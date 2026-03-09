'use client'

import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import type { Transaction } from '@/lib/types'
import { txnNet } from '@/lib/commission'
import { parseISO, format } from 'date-fns'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

interface GraphiqueEvolutionProps {
  transactions: Transaction[]
  periode: string
}

const SOURCES = [
  { key: 'Bungalows', color: 'var(--ww-orange)' },
  { key: 'Gym', color: 'var(--ww-lime)' },
  { key: 'F&B', color: 'var(--ww-wood)' },
]

export function GraphiqueEvolution({ transactions, periode }: GraphiqueEvolutionProps) {
  const [hidden, setHidden] = useState<Record<string, boolean>>({})

  const chartData = useMemo(() => {
    const bucketFmt = periode === 'year' ? 'yyyy-MM' : 'yyyy-MM-dd'
    const displayFmt = periode === 'year' ? 'MMM' : 'dd/MM'
    const grouped: Record<string, { sortKey: string; label: string; Bungalows: number; Gym: number; 'F&B': number }> = {}

    transactions.forEach((t) => {
      const d = parseISO(t.date)
      const sortKey = format(d, bucketFmt)
      const label = format(d, displayFmt)
      if (!grouped[sortKey]) grouped[sortKey] = { sortKey, label, Bungalows: 0, Gym: 0, 'F&B': 0 }
      grouped[sortKey][t.centreRevenu] += txnNet(t)
    })

    return Object.values(grouped).sort((a, b) => a.sortKey.localeCompare(b.sortKey))
  }, [transactions, periode])

  return (
    <Card className="p-4">
      <h3 className="font-display font-bold text-lg mb-4 text-ww-text">Evolution des revenus</h3>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--ww-border)" />
          <XAxis dataKey="label" stroke="var(--ww-muted)" tick={{ fill: 'var(--ww-muted)', fontSize: 12 }} />
          <YAxis
            tickFormatter={(v: number) => `฿${(v / 1000).toFixed(0)}k`}
            stroke="var(--ww-muted)"
            tick={{ fill: 'var(--ww-muted)', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--ww-surface)',
              border: '1px solid var(--ww-orange)',
              borderRadius: '8px',
              color: 'var(--ww-text)',
            }}
            formatter={(value: number | string | undefined) => [`฿ ${Number(value ?? 0).toLocaleString()}`]}
            labelStyle={{ color: 'var(--ww-muted)' }}
          />
          <Legend
            onClick={(e: { value?: string }) => {
              if (e?.value) setHidden((prev) => ({ ...prev, [e.value!]: !prev[e.value!] }))
            }}
            wrapperStyle={{ cursor: 'pointer' }}
          />
          {SOURCES.map(({ key, color }) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId="1"
              stroke={color}
              fill={color}
              fillOpacity={hidden[key] ? 0 : 0.6}
              strokeOpacity={hidden[key] ? 0.2 : 1}
              hide={hidden[key]}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
