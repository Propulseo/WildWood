'use client'

import { useMemo } from 'react'
import { useTransactions } from '@/contexts/transactions-context'
import { useExpenses } from '@/contexts/expenses-context'
import {
  parseISO,
  format,
  startOfYear,
  eachMonthOfInterval,
  endOfYear,
  isSameMonth,
} from 'date-fns'
import { txnNet } from '@/lib/commission'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
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
import { CATEGORY_LABELS } from '@/components/depenses/depenses-shared'

export default function VueMensuelle() {
  const { transactions } = useTransactions()
  const { expenses } = useExpenses()

  const chartData = useMemo(() => {
    const now = new Date()
    const months = eachMonthOfInterval({
      start: startOfYear(now),
      end: endOfYear(now),
    })

    return months.map((month) => {
      const revenus = transactions
        .filter((txn) => isSameMonth(parseISO(txn.date), month))
        .reduce((sum, txn) => sum + txnNet(txn), 0)

      const depenses = expenses
        .filter((exp) => isSameMonth(parseISO(exp.date), month))
        .reduce((sum, exp) => sum + exp.montant_thb, 0)

      return {
        mois: format(month, 'MMM'),
        revenus,
        depenses,
      }
    })
  }, [transactions, expenses])

  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, row) => ({
        revenus: acc.revenus + row.revenus,
        depenses: acc.depenses + row.depenses,
      }),
      { revenus: 0, depenses: 0 }
    )
  }, [chartData])

  return (
    <div className="space-y-6 pt-4">
      <Card className="p-4">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ww-border)" />
            <XAxis dataKey="mois" stroke="var(--ww-muted)" tick={{ fill: 'var(--ww-muted)', fontSize: 12 }} />
            <YAxis
              tickFormatter={(value: number) =>
                `${value.toLocaleString()} THB`
              }
              stroke="var(--ww-muted)"
              tick={{ fill: 'var(--ww-muted)', fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number | string | undefined) => [
                `${Number(value ?? 0).toLocaleString()} THB`,
              ]}
              contentStyle={{
                backgroundColor: 'var(--ww-surface)',
                border: '1px solid var(--ww-orange)',
                borderRadius: '8px',
                color: 'var(--ww-text)',
              }}
            />
            <Legend wrapperStyle={{ color: 'var(--ww-muted)' }} />
            <Bar dataKey="revenus" name="Revenus" fill="var(--ww-lime)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="depenses" name="Depenses" fill="var(--ww-danger)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <h2 className="font-display text-xl font-bold">Recapitulatif mensuel</h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mois</TableHead>
              <TableHead className="text-right">Revenus</TableHead>
              <TableHead className="text-right">Depenses</TableHead>
              <TableHead className="text-right">Solde Net</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chartData.map((row) => {
              const solde = row.revenus - row.depenses
              return (
                <TableRow key={row.mois}>
                  <TableCell>{row.mois}</TableCell>
                  <TableCell className="text-right font-display">
                    {row.revenus.toLocaleString()} THB
                  </TableCell>
                  <TableCell className="text-right font-display text-ww-danger">
                    {row.depenses.toLocaleString()} THB
                  </TableCell>
                  <TableCell
                    className={`text-right font-display font-bold ${
                      solde >= 0 ? 'text-ww-success' : 'text-ww-danger'
                    }`}
                  >
                    {solde.toLocaleString()} THB
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-bold">TOTAL</TableCell>
              <TableCell className="text-right font-display font-bold">
                {totals.revenus.toLocaleString()} THB
              </TableCell>
              <TableCell className="text-right font-display font-bold text-ww-danger">
                {totals.depenses.toLocaleString()} THB
              </TableCell>
              <TableCell
                className={`text-right font-display font-bold ${
                  totals.revenus - totals.depenses >= 0
                    ? 'text-ww-success'
                    : 'text-ww-danger'
                }`}
              >
                {(totals.revenus - totals.depenses).toLocaleString()} THB
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Card>

      {/* Depenses du mois par categorie */}
      {(['gym', 'fnb', 'resort'] as const).map((gc) => {
        const now = new Date()
        const monthExp = expenses.filter((exp) =>
          isSameMonth(parseISO(exp.date), now) && exp.grande_categorie === gc
        )
        const grouped = monthExp.reduce<Record<string, number>>((acc, exp) => {
          acc[exp.categorie] = (acc[exp.categorie] || 0) + exp.montant_thb
          return acc
        }, {})
        const entries = Object.entries(grouped).sort((a, b) => b[1] - a[1])
        const sectionTotal = monthExp.reduce((s, e) => s + e.montant_thb, 0)

        return (
          <div key={gc}>
            <h2 className="font-display text-xl font-bold">
              Depenses {gc === 'gym' ? 'GYM' : gc === 'fnb' ? 'F&B' : 'RESORT'} du mois
            </h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categorie</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-ww-muted">
                        Aucune depense ce mois
                      </TableCell>
                    </TableRow>
                  ) : (
                    entries.map(([cat, total]) => (
                      <TableRow key={cat}>
                        <TableCell>{CATEGORY_LABELS[cat] || cat}</TableCell>
                        <TableCell className="text-right font-display font-bold text-ww-danger">
                          {total.toLocaleString()} THB
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">TOTAL {gc === 'gym' ? 'GYM' : gc === 'fnb' ? 'F&B' : 'RESORT'}</TableCell>
                    <TableCell className="text-right font-display font-bold text-ww-danger">
                      {sectionTotal.toLocaleString()} THB
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
