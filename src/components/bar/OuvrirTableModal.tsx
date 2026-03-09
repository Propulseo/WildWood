'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

const EMPLACEMENTS = [
  'Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5',
  'Transat', 'Bar', 'Piscine', 'Plage', 'Autre',
]

interface OuvrirTableModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (clientNom: string, nomTable: string) => void
}

export function OuvrirTableModal({ open, onClose, onConfirm }: OuvrirTableModalProps) {
  const [clientNom, setClientNom] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  function handleConfirm() {
    if (!selected) return
    onConfirm(clientNom.trim() || 'Client', selected)
    setClientNom('')
    setSelected(null)
    onClose()
  }

  function handleClose() {
    setClientNom('')
    setSelected(null)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={handleClose} />
      <div className="relative bg-ww-surface border border-ww-border rounded-xl p-6 w-full max-w-md shadow-lg shadow-black/30">
        <button onClick={handleClose} className="absolute top-4 right-4 text-ww-muted hover:text-ww-text transition-colors">
          <X className="h-5 w-5" />
        </button>

        <h3 className="font-display text-lg font-bold text-ww-text mb-1">OUVRIR UNE TABLE</h3>
        <p className="text-xs text-ww-muted font-sans mb-5">Les articles du panier seront ajoutes a cette table.</p>

        {/* Client name */}
        <label className="text-xs text-ww-muted block mb-1.5">Nom du client (optionnel)</label>
        <input
          type="text"
          value={clientNom}
          onChange={(e) => setClientNom(e.target.value)}
          placeholder="Ex: Marco, Table de Sophie..."
          autoFocus
          className="w-full px-3 py-2.5 rounded-lg bg-ww-bg border border-ww-border text-ww-text text-sm font-sans placeholder:text-ww-muted/50 focus:outline-none focus:ring-2 focus:ring-ww-orange/50 mb-5"
        />

        {/* Emplacement pills */}
        <label className="text-xs text-ww-muted block mb-2">Emplacement</label>
        <div className="flex flex-wrap gap-2 mb-6">
          {EMPLACEMENTS.map((emp) => (
            <button
              key={emp}
              onClick={() => setSelected(emp)}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all duration-150 active:scale-[0.97] ${
                selected === emp
                  ? 'bg-ww-orange text-white'
                  : 'bg-ww-surface-2 border border-ww-border text-ww-muted hover:text-ww-text hover:border-ww-text/30'
              }`}
            >
              {emp}
            </button>
          ))}
        </div>

        {/* Confirm */}
        <button
          onClick={handleConfirm}
          disabled={!selected}
          className="w-full py-3 rounded-lg bg-ww-orange text-white font-display font-bold text-sm uppercase tracking-wider hover:bg-ww-orange/90 transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          OUVRIR LA TABLE
        </button>
      </div>
    </div>
  )
}
