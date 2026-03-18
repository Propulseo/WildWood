'use client'

import { useState, useEffect, useCallback } from 'react'
import type { StaffMember, Pointage } from '@/lib/types'
import * as staffQ from '@/lib/supabase/queries/staff'

interface UseStaffReturn {
  staff: StaffMember[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  pointerArrivee: (staffId: string) => Promise<void>
  pointerDepart: (staffId: string) => Promise<void>
  removeStaffMember: (staffId: string) => void
}

function todayStr() { return new Date().toISOString().slice(0, 10) }
function nowHHmm() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function useStaff(): UseStaffReturn {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [staffData, pointages] = await Promise.all([
        staffQ.getStaff(),
        staffQ.getPointages(),
      ])
      type StaffRow = { id: string; prenom: string; poste: string; avatar_initiales: string | null }
      type PointageRow = { id: string; staff_id: string; date: string; heure_arrivee: string | null; heure_depart: string | null }
      setStaff((staffData as StaffRow[]).map((s) => ({
        id: s.id,
        nom: s.prenom,
        prenom: s.prenom,
        poste: s.poste as StaffMember['poste'],
        avatar_initiales: s.avatar_initiales ?? s.prenom.slice(0, 2).toUpperCase(),
        couleur_avatar: '#C94E0A',
        pointages: (pointages as PointageRow[])
          .filter((p) => p.staff_id === s.id)
          .map((p): Pointage => ({
            date: p.date,
            heure_arrivee: p.heure_arrivee ?? '',
            heure_depart: p.heure_depart ?? null,
          })),
      })))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refetch() }, [refetch])

  async function pointerArrivee(staffId: string) {
    await staffQ.insertPointage({
      staff_id: staffId,
      date: todayStr(),
      heure_arrivee: nowHHmm(),
    })
    await refetch()
  }

  async function pointerDepart(staffId: string) {
    const dbPointages = await staffQ.getPointages(staffId, todayStr())
    if (dbPointages.length > 0) {
      await staffQ.updatePointage(dbPointages[0].id, { heure_depart: nowHHmm() })
    }
    await refetch()
  }

  function removeStaffMember(staffId: string) {
    setStaff((prev) => prev.filter((s) => s.id !== staffId))
  }

  return { staff, loading, error, refetch, pointerArrivee, pointerDepart, removeStaffMember }
}
