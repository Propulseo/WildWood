'use client'

import type { CategorieDepense, GrandeCategorie } from '@/lib/types'
import { GYM_CATEGORIES, RESORT_CATEGORIES, FNB_CATEGORIES, CATEGORY_LABELS } from './depenses-shared'

interface Props {
  grandeCategorie: GrandeCategorie
  value: CategorieDepense | ''
  onChange: (cat: CategorieDepense) => void
}

const CATEGORIES_MAP: Record<GrandeCategorie, CategorieDepense[]> = {
  gym: GYM_CATEGORIES,
  resort: RESORT_CATEGORIES,
  fnb: FNB_CATEGORIES,
}

export function SelectCategorie({ grandeCategorie, value, onChange }: Props) {
  const categories = CATEGORIES_MAP[grandeCategorie]

  return (
    <div className="grid grid-cols-2 gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
            value === cat
              ? 'bg-ww-orange text-white border-ww-orange'
              : 'bg-ww-surface-2 text-ww-text border-ww-border hover:border-ww-orange/50'
          }`}
        >
          {CATEGORY_LABELS[cat] || cat}
        </button>
      ))}
    </div>
  )
}
