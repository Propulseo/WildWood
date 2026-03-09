'use client'

import { useMemo } from 'react'
import { useReporting } from '@/contexts/reporting-context'
import type { BusinessUnit } from '@/lib/types-reporting'
import { parseISO, format, startOfMonth, eachDayOfInterval, endOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Card } from '@/components/ui/card'

interface Props {
  activeBus: BusinessUnit[]
  isGlobal: boolean
}

export default function GraphiqueMensuel({ activeBus, isGlobal }: Props) {
  const { revenues, mockToday } = useReporting()

  const chartData = useMemo(() => {
    const today = parseISO(mockToday)
    const start = startOfMonth(today)
    const end = endOfMonth(today)
    const days = eachDayOfInterval({ start, end })

    return days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const label = format(day, 'd')

      if (isGlobal) {
        const gym = revenues
          .filter((r) => r.date === dateStr && r.bu === 'GYM')
          .reduce((s, r) => s + r.montant, 0)
        const resort = revenues
          .filter((r) => r.date === dateStr && r.bu === 'RESORT')
          .reduce((s, r) => s + r.montant, 0)
        return { jour: label, GYM: gym, RESORT: resort }
      }

      const total = revenues
        .filter((r) => r.date === dateStr && activeBus.includes(r.bu))
        .reduce((s, r) => s + r.montant, 0)
      return { jour: label, revenus: total }
    })
  }, [revenues, mockToday, activeBus, isGlobal])

  const monthLabel = format(parseISO(mockToday), 'MMMM yyyy', { locale: fr })

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-bold capitalize">
          Revenus — {monthLabel}
        </h3>
        {!isGlobal && (
          <div className="flex items-center gap-1 text-xs text-ww-muted">
            <span className="inline-block w-3 h-3 rounded-full bg-ww-orange" />
            Revenus
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        {isGlobal ? (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ww-border)" vertical={false} />
            <XAxis dataKey="jour" stroke="var(--ww-muted)" tick={{ fill: 'var(--ww-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis stroke="var(--ww-muted)" tick={{ fill: 'var(--ww-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={fmtTooltip} />
            <Legend wrapperStyle={{ color: 'var(--ww-muted)', fontSize: 12 }} />
            <Bar dataKey="GYM" fill="var(--ww-orange)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="RESORT" fill="var(--ww-lime)" radius={[3, 3, 0, 0]} />
          </BarChart>
        ) : (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradRevenu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--ww-orange)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--ww-orange)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ww-border)" vertical={false} />
            <XAxis dataKey="jour" stroke="var(--ww-muted)" tick={{ fill: 'var(--ww-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis stroke="var(--ww-muted)" tick={{ fill: 'var(--ww-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={fmtTooltip} />
            <Area
              type="monotone"
              dataKey="revenus"
              stroke="var(--ww-orange)"
              strokeWidth={2}
              fill="url(#gradRevenu)"
              dot={{ r: 2.5, fill: 'var(--ww-orange)', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: 'var(--ww-orange)', stroke: 'var(--ww-surface)', strokeWidth: 2 }}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </Card>
  )
}

const tooltipStyle = {
  backgroundColor: 'var(--ww-surface)',
  border: '1px solid var(--ww-orange)',
  borderRadius: '8px',
  color: 'var(--ww-text)',
}

function fmtTooltip(value: number | string | undefined) {
  return [`${Number(value ?? 0).toLocaleString()} THB`]
}
