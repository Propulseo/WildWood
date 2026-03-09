'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { useReporting } from '@/contexts/reporting-context'
import type { BusinessUnit } from '@/lib/types-reporting'
import { parseISO, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import HeroKpis from '@/components/reporting/HeroKpis'
import SaisieRevenus from '@/components/reporting/SaisieRevenus'
import SaisieDepensesDaily from '@/components/reporting/SaisieDepensesDaily'
import ClotureCaisse from '@/components/reporting/ClotureCaisse'
import TableauSemaine from '@/components/reporting/TableauSemaine'
import GraphiqueMensuel from '@/components/reporting/GraphiqueMensuel'
import DepensesMensuelles from '@/components/reporting/DepensesMensuelles'
import BilanMensuel from '@/components/reporting/BilanMensuel'
import ClosingCard from '@/components/reporting/ClosingCard'
import HistoriqueClosings from '@/components/reporting/HistoriqueClosings'

type Period = 'today' | 'week' | 'month' | 'closings'
type BuTab = 'GYM' | 'RESORT' | 'GLOBAL'

const BU_TABS: BuTab[] = ['GYM', 'RESORT', 'GLOBAL']

const PERIOD_TABS: { value: Period; label: string; adminOnly?: boolean }[] = [
  { value: 'today', label: "Aujourd'hui" },
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'closings', label: 'Closings', adminOnly: true },
]

export default function ReportingPage() {
  const { role } = useAuth()
  const { mockToday } = useReporting()
  const isAdmin = role === 'admin'
  const [bu, setBu] = useState<BuTab>('GYM')
  const [period, setPeriod] = useState<Period>('today')

  const activeBus: BusinessUnit[] = bu === 'GLOBAL' ? ['GYM', 'RESORT'] : [bu]
  const dateLabel = format(parseISO(mockToday), 'EEEE d MMMM yyyy', { locale: fr })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ww-text tracking-tight">
            Reporting
          </h1>
          <p className="text-ww-muted text-sm mt-1 capitalize">{dateLabel}</p>
        </div>
        <div className="flex rounded-lg border border-ww-border overflow-hidden shrink-0">
          {BU_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setBu(t)}
              className={`px-4 py-2 text-sm font-display font-bold transition-colors ${
                bu === t
                  ? 'bg-ww-orange text-white'
                  : 'bg-ww-surface text-ww-muted hover:text-ww-text hover:bg-ww-surface-2'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Period pills */}
      <div className="flex items-center gap-2">
        {PERIOD_TABS.filter((t) => !t.adminOnly || isAdmin).map((t) => (
          <button
            key={t.value}
            onClick={() => setPeriod(t.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              period === t.value
                ? 'bg-ww-orange text-white border-ww-orange'
                : 'bg-ww-surface-2 text-ww-muted border-ww-border hover:border-ww-orange/50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Hero KPIs — always visible */}
      {period !== 'closings' && <HeroKpis activeBus={activeBus} period={period} />}

      {/* Today View */}
      {period === 'today' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeBus.map((unit) => (
              <SaisieRevenus key={`rev-${unit}`} bu={unit} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeBus.map((unit) => (
              <SaisieDepensesDaily key={`exp-${unit}`} bu={unit} />
            ))}
          </div>
          {bu !== 'GLOBAL' && <ClotureCaisse bu={bu as BusinessUnit} />}
          {isAdmin && <ClosingCard />}
        </div>
      )}

      {/* Week View */}
      {period === 'week' && <TableauSemaine activeBus={activeBus} />}

      {/* Month View */}
      {period === 'month' && (
        <div className="space-y-6">
          <GraphiqueMensuel activeBus={activeBus} isGlobal={bu === 'GLOBAL'} />
          {isAdmin && <DepensesMensuelles activeBus={activeBus} />}
        </div>
      )}

      {/* Closings View (admin only) */}
      {period === 'closings' && isAdmin && <HistoriqueClosings />}
    </div>
  )
}
