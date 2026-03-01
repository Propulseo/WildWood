'use client'

import { useMemo } from 'react'
import { useTransactions } from '@/contexts/transactions-context'
import { parseISO, getMonth, getYear } from 'date-fns'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const MOIS_FR = [
  'Janvier',
  'Fevrier',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Aout',
  'Septembre',
  'Octobre',
  'Novembre',
  'Decembre',
]

interface MonthRow {
  mois: string
  gym: number
  fnb: number
  bungalows: number
  total: number
}

export default function VueAnnuelle() {
  const { transactions } = useTransactions()

  const { rows, totals } = useMemo(() => {
    const currentYear = new Date().getFullYear()

    const yearTxns = transactions.filter(
      (txn) => getYear(parseISO(txn.date)) === currentYear
    )

    const rows: MonthRow[] = MOIS_FR.map((mois, idx) => {
      const monthTxns = yearTxns.filter(
        (txn) => getMonth(parseISO(txn.date)) === idx
      )

      const gym = monthTxns
        .filter((t) => t.centreRevenu === 'Gym')
        .reduce((s, t) => s + t.total, 0)

      const fnb = monthTxns
        .filter((t) => t.centreRevenu === 'F&B')
        .reduce((s, t) => s + t.total, 0)

      const bungalows = monthTxns
        .filter((t) => t.centreRevenu === 'Bungalows')
        .reduce((s, t) => s + t.total, 0)

      return {
        mois,
        gym,
        fnb,
        bungalows,
        total: gym + fnb + bungalows,
      }
    })

    const totals = rows.reduce(
      (acc, row) => ({
        gym: acc.gym + row.gym,
        fnb: acc.fnb + row.fnb,
        bungalows: acc.bungalows + row.bungalows,
        total: acc.total + row.total,
      }),
      { gym: 0, fnb: 0, bungalows: 0, total: 0 }
    )

    return { rows, totals }
  }, [transactions])

  return (
    <div className="space-y-6 pt-4">
      <h2 className="font-display text-xl font-bold">
        Revenus annuels par centre
      </h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mois</TableHead>
              <TableHead className="text-right">Gym</TableHead>
              <TableHead className="text-right">F&B</TableHead>
              <TableHead className="text-right">Bungalows</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.mois}>
                <TableCell>{row.mois}</TableCell>
                <TableCell className="text-right font-display text-wildwood-orange">
                  {row.gym.toLocaleString()} THB
                </TableCell>
                <TableCell className="text-right font-display text-wildwood-lime">
                  {row.fnb.toLocaleString()} THB
                </TableCell>
                <TableCell className="text-right font-display text-wildwood-bois">
                  {row.bungalows.toLocaleString()} THB
                </TableCell>
                <TableCell className="text-right font-display font-bold">
                  {row.total.toLocaleString()} THB
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-bold text-base">TOTAL</TableCell>
              <TableCell className="text-right font-display font-bold text-base text-wildwood-orange">
                {totals.gym.toLocaleString()} THB
              </TableCell>
              <TableCell className="text-right font-display font-bold text-base text-wildwood-lime">
                {totals.fnb.toLocaleString()} THB
              </TableCell>
              <TableCell className="text-right font-display font-bold text-base text-wildwood-bois">
                {totals.bungalows.toLocaleString()} THB
              </TableCell>
              <TableCell className="text-right font-display font-bold text-base">
                {totals.total.toLocaleString()} THB
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Card>
    </div>
  )
}
