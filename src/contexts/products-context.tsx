'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { GymPass, FnbProduct } from '@/lib/types'
import { getGymPasses, getFnbProducts } from '@/lib/data-access'
import * as transactionsQ from '@/lib/supabase/queries/transactions'
import { mutate } from '@/lib/mutation'

interface ProductsContextType {
  gymPasses: GymPass[]
  fnbProducts: FnbProduct[]
  addGymPass: (pass: GymPass) => void
  updateGymPass: (id: string, updates: Partial<GymPass>) => void
  deleteGymPass: (id: string) => void
  addFnbProduct: (product: FnbProduct) => void
  updateFnbProduct: (id: string, updates: Partial<FnbProduct>) => void
  deleteFnbProduct: (id: string) => void
  loading: boolean
  error: string | null
  refetch: () => void
}

const ProductsContext = createContext<ProductsContextType | null>(null)

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [gymPasses, setGymPasses] = useState<GymPass[]>([])
  const [fnbProducts, setFnbProducts] = useState<FnbProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [gp, fnb] = await Promise.all([getGymPasses(), getFnbProducts()])
      setGymPasses(gp); setFnbProducts(fnb)
    } catch (e) { setError(e instanceof Error ? e.message : 'Erreur') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function addGymPass(pass: GymPass) {
    await mutate({
      optimistic: () => { const prev = gymPasses; setGymPasses((p) => [...p, pass]); return prev },
      mutationFn: () => transactionsQ.insertProduit({
        nom: pass.nom,
        categorie: 'gym_pass',
        prix_thb: pass.prix,
        duree_jours: pass.dureeJours,
      }).then(() => {}),
      rollback: (prev) => setGymPasses(prev),
      successMessage: 'Pass gym ajoute',
      errorMessage: 'Erreur ajout pass gym',
    })
  }

  async function updateGymPass(id: string, updates: Partial<GymPass>) {
    const dbUpdates: Record<string, unknown> = {}
    if (updates.nom !== undefined) dbUpdates.nom = updates.nom
    if (updates.prix !== undefined) dbUpdates.prix_thb = updates.prix
    if (updates.dureeJours !== undefined) dbUpdates.duree_jours = updates.dureeJours
    if (updates.actif !== undefined) dbUpdates.actif = updates.actif
    await mutate({
      optimistic: () => { const prev = gymPasses; setGymPasses((p) => p.map((g) => (g.id === id ? { ...g, ...updates } : g))); return prev },
      mutationFn: () => transactionsQ.updateProduit(id, dbUpdates).then(() => {}),
      rollback: (prev) => setGymPasses(prev),
      errorMessage: 'Erreur mise a jour pass gym',
    })
  }

  async function deleteGymPass(id: string) {
    await mutate({
      optimistic: () => { const prev = gymPasses; setGymPasses((p) => p.filter((g) => g.id !== id)); return prev },
      mutationFn: () => transactionsQ.deleteProduit(id),
      rollback: (prev) => setGymPasses(prev),
      successMessage: 'Pass gym supprime',
      errorMessage: 'Erreur suppression pass gym',
    })
  }

  async function addFnbProduct(product: FnbProduct) {
    await mutate({
      optimistic: () => { const prev = fnbProducts; setFnbProducts((p) => [...p, product]); return prev },
      mutationFn: () => transactionsQ.insertProduit({
        nom: product.nom,
        categorie: 'fnb',
        sous_categorie: product.categorie,
        prix_thb: product.prix,
        emoji: product.emoji || '🍽️',
      }).then(() => {}),
      rollback: (prev) => setFnbProducts(prev),
      successMessage: 'Produit F&B ajoute',
      errorMessage: 'Erreur ajout produit F&B',
    })
  }

  async function updateFnbProduct(id: string, updates: Partial<FnbProduct>) {
    const dbUpdates: Record<string, unknown> = {}
    if (updates.nom !== undefined) dbUpdates.nom = updates.nom
    if (updates.prix !== undefined) dbUpdates.prix_thb = updates.prix
    if (updates.categorie !== undefined) dbUpdates.sous_categorie = updates.categorie
    if (updates.emoji !== undefined) dbUpdates.emoji = updates.emoji
    if (updates.actif !== undefined) dbUpdates.actif = updates.actif
    await mutate({
      optimistic: () => { const prev = fnbProducts; setFnbProducts((p) => p.map((f) => (f.id === id ? { ...f, ...updates } : f))); return prev },
      mutationFn: () => transactionsQ.updateProduit(id, dbUpdates).then(() => {}),
      rollback: (prev) => setFnbProducts(prev),
      errorMessage: 'Erreur mise a jour produit F&B',
    })
  }

  async function deleteFnbProduct(id: string) {
    await mutate({
      optimistic: () => { const prev = fnbProducts; setFnbProducts((p) => p.filter((f) => f.id !== id)); return prev },
      mutationFn: () => transactionsQ.deleteProduit(id),
      rollback: (prev) => setFnbProducts(prev),
      successMessage: 'Produit F&B supprime',
      errorMessage: 'Erreur suppression produit F&B',
    })
  }

  return (
    <ProductsContext value={{
      gymPasses, fnbProducts,
      addGymPass, updateGymPass, deleteGymPass,
      addFnbProduct, updateFnbProduct, deleteFnbProduct,
      loading, error, refetch: fetchData,
    }}>
      {children}
    </ProductsContext>
  )
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider')
  return ctx
}
