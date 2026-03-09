'use client'

import { X } from 'lucide-react'
import type { Client } from '@/lib/types'

interface BungalowSelectModalProps {
  open: boolean
  onClose: () => void
  residents: { client: Client; bungalowNumero: number }[]
  onSelect: (client: Client, bungalowNumero: number) => void
}

export function BungalowSelectModal({ open, onClose, residents, onSelect }: BungalowSelectModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-ww-surface border border-ww-border rounded-xl p-6 w-full max-w-md shadow-lg shadow-black/30">
        <button onClick={onClose} className="absolute top-4 right-4 text-ww-muted hover:text-ww-text transition-colors">
          <X className="h-5 w-5" />
        </button>
        <h3 className="font-display text-lg font-bold text-ww-text mb-1">BUNGALOW</h3>
        <p className="text-xs text-ww-muted font-sans mb-4">Selectionner le resident</p>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {residents.length === 0 ? (
            <p className="text-sm text-ww-muted text-center py-4">Aucun resident actif</p>
          ) : residents.map((r) => (
            <button
              key={r.client.id}
              onClick={() => { onSelect(r.client, r.bungalowNumero); onClose() }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-ww-surface-2 border border-ww-border hover:border-ww-orange transition-colors cursor-pointer"
            >
              <span className="text-sm font-sans text-ww-text">{r.client.prenom} {r.client.nom}</span>
              <span className="text-xs font-display font-bold text-ww-wood">B{r.bungalowNumero}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
