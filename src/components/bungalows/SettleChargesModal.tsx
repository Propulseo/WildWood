'use client'

import { useState } from 'react'
import type { RoomCharge } from '@/lib/types'
import { PaveNumerique } from './PaveNumerique'

interface SettleChargesModalProps {
  open: boolean
  roomCharges: RoomCharge[]
  clientName: string
  bungalowNumero: number
  onClose: () => void
  onSettle: (total: number) => void
}

export function SettleChargesModal({
  open, roomCharges, clientName, bungalowNumero, onClose, onSettle,
}: SettleChargesModalProps) {
  const [montantRecu, setMontantRecu] = useState<number | null>(null)

  if (!open) return null

  const total = roomCharges.reduce((s, rc) => s + rc.total, 0)
  const monnaie = montantRecu !== null ? montantRecu - total : 0
  const canValidate = montantRecu !== null && montantRecu >= total

  const grouped: Record<string, { nom: string; qty: number; total: number }> = {}
  for (const rc of roomCharges) {
    for (const item of rc.items) {
      if (!grouped[item.produitId]) grouped[item.produitId] = { nom: item.nom, qty: 0, total: 0 }
      grouped[item.produitId].qty += item.quantite
      grouped[item.produitId].total += item.sousTotal
    }
  }
  const items = Object.values(grouped)

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-ww-surface border border-ww-border rounded-xl p-6 w-full max-w-sm shadow-lg shadow-black/30">
        <h3 className="font-display text-base font-bold text-ww-text mb-1">
          REGLER NOTE F&B
        </h3>
        <p className="text-xs text-ww-muted mb-4">{clientName} — Bungalow {bungalowNumero}</p>

        <div className="space-y-1 mb-3">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm font-body">
              <span className="text-ww-text">{item.qty}x {item.nom}</span>
              <span className="text-ww-muted">&#3647; {item.total.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between font-display font-bold text-ww-orange text-lg mb-5 pt-2 border-t border-ww-border">
          <span>TOTAL</span>
          <span>&#3647; {total.toLocaleString()}</span>
        </div>

        <div className="mb-3">
          <p className="text-xs text-ww-muted font-display font-bold uppercase tracking-wide mb-2">MONTANT RECU</p>
          <PaveNumerique total={total} onSelect={setMontantRecu} />
          {montantRecu !== null && (
            <div className="mt-2 flex justify-between text-sm font-body">
              <span className="text-ww-muted">Recu: &#3647; {montantRecu.toLocaleString()}</span>
              {monnaie > 0 && <span className="text-ww-lime font-bold">Monnaie: &#3647; {monnaie.toLocaleString()}</span>}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-ww-border text-sm text-ww-muted hover:text-ww-text transition-colors">
            Annuler
          </button>
          <button
            onClick={() => onSettle(total)}
            disabled={!canValidate}
            className="flex-1 py-2.5 rounded-lg text-sm font-display font-bold text-white transition-all active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed bg-ww-orange hover:bg-ww-orange/90"
          >
            VALIDER
          </button>
        </div>
      </div>
    </div>
  )
}
