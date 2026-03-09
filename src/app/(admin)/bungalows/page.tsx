'use client'

import { useState, useEffect, useMemo } from 'react'
import { startOfWeek } from 'date-fns'
import { getClients, getBungalows, getRoomCharges } from '@/lib/data-access'
import type { Client, Bungalow, Reservation, RoomCharge, Transaction } from '@/lib/types'
import { useTransactions } from '@/contexts/transactions-context'
import { useMaintenance } from '@/contexts/maintenance-context'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { useDevice } from '@/lib/useDevice'
import { CalendrierHeader } from '@/components/bungalows/CalendrierHeader'
import { BungalowListMobile } from '@/components/bungalows/BungalowListMobile'
import { SearchFilterBar } from '@/components/bungalows/SearchFilterBar'
import { VueMensuelle } from '@/components/bungalows/VueMensuelle'
import { VueSemaine } from '@/components/bungalows/VueSemaine'
import { ReservationModal } from '@/components/bungalows/ReservationModal'
import { ReservationManuelleModal } from '@/components/bungalows/ReservationManuelleModal'

type ViewMode = 'mensuelle' | 'semaine'

export default function BungalowsPage() {
  const { addTransaction } = useTransactions()
  const { getTasksByBungalow } = useMaintenance()
  const [clients, setClients] = useState<Client[]>([])
  const [bungalows, setBungalows] = useState<Bungalow[]>([])
  const [roomCharges, setRoomCharges] = useState<RoomCharge[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('semaine')
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1))
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(2026, 2, 6), { weekStartsOn: 1 })
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedRes, setSelectedRes] = useState<{
    reservation: Reservation
    bungalowNumero: number
  } | null>(null)
  const [showManuelModal, setShowManuelModal] = useState(false)

  useEffect(() => {
    Promise.all([getClients(), getBungalows(), getRoomCharges()]).then(([c, b, rc]) => {
      setClients(c)
      setBungalows(b)
      setRoomCharges(rc)
    })
  }, [])

  const clientMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of clients) map.set(c.id, `${c.prenom} ${c.nom}`)
    for (const b of bungalows) for (const r of b.reservations) if (r.clientNom && !map.has(r.clientId)) map.set(r.clientId, r.clientNom)
    return map
  }, [clients, bungalows])

  useEffect(() => {
    if (!dateFrom) return
    const d = new Date(dateFrom)
    if (isNaN(d.getTime())) return
    setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1))
    setCurrentWeekStart(startOfWeek(d, { weekStartsOn: 1 }))
  }, [dateFrom])

  const handleReset = () => {
    setSearchQuery('')
    setDateFrom('')
    setDateTo('')
    setCurrentMonth(new Date(2026, 2, 1))
    setCurrentWeekStart(startOfWeek(new Date(2026, 2, 6), { weekStartsOn: 1 }))
  }

  const handleMarkNoShow = (resId: string) => {
    setBungalows(prev => prev.map(b => ({
      ...b,
      reservations: b.reservations.map(r =>
        r.id === resId ? { ...r, statut: 'no_show' as const } : r
      ),
    })))
    if (selectedRes?.reservation.id === resId) {
      setSelectedRes(s => s ? { ...s, reservation: { ...s.reservation, statut: 'no_show' } } : null)
    }
  }

  const handleCancelNoShow = (resId: string) => {
    setBungalows(prev => prev.map(b => ({
      ...b,
      reservations: b.reservations.map(r =>
        r.id === resId ? { ...r, statut: 'confirmee' as const } : r
      ),
    })))
    if (selectedRes?.reservation.id === resId) {
      setSelectedRes(s => s ? { ...s, reservation: { ...s.reservation, statut: 'confirmee' } } : null)
    }
  }

  const handleCheckoutComplete = (resId: string, totalPaid: number) => {
    setBungalows(prev => prev.map(b => ({
      ...b,
      reservations: b.reservations.map(r =>
        r.id === resId ? { ...r, statut: 'checked_out' as const } : r
      ),
    })))
    setRoomCharges(prev => prev.filter(rc => rc.reservationId !== resId))
    if (totalPaid > 0) {
      const res = selectedRes?.reservation
      const name = res ? (clientMap.get(res.clientId) ?? '') : ''
      const txn: Transaction = {
        id: `txn-co-${Date.now()}`,
        date: new Date().toISOString().slice(0, 19),
        type: 'fnb', centreRevenu: 'F&B',
        clientId: res?.clientId,
        items: [{ produitId: 'checkout', nom: `F&B Bungalow ${selectedRes?.bungalowNumero}`, quantite: 1, prixUnitaire: totalPaid, sousTotal: totalPaid }],
        total: totalPaid, methode: 'especes',
      }
      addTransaction(txn)
    }
    if (selectedRes?.reservation.id === resId) {
      setSelectedRes(s => s ? { ...s, reservation: { ...s.reservation, statut: 'checked_out' } } : null)
    }
    const bNum = selectedRes?.bungalowNumero ?? 0
    toast.success(`Bungalow ${bNum} cloture ✓`, {
      description: totalPaid > 0 ? `฿ ${totalPaid.toLocaleString()} enregistres en F&B` : 'Aucune consommation',
    })
  }

  const handleSettleCharges = (resId: string, totalPaid: number) => {
    setRoomCharges(prev => prev.filter(rc => rc.reservationId !== resId))
    const res = selectedRes?.reservation
    const txn: Transaction = {
      id: `txn-settle-${Date.now()}`,
      date: new Date().toISOString().slice(0, 19),
      type: 'fnb', centreRevenu: 'F&B',
      clientId: res?.clientId,
      items: [{ produitId: 'settle-fnb', nom: `F&B Bungalow ${selectedRes?.bungalowNumero}`, quantite: 1, prixUnitaire: totalPaid, sousTotal: totalPaid }],
      total: totalPaid, methode: 'especes',
    }
    addTransaction(txn)
    toast.success('Note F&B reglee', { description: `฿ ${totalPaid.toLocaleString()} enregistres en compta F&B` })
  }

  const handleChecklistToggle = (field: 'checkin_fait' | 'tm30_fait' | 'clef_remise') => {
    if (!selectedRes) return
    const resId = selectedRes.reservation.id
    const newVal = !selectedRes.reservation[field]
    const updateRes = (r: Reservation): Reservation => {
      if (r.id !== resId) return r
      if (field === 'checkin_fait' && !newVal) return { ...r, checkin_fait: false, tm30_fait: false, clef_remise: false }
      if (field === 'tm30_fait' && !newVal) return { ...r, tm30_fait: false, clef_remise: false }
      return { ...r, [field]: newVal }
    }
    setBungalows(prev => prev.map(b => ({ ...b, reservations: b.reservations.map(updateRes) })))
    setSelectedRes(s => s ? { ...s, reservation: updateRes(s.reservation) } : null)
  }

  const chargedResIds = useMemo(() => new Set(roomCharges.map(rc => rc.reservationId)), [roomCharges])

  const handleManuelSave = (newRes: Reservation) => {
    setBungalows(prev => prev.map(b => b.id === newRes.bungalowId ? { ...b, reservations: [...b.reservations, newRes] } : b))
    setShowManuelModal(false)
    const bNum = parseInt(newRes.bungalowId.replace('bung-', ''))
    toast.success(`Reservation creee · Bungalow ${bNum} · ${newRes.clientNom} · ฿ ${newRes.montant.toLocaleString()}`)
  }

  const { isMobile } = useDevice()
  const clientName = selectedRes ? (clientMap.get(selectedRes.reservation.clientId) ?? 'Inconnu') : ''

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-ww-text tracking-tight">Bungalows</h1>
          <p className="text-ww-muted text-sm mt-1">Calendrier des reservations</p>
        </div>
        <button onClick={() => setShowManuelModal(true)} className="flex items-center justify-center gap-2 bg-ww-orange text-white font-display font-bold text-sm px-4 py-2.5 rounded-lg transition-all duration-150 hover:bg-ww-orange/90 active:scale-[0.97]">
          <Plus className="h-4 w-4" /> RESERVATION MANUELLE
        </button>
      </div>

      {!isMobile && (
        <>
          <CalendrierHeader viewMode={viewMode} setViewMode={setViewMode}
            currentMonth={currentMonth} setCurrentMonth={setCurrentMonth}
            currentWeekStart={currentWeekStart} setCurrentWeekStart={setCurrentWeekStart} />
          <div className="flex flex-wrap items-center gap-5 text-xs font-body text-ww-muted">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-ww-orange" /> Confirmee</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: '#6D28D9' }} /> No Show</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-ww-lime" /> Arrivee aujourd&apos;hui</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-ww-danger" /> Alerte libre J+2</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-ww-danger flex items-center justify-center text-[7px] text-white font-bold">฿</span> Note F&B a regler</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-ww-wood" /> Manuel ✏️</span>
          </div>
          <SearchFilterBar searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo}
            setDateTo={setDateTo} onReset={handleReset} />
        </>
      )}

      {isMobile ? (
        <BungalowListMobile
          bungalows={bungalows}
          clientMap={clientMap}
          currentMonth={currentMonth}
          chargedResIds={chargedResIds}
          onReservationClick={(res, num) => setSelectedRes({ reservation: res, bungalowNumero: num })}
        />
      ) : viewMode === 'mensuelle' ? (
        <VueMensuelle
          bungalows={bungalows}
          clientMap={clientMap}
          currentMonth={currentMonth}
          searchQuery={searchQuery}
          chargedResIds={chargedResIds}
          onReservationClick={(res, num) => setSelectedRes({ reservation: res, bungalowNumero: num })}
        />
      ) : (
        <VueSemaine
          bungalows={bungalows}
          clientMap={clientMap}
          weekStart={currentWeekStart}
          searchQuery={searchQuery}
          chargedResIds={chargedResIds}
          onReservationClick={(res, num) => setSelectedRes({ reservation: res, bungalowNumero: num })}
        />
      )}

      <ReservationManuelleModal open={showManuelModal} onClose={() => setShowManuelModal(false)}
        bungalows={bungalows} clientMap={clientMap} onSave={handleManuelSave} />

      <ReservationModal
        reservation={selectedRes?.reservation ?? null}
        clientName={clientName}
        bungalowNumero={selectedRes?.bungalowNumero ?? 0}
        open={selectedRes !== null}
        onClose={() => setSelectedRes(null)}
        onMarkNoShow={handleMarkNoShow}
        onCancelNoShow={handleCancelNoShow}
        onChecklistToggle={handleChecklistToggle}
        roomCharges={selectedRes ? roomCharges.filter((rc) => rc.reservationId === selectedRes.reservation.id) : []}
        onCheckoutComplete={handleCheckoutComplete}
        onSettleCharges={handleSettleCharges}
        maintenanceTasks={selectedRes ? getTasksByBungalow(
          bungalows.find((b) => b.numero === selectedRes.bungalowNumero)?.id ?? ''
        ) : []}
      />
    </div>
  )
}
