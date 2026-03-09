'use client'

import { useState, useEffect, useRef } from 'react'
import { PaveNumerique } from './PaveNumerique'

interface CheckoutStep2PaiementProps {
  total: number
  onValidate: (montantRecu: number) => void
}

export function CheckoutStep2Paiement({ total, onValidate }: CheckoutStep2PaiementProps) {
  const [montantRecu, setMontantRecu] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 200)
  }, [])

  const recu = Number(montantRecu) || 0
  const monnaie = recu - total
  const isValid = recu >= total && montantRecu !== ''
  const isInsuffisant = montantRecu !== '' && recu < total

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-extrabold text-ww-text">ENCAISSEMENT</h2>

      <div>
        <p className="font-display font-bold text-xs text-ww-muted uppercase tracking-wider mb-2">
          TOTAL A ENCAISSER
        </p>
        <p className="font-display font-extrabold text-5xl text-ww-danger tracking-tight">
          ฿ {total.toLocaleString()}
        </p>
      </div>

      <div>
        <p className="font-display font-bold text-xs text-ww-muted uppercase tracking-wider mb-2">
          ARGENT RECU DU CLIENT
        </p>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ww-muted font-display font-bold text-lg">฿</span>
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            min={0}
            value={montantRecu}
            onChange={(e) => setMontantRecu(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && isValid) onValidate(recu) }}
            placeholder="0"
            className="w-full pl-10 pr-4 py-4 rounded-xl bg-ww-bg border-2 border-ww-border text-ww-text text-3xl font-display font-extrabold text-right focus:outline-none focus:border-ww-orange transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>

      <PaveNumerique total={total} onSelect={(v) => setMontantRecu(String(v))} />

      {montantRecu !== '' && (
        <div>
          <p className="font-display font-bold text-xs text-ww-muted uppercase tracking-wider mb-2">
            MONNAIE A RENDRE
          </p>
          {isInsuffisant ? (
            <p className="font-display font-extrabold text-5xl text-ww-danger tracking-tight">
              ⚠️ Insuffisant
            </p>
          ) : (
            <p className="font-display font-extrabold text-5xl text-ww-lime tracking-tight">
              ฿ {monnaie.toLocaleString()}
            </p>
          )}
        </div>
      )}

      <button
        disabled={!isValid}
        onClick={() => onValidate(recu)}
        className="w-full py-4 rounded-xl bg-ww-lime text-white font-display font-bold text-base uppercase tracking-wider transition-all hover:bg-ww-lime/90 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        VALIDER LE PAIEMENT ✓
      </button>
    </div>
  )
}
