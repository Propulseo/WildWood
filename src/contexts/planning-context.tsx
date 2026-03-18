'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { PlanningShift } from '@/lib/types'
import { getPlanning } from '@/lib/data-access'
import * as planningQ from '@/lib/supabase/queries/planning'
import { useRealtime } from '@/lib/hooks/use-realtime'
import { mutate } from '@/lib/mutation'

interface PlanningContextType {
  shifts: PlanningShift[]
  addShift: (shift: Omit<PlanningShift, 'id'>) => void
  updateShift: (id: string, data: Partial<PlanningShift>) => void
  removeShift: (id: string) => void
  publierSemaine: (weekDates: string[]) => void
  loading: boolean
  error: string | null
  refetch: () => void
}

const PlanningContext = createContext<PlanningContextType | null>(null)

export function PlanningProvider({ children }: { children: ReactNode }) {
  const [shifts, setShifts] = useState<PlanningShift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try { setShifts(await getPlanning()) }
    catch (e) { setError(e instanceof Error ? e.message : 'Erreur') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useRealtime('shifts', '*', fetchData)

  async function addShift(data: Omit<PlanningShift, 'id'>) {
    const id = `shift-${Date.now()}`
    await mutate({
      optimistic: () => { const prev = shifts; setShifts((p) => [...p, { ...data, id }]); return prev },
      mutationFn: () => planningQ.insertPlanningShift({
        staff_id: data.staff_id,
        date: data.date,
        heure_debut: data.heure_debut,
        heure_fin: data.heure_fin,
        poste_shift: data.poste_shift,
        repas_inclus: data.repas_inclus,
        note: data.note || undefined,
      }).then(() => {}),
      rollback: (prev) => setShifts(prev),
      successMessage: 'Shift ajoute',
      errorMessage: 'Erreur ajout shift',
    })
  }

  async function updateShift(id: string, data: Partial<PlanningShift>) {
    await mutate({
      optimistic: () => { const prev = shifts; setShifts((p) => p.map((s) => (s.id === id ? { ...s, ...data } : s))); return prev },
      mutationFn: () => planningQ.updatePlanningShift(id, data).then(() => {}),
      rollback: (prev) => setShifts(prev),
      errorMessage: 'Erreur mise a jour shift',
    })
  }

  async function removeShift(id: string) {
    await mutate({
      optimistic: () => { const prev = shifts; setShifts((p) => p.filter((s) => s.id !== id)); return prev },
      mutationFn: () => planningQ.deletePlanningShift(id),
      rollback: (prev) => setShifts(prev),
      successMessage: 'Shift supprime',
      errorMessage: 'Erreur suppression shift',
    })
  }

  async function publierSemaine(weekDates: string[]) {
    await mutate({
      optimistic: () => {
        const prev = shifts
        setShifts((p) => p.map((s) => weekDates.includes(s.date) ? { ...s, publie: true } : s))
        return prev
      },
      mutationFn: async () => {
        if (weekDates.length >= 2) {
          await planningQ.publishShifts(weekDates[0], weekDates[weekDates.length - 1])
        }
      },
      rollback: (prev) => setShifts(prev),
      successMessage: 'Semaine publiee',
      errorMessage: 'Erreur publication semaine',
    })
  }

  return (
    <PlanningContext value={{ shifts, addShift, updateShift, removeShift, publierSemaine, loading, error, refetch: fetchData }}>
      {children}
    </PlanningContext>
  )
}

export function usePlanning() {
  const ctx = useContext(PlanningContext)
  if (!ctx) throw new Error('usePlanning must be used within PlanningProvider')
  return ctx
}
