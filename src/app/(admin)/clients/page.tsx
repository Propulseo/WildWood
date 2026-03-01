'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTransactions } from '@/contexts/transactions-context'
import { getClients, getBungalows } from '@/lib/data-access'
import type { Client, Bungalow } from '@/lib/types'
import { format, parseISO, subDays, isAfter, startOfYear } from 'date-fns'
import { Search } from 'lucide-react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const ITEMS_PER_PAGE = 10

const PERIODE_OPTIONS = [
  { value: 'tous', label: 'Toutes les periodes' },
  { value: '7', label: '7 derniers jours' },
  { value: '30', label: '30 derniers jours' },
  { value: '90', label: '90 derniers jours' },
  { value: 'annee', label: 'Cette annee' },
]

export default function ClientsPage() {
  const router = useRouter()
  const { transactions } = useTransactions()

  const [clients, setClients] = useState<Client[]>([])
  const [bungalows, setBungalows] = useState<Bungalow[]>([])
  const [search, setSearch] = useState('')
  const [filterPass, setFilterPass] = useState('tous')
  const [filterPeriode, setFilterPeriode] = useState('tous')
  const [page, setPage] = useState(1)

  useEffect(() => {
    getClients().then(setClients)
    getBungalows().then(setBungalows)
  }, [])

  // Reset page to 1 when any filter changes
  useEffect(() => {
    setPage(1)
  }, [search, filterPass, filterPeriode])

  // Derive type de pass per client from transactions
  const clientsWithPass = useMemo(() => {
    return clients.map((client) => {
      const gymPassTxns = transactions
        .filter((t) => t.clientId === client.id && t.type === 'gym-pass')
        .sort((a, b) => b.date.localeCompare(a.date))

      const typePass =
        gymPassTxns.length > 0 && gymPassTxns[0].items.length > 0
          ? gymPassTxns[0].items[0].nom
          : '-'

      return { ...client, typePass }
    })
  }, [clients, transactions])

  // Derive unique pass type options
  const passOptions = useMemo(() => {
    const types = new Set<string>()
    clientsWithPass.forEach((c) => {
      if (c.typePass !== '-') types.add(c.typePass)
    })
    return Array.from(types).sort()
  }, [clientsWithPass])

  // Apply filters
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const now = new Date()

    return clientsWithPass.filter((c) => {
      // Search filter
      if (q) {
        const fullName = `${c.prenom} ${c.nom}`.toLowerCase()
        const email = (c.email ?? '').toLowerCase()
        const tel = (c.telephone ?? '').toLowerCase()
        if (
          !fullName.includes(q) &&
          !email.includes(q) &&
          !tel.includes(q)
        ) {
          return false
        }
      }

      // Pass type filter
      if (filterPass !== 'tous' && c.typePass !== filterPass) {
        return false
      }

      // Period filter
      if (filterPeriode !== 'tous' && c.derniereVisite) {
        const visite = parseISO(c.derniereVisite)
        if (filterPeriode === 'annee') {
          if (!isAfter(visite, startOfYear(now))) return false
        } else {
          const days = parseInt(filterPeriode, 10)
          if (!isAfter(visite, subDays(now, days))) return false
        }
      } else if (filterPeriode !== 'tous' && !c.derniereVisite) {
        return false
      }

      return true
    })
  }, [clientsWithPass, search, filterPass, filterPeriode])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const startIndex = (page - 1) * ITEMS_PER_PAGE + 1
  const endIndex = Math.min(page * ITEMS_PER_PAGE, filtered.length)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold">Clients</h1>
        <p className="text-muted-foreground">{filtered.length} clients</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email ou telephone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterPass} onValueChange={setFilterPass}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Type de pass" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les passes</SelectItem>
            {passOptions.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPeriode} onValueChange={setFilterPeriode}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Periode" />
          </SelectTrigger>
          <SelectContent>
            {PERIODE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Prenom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telephone</TableHead>
              <TableHead>Type de pass</TableHead>
              <TableHead>Derniere visite</TableHead>
              <TableHead className="text-right">Nb visites</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Aucun client trouve
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((client) => (
                <TableRow
                  key={client.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/clients/${client.id}`)}
                >
                  <TableCell className="font-medium">{client.nom}</TableCell>
                  <TableCell>{client.prenom}</TableCell>
                  <TableCell>{client.email ?? '-'}</TableCell>
                  <TableCell>{client.telephone ?? '-'}</TableCell>
                  <TableCell>{client.typePass}</TableCell>
                  <TableCell>
                    {client.derniereVisite
                      ? format(parseISO(client.derniereVisite), 'dd/MM/yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {client.nombreVisites}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length > 0
            ? `${startIndex} - ${endIndex} sur ${filtered.length} clients`
            : '0 clients'}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Precedent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}
