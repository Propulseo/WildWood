'use client'

import type { ModePaiement } from '@/lib/types'
import { MODE_LABELS, MODE_BADGE_STYLES } from './depenses-shared'

const MODES: ModePaiement[] = ['black_box', 'change_box', 'cb_scan']

interface Props {
  value: ModePaiement | ''
  onChange: (mode: ModePaiement) => void
}

export function SelectModePaiement({ value, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
            value === mode
              ? 'ring-2 ring-ww-orange ' + MODE_BADGE_STYLES[mode]
              : 'bg-ww-surface-2 text-ww-muted border-ww-border hover:border-ww-orange/50'
          }`}
        >
          {MODE_LABELS[mode]}
        </button>
      ))}
    </div>
  )
}
