'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProducts } from '@/contexts/products-context'
import { ProduitCard } from './ProduitCard'
import { ProduitModal } from './ProduitModal'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import type { FnbProduct } from '@/lib/types'

export function FnbTab() {
  const { fnbProducts, addFnbProduct, updateFnbProduct, deleteFnbProduct } =
    useProducts()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<FnbProduct | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<FnbProduct | null>(null)
  const [defaultCategorie, setDefaultCategorie] = useState<string | undefined>()

  const categories = [...new Set(fnbProducts.map((p) => p.categorie))]
  const grouped = categories.reduce<Record<string, FnbProduct[]>>(
    (acc, cat) => {
      acc[cat] = fnbProducts.filter((p) => p.categorie === cat)
      return acc
    },
    {}
  )

  function handleEdit(product: FnbProduct) {
    setEditingProduct(product)
    setDefaultCategorie(undefined)
    setModalOpen(true)
  }

  function handleAddInCategory(categorie: string) {
    setEditingProduct(null)
    setDefaultCategorie(categorie)
    setModalOpen(true)
  }

  function handleAddNew() {
    setEditingProduct(null)
    setDefaultCategorie(undefined)
    setModalOpen(true)
  }

  function handleSave(product: FnbProduct) {
    if (editingProduct) {
      updateFnbProduct(editingProduct.id, product)
    } else {
      addFnbProduct(product)
    }
  }

  function handleDeleteConfirm() {
    if (deleteTarget) deleteFnbProduct(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-lg text-ww-text uppercase tracking-wider">
          Produits F&B
        </h2>
        <Button
          onClick={handleAddNew}
          className="bg-ww-orange hover:bg-ww-orange/90 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Nouvelle categorie
        </Button>
      </div>

      {categories.map((cat) => (
        <div
          key={cat}
          className="bg-ww-surface border border-ww-border rounded-xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-ww-border bg-ww-surface-2">
            <span className="font-display font-bold uppercase tracking-wider text-ww-text">
              {cat}
            </span>
            <span className="text-xs text-ww-muted font-sans">
              {grouped[cat].length} produit
              {grouped[cat].length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="divide-y divide-ww-border/50">
            {grouped[cat].map((product) => (
              <ProduitCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
          <button
            onClick={() => handleAddInCategory(cat)}
            className="w-full px-4 py-2.5 text-sm font-sans text-ww-muted hover:text-ww-orange hover:bg-ww-surface-2 transition-all duration-150 cursor-pointer text-left"
          >
            + Ajouter un produit
          </button>
        </div>
      ))}

      <ProduitModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        product={editingProduct}
        categories={categories}
        defaultCategorie={defaultCategorie}
        onSave={handleSave}
      />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        nom={deleteTarget?.nom || ''}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
