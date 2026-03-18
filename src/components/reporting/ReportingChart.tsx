'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

interface DailyRow {
  date: string
  revenus_gym: number
  revenus_fnb: number
  revenus_resort: number
  revenus_total: number
  depenses_gym: number
  depenses_fnb: number
  depenses_resort: number
  depenses_total: number
}

type BU = 'gym' | 'resort' | 'global'

export function ReportingChart({ rows, bu }: { rows: DailyRow[]; bu: BU }) {
  const data = rows.map(r => ({
    date: new Date(r.date).toLocaleDateString('fr-FR', {
      weekday: 'short', day: 'numeric',
    }),
    revenus: bu === 'gym'    ? r.revenus_gym :
             bu === 'resort' ? r.revenus_resort : r.revenus_total,
    depenses: bu === 'gym'    ? r.depenses_gym :
              bu === 'resort' ? r.depenses_resort : r.depenses_total,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3D2A18" />
        <XAxis dataKey="date" tick={{ fill: '#8A7A66', fontSize: 11 }} />
        <YAxis
          tick={{ fill: '#8A7A66', fontSize: 11 }}
          tickFormatter={v => v > 0 ? `${(v / 1000).toFixed(0)}k` : '0'}
        />
        <Tooltip
          contentStyle={{ background: '#1A1108', border: '1px solid #3D2A18', color: '#F5EDD8' }}
          formatter={(v) => [`฿ ${Number(v ?? 0).toLocaleString()}`, '']}
        />
        <Line type="monotone" dataKey="revenus"
          stroke="#7AB648" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="depenses"
          stroke="#C94E0A" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
