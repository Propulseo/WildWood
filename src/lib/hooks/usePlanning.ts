'use client'

import { useState, useEffect, useCallback } from 'react'
import type { PlanningShift } from '@/lib/types'
import * as planningQ from '@/lib/supabase/queries/planning'

interface UsePlanningReturn {
  shifts: PlanningShift[]
  addShift: (data: Omit<PlanningShift, 'id'>) => Promise<void>
  updateShift: (id: string, data: Partial<PlanningShift>) => Promise<void>
  removeShift: (id: string) => Promise<void>
  publierSemaine: (weekDates: string[]) => Promise<void>
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

function mapShift(row: Record<string, unknown>): PlanningShift {
  const staff = row.staff as { id: string; prenom: string; poste: string } | null
  return {
    id: row.id as string,
    staff_id: staff?.id ?? '',
    staff_nom: staff?.prenom ?? '',
    staff_poste: staff?.poste ?? '',
    date: row.date as string,
    heure_debut: row.heure_debut as string,
    heure_fin: row.heure_fin as string,
    poste_shift: row.poste_shift as PlanningShift['poste_shift'],
    note: row.note as string | null,
    publie: row.publie as boolean,
    repas_inclus: row.repas_inclus as boolean,
  }
}

export function usePlanning(): UsePlanningReturn {
  const [shifts, setShifts] = useState<PlanningShift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await planningQ.getPlanningShifts()
      setShifts(data.map((r: Record<string, unknown>) => mapShift(r)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refetch() }, [refetch])

  async function addShift(data: Omit<PlanningShift, 'id'>) {
    await planningQ.insertPlanningShift({
      staff_id: data.staff_id,
      date: data.date,
      heure_debut: data.heure_debut,
      heure_fin: data.heure_fin,
      poste_shift: data.poste_shift,
      repas_inclus: data.repas_inclus,
      note: data.note || undefined,
    })
    await refetch()
  }

  async function updateShift(id: string, data: Partial<PlanningShift>) {
    await planningQ.updatePlanningShift(id, data)
    await refetch()
  }

  async function removeShift(id: string) {
    await planningQ.deletePlanningShift(id)
    await refetch()
  }

  async function publierSemaine(weekDates: string[]) {
    if (weekDates.length >= 2) {
      await planningQ.publishShifts(weekDates[0], weekDates[weekDates.length - 1])
    }
    await refetch()
  }

  return { shifts, addShift, updateShift, removeShift, publierSemaine, loading, error, refetch }
}
