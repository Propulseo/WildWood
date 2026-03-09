'use client'

import { useMemo } from 'react'
import { useTransactions } from '@/contexts/transactions-context'
import { useExpenses } from '@/contexts/expenses-context'
import {
  parseISO,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  eachDayOfInterval,
  format,
  isSameDay,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { txnNet } from '@/lib/commission'
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
import { CATEGORY_LABELS } from '@/components/depenses/depenses-shared'

export default function VueHebdomadaire() {
  const { transactions } = useTransactions()
  const { expenses } = useExpenses()

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const weekInterval = { start: weekStart, end: weekEnd }

  const days = eachDayOfInterval(weekInterval)

  const weekTxns = useMemo(
    () => transactions.filter((t) => isWithinInterval(parseISO(t.date), weekInterval)),
    [transactions, weekStart.toISOString()],
  )

  const weekExpenses = useMemo(
    () => expenses.filter((e) => isWithinInterval(parseISO(e.date), weekInterval)),
    [expenses, weekStart.toISOString()],
  )

  // --- KPIs ---
  const totalRevenue = weekTxns.reduce((s, t) => s + txnNet(t), 0)
  const totalExpenses = weekExpenses.reduce((s, e) => s + e.montant_thb, 0)
  const soldeNet = totalRevenue - totalExpenses

  const revenueByCenter = useMemo(() => ({
    Gym: weekTxns.filter((t) => t.centreRevenu === 'Gym').reduce((s, t) => s + t.total, 0),
    'F&B': weekTxns.filter((t) => t.centreRevenu === 'F&B').reduce((s, t) => s + t.total, 0),
    Bungalows: weekTxns.filter((t) => t.centreRevenu === 'Bungalows').reduce((s, t) => s + txnNet(t), 0),
  }), [weekTxns])

  // --- Chart data ---
  const chartData = days.map((day) => {
    const dayTxns = weekTxns.filter((t) => isSameDay(parseISO(t.date), day))
    const dayExp = weekExpenses.filter((e) => isSameDay(parseISO(e.date), day))
    return {
      jour: format(day, 'EEE d', { locale: fr }),
      revenus: dayTxns.reduce((s, t) => s + txnNet(t), 0),
      depenses: dayExp.reduce((s, e) => s + e.montant_thb, 0),
    }
  })

  // --- Expense categories ---
  const expByCategory = weekExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.categorie] = (acc[e.categorie] || 0) + e.montant_thb
    return acc
  }, {})
  const expEntries = Object.entries(expByCategory).sort((a, b) => b[1] - a[1])

  const weekLabel = `${format(weekStart, 'd MMM', { locale: fr })} — ${format(weekEnd, 'd MMM yyyy', { locale: fr })}`

  return (
    <div className="space-y-6 pt-4">
      <p className="text-sm text-ww-muted font-sans capitalize">{weekLabel}</p>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="ww-label mb-1">Revenu de la semaine</div>
          <div className="text-3xl font-bold font-display">{totalRevenue.toLocaleString()} THB</div>
        </Card>
        <Card className="p-4">
          <div className="ww-label mb-1">Depenses de la semaine</div>
          <div className="text-3xl font-bold font-display text-ww-danger">{totalExpenses.toLocaleString()} THB</div>
        </Card>
        <Card className="p-4">
          <div className="ww-label mb-1">Solde net</div>
          <div className={`text-3xl font-bold font-display ${soldeNet >= 0 ? 'text-ww-success' : 'text-ww-danger'}`}>
            {soldeNet.toLocaleString()} THB
          </div>
        </Card>
      </div>

      {/* Revenue by center */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="ww-label mb-1">Gym</div>
          <div className="text-2xl font-bold font-display text-ww-orange">{revenueByCenter.Gym.toLocaleString()} THB</div>
        </Card>
        <Card className="p-4">
          <div className="ww-label mb-1">F&B</div>
          <div className="text-2xl font-bold font-display text-ww-lime">{revenueByCenter['F&B'].toLocaleString()} THB</div>
        </Card>
        <Card className="p-4">
          <div className="ww-label mb-1">Bungalows</div>
          <div className="text-2xl font-bold font-display text-ww-wood">{revenueByCenter.Bungalows.toLocaleString()} THB</div>
        </Card>
      </div>

      {/* Daily chart */}
      <Card className="p-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ww-border)" />
            <XAxis dataKey="jour" stroke="var(--ww-muted)" tick={{ fill: 'var(--ww-muted)', fontSize: 12 }} />
            <YAxis
              tickFormatter={(v: number) => `${v.toLocaleString()}`}
              stroke="var(--ww-muted)"
              tick={{ fill: 'var(--ww-muted)', fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number | string | undefined) => [`${Number(value ?? 0).toLocaleString()} THB`]}
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

      {/* Daily breakdown table */}
      <h2 className="font-display text-xl font-bold">Detail par jour</h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jour</TableHead>
              <TableHead className="text-right">Revenus</TableHead>
              <TableHead className="text-right">Depenses</TableHead>
              <TableHead className="text-right">Solde</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chartData.map((row) => {
              const solde = row.revenus - row.depenses
              return (
                <TableRow key={row.jour}>
                  <TableCell className="capitalize">{row.jour}</TableCell>
                  <TableCell className="text-right font-display">{row.revenus.toLocaleString()} THB</TableCell>
                  <TableCell className="text-right font-display text-ww-danger">{row.depenses.toLocaleString()} THB</TableCell>
                  <TableCell className={`text-right font-display font-bold ${solde >= 0 ? 'text-ww-success' : 'text-ww-danger'}`}>
                    {solde.toLocaleString()} THB
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-bold">TOTAL</TableCell>
              <TableCell className="text-right font-display font-bold">{totalRevenue.toLocaleString()} THB</TableCell>
              <TableCell className="text-right font-display font-bold text-ww-danger">{totalExpenses.toLocaleString()} THB</TableCell>
              <TableCell className={`text-right font-display font-bold ${soldeNet >= 0 ? 'text-ww-success' : 'text-ww-danger'}`}>
                {soldeNet.toLocaleString()} THB
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Card>

      {/* Expenses by category */}
      <h2 className="font-display text-xl font-bold">Depenses par categorie</h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categorie</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-ww-muted">Aucune depense cette semaine</TableCell>
              </TableRow>
            ) : (
              expEntries.map(([cat, total]) => (
                <TableRow key={cat}>
                  <TableCell>{CATEGORY_LABELS[cat] || cat}</TableCell>
                  <TableCell className="text-right font-display font-bold text-ww-danger">{total.toLocaleString()} THB</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-bold">TOTAL</TableCell>
              <TableCell className="text-right font-display font-bold text-ww-danger">{totalExpenses.toLocaleString()} THB</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Card>
    </div>
  )
}
