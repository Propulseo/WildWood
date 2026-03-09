'use client'

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { COLORS, WwTooltip, SectionTitle, renderDonutLabel } from './stats-shared'

/* ------------------------------------------------------------------ */
/*  Top Products — Horizontal bar                                     */
/* ------------------------------------------------------------------ */
export function TopProductsChart({
  data,
}: {
  data: { nom: string; qty: number; revenue: number }[]
}) {
  return (
    <div>
      <SectionTitle>Top produits par revenu</SectionTitle>
      <Card className="p-5 mt-3">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} horizontal={false} />
            <XAxis type="number" tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} stroke={COLORS.muted} tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis dataKey="nom" type="category" width={120} stroke={COLORS.muted} tick={{ fill: COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<WwTooltip />} />
            <Bar dataKey="revenue" name="Revenu" fill={COLORS.orange} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Expense Breakdown — Donut                                         */
/* ------------------------------------------------------------------ */
export function ExpenseDonutChart({
  data,
}: {
  data: { name: string; value: number; color: string }[]
}) {
  return (
    <div>
      <SectionTitle>Repartition des depenses</SectionTitle>
      <Card className="p-5 mt-3">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} strokeWidth={0} label={renderDonutLabel}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | string | undefined) => [`${Number(value ?? 0).toLocaleString()} THB`]}
              contentStyle={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: '8px', color: COLORS.text }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-xs">
              <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-ww-muted truncate">{entry.name}</span>
              <span className="ml-auto text-ww-text font-medium">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Occupancy — Radial gauge + Line                                   */
/* ------------------------------------------------------------------ */
export function OccupancyChart({
  occupancyByMonth,
  currentOccupancy,
}: {
  occupancyByMonth: { mois: string; taux: number }[]
  currentOccupancy: number
}) {
  return (
    <div>
      <SectionTitle>Taux d&apos;occupation bungalows</SectionTitle>
      <Card className="p-5 mt-3">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center justify-center w-20 h-20 relative">
            <ResponsiveContainer width={80} height={80}>
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: currentOccupancy, fill: COLORS.wood }]} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" background={{ fill: COLORS.surface2 }} cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <span className="absolute inset-0 flex items-center justify-center font-display font-extrabold text-lg text-ww-wood">
              {currentOccupancy}%
            </span>
          </div>
          <div>
            <div className="text-sm text-ww-text font-medium">Ce mois-ci</div>
            <div className="text-xs text-ww-muted">8 bungalows disponibles</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={occupancyByMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
            <XAxis dataKey="mois" stroke={COLORS.muted} tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} stroke={COLORS.muted} tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
            <Tooltip content={<WwTooltip formatter={(v: number) => `${v}%`} />} />
            <Line type="monotone" dataKey="taux" name="Occupation" stroke={COLORS.wood} strokeWidth={2} dot={{ r: 4, fill: COLORS.wood, strokeWidth: 0 }} activeDot={{ r: 6, fill: COLORS.wood, stroke: COLORS.surface, strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Average Transaction — Area chart                                  */
/* ------------------------------------------------------------------ */
export function AvgTransactionChart({
  data,
  avgTxn,
}: {
  data: { mois: string; moyenne: number }[]
  avgTxn: number
}) {
  return (
    <div>
      <SectionTitle>Panier moyen — Mensuel</SectionTitle>
      <Card className="p-5 mt-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="font-display font-extrabold text-3xl text-ww-orange">
            &#3647; {avgTxn.toLocaleString()}
          </div>
          <div className="text-xs text-ww-muted">moyenne globale</div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradAvg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.orange} stopOpacity={0.2} />
                <stop offset="100%" stopColor={COLORS.orange} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
            <XAxis dataKey="mois" stroke={COLORS.muted} tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v: number) => `${v.toLocaleString()}`} stroke={COLORS.muted} tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
            <Tooltip content={<WwTooltip />} />
            <Area type="monotone" dataKey="moyenne" name="Panier moyen" stroke={COLORS.orange} strokeWidth={2} fill="url(#gradAvg)" dot={{ r: 3, fill: COLORS.orange, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
