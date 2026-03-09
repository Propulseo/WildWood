'use client'

import { useMemo } from 'react'
import { useTransactions } from '@/contexts/transactions-context'
import { useExpenses } from '@/contexts/expenses-context'
import { isToday, parseISO } from 'date-fns'
import { txnNet } from '@/lib/commission'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CATEGORY_LABELS } from '@/components/depenses/depenses-shared'

export default function VueJournaliere() {
  const { transactions } = useTransactions()
  const { expenses } = useExpenses()

  const { todayRevenue, revenueByCenter, todayExpenses, totalExpenses } =
    useMemo(() => {
      const todayTxns = transactions.filter((txn) =>
        isToday(parseISO(txn.date))
      )

      const todayRevenue = todayTxns.reduce((sum, txn) => sum + txnNet(txn), 0)

      const revenueByCenter = {
        Gym: todayTxns
          .filter((t) => t.centreRevenu === 'Gym')
          .reduce((s, t) => s + t.total, 0),
        'F&B': todayTxns
          .filter((t) => t.centreRevenu === 'F&B')
          .reduce((s, t) => s + t.total, 0),
        Bungalows: todayTxns
          .filter((t) => t.centreRevenu === 'Bungalows')
          .reduce((s, t) => s + txnNet(t), 0),
      }

      const todayExpenses = expenses.filter((exp) =>
        isToday(parseISO(exp.date))
      )

      const totalExpenses = todayExpenses.reduce(
        (sum, exp) => sum + exp.montant_thb,
        0
      )

      return { todayRevenue, revenueByCenter, todayExpenses, totalExpenses }
    }, [transactions, expenses])

  const soldeNet = todayRevenue - totalExpenses

  return (
    <div className="space-y-6 pt-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="ww-label">
              Revenu du jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">
              {todayRevenue.toLocaleString()} THB
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="ww-label">
              Depenses du jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display text-ww-danger">
              {totalExpenses.toLocaleString()} THB
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="ww-label">
              Solde net
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold font-display ${
                soldeNet >= 0 ? 'text-ww-success' : 'text-ww-danger'
              }`}
            >
              {soldeNet.toLocaleString()} THB
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by center */}
      <h2 className="font-display text-xl font-bold">Revenus par centre</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="ww-label">
              Gym
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-ww-orange">
              {revenueByCenter.Gym.toLocaleString()} THB
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="ww-label">
              F&B
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-ww-lime">
              {revenueByCenter['F&B'].toLocaleString()} THB
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="ww-label">
              Bungalows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-ww-wood">
              {revenueByCenter.Bungalows.toLocaleString()} THB
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's expenses */}
      <h2 className="font-display text-xl font-bold">Depenses du jour</h2>
      {todayExpenses.length === 0 ? (
        <p className="text-ww-muted">Aucune depense aujourd&apos;hui</p>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categorie</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todayExpenses.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell>{CATEGORY_LABELS[exp.categorie] || exp.categorie}</TableCell>
                  <TableCell className="font-display font-bold text-ww-danger">
                    {exp.montant_thb.toLocaleString()} THB
                  </TableCell>
                  <TableCell className="text-ww-muted">
                    {exp.note || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
