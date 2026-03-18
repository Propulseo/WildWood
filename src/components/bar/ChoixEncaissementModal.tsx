'use client'

import { X, Banknote, ClipboardList, Home } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ChoixEncaissementModalProps {
  open: boolean
  onClose: () => void
  total: number
  itemsSummary: string
  onEncaisserMaintenant: () => void
  onOuvrirTable: () => void
  onBungalow: () => void
}

export function ChoixEncaissementModal({
  open, onClose, total, itemsSummary,
  onEncaisserMaintenant, onOuvrirTable, onBungalow,
}: ChoixEncaissementModalProps) {
  const tPos = useTranslations('pos')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-ww-surface border border-ww-border rounded-xl p-6 w-full max-w-md shadow-lg shadow-black/30">
        <button onClick={onClose} className="absolute top-4 right-4 text-ww-muted hover:text-ww-text transition-colors">
          <X className="h-5 w-5" />
        </button>

        <h3 className="font-display text-lg font-bold text-ww-text mb-0.5">
          COMMANDE &middot; <span className="text-ww-orange">&#3647; {total.toLocaleString()}</span>
        </h3>
        <p className="text-xs text-ww-muted font-sans mb-6">{itemsSummary}</p>

        {/* Two big cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => { onEncaisserMaintenant(); onClose() }}
            className="flex flex-col items-center gap-3 p-5 rounded-xl border border-ww-border bg-ww-surface-2 hover:border-ww-orange hover:bg-ww-orange/5 text-ww-text hover:text-ww-orange transition-all duration-150 active:scale-[0.97] cursor-pointer"
          >
            <Banknote className="h-8 w-8" />
            <span className="font-display font-bold text-sm uppercase tracking-wider text-center">
              {tPos('collectNow').toUpperCase()}
            </span>
            <span className="text-[10px] text-ww-muted font-sans">{tPos('directCash')}</span>
          </button>

          <button
            onClick={() => { onOuvrirTable(); onClose() }}
            className="flex flex-col items-center gap-3 p-5 rounded-xl border border-ww-border bg-ww-surface-2 hover:border-ww-lime hover:bg-ww-lime/5 text-ww-text hover:text-ww-lime transition-all duration-150 active:scale-[0.97] cursor-pointer"
          >
            <ClipboardList className="h-8 w-8" />
            <span className="font-display font-bold text-sm uppercase tracking-wider text-center">
              {tPos('openTableLabel').toUpperCase()}
            </span>
            <span className="text-[10px] text-ww-muted font-sans">{tPos('payLater')}</span>
          </button>
        </div>

        {/* Bungalow link */}
        <button
          onClick={() => { onBungalow(); onClose() }}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-sans text-ww-wood hover:text-ww-text transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>{tPos('assignBungalowHotel')}</span>
        </button>
      </div>
    </div>
  )
}
