'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import type { GymPass, FnbProduct } from '@/lib/types'
import { getGymPasses, getFnbProducts } from '@/lib/data-access'

interface ProductsContextType {
  gymPasses: GymPass[]
  fnbProducts: FnbProduct[]
  addGymPass: (pass: GymPass) => void
  updateGymPass: (id: string, updates: Partial<GymPass>) => void
  deleteGymPass: (id: string) => void
  addFnbProduct: (product: FnbProduct) => void
  updateFnbProduct: (id: string, updates: Partial<FnbProduct>) => void
  deleteFnbProduct: (id: string) => void
}

const ProductsContext = createContext<ProductsContextType | null>(null)

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [gymPasses, setGymPasses] = useState<GymPass[]>([])
  const [fnbProducts, setFnbProducts] = useState<FnbProduct[]>([])

  useEffect(() => {
    getGymPasses().then(setGymPasses)
    getFnbProducts().then(setFnbProducts)
  }, [])

  function addGymPass(pass: GymPass) {
    setGymPasses((prev) => [...prev, pass])
  }

  function updateGymPass(id: string, updates: Partial<GymPass>) {
    setGymPasses((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )
  }

  function deleteGymPass(id: string) {
    setGymPasses((prev) => prev.filter((p) => p.id !== id))
  }

  function addFnbProduct(product: FnbProduct) {
    setFnbProducts((prev) => [...prev, product])
  }

  function updateFnbProduct(id: string, updates: Partial<FnbProduct>) {
    setFnbProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )
  }

  function deleteFnbProduct(id: string) {
    setFnbProducts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <ProductsContext value={{
      gymPasses,
      fnbProducts,
      addGymPass,
      updateGymPass,
      deleteGymPass,
      addFnbProduct,
      updateFnbProduct,
      deleteFnbProduct,
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
