'use client'

import { useReducer, useState, useMemo } from 'react'
import type { Client, GymPass, FnbProduct, Bungalow, Transaction, RoomCharge, TableOuverte } from '@/lib/types'
import { useAuth } from '@/lib/contexts/auth-context'
import { ProductGrid } from './product-grid'
import { ClientPopup } from './client-popup'
import { GuestHotelPopup } from './guest-hotel-popup'
import { CartSidebar } from './cart-sidebar'
import { SignatureModal } from './SignatureModal'
import { ChoixEncaissementModal } from '@/components/bar/ChoixEncaissementModal'
import { OuvrirTableModal } from '@/components/bar/OuvrirTableModal'
import { PaiementCashModal } from '@/components/bar/PaiementCashModal'
import { BungalowSelectModal } from '@/components/bar/BungalowSelectModal'
import { useTransactions } from '@/contexts/transactions-context'
import { useActivePasses } from '@/contexts/active-passes-context'
import { useTables } from '@/contexts/tables-context'
import { toast } from 'sonner'
import { cartReducer, initialCartState } from './cart-reducer'

type TabId = 'gym' | 'fnb' | 'serviettes'

interface PosRegisterProps {
  gymPasses: GymPass[]
  fnbProducts: FnbProduct[]
  clients: Client[]
  bungalows: Bungalow[]
  defaultTab?: TabId
}

function makeTxnId() { return `txn-${String(Date.now()).slice(-3)}` }
function nowISO() { return new Date().toISOString().slice(0, 19) }
function todayISO() { return new Date().toISOString().slice(0, 10) }

