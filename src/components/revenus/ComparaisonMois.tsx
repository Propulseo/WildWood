'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import type { Transaction } from '@/lib/types'
import { txnNet } from '@/lib/commission'
import { parseISO, format, subMonths, isSameMonth } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface ComparaisonMoisProps {
  transactions: Transaction[]
}

function formatAbrev(n: number): string {
  if (n >= 1000) return `฿ ${(n / 1000).toFixed(0)}k`
  return `฿ ${n.toLocaleString()}`
}

export function ComparaisonMois({ transactions }: ComparaisonMoisProps) {
  const months = useMemo(() => {
    const now = new Date()
    return [2, 1, 0].map((i) => subMonths(now, i))
  }, [])

  const data = useMemo(() => {
    return months.map((month) => {
      const monthTxns = transactions.filter((t) => isSameMonth(parseISO(t.date), month))
      return {
        label: format(month, 'MMMM yyyy', { locale: fr }),
        Bungalows: monthTxns.filter((t) => t.centreRevenu === 'Bungalows').reduce((s, t) => s + txnNet(t), 0),
        Gym: monthTxns.filter((t) => t.centreRevenu === 'Gym').reduce((s, t) => s + t.total, 0),
        'F&B': monthTxns.filter((t) => t.centreRevenu === 'F&B').reduce((s, t) => s + t.total, 0),
      }
    })
  }, [transactions, months])

  const rows = useMemo(() => {
    const sources = ['Bungalows', 'Gym', 'F&B'] as const
    const result = sources.map((source) => {
      const values = data.map((d) => d[source])
      const maxVal = Math.max(...values)
      return { label: source, values, maxVal }
    })
    const totals = data.map((_, i) => result.reduce((s, r) => s + r.values[i], 0))
    const maxTotal = Math.max(...totals)

    const evolutions = totals.map((t, i) => {
      if (i === 0) return null
      const prev = totals[i - 1]
      if (prev === 0) return t > 0 ? 100 : null
      return Math.round(((t - prev) / prev) * 100)
    })

    return { sources: result, totals, maxTotal, evolutions }
  }, [data])

  return (
    <Card className="p-4">
      <h3 className="font-display font-bold text-lg text-ww-text mb-4">Comparaison 3 mois</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            {data.map((d) => (
              <TableHead key={d.label} className="text-center capitalize font-display">
                {d.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.sources.map((row) => (
            <TableRow key={row.label}>
              <TableCell className="font-display font-bold">{row.label}</TableCell>
              {row.values.map((val, i) => (
                <TableCell
                  key={i}
                  className={`text-center font-display font-bold ${
                    val === row.maxVal && val > 0 ? 'bg-[var(--ww-lime-glow)]' : ''
                  }`}
                >
                  {formatAbrev(val)}
                </TableCell>
              ))}
            </TableRow>
          ))}
          <TableRow className="border-t-2 border-ww-orange">
            <TableCell className="font-display font-extrabold">TOTAL</TableCell>
            {rows.totals.map((val, i) => (
              <TableCell
                key={i}
                className={`text-center font-display font-extrabold text-lg ${
                  val === rows.maxTotal && val > 0 ? 'bg-[var(--ww-lime-glow)]' : ''
                }`}
              >
                {formatAbrev(val)}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-display font-bold text-ww-muted">Evolution</TableCell>
            {rows.evolutions.map((evo, i) => (
              <TableCell key={i} className="text-center">
                {evo !== null ? (
                  <span className={`inline-flex items-center gap-1 font-display font-bold ${
                    evo >= 0 ? 'text-ww-lime' : 'text-ww-danger'
                  }`}>
                    {evo >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    {Math.abs(evo)}%
                  </span>
                ) : (
                  <span className="text-ww-muted">—</span>
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  )
}
