'use client'

import { useState, useMemo, useEffect } from 'react'
import { useReporting } from '@/contexts/reporting-context'
import type { BusinessUnit, RevenueCategory, ReportRevenue } from '@/lib/types-reporting'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Save, Check, Plus, X } from 'lucide-react'

const CATEGORIES_GYM: { key: RevenueCategory; label: string }[] = [
  { key: 'passes_gym', label: 'Passes Gym' },
  { key: 'fnb_bar', label: 'F&B / Bar' },
  { key: 'sauna', label: 'Sauna' },
  { key: 'cours_prives', label: 'Cours prives' },
]

const CATEGORIES_RESORT: { key: RevenueCategory; label: string }[] = [
  { key: 'bungalows', label: 'Bungalows' },
  { key: 'services_extras', label: 'Services extras' },
  { key: 'laverie', label: 'Laverie' },
]

interface CustomLine { label: string; montant: number }

export default function SaisieRevenus({ bu }: { bu: BusinessUnit }) {
  const { revenues, mockToday, updateTodayRevenues } = useReporting()
  const categories = bu === 'GYM' ? CATEGORIES_GYM : CATEGORIES_RESORT
  const autreKey: RevenueCategory = bu === 'GYM' ? 'autre_gym' : 'autre_resort'

  const { fixedInit, customInit } = useMemo(() => {
    const todayRevs = revenues.filter((r) => r.date === mockToday && r.bu === bu)
    const map: Record<string, number> = {}
    categories.forEach((c) => {
      const found = todayRevs.find((r) => r.categorie === c.key)
      map[c.key] = found ? found.montant : 0
    })
    const customs = todayRevs
      .filter((r) => r.categorie === autreKey)
      .map((r) => ({ label: r.note || 'Autre', montant: r.montant }))
    return { fixedInit: map, customInit: customs }
  }, [revenues, mockToday, bu, categories, autreKey])

  const [values, setValues] = useState<Record<string, number>>(fixedInit)
  const [customLines, setCustomLines] = useState<CustomLine[]>(customInit)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setValues(fixedInit)
    setCustomLines(customInit)
  }, [fixedInit, customInit])

  const fixedTotal = Object.values(values).reduce((s, v) => s + v, 0)
  const customTotal = customLines.reduce((s, l) => s + l.montant, 0)
  const total = fixedTotal + customTotal

  function addCustomLine() {
    setCustomLines((prev) => [...prev, { label: '', montant: 0 }])
  }

  function removeCustomLine(idx: number) {
    setCustomLines((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateCustomLine(idx: number, field: keyof CustomLine, value: string | number) {
    setCustomLines((prev) => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l))
  }

  function handleSave() {
    const fixed: ReportRevenue[] = categories
      .filter((c) => values[c.key] > 0)
      .map((c) => ({
        id: `rev-new-${bu}-${c.key}-${Date.now()}`,
        date: mockToday, bu, categorie: c.key, montant: values[c.key],
      }))
    const custom: ReportRevenue[] = customLines
      .filter((l) => l.montant > 0)
      .map((l, i) => ({
        id: `rev-new-${bu}-autre-${Date.now()}-${i}`,
        date: mockToday, bu, categorie: autreKey, montant: l.montant,
        note: l.label || 'Autre',
      }))
    updateTodayRevenues(bu, [...fixed, ...custom])
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-ww-surface border border-ww-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2 h-2 rounded-full ${bu === 'GYM' ? 'bg-ww-orange' : 'bg-ww-lime'}`} />
        <h3 className="font-display text-base font-bold">Revenus {bu}</h3>
      </div>

      <div className="space-y-2.5">
        {categories.map((c) => (
          <FieldRow key={c.key} label={c.label} value={values[c.key]}
            onChange={(v) => setValues((prev) => ({ ...prev, [c.key]: v }))} />
        ))}

        {customLines.map((line, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={line.label}
              onChange={(e) => updateCustomLine(i, 'label', e.target.value)}
              placeholder="Libelle..."
              className="w-28 h-8 text-sm shrink-0"
            />
            <div className="relative flex-1">
              <Input type="number" min={0} value={line.montant || ''}
                onChange={(e) => updateCustomLine(i, 'montant', Number(e.target.value) || 0)}
                className="pr-12 h-8 text-sm" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-ww-muted font-mono">THB</span>
            </div>
            <button onClick={() => removeCustomLine(i)}
              className="text-ww-muted hover:text-ww-danger transition-colors shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        <button onClick={addCustomLine}
          className="flex items-center gap-1.5 text-xs text-ww-orange hover:text-ww-text transition-colors mt-1">
          <Plus className="h-3.5 w-3.5" /> Ajouter un champ
        </button>
      </div>

      <div className="flex items-center justify-between pt-3 mt-3 border-t border-ww-border">
        <div className="font-display font-bold text-lg">
          <span className={bu === 'GYM' ? 'text-ww-orange' : 'text-ww-lime'}>
            {total.toLocaleString()}
          </span>
          <span className="text-sm text-ww-muted ml-1">THB</span>
        </div>
        <Button onClick={handleSave} size="sm"
          className={`gap-1.5 text-xs transition-all ${saved ? 'bg-ww-success hover:bg-ww-success' : ''}`}>
          {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          {saved ? 'OK' : 'Sauver'}
        </Button>
      </div>
    </div>
  )
}

function FieldRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <label className="w-28 text-sm font-sans text-ww-muted shrink-0 truncate">{label}</label>
      <div className="relative flex-1">
        <Input type="number" min={0} value={value || ''} onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="pr-12 h-8 text-sm" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-ww-muted font-mono">THB</span>
      </div>
    </div>
  )
}
