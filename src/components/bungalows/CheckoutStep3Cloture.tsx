'use client'

import { useState, useEffect } from 'react'

interface CheckoutStep3ClotureProps {
  total: number
  monnaie: number
  onCloturer: () => void
}

export function CheckoutStep3Cloture({ total, monnaie, onCloturer }: CheckoutStep3ClotureProps) {
  const [animated, setAnimated] = useState(false)
  const [clefRecuperee, setClefRecuperee] = useState(false)
  const [bungalowInspecte, setBungalowInspecte] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(t)
  }, [])

  const canClose = clefRecuperee && bungalowInspecte

  return (
    <div className="space-y-6">
      {/* Animated checkmark */}
      <div className="text-center py-4">
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-ww-lime/20 transition-transform duration-500 ease-out"
          style={{ transform: animated ? 'scale(1)' : 'scale(0)' }}
        >
          <span className="text-ww-lime text-4xl">✓</span>
        </div>
        <p className="font-display font-extrabold text-xl text-ww-lime mt-3">
          PAIEMENT ENCAISSE
        </p>
        <p className="text-sm text-ww-muted font-body mt-1">
          ฿ {total.toLocaleString()} · Monnaie rendue : ฿ {monnaie.toLocaleString()}
        </p>
      </div>

      {/* Recap */}
      <div className="rounded-xl border border-ww-border bg-ww-surface-2 p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm text-ww-text font-body">
          <span className="text-ww-lime">✓</span>
          <span>Paiement encaisse</span>
          <span className="ml-auto font-display font-bold">฿ {total.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-ww-text font-body">
          <span className="text-ww-lime">✓</span>
          <span>Monnaie rendue</span>
          <span className="ml-auto font-display font-bold">฿ {monnaie.toLocaleString()}</span>
        </div>

        <div className="border-t border-ww-border pt-3 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={clefRecuperee}
              onChange={(e) => setClefRecuperee(e.target.checked)}
              className="w-5 h-5 rounded border-ww-border accent-ww-orange"
            />
            <span className="text-sm font-body text-ww-text">Clef recuperee</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={bungalowInspecte}
              onChange={(e) => setBungalowInspecte(e.target.checked)}
              className="w-5 h-5 rounded border-ww-border accent-ww-orange"
            />
            <span className="text-sm font-body text-ww-text">Bungalow inspecte</span>
          </label>
        </div>
      </div>

      <button
        disabled={!canClose}
        onClick={onCloturer}
        className="w-full py-4 rounded-xl bg-ww-lime text-white font-display font-bold text-base uppercase tracking-wider transition-all hover:bg-ww-lime/90 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        CLOTURER LE BUNGALOW ✓
      </button>
    </div>
  )
}
