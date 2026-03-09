'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import type { Serviette } from '@/lib/types'
import { getServiettes } from '@/lib/data-access'

interface ServiettesContextType {
  serviettes: Serviette[]
  stockTotal: number
  setStockTotal: (n: number) => void
  addEmprunt: (entry: Serviette) => void
  validerRetour: (id: string, statut: 'rendue' | 'perdue', staffRetour: string, note?: string) => void
}

const ServiettesContext = createContext<ServiettesContextType | null>(null)

export function ServiettesProvider({ children }: { children: ReactNode }) {
  const [serviettes, setServiettes] = useState<Serviette[]>([])
  const [stockTotal, setStockTotal] = useState(30)

  useEffect(() => {
    getServiettes().then(setServiettes)
  }, [])

  function addEmprunt(entry: Serviette) {
    setServiettes((prev) => [entry, ...prev])
  }

  function validerRetour(id: string, statut: 'rendue' | 'perdue', staffRetour: string, note?: string) {
    setServiettes((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, statut, date_retour: new Date().toISOString().slice(0, 10), staff_retour: staffRetour, note: note || s.note }
          : s
      )
    )
  }

  return (
    <ServiettesContext value={{ serviettes, stockTotal, setStockTotal, addEmprunt, validerRetour }}>
      {children}
    </ServiettesContext>
  )
}

export function useServiettes() {
  const ctx = useContext(ServiettesContext)
  if (!ctx) throw new Error('useServiettes must be used within ServiettesProvider')
  return ctx
}
