'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import type { DailyClosing, ClosingStatut } from '@/lib/types-reporting'
import { getClosings } from '@/lib/data-access'

interface ClosingsContextType {
  closings: DailyClosing[]
  addClosing: (closing: DailyClosing) => void
  updateStatut: (id: string, statut: ClosingStatut, validePar: string) => void
}

const ClosingsContext = createContext<ClosingsContextType | null>(null)

export function ClosingsProvider({ children }: { children: ReactNode }) {
  const [closings, setClosings] = useState<DailyClosing[]>([])

  useEffect(() => {
    getClosings().then(setClosings)
  }, [])

  function addClosing(closing: DailyClosing) {
    setClosings((prev) => [closing, ...prev])
  }

  function updateStatut(id: string, statut: ClosingStatut, validePar: string) {
    setClosings((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, statut, valide_par: validePar, valide_at: new Date().toISOString() }
          : c
      )
    )
  }

  return (
    <ClosingsContext value={{ closings, addClosing, updateStatut }}>
      {children}
    </ClosingsContext>
  )
}

export function useClosings() {
  const ctx = useContext(ClosingsContext)
  if (!ctx) throw new Error('useClosings must be used within ClosingsProvider')
  return ctx
}
