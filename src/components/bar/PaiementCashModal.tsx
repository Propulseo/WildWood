'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { TableOuverte } from '@/lib/types'

const BILLETS = [20, 50, 100, 500, 1000] as const

interface PaiementCashModalProps {
  open: boolean
  total: number
  onConfirm: () => void
  onCancel: () => void
  table?: TableOuverte
}

export function PaiementCashModal({ open, total, onConfirm, onCancel, table }: PaiementCashModalProps) {
  const [montantRecu, setMontantRecu] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setMontantRecu('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const recu = Number(montantRecu) || 0
  const monnaie = recu - total
  const isValid = recu >= total && montantRecu !== ''
  const isExact = recu === total

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
      <div className="relative bg-ww-surface border border-ww-border rounded-xl p-6 w-full max-w-sm shadow-lg shadow-black/30">
        <button onClick={onCancel} className="absolute top-4 right-4 text-ww-muted hover:text-ww-text transition-colors">
          <X className="h-5 w-5" />
        </button>

        <h3 className="font-display text-lg font-bold text-ww-text mb-1">PAIEMENT ESPECES</h3>
        <p className="text-xs text-ww-muted font-sans mb-4">
          Total : <span className="font-bold text-ww-orange">&#3647; {total.toLocaleString()}</span>
        </p>

        {/* Table recap */}
        {table && (
          <div className="bg-ww-surface-2 rounded-lg p-3 mb-4 space-y-1">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-ww-text font-medium">{table.client_nom}</span>
              <span className="text-ww-muted">{table.nom_table}</span>
            </div>
            {table.items.map((item, i) => (
              <div key={i} className="flex justify-between text-xs font-sans text-ww-muted">
                <span>{item.nom}{item.quantite > 1 && ` x${item.quantite}`}</span>
                <span>&#3647; {(item.prix * item.quantite).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="mb-3">
          <label className="text-xs text-ww-muted block mb-1.5">Montant recu</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ww-muted font-bold">&#3647;</span>
            <input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              min={0}
              value={montantRecu}
              onChange={(e) => setMontantRecu(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && isValid) onConfirm() }}
              placeholder="0"
              className="w-full pl-8 pr-4 py-3 rounded-lg bg-ww-bg border border-ww-border text-ww-text text-xl font-bold text-right focus:outline-none focus:ring-2 focus:ring-ww-orange/50 focus:border-ww-orange [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Quick bills */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMontantRecu(String(total))}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-ww-lime/15 text-ww-lime border border-ww-lime/30 hover:bg-ww-lime/25 transition-colors"
          >
            Exact
          </button>
          {BILLETS.filter((b) => b >= total).slice(0, 3).map((billet) => (
            <button
              key={billet}
              type="button"
              onClick={() => setMontantRecu(String(billet))}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-ww-surface-2 text-ww-text border border-ww-border hover:bg-ww-surface-2/80 transition-colors"
            >
              &#3647;{billet.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Change display */}
        {montantRecu !== '' && (
          <div className={`rounded-lg p-4 text-center mb-4 ${
            isExact
              ? 'bg-ww-lime/10 border border-ww-lime/30'
              : isValid
                ? 'bg-ww-orange/10 border border-ww-orange/30'
                : 'bg-ww-danger/10 border border-ww-danger/30'
          }`}>
            {isExact ? (
              <p className="text-ww-lime font-bold text-lg">Compte exact</p>
            ) : isValid ? (
              <>
                <p className="text-xs text-ww-muted mb-1">Monnaie a rendre</p>
                <p className="text-ww-orange font-extrabold text-2xl font-display">
                  &#3647; {monnaie.toLocaleString()}
                </p>
              </>
            ) : (
              <p className="text-ww-danger font-bold text-sm">
                Il manque &#3647; {Math.abs(monnaie).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-ww-surface-2 text-ww-muted border border-ww-border hover:bg-ww-surface-2/80 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={!isValid}
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold bg-ww-orange text-white hover:bg-ww-orange/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}
