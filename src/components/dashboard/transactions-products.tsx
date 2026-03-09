'use client'

import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { TYPE_LABELS, TYPE_COLORS } from './dashboard-shared'
import type { Transaction } from '@/lib/types'

/* ------------------------------------------------------------------ */
/*  Recent Transactions Table                                         */
/* ------------------------------------------------------------------ */
export function RecentTransactions({
  transactions,
  clientMap,
}: {
  transactions: Transaction[]
  clientMap: Map<string, string>
}) {
  return (
    <Card className="lg:col-span-2">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 className="font-display text-lg font-bold text-ww-text">
          Transactions recentes
        </h2>
        <a href="/comptabilite" className="flex items-center gap-1 text-xs text-ww-orange hover:underline">
          Voir tout <ArrowRight className="h-3 w-3" />
        </a>
      </div>
      <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Montant</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((txn) => (
            <TableRow key={txn.id}>
              <TableCell className="text-ww-muted text-xs">
                {format(parseISO(txn.date), 'd MMM HH:mm', { locale: fr })}
              </TableCell>
              <TableCell className="text-sm">
                {txn.clientId ? clientMap.get(txn.clientId) ?? 'Inconnu' : '—'}
              </TableCell>
              <TableCell>
                <span className={`text-xs font-medium ${TYPE_COLORS[txn.type] || 'text-ww-text'}`}>
                  {TYPE_LABELS[txn.type] || txn.type}
                </span>
              </TableCell>
              <TableCell className="text-right font-display font-bold">
                {txn.total.toLocaleString()} THB
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Top Products Card                                                 */
/* ------------------------------------------------------------------ */
export function TopProductsCard({
  products,
}: {
  products: { nom: string; qty: number; revenue: number }[]
}) {
  return (
    <Card className="p-5">
      <h2 className="font-display text-lg font-bold text-ww-text mb-4">
        Top produits
      </h2>
      <div className="space-y-3">
        {products.map((p, i) => {
          const maxRevenue = products[0]?.revenue || 1
          const pct = Math.round((p.revenue / maxRevenue) * 100)
          return (
            <div key={p.nom}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-ww-text truncate mr-2">
                  <span className="text-ww-muted text-xs mr-1.5">{i + 1}.</span>
                  {p.nom}
                </span>
                <span className="text-xs font-display font-bold text-ww-orange shrink-0">
                  {p.revenue.toLocaleString()} THB
                </span>
              </div>
              <div className="h-1.5 bg-ww-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: i === 0 ? 'var(--ww-orange)' : i === 1 ? 'var(--ww-lime)' : 'var(--ww-wood)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
