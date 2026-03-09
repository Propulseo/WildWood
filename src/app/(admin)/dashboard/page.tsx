'use client'

import { useMemo, useState, useEffect } from 'react'
import { useTransactions } from '@/contexts/transactions-context'
import { useExpenses } from '@/contexts/expenses-context'
import { useActivePasses } from '@/contexts/active-passes-context'
import { useTables } from '@/contexts/tables-context'
import { useShift } from '@/contexts/shift-context'
import { useMessagesWA } from '@/contexts/messages-wa-context'
import { getBungalows, getClients } from '@/lib/data-access'
import type { Bungalow, Client } from '@/lib/types'
import { txnNet } from '@/lib/commission'
import {
  isToday, parseISO, subDays, format, isSameDay,
  eachDayOfInterval, isSameMonth, getDaysInMonth,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { DashboardSkeleton } from '@/components/dashboard/dashboard-shared'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { RevenueTrendChart, RevenueDonutChart } from '@/components/dashboard/revenue-charts'
import { RecentTransactions, TopProductsCard } from '@/components/dashboard/transactions-products'
import { AlertsStrip } from '@/components/dashboard/alerts-strip'
import { PlanningEncart } from '@/components/dashboard/planning-encart'

export default function DashboardPage() {
  const { transactions } = useTransactions()
  const { expenses } = useExpenses()
  const { activePasses } = useActivePasses()
  const { getTablesOuvertes } = useTables()
  const { getStaffActif, getShiftInfo } = useShift()
  const { getMessagesAEnvoyerAujourdhui } = useMessagesWA()
  const [bungalows, setBungalows] = useState<Bungalow[]>([])
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    getBungalows().then(setBungalows)
    getClients().then(setClients)
  }, [])

  // --- KPIs ---

  const todayStats = useMemo(() => {
    const todayTxns = transactions.filter(t => isToday(parseISO(t.date)))
    return { revenuTotal: todayTxns.reduce((s, t) => s + txnNet(t), 0) }
  }, [transactions])

  const monthStats = useMemo(() => {
    const now = new Date()
    const rev = transactions.filter(t => isSameMonth(parseISO(t.date), now)).reduce((s, t) => s + txnNet(t), 0)
    const dep = expenses.filter(e => isSameMonth(parseISO(e.date), now)).reduce((s, e) => s + e.montant_thb, 0)
    return { monthRevenue: rev, monthExpenses: dep, soldeNet: rev - dep }
  }, [transactions, expenses])

  const revenueTrendPercent = useMemo(() => {
    const now = new Date()
    const cur = transactions.filter(t => { const d = parseISO(t.date); return d >= subDays(now, 6) && d <= now }).reduce((s, t) => s + txnNet(t), 0)
    const prev = transactions.filter(t => { const d = parseISO(t.date); return d >= subDays(now, 13) && d < subDays(now, 6) }).reduce((s, t) => s + txnNet(t), 0)
    return prev === 0 ? 0 : Math.round(((cur - prev) / prev) * 100)
  }, [transactions])

  const occupancyRate = useMemo(() => {
    if (bungalows.length === 0) return 0
    const now = new Date()
    const total = 6 * getDaysInMonth(now)
    let occupied = 0
    for (const b of bungalows) for (const res of b.reservations) {
      if (res.statut === 'annulee' || res.statut === 'no_show' || res.statut === 'checked_out') continue
      const ms = new Date(now.getFullYear(), now.getMonth(), 1)
      const me = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      const s = parseISO(res.dateDebut) < ms ? ms : parseISO(res.dateDebut)
      const e = parseISO(res.dateFin) > me ? me : parseISO(res.dateFin)
      if (s <= e) occupied += eachDayOfInterval({ start: s, end: e }).length
    }
    return total > 0 ? Math.round((occupied / total) * 100) : 0
  }, [bungalows])

  const bungalowRevenue = useMemo(() => {
    const now = new Date()
    let brut = 0, net = 0
    for (const b of bungalows) for (const res of b.reservations) {
      if (res.statut === 'annulee' || res.statut === 'no_show' || res.statut === 'checked_out') continue
      if (!isSameMonth(parseISO(res.dateDebut), now)) continue
      brut += res.prix_total_brut ?? res.montant
      net += res.prix_total_net ?? res.montant
    }
    return { brut, net }
  }, [bungalows])

  // --- Charts ---

  const revenueTrend = useMemo(() => {
    const now = new Date()
    return eachDayOfInterval({ start: subDays(now, 6), end: now }).map(day => ({
      jour: format(day, 'EEE d', { locale: fr }),
      revenus: transactions.filter(t => isSameDay(parseISO(t.date), day)).reduce((s, t) => s + txnNet(t), 0),
    }))
  }, [transactions])

  const revenueByCenter = useMemo(() => [
    { name: 'Gym', value: transactions.filter(t => t.centreRevenu === 'Gym').reduce((s, t) => s + t.total, 0), color: 'var(--ww-orange)' },
    { name: 'F&B', value: transactions.filter(t => t.centreRevenu === 'F&B').reduce((s, t) => s + t.total, 0), color: 'var(--ww-lime)' },
    { name: 'Bungalows', value: transactions.filter(t => t.centreRevenu === 'Bungalows').reduce((s, t) => s + txnNet(t), 0), color: 'var(--ww-wood)' },
  ], [transactions])

  // --- Tables ---

  const recentTxns = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8),
    [transactions],
  )

  const clientMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of clients) map.set(c.id, `${c.prenom} ${c.nom}`)
    return map
  }, [clients])

  const topProducts = useMemo(() => {
    const counts: Record<string, { nom: string; qty: number; revenue: number }> = {}
    for (const txn of transactions) for (const item of txn.items) {
      if (!counts[item.produitId]) counts[item.produitId] = { nom: item.nom, qty: 0, revenue: 0 }
      counts[item.produitId].qty += item.quantite
      counts[item.produitId].revenue += item.sousTotal
    }
    return Object.values(counts).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
  }, [transactions])

  // --- Alerts ---

  const checkoutsToday = useMemo(() => {
    const now = new Date(); now.setHours(0, 0, 0, 0)
    let count = 0
    for (const b of bungalows) for (const r of b.reservations) {
      if (r.statut !== 'confirmee' && r.statut !== 'en-cours') continue
      const fin = parseISO(r.dateFin); fin.setHours(0, 0, 0, 0)
      if (fin.getTime() === now.getTime()) count++
    }
    return count
  }, [bungalows])

  const incompleteCheckins = useMemo(() => {
    let c = 0
    for (const b of bungalows) for (const r of b.reservations)
      if (r.statut !== 'no_show' && r.statut !== 'annulee' && r.statut !== 'checked_out'
        && isToday(parseISO(r.dateDebut)) && (!r.checkin_fait || !r.tm30_fait || !r.clef_remise)) c++
    return c
  }, [bungalows])

  const noShowCount = useMemo(() => {
    const now = new Date()
    let count = 0
    for (const b of bungalows) for (const r of b.reservations) {
      if (r.statut !== 'no_show') continue
      if (parseISO(r.dateDebut) <= now && parseISO(r.dateFin) > now) count++
    }
    return count
  }, [bungalows])

  const tablesOuvertes = getTablesOuvertes()
  const tablesTotalThb = tablesOuvertes.reduce((s, t) => s + t.total_thb, 0)

  // --- Shift (header) ---

  const receptionStaff = getStaffActif('reception')
  const barStaff = getStaffActif('bar')
  const rDepuis = getShiftInfo('reception')?.depuis?.replace(':', 'h') ?? '--'
  const bDepuis = getShiftInfo('bar')?.depuis?.replace(':', 'h') ?? '--'

  if (transactions.length === 0) return <DashboardSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-ww-text tracking-tight">Dashboard</h1>
          <p className="text-ww-muted text-sm mt-1">Vue d&apos;ensemble de votre activite</p>
        </div>
        <div className="text-right text-xs font-body text-ww-muted hidden sm:block shrink-0">
          <p className="font-display font-bold text-sm text-ww-text uppercase">
            {format(new Date(2026, 2, 6), 'd MMMM yyyy', { locale: fr })}
          </p>
          <p className="mt-0.5">
            Reception : <span className="text-ww-text">{receptionStaff?.prenom ?? '—'}</span> ({rDepuis})
            <span className="mx-1.5 text-ww-border">·</span>
            Bar : <span className="text-ww-text">{barStaff?.prenom ?? '—'}</span> ({bDepuis})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="REVENU · AUJOURD'HUI" value={todayStats.revenuTotal} prefix="฿ "
          accentColor="var(--ww-orange)" trend={{ value: revenueTrendPercent, label: 'vs sem. prec.' }} />
        <KpiCard label="REVENU · CE MOIS" value={monthStats.monthRevenue} prefix="฿ "
          accentColor="var(--ww-lime)" />
        <KpiCard label="BUNGALOWS · NET" value={bungalowRevenue.net} prefix={'\u0E3F '}
          accentColor="var(--ww-wood)"
          subtitle={`\u0E3F ${bungalowRevenue.brut.toLocaleString()} brut Booking`}
          tooltip="Prix apres commission Booking (\u00D70.8142)" />
        <KpiCard label="SOLDE NET · CE MOIS" value={monthStats.soldeNet} prefix="฿ "
          accentColor={monthStats.soldeNet >= 0 ? 'var(--ww-success)' : 'var(--ww-danger)'} />
      </div>

      <AlertsStrip checkoutsToday={checkoutsToday} incompleteCheckins={incompleteCheckins}
        noShowCount={noShowCount} tablesOuvertes={tablesOuvertes.length} tablesTotalThb={tablesTotalThb}
        messagesWA={getMessagesAEnvoyerAujourdhui().length} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RevenueTrendChart data={revenueTrend} />
        <RevenueDonutChart data={revenueByCenter} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RecentTransactions transactions={recentTxns} clientMap={clientMap} />
        <TopProductsCard products={topProducts} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-ww-surface border border-ww-border rounded-xl p-5" style={{ borderLeftWidth: 3, borderLeftColor: 'var(--ww-danger)' }}>
          <p className="ww-label mb-1.5">DEPENSES · CE MOIS</p>
          <p className="font-display font-extrabold text-2xl text-ww-danger">฿ {monthStats.monthExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-ww-surface border border-ww-border rounded-xl p-5" style={{ borderLeftWidth: 3, borderLeftColor: 'var(--ww-orange)' }}>
          <p className="ww-label mb-1.5">PASSES ACTIFS</p>
          <p className="font-display font-extrabold text-2xl text-ww-text">{activePasses.length}</p>
        </div>
        <div className="bg-ww-surface border border-ww-border rounded-xl p-5 col-span-2 sm:col-span-1" style={{ borderLeftWidth: 3, borderLeftColor: 'var(--ww-muted)' }}>
          <p className="ww-label mb-1.5">CLIENTS ENREGISTRES</p>
          <p className="font-display font-extrabold text-2xl text-ww-text">{clients.length}</p>
        </div>
      </div>

      <PlanningEncart />
    </div>
  )
}
