'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTransactions } from '@/contexts/transactions-context'
import { useMaintenance } from '@/contexts/maintenance-context'
import { getClientById, getBungalows, getRoomCharges } from '@/lib/data-access'
import type { Client, Bungalow, Reservation, RoomCharge } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { ArrowLeft, Home, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ProfileSkeleton } from '@/components/clients/profile-skeleton'
import { HistoriqueAchats } from '@/components/clients/HistoriqueAchats'
import { SejoursList } from '@/components/clients/SejoursList'
import { CommandesFavorites } from '@/components/clients/CommandesFavorites'
import { ReservationModal } from '@/components/bungalows/ReservationModal'

export default function ClientProfilePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { transactions } = useTransactions()
  const { getTasksByBungalow } = useMaintenance()

  const [client, setClient] = useState<Client | null>(null)
  const [bungalows, setBungalows] = useState<Bungalow[]>([])
  const [roomCharges, setRoomCharges] = useState<RoomCharge[]>([])
  const [newsletterStatus, setNewsletterStatus] = useState(false)
  const [selectedRes, setSelectedRes] = useState<{ reservation: Reservation; bungalowNumero: number } | null>(null)

  useEffect(() => {
    if (params.id) {
      getClientById(params.id).then((c) => setClient(c ?? null)).catch(() => {})
      getBungalows().then(setBungalows).catch(() => {})
      getRoomCharges().then(setRoomCharges).catch(() => {})
    }
  }, [params.id])

  useEffect(() => {
    if (client) setNewsletterStatus(client.newsletter)
  }, [client])

  function handleNewsletter() {
    setNewsletterStatus((prev) => {
      const next = !prev
      toast.success(next ? 'Client ajoute a la newsletter' : 'Client retire de la newsletter')
      return next
    })
  }

  const { montantTotal, datesVisite, historiqueAchats } = useMemo(() => {
    if (!client) return { montantTotal: 0, datesVisite: [] as string[], historiqueAchats: [] as typeof transactions }
    const clientTxns = transactions.filter((t) => t.clientId === client.id)
    const total = clientTxns.reduce((sum, t) => sum + t.total, 0)
    const dates = [...new Set(clientTxns.map((t) => t.date.split('T')[0]))].sort((a, b) => b.localeCompare(a))
    const achats = [...clientTxns].sort((a, b) => b.date.localeCompare(a.date))
    return { montantTotal: total, datesVisite: dates, historiqueAchats: achats }
  }, [client, transactions])

  const clientRoomCharges = useMemo(
    () => client ? roomCharges.filter((rc) => rc.clientId === client.id) : [],
    [client, roomCharges]
  )

  const isResident = useMemo(() => {
    if (!client?.bungalowId) return false
    const bungalow = bungalows.find((b) => b.id === client.bungalowId)
    return bungalow?.reservations.some((r) => r.statut === 'en-cours') ?? false
  }, [client, bungalows])

  if (!client) return <ProfileSkeleton />

  const hasSejours = bungalows.some((b) => b.reservations.some((r) => r.clientId === client.id))
  const selectedBungalowId = selectedRes
    ? bungalows.find((b) => b.numero === selectedRes.bungalowNumero)?.id ?? ''
    : ''

  return (
    <div className="space-y-6">
      <button onClick={() => router.push('/clients')} className="flex items-center gap-2 text-sm text-ww-muted hover:text-ww-text transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour aux clients
      </button>

      <div className="flex items-start gap-4">
        <div className="bg-ww-orange/15 border border-ww-orange/30 text-ww-orange rounded-full w-16 h-16 flex items-center justify-center font-display text-2xl font-extrabold shrink-0">
          {client.prenom.charAt(0)}{client.nom.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-3xl font-extrabold text-ww-text tracking-tight">
              {client.prenom} {client.nom}
            </h1>
            {isResident && (
              <span className="inline-flex items-center gap-1.5 bg-ww-wood/15 border border-ww-wood/30 rounded-full px-3 py-1 text-xs text-ww-wood font-display font-bold uppercase tracking-wider">
                <Home className="h-3 w-3" /> Resident bungalow
              </span>
            )}
            <Button variant={newsletterStatus ? 'secondary' : 'default'} size="sm" onClick={handleNewsletter}>
              <Mail className="h-4 w-4 mr-1" />
              {newsletterStatus ? 'Inscrit a la newsletter' : 'Ajouter a la newsletter'}
            </Button>
          </div>
          <div className="mt-1 space-y-0.5 text-ww-muted text-sm">
            {client.email && <p>{client.email}</p>}
            {client.telephone && <p>{client.telephone}</p>}
            <p>Inscrit le {format(parseISO(client.dateCreation), 'dd/MM/yyyy')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="ww-label">Montant total depense</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{montantTotal.toLocaleString()} THB</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="ww-label">Nombre de visites</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{client.nombreVisites}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="ww-label">Derniere visite</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{client.derniereVisite ? format(parseISO(client.derniereVisite), 'dd/MM/yyyy') : '-'}</p></CardContent></Card>
      </div>

      {hasSejours && (
        <SejoursList
          bungalows={bungalows}
          clientId={client.id}
          roomCharges={roomCharges}
          onVoirActivite={(res, num) => setSelectedRes({ reservation: res, bungalowNumero: num })}
        />
      )}

      {clientRoomCharges.length > 0 && (
        <CommandesFavorites roomCharges={clientRoomCharges} />
      )}

      <HistoriqueAchats achats={historiqueAchats} />

      {datesVisite.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-xl font-bold text-ww-text">Dates de visite</h2>
          <div className="flex flex-wrap gap-2">
            {datesVisite.map((date) => (
              <Badge key={date} variant="outline">{format(parseISO(date), 'dd/MM/yyyy')}</Badge>
            ))}
          </div>
        </div>
      )}

      <ReservationModal
        reservation={selectedRes?.reservation ?? null}
        clientName={client ? `${client.prenom} ${client.nom}` : ''}
        bungalowNumero={selectedRes?.bungalowNumero ?? 0}
        open={selectedRes !== null}
        onClose={() => setSelectedRes(null)}
        onMarkNoShow={() => {}}
        onCancelNoShow={() => {}}
        onChecklistToggle={() => {}}
        roomCharges={selectedRes ? roomCharges.filter((rc) => rc.reservationId === selectedRes.reservation.id) : []}
        maintenanceTasks={selectedRes ? getTasksByBungalow(selectedBungalowId) : []}
        defaultTab="activite"
      />
    </div>
  )
}
