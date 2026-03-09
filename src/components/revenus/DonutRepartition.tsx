'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import type { Transaction } from '@/lib/types'
import { txnNet } from '@/lib/commission'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'

interface DonutRepartitionProps {
  transactions: Transaction[]
}

const COLORS: Record<string, string> = {
  Bungalows: 'var(--ww-orange)',
  Gym: 'var(--ww-lime)',
  'F&B': 'var(--ww-wood)',
}

export function DonutRepartition({ transactions }: DonutRepartitionProps) {
  const data = useMemo(() => {
    const totals: Record<string, number> = { Bungalows: 0, Gym: 0, 'F&B': 0 }
    transactions.forEach((t) => { totals[t.centreRevenu] += txnNet(t) })
    return Object.entries(totals).map(([name, value]) => ({ name, value }))
  }, [transactions])

  const grandTotal = data.reduce((s, d) => s + d.value, 0)

  return (
    <Card className="p-4">
      <h3 className="font-display font-bold text-lg mb-4 text-ww-text">Repartition</h3>
      <div className="relative">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={70}
              outerRadius={110}
              dataKey="value"
              label={false}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Legend
              formatter={(value: string) => {
                const item = data.find((d) => d.name === value)
                const pct = grandTotal > 0 ? Math.round(((item?.value || 0) / grandTotal) * 100) : 0
                return `${value} — ${pct}%`
              }}
              wrapperStyle={{ color: 'var(--ww-text)', fontSize: 13 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingBottom: 60 }}>
          <div className="text-center">
            <p className="text-xs text-ww-muted font-display uppercase">Total</p>
            <p className="font-display font-extrabold text-lg text-ww-text">
              ฿ {grandTotal.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
