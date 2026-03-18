'use client'

import { X, Banknote, ClipboardList, Home } from 'lucide-react'

interface ChoixModalProps {
  total: number
  onEncaisser: () => void
  onTable: () => void
  onBungalow: () => void
  onClose: () => void
}

const options = [
  { icon: Banknote, label: 'ENCAISSER MAINTENANT', sub: 'Paiement cash direct', fn: 'onEncaisser' as const, hover: 'hover:border-ww-orange hover:bg-ww-orange/5' },
  { icon: ClipboardList, label: 'OUVRIR UNE TABLE', sub: 'Paiera plus tard', fn: 'onTable' as const, hover: 'hover:border-ww-lime hover:bg-ww-lime/5' },
  { icon: Home, label: 'NOTE DE BUNGALOW', sub: 'Room charge + signature', fn: 'onBungalow' as const, hover: 'hover:border-ww-wood hover:bg-ww-wood/5' },
]

export function ChoixModal({ total, onEncaisser, onTable, onBungalow, onClose }: ChoixModalProps) {
  if (total <= 0) return null
  const handlers = { onEncaisser, onTable, onBungalow }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-ww-surface border border-ww-border rounded-xl p-6 w-full max-w-md">
        <button onClick={onClose} className="absolute top-4 right-4 text-ww-muted hover:text-ww-text transition-colors">
          <X className="h-5 w-5" />
        </button>
        <h2 className="font-display text-lg font-bold text-ww-text mb-5">
          COMMANDE · <span className="text-ww-orange">฿ {total.toLocaleString()}</span>
        </h2>
        <div className="flex flex-col gap-3">
          {options.map((o) => (
            <button key={o.fn} onClick={handlers[o.fn]}
              className={`flex items-center gap-4 p-4 rounded-xl border border-ww-border bg-ww-surface-2 transition-all duration-150 active:scale-[0.97] cursor-pointer text-left ${o.hover}`}>
              <o.icon className="h-6 w-6 text-ww-muted shrink-0" />
              <div>
                <div className="font-display font-bold text-sm uppercase tracking-wider text-ww-text">{o.label}</div>
                <div className="text-[10px] text-ww-muted">{o.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
