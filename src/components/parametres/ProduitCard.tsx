import type { FnbProduct } from '@/lib/types'
import { Pencil, Trash2 } from 'lucide-react'

interface ProduitCardProps {
  product: FnbProduct
  onEdit: (product: FnbProduct) => void
  onDelete: (product: FnbProduct) => void
}

export function ProduitCard({ product, onEdit, onDelete }: ProduitCardProps) {
  const isActive = product.actif !== false

  return (
    <div
      className={`flex items-center justify-between py-2.5 px-4 hover:bg-ww-surface-2 transition-all duration-150 ${
        !isActive ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{product.emoji}</span>
        <span className="text-sm font-sans text-ww-text">{product.nom}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-display font-semibold text-sm text-ww-orange">
          &#3647; {product.prix.toLocaleString()}
        </span>
        {!isActive && (
          <span className="text-xs text-ww-muted font-sans">Inactif</span>
        )}
        <button
          onClick={() => onEdit(product)}
          className="p-1.5 rounded-lg text-ww-muted hover:text-ww-orange hover:bg-ww-surface transition-all duration-150 cursor-pointer"
          title="Modifier"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(product)}
          className="p-1.5 rounded-lg text-ww-muted hover:text-ww-danger hover:bg-ww-surface transition-all duration-150 cursor-pointer"
          title="Supprimer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
