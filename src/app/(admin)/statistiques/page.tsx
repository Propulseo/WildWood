'use client'

import { useState, useEffect } from 'react'
import { useTransactions } from '@/contexts/transactions-context'
import { useExpenses } from '@/contexts/expenses-context'
import { getBungalows, getClients } from '@/lib/data-access'
import type { Bungalow, Client } from '@/lib/types'
import { StatsSkeleton } from '@/components/statistiques/stats-shared'
import { useStatsData } from '@/components/statistiques/use-stats-data'
import { RevenueExpensesChart, RevenueByCenterChart, DayOfWeekChart } from '@/components/statistiques/revenue-charts'
import { TopProductsChart, ExpenseDonutChart, OccupancyChart, AvgTransactionChart } from '@/components/statistiques/detail-charts'
import { StatsKpiRow, BottomSummaryCards } from '@/components/statistiques/summary-cards'

export default function StatistiquesPage() {
  const { transactions } = useTransactions()
  const { expenses } = useExpenses()
  const [bungalows, setBungalows] = useState<Bungalow[]>([])
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    getBungalows().then(setBungalows)
    getClients().then(setClients)
  }, [])

  const stats = useStatsData(transactions, expenses, bungalows, clients)

  if (transactions.length === 0) return <StatsSkeleton />

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-ww-text tracking-tight">
          Statistiques
        </h1>
        <p className="text-ww-muted text-sm mt-1">
          Analyses et indicateurs de performance
        </p>
      </div>

      <StatsKpiRow kpis={stats.summaryKpis} />

      <RevenueExpensesChart data={stats.monthlyData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueByCenterChart data={stats.revenueByCenterMonthly} />
        <DayOfWeekChart data={stats.dayOfWeekData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopProductsChart data={stats.topProducts} />
        <ExpenseDonutChart data={stats.expenseByCategory} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OccupancyChart occupancyByMonth={stats.occupancyByMonth} currentOccupancy={stats.currentOccupancy} />
        <AvgTransactionChart data={stats.avgTxnByMonth} avgTxn={stats.summaryKpis.avgTxn} />
      </div>

      <BottomSummaryCards
        paymentData={stats.paymentData}
        clientTypes={stats.clientTypes}
        monthlyData={stats.monthlyData}
      />
    </div>
  )
}
