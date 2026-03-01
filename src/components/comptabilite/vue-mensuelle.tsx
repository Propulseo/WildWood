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
        .reduce((sum, txn) => sum + txn.total, 0)

      const depenses = expenses
        .filter((exp) => isSameMonth(parseISO(exp.date), month))
        .reduce((sum, exp) => sum + exp.montant, 0)

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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mois" />
            <YAxis
              tickFormatter={(value: number) =>
                `${value.toLocaleString()} THB`
              }
            />
            <Tooltip
              formatter={(value: number | string | undefined) => [
                `${Number(value ?? 0).toLocaleString()} THB`,
              ]}
            />
            <Legend />
            <Bar dataKey="revenus" name="Revenus" fill="#7AB648" />
            <Bar dataKey="depenses" name="Depenses" fill="#e74c3c" />
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
                  <TableCell className="text-right font-display text-red-500">
                    {row.depenses.toLocaleString()} THB
                  </TableCell>
                  <TableCell
                    className={`text-right font-display font-bold ${
                      solde >= 0 ? 'text-green-600' : 'text-red-500'
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
              <TableCell className="text-right font-display font-bold text-red-500">
                {totals.depenses.toLocaleString()} THB
              </TableCell>
              <TableCell
                className={`text-right font-display font-bold ${
                  totals.revenus - totals.depenses >= 0
                    ? 'text-green-600'
                    : 'text-red-500'
                }`}
              >
                {(totals.revenus - totals.depenses).toLocaleString()} THB
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Card>
    </div>
  )
}
