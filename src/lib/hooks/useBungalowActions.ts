import type { Bungalow, Reservation, Transaction, RoomCharge } from '@/lib/types'
import * as bungalowsQ from '@/lib/supabase/queries/bungalows'
import { mutate } from '@/lib/mutation'
import { toast } from 'sonner'

interface BungalowActionsParams {
  bungalows: Bungalow[]
  setBungalows: React.Dispatch<React.SetStateAction<Bungalow[]>>
  roomCharges: RoomCharge[]
  setRoomCharges: React.Dispatch<React.SetStateAction<RoomCharge[]>>
  selectedRes: { reservation: Reservation; bungalowNumero: number } | null
  setSelectedRes: React.Dispatch<React.SetStateAction<{ reservation: Reservation; bungalowNumero: number } | null>>
  clientMap: Map<string, string>
  addTransaction: (txn: Transaction) => void
  setShowManuelModal: React.Dispatch<React.SetStateAction<boolean>>
  staffId?: string
}

export function useBungalowActions(params: BungalowActionsParams) {
  const { bungalows, setBungalows, roomCharges, setRoomCharges, selectedRes, setSelectedRes, clientMap, addTransaction, setShowManuelModal, staffId } = params

  function updateResInState(resId: string, updater: (r: Reservation) => Reservation) {
    setBungalows(prev => prev.map(b => ({ ...b, reservations: b.reservations.map(r => r.id === resId ? updater(r) : r) })))
    if (selectedRes?.reservation.id === resId) {
      setSelectedRes(s => s ? { ...s, reservation: updater(s.reservation) } : null)
    }
  }

  async function handleMarkNoShow(resId: string) {
    updateResInState(resId, r => ({ ...r, statut: 'no_show' as const }))
    await mutate({
      mutationFn: () => bungalowsQ.updateReservation(resId, { statut: 'no_show' }).then(() => {}),
      rollback: () => updateResInState(resId, r => ({ ...r, statut: 'confirmee' as const })),
      successMessage: 'Marque no-show',
      errorMessage: 'Erreur marquage no-show',
    })
  }

  async function handleCancelNoShow(resId: string) {
    updateResInState(resId, r => ({ ...r, statut: 'confirmee' as const }))
    await mutate({
      mutationFn: () => bungalowsQ.updateReservation(resId, { statut: 'confirmee' }).then(() => {}),
      rollback: () => updateResInState(resId, r => ({ ...r, statut: 'no_show' as const })),
      successMessage: 'No-show annule',
      errorMessage: 'Erreur annulation no-show',
    })
  }

  async function handleCheckoutComplete(resId: string, totalPaid: number) {
    updateResInState(resId, r => ({ ...r, statut: 'checked_out' as const }))
    setRoomCharges(prev => prev.map(rc =>
      rc.reservationId === resId ? { ...rc, statut: 'paye' as const } : rc
    ))

    await mutate({
      mutationFn: async () => {
        // Pay pending room charges + create transaction in Supabase
        if (totalPaid > 0) {
          await bungalowsQ.payerRoomCharges(resId, staffId ?? '')
          const res = selectedRes?.reservation
          const txn: Transaction = {
            id: `txn-co-${Date.now()}`, date: new Date().toISOString().slice(0, 19),
            type: 'fnb', centreRevenu: 'F&B', clientId: res?.clientId,
            items: [{ produitId: 'checkout', nom: `F&B Bungalow ${selectedRes?.bungalowNumero}`, quantite: 1, prixUnitaire: totalPaid, sousTotal: totalPaid }],
            total: totalPaid, methode: 'especes',
          }
          addTransaction(txn)
        }
        await bungalowsQ.updateReservation(resId, { statut: 'checked_out' })
      },
      errorMessage: 'Erreur checkout',
    })
    toast.success(`Bungalow ${selectedRes?.bungalowNumero ?? 0} cloture`, {
      description: totalPaid > 0 ? `฿ ${totalPaid.toLocaleString()} enregistres en F&B` : 'Aucune consommation',
    })
  }

  async function handleSettleCharges(resId: string, _totalPaid: number) {
    const prevCharges = roomCharges
    // Optimistic: mark charges as paid in local state
    setRoomCharges(prev => prev.map(rc =>
      rc.reservationId === resId ? { ...rc, statut: 'paye' as const } : rc
    ))

    await mutate({
      mutationFn: async () => {
        const result = await bungalowsQ.payerRoomCharges(resId, staffId ?? '')
        // Add local transaction for immediate UI feedback
        const res = selectedRes?.reservation
        const txn: Transaction = {
          id: `txn-settle-${Date.now()}`, date: new Date().toISOString().slice(0, 19),
          type: 'fnb', centreRevenu: 'F&B', clientId: res?.clientId,
          items: [{ produitId: 'settle-fnb', nom: `F&B Bungalow ${selectedRes?.bungalowNumero}`, quantite: 1, prixUnitaire: result.total, sousTotal: result.total }],
          total: result.total, methode: 'especes',
        }
        addTransaction(txn)
      },
      rollback: () => setRoomCharges(prevCharges),
      successMessage: `Note F&B reglee · ฿ ${_totalPaid.toLocaleString()} encaisses`,
      errorMessage: 'Erreur paiement note F&B',
    })
  }

  async function handleChecklistToggle(field: 'checkin_fait' | 'tm30_fait' | 'clef_remise') {
    if (!selectedRes) return
    const resId = selectedRes.reservation.id
    const newVal = !selectedRes.reservation[field]
    const updater = (r: Reservation): Reservation => {
      if (r.id !== resId) return r
      if (field === 'checkin_fait' && !newVal) return { ...r, checkin_fait: false, tm30_fait: false, clef_remise: false }
      if (field === 'tm30_fait' && !newVal) return { ...r, tm30_fait: false, clef_remise: false }
      return { ...r, [field]: newVal }
    }
    setBungalows(prev => prev.map(b => ({ ...b, reservations: b.reservations.map(updater) })))
    setSelectedRes(s => s ? { ...s, reservation: updater(s.reservation) } : null)
    await mutate({
      mutationFn: () => {
        const updates: Record<string, boolean> = { [field]: newVal }
        if (field === 'checkin_fait' && !newVal) { updates.tm30_fait = false; updates.clef_remise = false }
        if (field === 'tm30_fait' && !newVal) { updates.clef_remise = false }
        return bungalowsQ.updateReservation(resId, updates).then(() => {})
      },
      rollback: () => {
        const reverter = (r: Reservation): Reservation => r.id === resId ? { ...r, [field]: !newVal } : r
        setBungalows(prev => prev.map(b => ({ ...b, reservations: b.reservations.map(reverter) })))
        setSelectedRes(s => s ? { ...s, reservation: reverter(s.reservation) } : null)
      },
      errorMessage: 'Erreur mise a jour checklist',
    })
  }

  async function handleManuelSave(newRes: Reservation) {
    setBungalows(prev => prev.map(b => b.id === newRes.bungalowId ? { ...b, reservations: [...b.reservations, newRes] } : b))
    setShowManuelModal(false)
    const bNum = parseInt(newRes.bungalowId.replace('bung-', ''))
    await mutate({
      mutationFn: () => bungalowsQ.insertReservation({
        bungalow_id: Number(newRes.bungalowId.replace('bung-', '')),
        client_nom: newRes.clientNom,
        client_id: newRes.clientId,
        date_arrivee: newRes.dateDebut,
        date_depart: newRes.dateFin,
        nb_nuits: newRes.nuits,
        nb_adultes: newRes.nb_adultes || 1,
        nb_enfants: newRes.nb_enfants || 0,
        statut: 'confirmee',
        tarif_type: newRes.tarif_type || 'standard',
        source: newRes.source || 'manuel',
        prix_nuit_brut: newRes.montant / (newRes.nuits || 1),
        prix_total_brut: newRes.montant,
        prix_nuit_net: newRes.montant / (newRes.nuits || 1),
        prix_total_net: newRes.montant,
      }).then(() => {}),
      rollback: () => setBungalows(prev => prev.map(b => b.id === newRes.bungalowId ? { ...b, reservations: b.reservations.filter(r => r.id !== newRes.id) } : b)),
      successMessage: `Reservation creee - Bungalow ${bNum}`,
      errorMessage: 'Erreur creation reservation',
    })
  }

  return { handleMarkNoShow, handleCancelNoShow, handleCheckoutComplete, handleSettleCharges, handleChecklistToggle, handleManuelSave }
}
