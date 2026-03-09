'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Reservation, RoomCharge } from '@/lib/types'
import { CheckoutStep1Recap } from './CheckoutStep1Recap'
import { CheckoutStep2Paiement } from './CheckoutStep2Paiement'
import { CheckoutStep3Cloture } from './CheckoutStep3Cloture'

interface CheckoutModalProps {
  open: boolean
  reservation: Reservation
  clientName: string
  bungalowNumero: number
  roomCharges: RoomCharge[]
  onClose: () => void
  onCheckoutComplete: (resId: string, totalPaid: number) => void
}

export function CheckoutModal({
  open, reservation, clientName, bungalowNumero,
  roomCharges, onClose, onCheckoutComplete,
}: CheckoutModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [montantRecu, setMontantRecu] = useState(0)

  if (!open) return null

  const totalFnb = roomCharges.reduce((s, rc) => s + rc.total, 0)
  const monnaie = montantRecu - totalFnb

  const handleValidatePayment = (recu: number) => {
    setMontantRecu(recu)
    setStep(3)
  }

  const handleCloturer = () => {
    onCheckoutComplete(reservation.id, totalFnb)
  }

  const handleClotureDirecte = () => {
    setMontantRecu(0)
    setStep(3)
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center">
      <div className="absolute inset-0 bg-ww-bg/95" />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ww-muted hover:text-ww-text transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-ww-orange' : 'bg-ww-border'
              }`}
            />
          ))}
        </div>

        <div className="transition-all duration-300">
          {step === 1 && (
            <CheckoutStep1Recap
              clientName={clientName}
              bungalowNumero={bungalowNumero}
              nuits={reservation.nuits}
              dateDebut={reservation.dateDebut}
              dateFin={reservation.dateFin}
              roomCharges={roomCharges}
              onProceedPayment={() => setStep(2)}
              onClotureDirecte={handleClotureDirecte}
            />
          )}
          {step === 2 && (
            <CheckoutStep2Paiement
              total={totalFnb}
              onValidate={handleValidatePayment}
            />
          )}
          {step === 3 && (
            <CheckoutStep3Cloture
              total={totalFnb}
              monnaie={monnaie > 0 ? monnaie : 0}
              onCloturer={handleCloturer}
            />
          )}
        </div>
      </div>
    </div>
  )
}
