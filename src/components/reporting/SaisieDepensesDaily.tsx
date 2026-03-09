'use client'

import { useState, useMemo } from 'react'
import { useReporting } from '@/contexts/reporting-context'
import type { BusinessUnit, ExpenseDailyCategory, ExpenseSource, ReportExpenseDaily } from '@/lib/types-reporting'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'

const CATS_GYM: { key: ExpenseDailyCategory; label: string }[] = [
  { key: 'product_sold', label: 'Produits' },
  { key: 'ice_bar', label: 'Glace' },
  { key: 'staff_meal', label: 'Repas staff' },
  { key: 'gas_wood_sauna', label: 'Sauna' },
  { key: 'maintenance_gym', label: 'Maintenance' },
  { key: 'water', label: 'Eau' },
  { key: 'autre_dep_gym', label: 'Autre' },
]

const CATS_RESORT: { key: ExpenseDailyCategory; label: string }[] = [
  { key: 'daily_expenses', label: 'Courantes' },
  { key: 'laundry', label: 'Laverie' },
  { key: 'cleaning_products', label: 'Nettoyage' },
  { key: 'swimming_pool', label: 'Piscine' },
  { key: 'autre_dep_resort', label: 'Autre' },
]

const SOURCES: { key: ExpenseSource; label: string }[] = [
  { key: 'black_box', label: 'Black Box' },
  { key: 'change_box', label: 'Change Box' },
  { key: 'cb_scan', label: 'CB / Scan' },
]

const ALL_CAT_LABELS = [...CATS_GYM, ...CATS_RESORT]

export default function SaisieDepensesDaily({ bu }: { bu: BusinessUnit }) {
  const { expensesDaily, mockToday, addExpenseDaily, removeExpenseDaily } = useReporting()
  const cats = bu === 'GYM' ? CATS_GYM : CATS_RESORT

  const todayExps = useMemo(
    () => expensesDaily.filter((e) => e.date === mockToday && e.bu === bu),
    [expensesDaily, mockToday, bu]
  )

  const [categorie, setCategorie] = useState<ExpenseDailyCategory>(cats[0].key)
  const [montant, setMontant] = useState(0)
  const [source, setSource] = useState<ExpenseSource>('black_box')
  const [note, setNote] = useState('')

  function handleAdd() {
    if (montant <= 0) return
    const exp: ReportExpenseDaily = {
      id: `expd-new-${Date.now()}`,
      date: mockToday,
      bu,
      categorie,
      montant,
      source,
      note: note || undefined,
    }
    addExpenseDaily(exp)
    setMontant(0)
    setNote('')
  }

  const totalToday = todayExps.reduce((s, e) => s + e.montant, 0)

  return (
    <div className="bg-ww-surface border border-ww-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${bu === 'GYM' ? 'bg-ww-orange' : 'bg-ww-lime'}`} />
          <h3 className="font-display text-base font-bold">Depenses {bu}</h3>
        </div>
        {totalToday > 0 && (
          <span className="text-sm font-display font-bold text-ww-danger">
            -{totalToday.toLocaleString()} THB
          </span>
        )}
      </div>

      {/* Existing expenses list */}
      {todayExps.length > 0 && (
        <div className="space-y-0 mb-4">
          {todayExps.map((e) => {
            const catLabel = ALL_CAT_LABELS.find((c) => c.key === e.categorie)?.label ?? e.categorie
            return (
              <div key={e.id} className="flex items-center py-1.5 border-b border-ww-border/30 last:border-0 group">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm text-ww-text font-sans">{catLabel}</span>
                  {e.note && <span className="text-[10px] text-ww-muted truncate">({e.note})</span>}
                </div>
                <span className="font-mono text-sm text-ww-danger mr-2">
                  {e.montant.toLocaleString()}
                </span>
                <button
                  onClick={() => removeExpenseDaily(e.id)}
                  className="opacity-0 group-hover:opacity-100 text-ww-muted hover:text-ww-danger transition-all shrink-0"
                  title="Supprimer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add row */}
      <div className="pt-3 border-t border-ww-border space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-ww-muted font-sans uppercase mb-0.5 block">Categorie</label>
            <select
              value={categorie}
              onChange={(e) => setCategorie(e.target.value as ExpenseDailyCategory)}
              className="w-full h-8 rounded-md border border-ww-border bg-ww-surface-2 px-2 text-sm text-ww-text"
            >
              {cats.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-ww-muted font-sans uppercase mb-0.5 block">Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as ExpenseSource)}
              className="w-full h-8 rounded-md border border-ww-border bg-ww-surface-2 px-2 text-sm text-ww-text"
            >
              {SOURCES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="number"
              min={0}
              value={montant || ''}
              onChange={(e) => setMontant(Number(e.target.value) || 0)}
              placeholder="Montant THB"
              className="h-8 text-sm"
            />
          </div>
          <div className="flex-1">
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optionnel)"
              className="h-8 text-sm"
            />
          </div>
          <Button onClick={handleAdd} size="sm" className="h-8 px-3 gap-1 shrink-0">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
