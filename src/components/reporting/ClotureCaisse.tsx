'use client'

import { useState, useMemo } from 'react'
import { useReporting } from '@/contexts/reporting-context'
import type { BusinessUnit, CashClosing } from '@/lib/types-reporting'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Lock, CheckCircle } from 'lucide-react'

export default function ClotureCaisse({ bu }: { bu: BusinessUnit }) {
  const { revenues, expensesDaily, cashClosings, mockToday, closeCash } = useReporting()

  const alreadyClosed = useMemo(
    () => cashClosings.some((c) => c.date === mockToday && c.bu === bu),
    [cashClosings, mockToday, bu]
  )

  const soldeCalcule = useMemo(() => {
    const rev = revenues
      .filter((r) => r.date === mockToday && r.bu === bu)
      .reduce((s, r) => s + r.montant, 0)
    const exp = expensesDaily
      .filter((e) => e.date === mockToday && e.bu === bu && e.source === 'black_box')
      .reduce((s, e) => s + e.montant, 0)
    return rev - exp
  }, [revenues, expensesDaily, mockToday, bu])

  const [soldeCompte, setSoldeCompte] = useState(0)
  const [retrait, setRetrait] = useState(0)
  const [staff, setStaff] = useState('')
  const [done, setDone] = useState(false)

  const ecart = soldeCompte - soldeCalcule
  const suggestion = Math.max(0, Math.floor(soldeCompte / 1000) * 1000 - 3000)

  function handleClose() {
    if (!staff || soldeCompte <= 0) return
    const closing: CashClosing = {
      id: `cc-new-${Date.now()}`,
      date: mockToday,
      bu,
      solde_calcule: soldeCalcule,
      solde_compte: soldeCompte,
      ecart,
      retrait,
      staff,
    }
    closeCash(closing)
    setDone(true)
  }

  if (alreadyClosed || done) {
    return (
      <div className="bg-ww-surface border border-ww-border rounded-xl p-5 flex items-center gap-3"
        style={{ borderLeftWidth: 3, borderLeftColor: 'var(--ww-success)' }}>
        <CheckCircle className="h-5 w-5 text-ww-success shrink-0" />
        <div>
          <span className="font-display font-bold text-ww-success">Caisse {bu} cloturee</span>
          <span className="text-sm text-ww-muted ml-2">pour aujourd&apos;hui</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-ww-surface border border-ww-border rounded-xl overflow-hidden"
      style={{ borderLeftWidth: 3, borderLeftColor: 'var(--ww-orange)' }}>
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-4 w-4 text-ww-orange" />
          <h3 className="font-display text-base font-bold">Cloture de caisse — {bu}</h3>
        </div>

        {/* Step 1: Calculated balance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-ww-bg border border-ww-border/50">
            <div className="text-[10px] text-ww-muted font-sans uppercase mb-1">
              Solde calcule
            </div>
            <div className="text-2xl font-display font-bold text-ww-text">
              {soldeCalcule.toLocaleString()}
              <span className="text-sm text-ww-muted ml-1">THB</span>
            </div>
          </div>

          {/* Step 2: Counted amount */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-ww-muted font-sans uppercase">Montant compte</label>
            <Input
              type="number"
              min={0}
              value={soldeCompte || ''}
              onChange={(e) => setSoldeCompte(Number(e.target.value) || 0)}
              className="h-9"
            />
            {soldeCompte > 0 && (
              <div className={`inline-flex items-center gap-1 text-xs font-display font-bold px-2 py-0.5 rounded-full ${
                Math.abs(ecart) <= 50
                  ? 'bg-ww-lime-glow text-ww-lime'
                  : 'bg-red-500/10 text-ww-danger'
              }`}>
                Ecart: {ecart >= 0 ? '+' : ''}{ecart.toLocaleString()} THB
              </div>
            )}
          </div>

          {/* Step 3: Withdraw */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-ww-muted font-sans uppercase">Retrait</label>
            <Input
              type="number"
              min={0}
              value={retrait || ''}
              onChange={(e) => setRetrait(Number(e.target.value) || 0)}
              className="h-9"
            />
            {suggestion > 0 && retrait === 0 && (
              <button
                onClick={() => setRetrait(suggestion)}
                className="text-[10px] text-ww-orange hover:underline cursor-pointer"
              >
                Suggestion: {suggestion.toLocaleString()} THB
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-ww-bg/50 border-t border-ww-border flex items-center justify-between gap-3">
        <div className="flex-1 max-w-[200px]">
          <Input
            value={staff}
            onChange={(e) => setStaff(e.target.value)}
            placeholder="Nom du staff"
            className="h-8 text-sm bg-ww-surface"
          />
        </div>
        <Button
          onClick={handleClose}
          disabled={!staff || soldeCompte <= 0}
          className="gap-2"
        >
          <Lock className="h-4 w-4" />
          Cloturer
        </Button>
      </div>
    </div>
  )
}
