'use client'

import { useState, useMemo } from 'react'
import { useExpenses } from '@/contexts/expenses-context'
import { parseISO, isToday, startOfWeek, endOfWeek, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns'
import { toast } from 'sonner'
import type { ModePaiement } from '@/lib/types'
import type { Periode } from '@/components/depenses/depenses-shared'
import { PERIODES, MODE_LABELS, MODE_BADGE_STYLES } from '@/components/depenses/depenses-shared'
import { TabsCategories, type DepenseTab } from '@/components/depenses/TabsCategories'
import { KpiDepenses } from '@/components/depenses/KpiDepenses'
import { GraphiqueCategories } from '@/components/depenses/GraphiqueCategories'
import { ListeDepenses } from '@/components/depenses/ListeDepenses'
import { ModalDepense } from '@/components/depenses/ModalDepense'

const MODES: ModePaiement[] = ['black_box', 'change_box', 'cb_scan']

export default function DepensesPage() {
  const { expenses, deleteExpense } = useExpenses()
  const [activeTab, setActiveTab] = useState<DepenseTab>('all')
  const [filterPaiement, setFilterPaiement] = useState<ModePaiement | 'all'>('all')
  const [filterPeriode, setFilterPeriode] = useState<Periode>('all')

  const filtered = useMemo(() => {
    const now = new Date()
    return expenses
      .filter((exp) => {
        if (activeTab !== 'all' && exp.grande_categorie !== activeTab) return false
        if (filterPaiement !== 'all' && exp.mode_paiement !== filterPaiement) return false
        if (filterPeriode === 'today') return isToday(parseISO(exp.date))
        if (filterPeriode === 'week') return isWithinInterval(parseISO(exp.date), { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) })
        if (filterPeriode === 'month') return isWithinInterval(parseISO(exp.date), { start: startOfMonth(now), end: endOfMonth(now) })
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [expenses, activeTab, filterPaiement, filterPeriode])

  function handleDelete(id: string) {
    deleteExpense(id)
    toast.success('Depense supprimee')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ww-text tracking-tight">Depenses & Recus</h1>
          <p className="text-ww-muted text-sm mt-1">{filtered.length} depenses affichees</p>
        </div>
        <ModalDepense />
      </div>

      <TabsCategories value={activeTab} onChange={setActiveTab} />

      <div className="flex flex-wrap items-center gap-2">
        {PERIODES.map((p) => (
          <button
            key={p.value}
            onClick={() => setFilterPeriode(p.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
              filterPeriode === p.value
                ? 'bg-ww-orange text-white border-ww-orange'
                : 'bg-ww-surface-2 text-ww-muted border-ww-border hover:border-ww-orange/50'
            }`}
          >
            {p.label}
          </button>
        ))}
        <div className="w-px h-5 bg-ww-border mx-1" />
        <button
          onClick={() => setFilterPaiement('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
            filterPaiement === 'all'
              ? 'bg-ww-orange text-white border-ww-orange'
              : 'bg-ww-surface-2 text-ww-muted border-ww-border hover:border-ww-orange/50'
          }`}
        >
          Tous modes
        </button>
        {MODES.map((m) => (
          <button
            key={m}
            onClick={() => setFilterPaiement(filterPaiement === m ? 'all' : m)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
              filterPaiement === m
                ? MODE_BADGE_STYLES[m]
                : 'bg-ww-surface-2 text-ww-muted border-ww-border hover:border-ww-orange/50'
            }`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      <KpiDepenses expenses={filtered} activeTab={activeTab} />
      <GraphiqueCategories expenses={filtered} activeTab={activeTab} />
      <ListeDepenses expenses={filtered} onDelete={handleDelete} />
    </div>
  )
}
