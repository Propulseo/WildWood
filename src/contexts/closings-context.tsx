'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { DailyClosing, ClosingStatut } from '@/lib/types-reporting'
import { getClosings } from '@/lib/data-access'
import * as reportingQ from '@/lib/supabase/queries/reporting'
import { useRealtime } from '@/lib/hooks/use-realtime'
import { mutate } from '@/lib/mutation'

interface ClosingsContextType {
  closings: DailyClosing[]
  addClosing: (closing: DailyClosing) => void
  updateStatut: (id: string, statut: ClosingStatut, validePar: string) => void
  loading: boolean
  error: string | null
  refetch: () => void
}

const ClosingsContext = createContext<ClosingsContextType | null>(null)

export function ClosingsProvider({ children }: { children: ReactNode }) {
  const [closings, setClosings] = useState<DailyClosing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try { setClosings(await getClosings()) }
    catch (e) { setError(e instanceof Error ? e.message : 'Erreur') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useRealtime('closings', '*', fetchData)

  async function addClosing(closing: DailyClosing) {
    await mutate({
      optimistic: () => { const prev = closings; setClosings((p) => [closing, ...p]); return prev },
      mutationFn: () => reportingQ.insertClosing({
        date: closing.date,
        ca_jour: closing.ca_jour,
        cash_compte: closing.cash_compte,
        ecart: closing.ecart,
        note_ecart: closing.note_ecart,
      }).then(() => {}),
      rollback: (prev) => setClosings(prev),
      successMessage: 'Cloture ajoutee',
      errorMessage: 'Erreur ajout cloture',
    })
  }

  async function updateStatut(id: string, statut: ClosingStatut, validePar: string) {
    await mutate({
      optimistic: () => {
        const prev = closings
        setClosings((p) =>
          p.map((c) =>
            c.id === id ? { ...c, statut, valide_par: validePar, valide_at: new Date().toISOString() } : c
          )
        )
        return prev
      },
      mutationFn: () => reportingQ.updateClosing(id, {
        statut, valide_par: validePar, valide_at: new Date().toISOString(),
      }).then(() => {}),
      rollback: (prev) => setClosings(prev),
      successMessage: 'Statut mis a jour',
      errorMessage: 'Erreur mise a jour statut',
    })
  }

  return (
    <ClosingsContext value={{ closings, addClosing, updateStatut, loading, error, refetch: fetchData }}>
      {children}
    </ClosingsContext>
  )
}

export function useClosings() {
  const ctx = useContext(ClosingsContext)
  if (!ctx) throw new Error('useClosings must be used within ClosingsProvider')
  return ctx
}
