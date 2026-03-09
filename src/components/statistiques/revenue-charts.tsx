'use client'

import {
  AreaChart, Area, BarChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { COLORS, WwTooltip, SectionTitle } from './stats-shared'

/* ------------------------------------------------------------------ */
/*  Revenue vs Expenses — Area chart                                  */
/* ------------------------------------------------------------------ */
export function RevenueExpensesChart({
  data,
}: {
  data: { mois: string; revenus: number; depenses: number }[]
}) {
  return (
    <>
      <SectionTitle>Revenus vs Depenses — Annee 2026</SectionTitle>
      <Card className="p-5">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradRevenu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.lime} stopOpacity={0.25} />
                <stop offset="100%" stopColor={COLORS.lime} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradDepense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.danger} stopOpacity={0.15} />
                <stop offset="100%" stopColor={COLORS.danger} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
            <XAxis dataKey="mois" stroke={COLORS.muted} tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} stroke={COLORS.muted} tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
            <Tooltip content={<WwTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 8 }} formatter={(value: string) => <span className="text-xs text-ww-muted">{value}</span>} />
            <Area type="monotone" dataKey="revenus" name="Revenus" stroke={COLORS.lime} strokeWidth={2} fill="url(#gradRevenu)" dot={{ r: 3, fill: COLORS.lime, strokeWidth: 0 }} />
            <Area type="monotone" dataKey="depenses" name="Depenses" stroke={COLORS.danger} strokeWidth={2} fill="url(#gradDepense)" dot={{ r: 3, fill: COLORS.danger, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Revenue by Center — Stacked bar                                   */
/* ------------------------------------------------------------------ */
export function RevenueByCenterChart({
  data,
}: {
  data: { mois: string; Gym: number; 'F&B': number; Bungalows: number }[]
}) {
  return (
    <div>
      <SectionTitle>Revenus par centre — Mensuel</SectionTitle>
      <Card className="p-5 mt-3">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
            <XAxis dataKey="mois" stroke={COLORS.muted} tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} stroke={COLORS.muted} tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
            <Tooltip content={<WwTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 8 }} formatter={(value: string) => <span className="text-xs text-ww-muted">{value}</span>} />
            <Bar dataKey="Gym" name="Gym" fill={COLORS.orange} radius={[2, 2, 0, 0]} stackId="rev" />
            <Bar dataKey="F&B" name="F&B" fill={COLORS.lime} radius={[0, 0, 0, 0]} stackId="rev" />
            <Bar dataKey="Bungalows" name="Bungalows" fill={COLORS.wood} radius={[4, 4, 0, 0]} stackId="rev" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Day of Week — Bar + Line combo                                    */
/* ------------------------------------------------------------------ */
export function DayOfWeekChart({
  data,
}: {
  data: { jour: string; transactions: number; revenus: number }[]
}) {
  return (
    <div>
      <SectionTitle>Activite par jour de la semaine</SectionTitle>
      <Card className="p-5 mt-3">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
            <XAxis dataKey="jour" stroke={COLORS.muted} tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} stroke={COLORS.muted} tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
            <YAxis yAxisId="right" orientation="right" stroke={COLORS.muted} tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
            <Tooltip content={<WwTooltip />} />
            <Bar yAxisId="left" dataKey="revenus" name="Revenus" fill={COLORS.orange} radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="transactions" name="Transactions" stroke={COLORS.lime} strokeWidth={2} dot={{ r: 3, fill: COLORS.lime, strokeWidth: 0 }} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
