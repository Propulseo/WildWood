'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useActivePasses } from '@/contexts/active-passes-context'

const TODAY = '2026-03-06'

function last14Days(): string[] {
  const days: string[] = []
  const base = new Date(TODAY)
  for (let i = 13; i >= 0; i--) {
    const d = new Date(base)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function formatShort(iso: string) {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

export function AffluenceChart() {
  const { activePasses } = useActivePasses()

  const data = useMemo(() => {
    const days = last14Days()
    return days.map((day) => ({
      jour: formatShort(day),
      entrees: activePasses.reduce(
        (n, p) => n + p.checkins.filter((c) => c.date === day).length,
        0
      ),
    }))
  }, [activePasses])

  return (
    <div>
      <h3 className="font-display text-base font-bold uppercase tracking-wide mb-3">
        Affluence Gym — 14 jours
      </h3>
      <div className="h-[200px] bg-ww-surface rounded-xl border border-ww-border p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="jour" tick={{ fill: '#8A7A66', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: '#8A7A66', fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1A1108', border: '1px solid #3D2A18', borderRadius: 8, color: '#F5EDD8', fontSize: 13 }}
              formatter={(value) => [`${value} entree${value !== 1 ? 's' : ''}`, 'Entrees']}
            />
            <Bar dataKey="entrees" fill="var(--ww-orange)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
