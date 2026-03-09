import { useState } from 'react'
import type { FnbProduct } from '@/lib/types'

// =============================================================================
// FnbGrid -- Category-filtered F&B product grid for POS register
// =============================================================================

const FNB_CATEGORIES = [
  { key: 'bowls', label: 'Bowls' },
  { key: 'cocktails-proteines', label: 'Cocktails' },
  { key: 'cafes', label: 'Cafes' },
  { key: 'smoothies', label: 'Smoothies' },
  { key: 'boissons', label: 'Boissons' },
  { key: 'snacks', label: 'Snacks' },
] as const

interface FnbGridProps {
  fnbProducts: FnbProduct[]
  onAddItem: (product: FnbProduct) => void
}

export function FnbGrid({ fnbProducts, onAddItem }: FnbGridProps) {
  const [activeCategory, setActiveCategory] = useState<FnbProduct['categorie']>('bowls')

  const filteredProducts = fnbProducts.filter(
    (p) => p.categorie === activeCategory
  )

  return (
    <div className="flex flex-col p-5 gap-5">
      {/* Category filter row */}
      <div className="flex gap-2 flex-wrap">
        {FNB_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-lg text-sm font-display font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-ww-orange text-white shadow-md'
                  : 'bg-ww-surface text-ww-muted border border-ww-border hover:bg-ww-surface-2 hover:text-ww-text'
              }`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Section label */}
      <div className="ww-section-label">
        {FNB_CATEGORIES.find((c) => c.key === activeCategory)?.label}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filteredProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => onAddItem(product)}
            className="group bg-ww-surface border border-ww-border rounded-xl min-h-[120px] flex flex-col items-center justify-center gap-1.5 p-3 transition-all duration-200 hover:border-ww-orange hover:shadow-[0_0_12px_var(--ww-orange-glow)] hover:scale-[1.02] active:scale-[0.97] cursor-pointer"
          >
            <span className="text-2xl">{product.emoji}</span>
            <span className="text-sm font-medium text-ww-text text-center leading-tight">
              {product.nom}
            </span>
            <span className="font-display font-semibold text-ww-lime text-sm">
              {product.prix.toLocaleString()} THB
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
