'use client'

import { useMemo } from 'react'
import { useReporting } from '@/contexts/reporting-context'
import type { BusinessUnit } from '@/lib/types-reporting'
import { parseISO, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useCountUp } from '@/lib/use-count-up'

export default function BilanMensuel({ activeBus }: { activeBus: BusinessUnit[] }) {
  const { revenues, expensesDaily, expensesMonthly, mockToday } = useReporting()
  const currentMois = mockToday.slice(0, 7)

  const { totalRev, totalExpDaily, totalExpMonthly, netProfit } = useMemo(() => {
    const totalRev = revenues
      .filter((r) => r.date.startsWith(currentMois) && activeBus.includes(r.bu))
      .reduce((s, r) => s + r.montant, 0)
    const totalExpDaily = expensesDaily
      .filter((e) => e.date.startsWith(currentMois) && activeBus.includes(e.bu))
      .reduce((s, e) => s + e.montant, 0)
    const totalExpMonthly = expensesMonthly
      .filter((e) => e.mois === currentMois && activeBus.includes(e.bu))
      .reduce((s, e) => s + e.montant, 0)
    return {
      totalRev,
      totalExpDaily,
      totalExpMonthly,
      netProfit: totalRev - totalExpDaily - totalExpMonthly,
    }
  }, [revenues, expensesDaily, expensesMonthly, currentMois, activeBus])

  const monthLabel = format(parseISO(`${currentMois}-01`), 'MMMM yyyy', { locale: fr })
  const marginPct = totalRev > 0 ? Math.round((netProfit / totalRev) * 100) : 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <BilanBlock label="REVENUS" sublabel={monthLabel} value={totalRev} color="var(--ww-lime)" />
      <BilanBlock label="DEP. QUOTIDIENNES" sublabel={monthLabel} value={totalExpDaily} color="var(--ww-danger)" />
      <BilanBlock label="CHARGES MENSUELLES" sublabel={monthLabel} value={totalExpMonthly} color="var(--ww-danger)" />
      <div
        className="bg-ww-surface border border-ww-border rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5"
        style={{ borderLeftWidth: 3, borderLeftColor: netProfit >= 0 ? 'var(--ww-success)' : 'var(--ww-danger)' }}
      >
        <p className="ww-label mb-1">PROFIT NET</p>
        <p className="text-[10px] text-ww-muted capitalize mb-2">{monthLabel}</p>
        <p className={`font-display font-extrabold text-2xl tracking-tight ${
          netProfit >= 0 ? 'text-ww-success' : 'text-ww-danger'
        }`}>
          <AnimatedValue value={netProfit} />
          <span className="text-sm text-ww-muted ml-1">THB</span>
        </p>
        <span className={`inline-block mt-1 text-xs font-mono px-2 py-0.5 rounded-full ${
          marginPct >= 0 ? 'bg-ww-lime-glow text-ww-lime' : 'bg-red-500/10 text-ww-danger'
        }`}>
          {marginPct}%
        </span>
      </div>
    </div>
  )
}

function BilanBlock({ label, sublabel, value, color }: {
  label: string; sublabel: string; value: number; color: string
}) {
  return (
    <div
      className="bg-ww-surface border border-ww-border rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5"
      style={{ borderLeftWidth: 3, borderLeftColor: color }}
    >
      <p className="ww-label mb-1">{label}</p>
      <p className="text-[10px] text-ww-muted capitalize mb-2">{sublabel}</p>
      <p className="font-display font-extrabold text-2xl text-ww-text tracking-tight">
        <AnimatedValue value={value} />
        <span className="text-sm text-ww-muted ml-1">THB</span>
      </p>
    </div>
  )
}

function AnimatedValue({ value }: { value: number }) {
  const animated = useCountUp(Math.abs(value))
  return <>{value < 0 && '-'}{animated.toLocaleString()}</>
}
