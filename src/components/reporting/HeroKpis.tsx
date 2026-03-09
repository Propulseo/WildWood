'use client'

import { useMemo } from 'react'
import { useReporting } from '@/contexts/reporting-context'
import type { BusinessUnit } from '@/lib/types-reporting'
import { parseISO, startOfWeek, endOfWeek, isWithinInterval, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useCountUp } from '@/lib/use-count-up'
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react'

interface Props {
  activeBus: BusinessUnit[]
  period: 'today' | 'week' | 'month'
}

export default function HeroKpis({ activeBus, period }: Props) {
  const { revenues, expensesDaily, expensesMonthly, mockToday } = useReporting()

  const stats = useMemo(() => {
    const today = parseISO(mockToday)
    const currentMois = mockToday.slice(0, 7)

    if (period === 'today') {
      const rev = revenues.filter((r) => r.date === mockToday && activeBus.includes(r.bu))
        .reduce((s, r) => s + r.montant, 0)
      const exp = expensesDaily.filter((e) => e.date === mockToday && activeBus.includes(e.bu))
        .reduce((s, e) => s + e.montant, 0)
      return { rev, exp, profit: rev - exp }
    }

    if (period === 'week') {
      const start = startOfWeek(today, { weekStartsOn: 1 })
      const end = endOfWeek(today, { weekStartsOn: 1 })
      const rev = revenues.filter((r) => activeBus.includes(r.bu) &&
        isWithinInterval(parseISO(r.date), { start, end }))
        .reduce((s, r) => s + r.montant, 0)
      const exp = expensesDaily.filter((e) => activeBus.includes(e.bu) &&
        isWithinInterval(parseISO(e.date), { start, end }))
        .reduce((s, e) => s + e.montant, 0)
      return { rev, exp, profit: rev - exp }
    }

    // month
    const rev = revenues.filter((r) => r.date.startsWith(currentMois) && activeBus.includes(r.bu))
      .reduce((s, r) => s + r.montant, 0)
    const expD = expensesDaily.filter((e) => e.date.startsWith(currentMois) && activeBus.includes(e.bu))
      .reduce((s, e) => s + e.montant, 0)
    const expM = expensesMonthly.filter((e) => e.mois === currentMois && activeBus.includes(e.bu))
      .reduce((s, e) => s + e.montant, 0)
    return { rev, exp: expD + expM, profit: rev - expD - expM }
  }, [revenues, expensesDaily, expensesMonthly, mockToday, activeBus, period])

  const margin = stats.rev > 0 ? Math.round((stats.profit / stats.rev) * 100) : 0
  const periodLabel = period === 'today' ? "aujourd'hui"
    : period === 'week' ? `sem. du ${format(startOfWeek(parseISO(mockToday), { weekStartsOn: 1 }), 'd MMM', { locale: fr })}`
    : format(parseISO(mockToday), 'MMMM', { locale: fr })

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <KpiBlock
        label={`REVENUS · ${periodLabel.toUpperCase()}`}
        value={stats.rev}
        accentColor="var(--ww-lime)"
      />
      <KpiBlock
        label={`DEPENSES · ${periodLabel.toUpperCase()}`}
        value={stats.exp}
        accentColor="var(--ww-danger)"
      />
      <KpiBlock
        label={`PROFIT · ${periodLabel.toUpperCase()}`}
        value={stats.profit}
        accentColor={stats.profit >= 0 ? 'var(--ww-success)' : 'var(--ww-danger)'}
        badge={margin}
      />
    </div>
  )
}

function KpiBlock({
  label, value, accentColor, badge,
}: {
  label: string; value: number; accentColor: string; badge?: number
}) {
  const animated = useCountUp(Math.abs(value))

  return (
    <div
      className="bg-ww-surface border border-ww-border rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_24px_var(--ww-orange-glow)]"
      style={{ borderLeftWidth: 3, borderLeftColor: accentColor }}
    >
      <p className="ww-label mb-2">{label}</p>
      <div className="flex items-baseline gap-3">
        <p className="font-display font-extrabold text-3xl text-ww-text tracking-tight">
          {value < 0 && '-'}{animated.toLocaleString()}
          <span className="text-lg text-ww-muted ml-1">THB</span>
        </p>
        {badge !== undefined && (
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
            badge >= 0 ? 'bg-ww-lime-glow text-ww-lime' : 'bg-red-500/10 text-ww-danger'
          }`}>
            {badge >= 20 ? <TrendingUp className="h-3 w-3" /> :
             badge <= -10 ? <TrendingDown className="h-3 w-3" /> :
             <Minus className="h-3 w-3" />}
            {badge}%
          </span>
        )}
      </div>
    </div>
  )
}
