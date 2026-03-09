'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import type { Expense } from '@/lib/types'
import type { DepenseTab } from './TabsCategories'

interface Props {
  expenses: Expense[]
  activeTab: DepenseTab
}

export function KpiDepenses({ expenses, activeTab }: Props) {
  const stats = useMemo(() => {
    const filtered = activeTab === 'all'
      ? expenses
      : expenses.filter((e) => e.grande_categorie === activeTab)

    const total = filtered.reduce((s, e) => s + e.montant_thb, 0)
    const count = filtered.length
    const avg = count > 0 ? Math.round(total / count) : 0

    const byMode = { black_box: 0, change_box: 0, cb_scan: 0 }
    for (const e of filtered) byMode[e.mode_paiement] += e.montant_thb

    return { total, count, avg, byMode }
  }, [expenses, activeTab])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="ww-label mb-1">TOTAL DEPENSES</div>
        <div className="font-display font-extrabold text-2xl text-ww-danger">
          ฿ {stats.total.toLocaleString()}
        </div>
        <div className="text-xs text-ww-muted mt-1">{stats.count} depenses</div>
      </Card>
      <Card className="p-4">
        <div className="ww-label mb-1">MOYENNE / DEPENSE</div>
        <div className="font-display font-extrabold text-2xl text-ww-text">
          ฿ {stats.avg.toLocaleString()}
        </div>
      </Card>
      <Card className="p-4">
        <div className="ww-label mb-1">PAR MODE</div>
        <div className="space-y-1 mt-1">
          <div className="flex justify-between text-sm">
            <span className="text-ww-muted">Black Box</span>
            <span className="font-display font-bold text-ww-text">฿ {stats.byMode.black_box.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ww-muted">Change Box</span>
            <span className="font-display font-bold text-ww-text">฿ {stats.byMode.change_box.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ww-muted">CB / Scan</span>
            <span className="font-display font-bold text-ww-text">฿ {stats.byMode.cb_scan.toLocaleString()}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
