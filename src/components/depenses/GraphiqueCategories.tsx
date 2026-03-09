'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import type { Expense } from '@/lib/types'
import { CATEGORY_LABELS, isGymCategory, isFnbCategory } from './depenses-shared'
import type { DepenseTab } from './TabsCategories'

interface Props {
  expenses: Expense[]
  activeTab: DepenseTab
}

export function GraphiqueCategories({ expenses, activeTab }: Props) {
  const data = useMemo(() => {
    const filtered = activeTab === 'all'
      ? expenses
      : expenses.filter((e) => e.grande_categorie === activeTab)

    const grouped: Record<string, { total: number; gc: string }> = {}
    for (const e of filtered) {
      if (!grouped[e.categorie]) grouped[e.categorie] = { total: 0, gc: e.grande_categorie }
      grouped[e.categorie].total += e.montant_thb
    }
    return Object.entries(grouped)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([cat, { total, gc }]) => ({
        label: CATEGORY_LABELS[cat] || cat,
        total,
        gc,
      }))
  }, [expenses, activeTab])

  if (data.length === 0) return null

  const maxVal = Math.max(...data.map((d) => d.total))

  return (
    <Card className="p-4">
      <h3 className="font-display font-bold text-sm text-ww-muted mb-4">REPARTITION PAR CATEGORIE</h3>
      <div className="space-y-2.5">
        {data.map((item) => {
          const pct = maxVal > 0 ? (item.total / maxVal) * 100 : 0
          return (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-sm text-ww-text w-[140px] shrink-0 truncate">
                {item.label}
              </span>
              <div className="flex-1 h-6 bg-ww-surface-2 rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${Math.max(pct, 2)}%`,
                    backgroundColor: item.gc === 'gym' ? 'var(--ww-orange)' : item.gc === 'fnb' ? 'var(--ww-wood)' : 'var(--ww-lime)',
                    opacity: 0.8,
                  }}
                />
              </div>
              <span className="text-sm font-display font-bold text-ww-text w-[80px] text-right shrink-0">
                ฿ {item.total.toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
