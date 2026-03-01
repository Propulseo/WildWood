'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTransactions } from '@/contexts/transactions-context'
import { getClientById, getBungalows } from '@/lib/data-access'
import type { Client, Bungalow } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { ArrowLeft, Home } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

const TYPE_LABELS: Record<string, string> = {
  'gym-pass': 'Gym',
  fnb: 'F&B',
  bungalow: 'Bungalow',
}

export default function ClientProfilePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { transactions } = useTransactions()

  const [client, setClient] = useState<Client | null>(null)
  const [bungalows, setBungalows] = useState<Bungalow[]>([])

  useEffect(() => {
    if (params.id) {
      getClientById(params.id).then((c) => setClient(c ?? null))
      getBungalows().then(setBungalows)
    }
  }, [params.id])

  // Compute client stats from transactions
  const { montantTotal, datesVisite, historiqueAchats } = useMemo(() => {
    if (!client) return { montantTotal: 0, datesVisite: [] as string[], historiqueAchats: [] as typeof transactions }

    const clientTxns = transactions.filter((t) => t.clientId === client.id)
    const total = clientTxns.reduce((sum, t) => sum + t.total, 0)
    const dates = [
      ...new Set(clientTxns.map((t) => t.date.split('T')[0])),
    ].sort((a, b) => b.localeCompare(a))
    const achats = [...clientTxns].sort((a, b) => b.date.localeCompare(a.date))

    return { montantTotal: total, datesVisite: dates, historiqueAchats: achats }
  }, [client, transactions])

  // Detect bungalow resident with active reservation
  const isResident = useMemo(() => {
    if (!client?.bungalowId) return false
    const bungalow = bungalows.find((b) => b.id === client.bungalowId)
    if (!bungalow) return false
    return bungalow.reservations.some((r) => r.statut === 'en-cours')
  }, [client, bungalows])

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push('/clients')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux clients
      </button>

      {/* Client header */}
      <div className="flex items-start gap-4">
        <div className="bg-wildwood-bois text-white rounded-full w-16 h-16 flex items-center justify-center font-display text-2xl font-bold shrink-0">
          {client.prenom.charAt(0)}
          {client.nom.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-3xl font-bold">
              {client.prenom} {client.nom}
            </h1>
            {isResident && (
              <Badge className="bg-wildwood-bois text-white">
                <Home className="h-3 w-3" />
                Resident bungalow
              </Badge>
            )}
          </div>
          <div className="mt-1 space-y-0.5 text-muted-foreground text-sm">
            {client.email && <p>{client.email}</p>}
            {client.telephone && <p>{client.telephone}</p>}
            <p>Inscrit le {format(parseISO(client.dateCreation), 'dd/MM/yyyy')}</p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Montant total depense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {montantTotal.toLocaleString()} THB
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nombre de visites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{client.nombreVisites}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Derniere visite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {client.derniereVisite
                ? format(parseISO(client.derniereVisite), 'dd/MM/yyyy')
                : '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Purchase history */}
      <div className="space-y-3">
        <h2 className="font-display text-xl font-bold">Historique des achats</h2>
        {historiqueAchats.length === 0 ? (
          <p className="text-muted-foreground">Aucun achat enregistre</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historiqueAchats.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      {format(parseISO(t.date), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {TYPE_LABELS[t.type] ?? t.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {t.items.map((i) => i.nom).join(', ')}
                    </TableCell>
                    <TableCell className="text-right">
                      {t.total.toLocaleString()} THB
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Visit dates */}
      {datesVisite.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-xl font-bold">Dates de visite</h2>
          <div className="flex flex-wrap gap-2">
            {datesVisite.map((date) => (
              <Badge key={date} variant="outline">
                {format(parseISO(date), 'dd/MM/yyyy')}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
