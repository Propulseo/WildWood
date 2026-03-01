'use client'

import { useMemo } from 'react'
import { useTransactions } from '@/contexts/transactions-context'
import { isToday, parseISO } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Ticket, CalendarPlus } from 'lucide-react'

export default function DashboardPage() {
  const { transactions } = useTransactions()

  const todayStats = useMemo(() => {
    const todayTxns = transactions.filter((txn) => isToday(parseISO(txn.date)))

    const revenuTotal = todayTxns.reduce((sum, txn) => sum + txn.total, 0)

    const passesVendus = todayTxns
      .filter((txn) => txn.type === 'gym-pass')
      .reduce(
        (sum, txn) =>
          txn.items.reduce((s, item) => s + item.quantite, 0) + sum,
        0
      )

    const nouvellesReservations = todayTxns.filter(
      (txn) => txn.type === 'bungalow'
    ).length

    const revenueByCenter = {
      Gym: todayTxns
        .filter((t) => t.centreRevenu === 'Gym')
        .reduce((s, t) => s + t.total, 0),
      'F&B': todayTxns
        .filter((t) => t.centreRevenu === 'F&B')
        .reduce((s, t) => s + t.total, 0),
      Bungalows: todayTxns
        .filter((t) => t.centreRevenu === 'Bungalows')
        .reduce((s, t) => s + t.total, 0),
    }

    return { revenuTotal, passesVendus, nouvellesReservations, revenueByCenter }
  }, [transactions])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Chiffres cles du jour</p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenus du jour
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">
              {todayStats.revenuTotal.toLocaleString()} THB
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Passes vendus
            </CardTitle>
            <Ticket className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">
              {todayStats.passesVendus}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nouvelles reservations
            </CardTitle>
            <CalendarPlus className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">
              {todayStats.nouvellesReservations}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by center */}
      <h2 className="font-display text-xl font-bold">Revenus par centre</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gym
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-wildwood-orange">
              {todayStats.revenueByCenter.Gym.toLocaleString()} THB
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              F&B
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-wildwood-lime">
              {todayStats.revenueByCenter['F&B'].toLocaleString()} THB
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bungalows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-wildwood-bois">
              {todayStats.revenueByCenter.Bungalows.toLocaleString()} THB
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
