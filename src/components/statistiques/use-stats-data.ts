import { useMemo } from 'react'
import type { Transaction, Expense, Bungalow, Client } from '@/lib/types'
import { txnNet } from '@/lib/commission'
import {
  parseISO,
  format,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
  isSameMonth,
  eachDayOfInterval,
  getDay,
  getDaysInMonth,
  subMonths,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { DAY_NAMES, EXPENSE_COLORS } from './stats-shared'
import { CATEGORY_LABELS } from '@/components/depenses/depenses-shared'

export function useStatsData(
  transactions: Transaction[],
  expenses: Expense[],
  bungalows: Bungalow[],
  clients: Client[]
) {
  const monthlyData = useMemo(() => {
    const now = new Date()
    const months = eachMonthOfInterval({ start: startOfYear(now), end: endOfYear(now) })
    return months.map((month) => {
      const revenus = transactions
        .filter((t) => isSameMonth(parseISO(t.date), month))
        .reduce((s, t) => s + txnNet(t), 0)
      const depenses = expenses
        .filter((e) => isSameMonth(parseISO(e.date), month))
        .reduce((s, e) => s + e.montant_thb, 0)
      return { mois: format(month, 'MMM', { locale: fr }), revenus, depenses, solde: revenus - depenses }
    })
  }, [transactions, expenses])

  const revenueByCenterMonthly = useMemo(() => {
    const now = new Date()
    const months = eachMonthOfInterval({ start: startOfYear(now), end: endOfYear(now) })
    return months.map((month) => {
      const monthTxns = transactions.filter((t) => isSameMonth(parseISO(t.date), month))
      return {
        mois: format(month, 'MMM', { locale: fr }),
        Gym: monthTxns.filter((t) => t.centreRevenu === 'Gym').reduce((s, t) => s + t.total, 0),
        'F&B': monthTxns.filter((t) => t.centreRevenu === 'F&B').reduce((s, t) => s + t.total, 0),
        Bungalows: monthTxns.filter((t) => t.centreRevenu === 'Bungalows').reduce((s, t) => s + txnNet(t), 0),
      }
    })
  }, [transactions])

  const dayOfWeekData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0]
    const revenue = [0, 0, 0, 0, 0, 0, 0]
    for (const t of transactions) {
      const day = getDay(parseISO(t.date))
      counts[day]++
      revenue[day] += txnNet(t)
    }
    return DAY_NAMES.map((name, i) => ({ jour: name, transactions: counts[i], revenus: revenue[i] }))
  }, [transactions])

  const topProducts = useMemo(() => {
    const productMap: Record<string, { nom: string; qty: number; revenue: number }> = {}
    for (const txn of transactions) {
      for (const item of txn.items) {
        if (!productMap[item.produitId]) {
          productMap[item.produitId] = { nom: item.nom, qty: 0, revenue: 0 }
        }
        productMap[item.produitId].qty += item.quantite
        productMap[item.produitId].revenue += item.sousTotal
      }
    }
    return Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 8).reverse()
  }, [transactions])

  const expenseByCategory = useMemo(() => {
    const grouped: Record<string, number> = {}
    for (const e of expenses) {
      grouped[e.categorie] = (grouped[e.categorie] || 0) + e.montant_thb
    }
    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({ name: CATEGORY_LABELS[name] || name, value, color: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }))
  }, [expenses])

  const occupancyByMonth = useMemo(() => {
    if (bungalows.length === 0) return []
    const now = new Date()
    const months = eachMonthOfInterval({ start: subMonths(now, 5), end: now })
    return months.map((month) => {
      const daysInMonth = getDaysInMonth(month)
      const total = 8 * daysInMonth
      let occupied = 0
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
      for (const b of bungalows) {
        for (const res of b.reservations) {
          if (res.statut === 'annulee') continue
          const resStart = parseISO(res.dateDebut)
          const resEnd = parseISO(res.dateFin)
          const overlapStart = resStart < monthStart ? monthStart : resStart
          const overlapEnd = resEnd > monthEnd ? monthEnd : resEnd
          if (overlapStart <= overlapEnd) {
            occupied += eachDayOfInterval({ start: overlapStart, end: overlapEnd }).length
          }
        }
      }
      return { mois: format(month, 'MMM yy', { locale: fr }), taux: total > 0 ? Math.round((occupied / total) * 100) : 0 }
    })
  }, [bungalows])

  const paymentData = useMemo(() => {
    const especes = transactions.filter((t) => t.methode === 'especes')
    const virement = transactions.filter((t) => t.methode === 'virement')
    return [
      { name: 'Especes', count: especes.length, value: especes.reduce((s, t) => s + txnNet(t), 0), color: 'var(--ww-orange)' },
      { name: 'Virement', count: virement.length, value: virement.reduce((s, t) => s + txnNet(t), 0), color: 'var(--ww-lime)' },
    ]
  }, [transactions])

  const clientTypes = useMemo(() => {
    const visiteurs = clients.filter((c) => c.type === 'visiteur').length
    const residents = clients.filter((c) => c.type === 'resident').length
    return [
      { name: 'Visiteurs', value: visiteurs, color: 'var(--ww-orange)' },
      { name: 'Residents', value: residents, color: 'var(--ww-lime)' },
    ]
  }, [clients])

  const avgTxnByMonth = useMemo(() => {
    const now = new Date()
    const months = eachMonthOfInterval({ start: startOfYear(now), end: endOfYear(now) })
    return months.map((month) => {
      const monthTxns = transactions.filter((t) => isSameMonth(parseISO(t.date), month))
      const total = monthTxns.reduce((s, t) => s + txnNet(t), 0)
      return { mois: format(month, 'MMM', { locale: fr }), moyenne: monthTxns.length > 0 ? Math.round(total / monthTxns.length) : 0 }
    })
  }, [transactions])

  const summaryKpis = useMemo(() => {
    const totalRevenue = transactions.reduce((s, t) => s + txnNet(t), 0)
    const totalExpenses = expenses.reduce((s, e) => s + e.montant_thb, 0)
    const avgTxn = transactions.length > 0 ? Math.round(totalRevenue / transactions.length) : 0
    const topDay = DAY_NAMES[dayOfWeekData.reduce((best, d, i, arr) => (d.revenus > arr[best].revenus ? i : best), 0)]
    return { totalRevenue, totalExpenses, avgTxn, topDay }
  }, [transactions, expenses, dayOfWeekData])

  const currentOccupancy = useMemo(() => {
    if (bungalows.length === 0) return 0
    const now = new Date()
    const daysInMonth = getDaysInMonth(now)
    const total = 8 * daysInMonth
    let occupied = 0
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    for (const b of bungalows) {
      for (const res of b.reservations) {
        if (res.statut === 'annulee') continue
        const resStart = parseISO(res.dateDebut)
        const resEnd = parseISO(res.dateFin)
        const overlapStart = resStart < monthStart ? monthStart : resStart
        const overlapEnd = resEnd > monthEnd ? monthEnd : resEnd
        if (overlapStart <= overlapEnd) {
          occupied += eachDayOfInterval({ start: overlapStart, end: overlapEnd }).length
        }
      }
    }
    return total > 0 ? Math.round((occupied / total) * 100) : 0
  }, [bungalows])

  return {
    monthlyData,
    revenueByCenterMonthly,
    dayOfWeekData,
    topProducts,
    expenseByCategory,
    occupancyByMonth,
    paymentData,
    clientTypes,
    avgTxnByMonth,
    summaryKpis,
    currentOccupancy,
  }
}
