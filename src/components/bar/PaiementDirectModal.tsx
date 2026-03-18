'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'

interface CartItem {
  id: string
  nom: string
  prix: number
  quantite: number
}

interface PaiementDirectModalProps {
  total: number
  items: CartItem[]
  onConfirm: () => void
  onBack: () => void
  loading: boolean
}

const BILLETS = [20, 50, 100, 500, 1000] as const

export function PaiementDirectModal({ total, items, onConfirm, onBack, loading }: PaiementDirectModalProps) {
  const [cashRecu, setCashRecu] = useState(0)
  const monnaie = cashRecu - total
  const isValid = cashRecu >= total && !loading

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onBack} />
      <div className="relative bg-ww-surface border border-ww-border rounded-xl p-6 w-full max-w-md shadow-lg shadow-black/30">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="text-ww-muted hover:text-ww-text transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h3 className="font-display text-lg font-bold text-ww-text">PAIEMENT CASH</h3>
        </div>

        <div className="bg-ww-surface-2 rounded-lg p-3 mb-4 space-y-1">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-xs font-sans text-ww-muted">
              <span>{item.nom} x{item.quantite}</span>
              <span>&#3647; {(item.prix * item.quantite).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t border-ww-border my-1.5" />
          <div className="flex justify-between text-sm font-display font-bold">
            <span className="text-ww-text">TOTAL</span>
            <span className="text-ww-orange">&#3647; {total.toLocaleString()}</span>
          </div>
        </div>

        <div className="mb-3">
          <label className="text-sm font-sans text-ww-muted block mb-1.5">Montant reçu</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={cashRecu || ''}
            onChange={(e) => setCashRecu(Number(e.target.value) || 0)}
            placeholder="0"
            className="bg-ww-surface-2 border border-ww-border rounded-lg text-center text-2xl font-display font-bold text-ww-text p-3 w-full focus:outline-none focus:ring-2 focus:ring-ww-orange/50 focus:border-ww-orange [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {BILLETS.map((amount) => (
            <button key={amount} type="button" onClick={() => setCashRecu((prev) => prev + amount)} className="bg-ww-surface-2 border border-ww-border rounded-lg px-3 py-2 font-display font-bold text-sm text-ww-muted hover:text-ww-text hover:border-ww-orange transition-colors">
              {amount}
            </button>
          ))}
          <button type="button" onClick={() => setCashRecu(total)} className="px-3 py-2 rounded-lg text-sm font-bold bg-ww-lime/15 text-ww-lime border border-ww-lime/30 hover:bg-ww-lime/25 transition-colors">
            Exact
          </button>
        </div>

        {cashRecu > 0 && (
          <div className="mb-4 text-center text-sm font-display font-bold">
            {cashRecu >= total
              ? <p className="text-ww-success">Monnaie à rendre : &#3647; {monnaie.toLocaleString()}</p>
              : <p className="text-ww-danger">Il manque : &#3647; {Math.abs(monnaie).toLocaleString()}</p>}
          </div>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={onBack} className="flex-1 py-2.5 rounded-lg border border-ww-border font-display font-bold text-sm text-ww-muted hover:text-ww-text transition-colors">
            Annuler
          </button>
          <button type="button" disabled={!isValid} onClick={onConfirm} className="flex-1 py-2.5 rounded-lg bg-ww-orange text-white font-display font-bold text-sm uppercase hover:bg-ww-orange/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? '...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  )
}
