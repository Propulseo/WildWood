'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { ChartTooltip, renderDonutLabel } from './dashboard-shared'

/* ------------------------------------------------------------------ */
/*  Revenue Trend — Area chart (last 7 days)                          */
/* ------------------------------------------------------------------ */
export function RevenueTrendChart({
  data,
}: {
  data: { jour: string; revenus: number }[]
}) {
  return (
    <Card className="lg:col-span-2 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold text-ww-text">
          Revenus — 7 derniers jours
        </h2>
        <div className="flex items-center gap-1 text-xs text-ww-muted">
          <span className="inline-block w-3 h-3 rounded-full bg-ww-orange" />
          Revenus
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gradOrange" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--ww-orange)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--ww-orange)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--ww-border)" vertical={false} />
          <XAxis dataKey="jour" stroke="var(--ww-muted)" tick={{ fill: 'var(--ww-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} stroke="var(--ww-muted)" tick={{ fill: 'var(--ww-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="revenus" stroke="var(--ww-orange)" strokeWidth={2} fill="url(#gradOrange)" dot={{ r: 3, fill: 'var(--ww-orange)', strokeWidth: 0 }} activeDot={{ r: 5, fill: 'var(--ww-orange)', stroke: 'var(--ww-surface)', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Revenue Donut — By center                                         */
/* ------------------------------------------------------------------ */
export function RevenueDonutChart({
  data,
}: {
  data: { name: string; value: number; color: string }[]
}) {
  return (
    <Card className="p-5">
      <h2 className="font-display text-lg font-bold text-ww-text mb-4">
        Revenus par centre
      </h2>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} strokeWidth={0} label={renderDonutLabel}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number | string | undefined) => [`${Number(value ?? 0).toLocaleString()} THB`]}
            contentStyle={{ backgroundColor: 'var(--ww-surface)', border: '1px solid var(--ww-orange)', borderRadius: '8px', color: 'var(--ww-text)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-xs">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-ww-muted">{entry.name}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
