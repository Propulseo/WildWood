'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { CheckinEntry, Transaction } from '@/lib/types'

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7) // 07h → 18h

function buildHourlyData(checkins: CheckinEntry[], transactions: Transaction[], today: string) {
  const todayCheckins = checkins.filter((c) => c.date_entree === today)
  const todayFnb = transactions.filter(
    (t) => t.date.startsWith(today) && (t.centreRevenu === 'F&B')
  )

  return HOURS.map((h) => {
    const label = `${String(h).padStart(2, '0')}h`
    const entrees = todayCheckins.filter((c) => {
      const hour = parseInt(c.heure_entree.split(':')[0], 10)
      return hour === h
    }).length
    const fnb = todayFnb
      .filter((t) => {
        const hour = new Date(t.date).getHours()
        return hour === h
      })
      .reduce((s, t) => s + t.total, 0)
    return { heure: label, entrees, fnb }
  })
}

const tooltipStyle = {
  backgroundColor: '#1A1108',
  border: '1px solid #3D2A18',
  borderRadius: 8,
  color: '#F5EDD8',
  fontSize: 13,
}

interface HourlyActivityChartProps {
  checkins: CheckinEntry[]
  transactions: Transaction[]
  today: string
}

export function HourlyActivityChart({ checkins, transactions, today }: HourlyActivityChartProps) {
  const data = useMemo(
    () => buildHourlyData(checkins, transactions, today),
    [checkins, transactions, today]
  )

  const totalEntrees = data.reduce((s, d) => s + d.entrees, 0)
  const totalFnb = data.reduce((s, d) => s + d.fnb, 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <h3 className="font-display text-base font-bold uppercase tracking-wide text-ww-text">
          Activite du jour
        </h3>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-sans text-ww-muted">
            <span className="h-2.5 w-2.5 rounded-sm bg-ww-orange" />
            {totalEntrees} entrees
          </span>
          <span className="text-ww-muted text-xs">·</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-sans text-ww-muted">
            <span className="h-2.5 w-2.5 rounded-sm bg-[var(--ww-lime)]" />
            F&B ฿ {totalFnb.toLocaleString('fr-FR')}
          </span>
        </div>
      </div>

      <div className="h-[220px] bg-ww-surface rounded-xl border border-ww-border p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2} barCategoryGap="20%">
            <XAxis
              dataKey="heure"
              tick={{ fill: '#8A7A66', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              allowDecimals={false}
              tick={{ fill: '#8A7A66', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={24}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#8A7A66', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={40}
              tickFormatter={(v: number) => (v === 0 ? '0' : `${v}`)}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value, name) => {
                const v = Number(value ?? 0)
                if (name === 'entrees') return [`${v}`, 'Entrees']
                return [`฿ ${v.toLocaleString('fr-FR')}`, 'F&B']
              }}
            />
            <Legend
              verticalAlign="top"
              height={28}
              iconType="square"
              iconSize={10}
              formatter={(value: string) => (
                <span style={{ color: '#8A7A66', fontSize: 11 }}>
                  {value === 'entrees' ? 'Entrees' : 'F&B (฿)'}
                </span>
              )}
            />
            <Bar
              yAxisId="left"
              dataKey="entrees"
              fill="var(--ww-orange)"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="fnb"
              fill="var(--ww-lime)"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