export function PosRegister({ gymPasses, fnbProducts, clients, bungalows, defaultTab }: PosRegisterProps) {
  const { role } = useAuth()
  const visibleTabs: TabId[] = role === 'bar' ? ['fnb'] : role === 'reception' ? ['gym', 'serviettes'] : ['gym', 'fnb', 'serviettes']
  const [cart, dispatch] = useReducer(cartReducer, initialCartState)
  const [selectedPass, setSelectedPass] = useState<GymPass | null>(null)
  const [clientDialogOpen, setClientDialogOpen] = useState(false)
  const [guestHotelOpen, setGuestHotelOpen] = useState(false)
  const [signatureModalOpen, setSignatureModalOpen] = useState(false)
  const [signatureClient, setSignatureClient] = useState<{ client: Client; bungalowNumero: number } | null>(null)
  const [choixOpen, setChoixOpen] = useState(false)
  const [ouvrirTableOpen, setOuvrirTableOpen] = useState(false)
  const [paiementCashOpen, setPaiementCashOpen] = useState(false)
  const [activeTableId, setActiveTableId] = useState<string | null>(null)
  const [paiementTable, setPaiementTable] = useState<TableOuverte | null>(null)
  const [fnbBungalowOpen, setFnbBungalowOpen] = useState(false)

  const { addTransaction } = useTransactions()
  const { addActivePass } = useActivePasses()
  const { addTable, addItemsToTable, encaisserTable, getTablesOuvertes } = useTables()

  const activeTable = activeTableId ? getTablesOuvertes().find((t) => t.id === activeTableId) ?? null : null
  const fnbItems = cart.items.filter((i) => i.type === 'fnb')
  const fnbTotal = fnbItems.reduce((s, i) => s + i.prixUnitaire * i.quantite, 0)
  const itemsSummary = fnbItems.map((i) => `${i.nom}${i.quantite > 1 ? ` x${i.quantite}` : ''}`).join(', ')

  const residents = useMemo(() => bungalows.flatMap((b) =>
    b.reservations
      .filter((r) => r.statut === 'confirmee' || r.statut === 'en-cours')
      .map((r) => ({ client: clients.find((c) => c.id === r.clientId)!, bungalowNumero: b.numero }))
      .filter((r) => !!r.client)
  ), [bungalows, clients])

  const handleSelectGymPass = (pass: GymPass) => {
    setSelectedPass(pass)
    if (pass.id === 'pass-guest-hotel') setGuestHotelOpen(true)
    else setClientDialogOpen(true)
  }

  const createGymPassActivePass = (clientId: string, clientNom: string, passId: string, passNom: string, duree: number) => {
    const exp = new Date(); exp.setDate(exp.getDate() + duree)
    addActivePass({
      id: `ap-${Date.now()}`, qrToken: `WW-PASS-${Date.now().toString(36).toUpperCase().slice(-4)}`,
      clientId, clientNom, passId, passNom,
      dateAchat: todayISO(), dateExpiration: exp.toISOString().slice(0, 10),
      actif: true, checkins: [],
    })
  }

  const handleGuestHotelConfirm = (client: Client, pass: GymPass) => {
    addTransaction({
      id: makeTxnId(), date: nowISO(), type: 'gym-pass', centreRevenu: 'Gym', clientId: client.id,
      items: [{ produitId: pass.id, nom: pass.nom, quantite: 1, prixUnitaire: 0, sousTotal: 0 }],
      total: 0, methode: 'especes',
    })
    createGymPassActivePass(client.id, `${client.prenom} ${client.nom}`, pass.id, pass.nom, 1)
    toast.success(`${client.prenom} ${client.nom} enregistre`, { description: 'Guest Hotel - Gratuit' })
  }

  const handleAddFnbItem = (product: FnbProduct) => {
    dispatch({ type: 'ADD_ITEM', payload: { produitId: product.id, nom: product.nom, prixUnitaire: product.prix, type: 'fnb' } })
  }

  const handleClientConfirm = (client: Client | null, isBungalowResident: boolean, pass: GymPass, pax: number) => {
    if (client) dispatch({ type: 'SET_CLIENT', payload: { client, isBungalowResident } })
    dispatch({ type: 'ADD_ITEM', payload: { produitId: pass.id, nom: pass.nom, prixUnitaire: pass.prix, type: 'gym-pass' } })
    if (pax > 1) dispatch({ type: 'UPDATE_QUANTITY', payload: { produitId: pass.id, quantite: pax } })
  }

  const handleCheckout = () => {
    const total = cart.items.reduce((sum, item) => {
      if (cart.isBungalowResident && item.type === 'gym-pass') return sum
      return sum + item.prixUnitaire * item.quantite
    }, 0)
    const hasGymPass = cart.items.some((i) => i.type === 'gym-pass')
    addTransaction({
      id: makeTxnId(), date: nowISO(), type: hasGymPass ? 'gym-pass' : 'fnb',
      centreRevenu: hasGymPass ? 'Gym' : 'F&B', clientId: cart.client?.id,
      items: cart.items.map((item) => ({
        produitId: item.produitId, nom: item.nom, quantite: item.quantite,
        prixUnitaire: cart.isBungalowResident && item.type === 'gym-pass' ? 0 : item.prixUnitaire,
        sousTotal: cart.isBungalowResident && item.type === 'gym-pass' ? 0 : item.prixUnitaire * item.quantite,
      })),
      total, methode: 'especes',
    })
    if (hasGymPass && cart.client) {
      const gpi = cart.items.find((i) => i.type === 'gym-pass')
      if (gpi) {
        const pt = gymPasses.find((p) => p.id === gpi.produitId)
        createGymPassActivePass(cart.client.id, `${cart.client.prenom} ${cart.client.nom}`, gpi.produitId, gpi.nom, pt?.dureeJours || 1)
      }
    }
    dispatch({ type: 'CLEAR_CART' })
    toast.success('Transaction enregistree', { description: `Total: ${total.toLocaleString()} THB` })
  }

  const handleFnbEncaisser = () => {
    if (activeTableId && activeTable) {
      addItemsToTable(activeTableId, fnbItems.map((i) => ({ nom: i.nom, prix: i.prixUnitaire, quantite: i.quantite })))
      dispatch({ type: 'CLEAR_CART' }); setActiveTableId(null)
      toast.success(`Articles ajoutes a ${activeTable.nom_table}`)
      return
    }
    setChoixOpen(true)
  }

  const handlePaiementConfirm = () => {
    if (paiementTable) {
      addTransaction({
        id: makeTxnId(), date: nowISO(), type: 'fnb', centreRevenu: 'F&B',
        items: paiementTable.items.map((i) => ({ produitId: `fnb-${i.nom.toLowerCase().replace(/\s+/g, '-')}`, nom: i.nom, quantite: i.quantite, prixUnitaire: i.prix, sousTotal: i.prix * i.quantite })),
        total: paiementTable.total_thb, methode: 'especes',
      })
      encaisserTable(paiementTable.id)
      toast.success(`Table ${paiementTable.nom_table} encaissee`, { description: `฿ ${paiementTable.total_thb.toLocaleString()}` })
    } else {
      addTransaction({
        id: makeTxnId(), date: nowISO(), type: 'fnb', centreRevenu: 'F&B',
        items: fnbItems.map((item) => ({ produitId: item.produitId, nom: item.nom, quantite: item.quantite, prixUnitaire: item.prixUnitaire, sousTotal: item.prixUnitaire * item.quantite })),
        total: fnbTotal, methode: 'especes',
      })
      dispatch({ type: 'CLEAR_CART' })
      toast.success('Transaction enregistree', { description: `฿ ${fnbTotal.toLocaleString()}` })
    }
    setPaiementCashOpen(false); setPaiementTable(null)
  }

  const handleBungalowSelect = (client: Client, bungalowNumero: number) => {
    dispatch({ type: 'SET_CLIENT', payload: { client, isBungalowResident: true } })
    setSignatureClient({ client, bungalowNumero }); setSignatureModalOpen(true)
  }

  const handleSignatureConfirm = (signatureBase64: string) => {
    if (!signatureClient) return
    const { client, bungalowNumero } = signatureClient
    const bungalow = bungalows.find((b) => b.numero === bungalowNumero)
    const activeRes = bungalow?.reservations.find((r) => r.clientId === client.id && (r.statut === 'confirmee' || r.statut === 'en-cours'))
    const total = fnbItems.reduce((s, i) => s + i.prixUnitaire * i.quantite, 0)
    const rc: RoomCharge = {
      id: `rc-${Date.now()}`, bungalowId: bungalow?.id ?? '', reservationId: activeRes?.id ?? '', clientId: client.id,
      items: fnbItems.map((item) => ({ produitId: item.produitId, nom: item.nom, quantite: item.quantite, prixUnitaire: item.prixUnitaire, sousTotal: item.prixUnitaire * item.quantite })),
      total, date: nowISO(), staff: 'Staff POS', signature_base64: signatureBase64, signed_at: nowISO(), signed_by: `${client.prenom} ${client.nom}`,
    }
    console.log('Room charge created:', rc)
    setSignatureModalOpen(false); setSignatureClient(null); dispatch({ type: 'CLEAR_CART' })
    toast.success('Note de bungalow enregistree', { description: `฿ ${total.toLocaleString()} — Signe par ${rc.signed_by}` })
  }

  const handleOuvrirTable = (clientNom: string, nomTable: string) => {
    const items = fnbItems.map((i) => ({ nom: i.nom, prix: i.prixUnitaire, quantite: i.quantite }))
    const total = items.reduce((s, i) => s + i.prix * i.quantite, 0)
    addTable({ id: `tab-${Date.now()}`, nom_table: nomTable, client_nom: clientNom, type_client: 'externe', bungalow_id: null, items, total_thb: total, heure_ouverture: nowISO(), statut: 'ouverte', staff_ouverture: 'Staff POS' })
    dispatch({ type: 'CLEAR_CART' })
    toast.success(`Table ouverte: ${nomTable}`, { description: `${clientNom} - ฿ ${total.toLocaleString()}` })
  }

  return (
    <div className="flex flex-col h-full bg-ww-bg">
      <div className="flex-1 overflow-auto">
        <ProductGrid gymPasses={gymPasses} fnbProducts={fnbProducts} onSelectGymPass={handleSelectGymPass} onAddFnbItem={handleAddFnbItem} visibleTabs={visibleTabs} defaultTab={defaultTab} />
      </div>
      <CartSidebar items={cart.items} client={cart.client} isBungalowResident={cart.isBungalowResident} onRemoveItem={(id) => dispatch({ type: 'REMOVE_ITEM', payload: { produitId: id } })} onUpdateQuantity={(id, q) => dispatch({ type: 'UPDATE_QUANTITY', payload: { produitId: id, quantite: q } })} onCheckout={handleCheckout} onFnbAssign={handleFnbEncaisser} activeTableName={activeTable?.nom_table} />
      <ClientPopup open={clientDialogOpen} onOpenChange={setClientDialogOpen} selectedPass={selectedPass} clients={clients} bungalows={bungalows} onConfirm={handleClientConfirm} />
      <GuestHotelPopup open={guestHotelOpen} onOpenChange={setGuestHotelOpen} selectedPass={selectedPass} clients={clients} bungalows={bungalows} onConfirm={handleGuestHotelConfirm} />
      <ChoixEncaissementModal open={choixOpen} onClose={() => setChoixOpen(false)} total={fnbTotal} itemsSummary={itemsSummary} onEncaisserMaintenant={() => { setPaiementTable(null); setPaiementCashOpen(true) }} onOuvrirTable={() => setOuvrirTableOpen(true)} onBungalow={() => setFnbBungalowOpen(true)} />
      <OuvrirTableModal open={ouvrirTableOpen} onClose={() => setOuvrirTableOpen(false)} onConfirm={handleOuvrirTable} />
      <PaiementCashModal open={paiementCashOpen} total={paiementTable ? paiementTable.total_thb : fnbTotal} onConfirm={handlePaiementConfirm} onCancel={() => { setPaiementCashOpen(false); setPaiementTable(null) }} table={paiementTable ?? undefined} />
      <BungalowSelectModal open={fnbBungalowOpen} onClose={() => setFnbBungalowOpen(false)} residents={residents} onSelect={handleBungalowSelect} />
      {signatureClient && signatureModalOpen && (
        <SignatureModal open={signatureModalOpen} items={cart.items} client={signatureClient.client} bungalowNumero={signatureClient.bungalowNumero} onConfirm={handleSignatureConfirm} onCancel={() => { setSignatureModalOpen(false); setSignatureClient(null) }} />
      )}
    </div>
  )
}
