'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import type { Transaction } from '@/lib/types'
import { txnNet } from '@/lib/commission'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface KpiRevenusProps {
  transactions: Transaction[]
  previousTransactions: Transaction[]
}

const SOURCES = [
  { key: 'Bungalows' as const, emoji: '🏠', label: 'Bungalows' },
  { key: 'Gym' as const, emoji: '🎟️', label: 'Gym' },
  { key: 'F&B' as const, emoji: '🍹', label: 'F&B' },
]

function computeEvolution(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null
  return Math.round(((current - previous) / previous) * 100)
}

export function KpiRevenus({ transactions, previousTransactions }: KpiRevenusProps) {
  const stats = useMemo(() => {
    return SOURCES.map(({ key, emoji, label }) => {
      const current = transactions.filter((t) => t.centreRevenu === key)
      const previous = previousTransactions.filter((t) => t.centreRevenu === key)
      const total = current.reduce((s, t) => s + txnNet(t), 0)
      const prevTotal = previous.reduce((s, t) => s + txnNet(t), 0)
      return {
        key, emoji, label,
        total,
        count: current.length,
        evolution: computeEvolution(total, prevTotal),
      }
    })
  }, [transactions, previousTransactions])

  const grandTotal = stats.reduce((s, st) => s + st.total, 0)
  const prevGrandTotal = previousTransactions.reduce((s, t) => s + txnNet(t), 0)
  const grandEvolution = computeEvolution(grandTotal, prevGrandTotal)
  const bestKey = stats.reduce((best, s) => (s.total > best.total ? s : best), stats[0])?.key

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card
            key={s.key}
            className={`p-5 ${s.key === bestKey ? 'shadow-[0_0_20px_var(--ww-orange-glow)]' : ''}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{s.emoji}</span>
              <span className="font-display font-bold text-ww-muted uppercase text-sm">{s.label}</span>
            </div>
            <p className="font-display font-extrabold text-5xl text-ww-text">
              ฿ {s.total.toLocaleString()}
            </p>
            <div className="flex items-center justify-between mt-2">
              {s.evolution !== null ? (
                <span className={`flex items-center gap-1 text-sm font-display font-bold ${
                  s.evolution >= 0 ? 'text-ww-lime' : 'text-ww-danger'
                }`}>
                  {s.evolution >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  {Math.abs(s.evolution)}%
                </span>
              ) : (
                <span className="text-sm text-ww-muted">—</span>
              )}
              <span className="text-sm text-ww-muted font-sans">
                {s.count} transaction{s.count > 1 ? 's' : ''}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5 border-ww-orange bg-ww-surface">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-display font-bold text-ww-muted uppercase text-sm">TOTAL REVENUS</span>
            <p className="font-display font-extrabold text-6xl text-ww-orange mt-1">
              ฿ {grandTotal.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            {grandEvolution !== null && (
              <span className={`flex items-center gap-1 text-lg font-display font-bold ${
                grandEvolution >= 0 ? 'text-ww-lime' : 'text-ww-danger'
              }`}>
                {grandEvolution >= 0 ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                {Math.abs(grandEvolution)}% vs periode precedente
              </span>
            )}
            <span className="text-sm text-ww-muted font-sans">{transactions.length} transactions</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
