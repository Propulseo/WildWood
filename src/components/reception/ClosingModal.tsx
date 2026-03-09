'use client'

import { useState, useCallback } from 'react'
import { useReporting } from '@/contexts/reporting-context'
import { useClosings } from '@/contexts/closings-context'
import { useShift } from '@/contexts/shift-context'
import type { DailyClosing } from '@/lib/types-reporting'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import ClosingStep1Recap from './ClosingStep1Recap'
import ClosingStep2Comptage from './ClosingStep2Comptage'
import ClosingStep3Confirmation from './ClosingStep3Confirmation'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STEPS = ['Recap', 'Comptage', 'Confirmation'] as const

export default function ClosingModal({ open, onOpenChange }: Props) {
  const { mockToday } = useReporting()
  const { addClosing } = useClosings()
  const { getStaffActif } = useShift()

  const [step, setStep] = useState(0)
  const [caJour, setCaJour] = useState(0)
  const [cashCompte, setCashCompte] = useState(0)
  const [noteEcart, setNoteEcart] = useState('')

  const staffActif = getStaffActif('reception')
  const staffName = staffActif?.prenom ?? 'Reception'

  const resetAndClose = useCallback(() => {
    setStep(0)
    setCaJour(0)
    setCashCompte(0)
    setNoteEcart('')
    onOpenChange(false)
  }, [onOpenChange])

  function handleStep1(ca: number) {
    setCaJour(ca)
    setStep(1)
  }

  function handleStep2(cash: number, note: string) {
    setCashCompte(cash)
    setNoteEcart(note)
    setStep(2)
  }

  function handleSubmit() {
    const now = new Date()
    const closing: DailyClosing = {
      id: `cl-new-${Date.now()}`,
      date: mockToday,
      ca_jour: caJour,
      cash_compte: cashCompte,
      ecart: cashCompte - caJour,
      note_ecart: noteEcart || undefined,
      soumis_par: staffName,
      soumis_a: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      statut: 'soumis',
    }
    addClosing(closing)
    resetAndClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose() }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                i <= step ? 'bg-ww-orange text-white' : 'bg-ww-surface-2 text-ww-muted border border-ww-border'
              }`}>
                {i + 1}
              </div>
              <span className={`text-xs ${i === step ? 'text-ww-text font-medium' : 'text-ww-muted'}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px ${i < step ? 'bg-ww-orange' : 'bg-ww-border'}`} />
              )}
            </div>
          ))}
        </div>

        {step === 0 && <ClosingStep1Recap onNext={handleStep1} />}
        {step === 1 && (
          <ClosingStep2Comptage
            caJour={caJour}
            onNext={handleStep2}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <ClosingStep3Confirmation
            caJour={caJour}
            cashCompte={cashCompte}
            noteEcart={noteEcart}
            staffName={staffName}
            onSubmit={handleSubmit}
            onBack={() => setStep(1)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
