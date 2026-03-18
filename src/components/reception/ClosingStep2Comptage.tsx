'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, ArrowLeft, RotateCcw, Banknote } from 'lucide-react'
import { useTranslations } from 'next-intl'

const BILLS = [20, 50, 100, 500, 1000] as const

interface Props {
  caJour: number
  onNext: (cashCompte: number, noteEcart: string) => void
  onBack: () => void
}

export default function ClosingStep2Comptage({ caJour, onNext, onBack }: Props) {
  const t = useTranslations('closing')
  const tc = useTranslations('common')
  const [counts, setCounts] = useState<Record<number, number>>({})
  const [noteEcart, setNoteEcart] = useState('')

  const cashCompte = BILLS.reduce((s, b) => s + b * (counts[b] || 0), 0)
  const ecart = cashCompte - caJour
  const hasEcart = ecart !== 0
  const canSubmit = cashCompte > 0 && (!hasEcart || noteEcart.trim().length > 0)

  function addBill(bill: number) {
    setCounts((prev) => ({ ...prev, [bill]: (prev[bill] || 0) + 1 }))
  }

  function reset() {
    setCounts({})
    setNoteEcart('')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-ww-orange/15 flex items-center justify-center">
          <Banknote className="h-5 w-5 text-ww-orange" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-ww-text">{t('counting')}</h2>
          <p className="text-sm text-ww-muted">{t('countBills')}</p>
        </div>
      </div>

      {/* Live total */}
      <div className="text-center mb-6 p-4 rounded-xl bg-ww-surface-2 border border-ww-border">
        <p className="text-[10px] uppercase text-ww-muted mb-1">{t('totalCounted')}</p>
        <p className="font-display font-extrabold text-4xl text-ww-text tracking-tight">
          {cashCompte.toLocaleString()}
          <span className="text-lg text-ww-muted ml-1">THB</span>
        </p>
      </div>

      {/* Bill numpad */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {BILLS.map((bill) => (
          <button
            key={bill}
            onClick={() => addBill(bill)}
            className="flex flex-col items-center gap-1 py-3 rounded-lg bg-ww-surface border border-ww-border hover:border-ww-orange/50 transition-all active:scale-[0.95]"
          >
            <span className="font-display font-bold text-sm text-ww-orange">{bill}</span>
            <span className="text-[10px] text-ww-muted font-mono">x{counts[bill] || 0}</span>
          </button>
        ))}
      </div>

      <button
        onClick={reset}
        className="flex items-center justify-center gap-1.5 text-xs text-ww-muted hover:text-ww-danger transition-colors mb-4"
      >
        <RotateCcw className="h-3 w-3" /> Reset
      </button>

      {/* Ecart display */}
      {cashCompte > 0 && (
        <div className={`p-3 rounded-lg border mb-4 ${
          Math.abs(ecart) <= 50
            ? 'bg-ww-lime-glow border-ww-lime/30'
            : 'bg-red-500/10 border-ww-danger/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-ww-muted">{t('difference')}</span>
            <span className={`font-display font-bold ${
              Math.abs(ecart) <= 50 ? 'text-ww-lime' : 'text-ww-danger'
            }`}>
              {ecart >= 0 ? '+' : ''}{ecart.toLocaleString()} THB
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-ww-muted">{t('dailyRevenue')}</span>
            <span className="text-xs font-mono text-ww-muted">{caJour.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Note ecart (mandatory if ecart != 0) */}
      {hasEcart && cashCompte > 0 && (
        <div className="mb-4">
          <label className="text-[10px] uppercase text-ww-muted block mb-1">
            {t('noteRequired')}
          </label>
          <Input
            value={noteEcart}
            onChange={(e) => setNoteEcart(e.target.value)}
            placeholder={t('explainGap')}
            className="text-sm"
          />
        </div>
      )}

      {/* Navigation */}
      <div className="mt-auto flex gap-3 pt-4 border-t border-ww-border">
        <Button variant="outline" onClick={onBack} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> {tc('back')}
        </Button>
        <Button
          onClick={() => onNext(cashCompte, noteEcart)}
          disabled={!canSubmit}
          className="flex-1 gap-2"
        >
          {tc('confirm')} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
