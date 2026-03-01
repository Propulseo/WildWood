import { useState } from 'react'
import type { FnbProduct } from '@/lib/types'
import { Button } from '@/components/ui/button'

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
    <div className="flex flex-col">
      {/* Category filter row */}
      <div className="flex gap-2 p-4 pb-0 flex-wrap">
        {FNB_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key
          return (
            <Button
              key={cat.key}
              variant={isActive ? 'pos-accent' : 'pos'}
              size="sm"
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </Button>
          )
        })}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-3 gap-3 p-4">
        {filteredProducts.map((product) => (
          <Button
            key={product.id}
            variant="pos"
            size="pos"
            className="flex flex-col items-center justify-center"
            onClick={() => onAddItem(product)}
          >
            <span className="text-2xl">{product.emoji}</span>
            <span className="text-sm font-medium">{product.nom}</span>
            <span className="text-wildwood-orange text-xs font-bold">
              {product.prix.toLocaleString()} THB
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}
