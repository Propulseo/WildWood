'use client'

import { useState, useEffect } from 'react'
import { getRecapDuJour, submitClosing } from '@/lib/supabase/queries/closing'
import { useAuth } from '@/lib/contexts/auth-context'
import { toast } from 'sonner'
import {
  ClosingHeader, Step1Recap, Step2Comptage, Step3Confirmation,
  type RecapData,
} from './ClosingSteps'

type Step = 1 | 2 | 3
const BILLETS = [20, 50, 100, 500, 1000] as const

interface Props {
  onClose: () => void
  onSuccess?: (result: { cashWithdrawn: number }) => void
}

export function ClosingModal({ onClose, onSuccess }: Props) {
  const { staffMember } = useAuth()
  const [step, setStep] = useState<Step>(1)
  const [recap, setRecap] = useState<RecapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [billets, setBillets] = useState<Record<number, number>>(
    Object.fromEntries(BILLETS.map(b => [b, 0]))
  )
  const [alreadyClosed, setAlreadyClosed] = useState(false)

  useEffect(() => {
    getRecapDuJour()
      .then(data => { setRecap(data); setAlreadyClosed(data.alreadyClosed) })
      .catch(() => toast.error('Erreur chargement recap'))
      .finally(() => setLoading(false))
  }, [])

  const cashCounted = BILLETS.reduce((s, b) => s + b * (billets[b] || 0), 0)

  const handleBillet = (valeur: number, delta: number) => {
    setBillets(prev => ({ ...prev, [valeur]: Math.max(0, (prev[valeur] || 0) + delta) }))
  }

  const handleSubmit = async () => {
    if (!staffMember) return
    setSubmitting(true)
    try {
      const result = await submitClosing({
        cashCounted,
        staffId: staffMember.id,
      })
      setStep(3)
      onSuccess?.(result)
    } catch (err) {
      toast.error(`Erreur closing : ${err instanceof Error ? err.message : 'Inconnue'}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-ww-surface rounded-xl p-8 text-ww-muted">Chargement...</div>
    </div>
  )

  if (!recap) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-ww-surface border border-ww-border rounded-xl w-[500px] max-h-[90vh] overflow-y-auto">
        <ClosingHeader step={step} onClose={onClose} />
        <div className="p-6">
          {step === 1 && (
            <Step1Recap recap={recap} alreadyClosed={alreadyClosed} onNext={() => setStep(2)} />
          )}
          {step === 2 && (
            <Step2Comptage
              billets={billets}
              cashCounted={cashCounted}
              onBillet={handleBillet}
              onReset={() => setBillets(Object.fromEntries(BILLETS.map(b => [b, 0])))}
              onBack={() => setStep(1)}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          )}
          {step === 3 && (
            <Step3Confirmation recap={recap} cashCounted={cashCounted} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  )
}
