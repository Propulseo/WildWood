'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { FnbProduct } from '@/lib/types'

interface ProduitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: FnbProduct | null
  categories: string[]
  defaultCategorie?: string
  onSave: (product: FnbProduct) => void
}

export function ProduitModal({
  open,
  onOpenChange,
  product,
  categories,
  defaultCategorie,
  onSave,
}: ProduitModalProps) {
  const [nom, setNom] = useState('')
  const [prix, setPrix] = useState('')
  const [categorie, setCategorie] = useState('')
  const [newCategorie, setNewCategorie] = useState('')
  const [emoji, setEmoji] = useState('')
  const [actif, setActif] = useState(true)
  const [useNewCategory, setUseNewCategory] = useState(false)
  const isEditing = !!product

  useEffect(() => {
    if (product) {
      setNom(product.nom)
      setPrix(String(product.prix))
      setCategorie(product.categorie)
      setEmoji(product.emoji)
      setActif(product.actif !== false)
      setUseNewCategory(false)
      setNewCategorie('')
    } else {
      setNom('')
      setPrix('')
      setCategorie(defaultCategorie || categories[0] || '')
      setEmoji('')
      setActif(true)
      setUseNewCategory(!defaultCategorie && categories.length === 0)
      setNewCategorie('')
    }
  }, [product, open, defaultCategorie, categories])

  const selectedCategorie = useNewCategory
    ? newCategorie.trim().toLowerCase().replace(/\s+/g, '-')
    : categorie

  const isValid =
    nom.trim() && prix && Number(prix) > 0 && selectedCategorie

  function handleSubmit() {
    if (!isValid) return
    onSave({
      id: product?.id || `fnb-${Date.now()}`,
      nom: nom.trim(),
      prix: Number(prix),
      categorie: selectedCategorie,
      emoji: emoji || '\uD83C\uDF7D\uFE0F',
      actif,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier le produit' : 'Ajouter un produit'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="ww-label mb-1.5 block">Nom du produit</label>
            <Input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Mango Smoothie"
            />
          </div>
          <div>
            <label className="ww-label mb-1.5 block">Prix (THB)</label>
            <Input
              type="number"
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
              placeholder="120"
              min="0"
            />
          </div>
          <div>
            <label className="ww-label mb-1.5 block">Categorie</label>
            {!useNewCategory ? (
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
                className="w-full rounded-lg border border-ww-border bg-ww-surface px-3 py-2 text-sm text-ww-text font-sans"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                value={newCategorie}
                onChange={(e) => setNewCategorie(e.target.value)}
                placeholder="Nouvelle categorie"
              />
            )}
            <button
              type="button"
              onClick={() => setUseNewCategory(!useNewCategory)}
              className="mt-1.5 text-xs text-ww-orange hover:underline cursor-pointer font-sans"
            >
              {useNewCategory
                ? 'Choisir une categorie existante'
                : '+ Nouvelle categorie'}
            </button>
          </div>
          <div>
            <label className="ww-label mb-1.5 block">Emoji (optionnel)</label>
            <Input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="\uD83E\uDD6D"
              className="w-20 text-center text-xl"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActif(!actif)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                actif ? 'bg-ww-success' : 'bg-ww-border'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                  actif ? 'translate-x-5' : ''
                }`}
              />
            </button>
            <span className="text-sm font-sans text-ww-text">
              {actif ? 'Actif' : 'Inactif (masque dans la caisse)'}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className="bg-ww-orange hover:bg-ww-orange/90"
          >
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
