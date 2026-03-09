'use client'

import { useState, useMemo } from 'react'
import { useTransactions } from '@/contexts/transactions-context'
import {
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
} from 'date-fns'
import { KpiRevenus } from '@/components/revenus/KpiRevenus'
import { GraphiqueEvolution } from '@/components/revenus/GraphiqueEvolution'
import { DonutRepartition } from '@/components/revenus/DonutRepartition'
import { DetailBungalows } from '@/components/revenus/DetailBungalows'
import { DetailGym } from '@/components/revenus/DetailGym'
import { DetailFnB } from '@/components/revenus/DetailFnB'
import { ComparaisonMois } from '@/components/revenus/ComparaisonMois'

type Periode = 'today' | 'week' | 'month' | 'year' | 'custom'

const PERIOD_LABELS: { value: Periode; label: string }[] = [
  { value: 'today', label: "AUJOURD'HUI" },
  { value: 'week', label: 'CETTE SEMAINE' },
  { value: 'month', label: 'CE MOIS' },
  { value: 'year', label: 'CETTE ANNEE' },
  { value: 'custom', label: 'PERSONNALISE' },
]

function getInterval(periode: Periode, dateDebut: string, dateFin: string) {
  const now = new Date()
  switch (periode) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) }
    case 'week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case 'year':
      return { start: startOfYear(now), end: endOfYear(now) }
    case 'custom':
      return {
        start: dateDebut ? startOfDay(parseISO(dateDebut)) : startOfMonth(now),
        end: dateFin ? endOfDay(parseISO(dateFin)) : endOfDay(now),
      }
  }
}

function getPreviousInterval(periode: Periode, dateDebut: string, dateFin: string) {
  const now = new Date()
  switch (periode) {
    case 'today':
      return { start: startOfDay(subDays(now, 1)), end: endOfDay(subDays(now, 1)) }
    case 'week': {
      const prev = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
      return { start: prev, end: endOfWeek(prev, { weekStartsOn: 1 }) }
    }
    case 'month': {
      const prev = startOfMonth(subMonths(now, 1))
      return { start: prev, end: endOfMonth(prev) }
    }
    case 'year': {
      const prev = startOfYear(subYears(now, 1))
      return { start: prev, end: endOfYear(prev) }
    }
    case 'custom': {
      const s = dateDebut ? parseISO(dateDebut) : startOfMonth(now)
      const e = dateFin ? parseISO(dateFin) : now
      const duration = e.getTime() - s.getTime()
      const prevEnd = new Date(s.getTime() - 1)
      const prevStart = new Date(prevEnd.getTime() - duration)
      return { start: startOfDay(prevStart), end: endOfDay(prevEnd) }
    }
  }
}

export default function RevenusPage() {
  const { transactions } = useTransactions()
  const [periode, setPeriode] = useState<Periode>('year')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')

  const interval = useMemo(() => getInterval(periode, dateDebut, dateFin), [periode, dateDebut, dateFin])
  const prevInterval = useMemo(() => getPreviousInterval(periode, dateDebut, dateFin), [periode, dateDebut, dateFin])

  const filtered = useMemo(
    () => transactions.filter((t) => isWithinInterval(parseISO(t.date), interval)),
    [transactions, interval]
  )

  const previousFiltered = useMemo(
    () => transactions.filter((t) => isWithinInterval(parseISO(t.date), prevInterval)),
    [transactions, prevInterval]
  )

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-ww-text">REVENUS</h1>

      <div className="flex flex-wrap items-center gap-2">
        {PERIOD_LABELS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setPeriode(value)}
            className={`px-4 py-1.5 rounded-full text-sm font-display font-bold transition-all duration-150 ${
              periode === value
                ? 'bg-ww-orange text-white'
                : 'bg-ww-surface-2 text-ww-muted hover:text-ww-text'
            }`}
          >
            {label}
          </button>
        ))}
        {periode === 'custom' && (
          <div className="flex items-center gap-2 ml-2">
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="bg-ww-surface-2 border border-ww-border text-ww-text text-sm rounded-lg px-3 py-1.5 font-sans"
            />
            <span className="text-ww-muted">→</span>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="bg-ww-surface-2 border border-ww-border text-ww-text text-sm rounded-lg px-3 py-1.5 font-sans"
            />
          </div>
        )}
      </div>

      <KpiRevenus transactions={filtered} previousTransactions={previousFiltered} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GraphiqueEvolution transactions={filtered} periode={periode} />
        </div>
        <DonutRepartition transactions={filtered} />
      </div>

      <DetailBungalows transactions={filtered} />
      <DetailGym transactions={filtered} />
      <DetailFnB transactions={filtered} />
      <ComparaisonMois transactions={transactions} />
    </div>
  )
}
