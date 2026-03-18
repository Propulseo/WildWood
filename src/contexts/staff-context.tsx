'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { StaffMember, Pointage } from '@/lib/types'
import { getStaff } from '@/lib/data-access'
import * as staffQ from '@/lib/supabase/queries/staff'
import { useRealtime } from '@/lib/hooks/use-realtime'
import { mutate } from '@/lib/mutation'

function todayStr() { return new Date().toISOString().slice(0, 10) }
function nowHHmm() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

interface StaffContextType {
  staff: StaffMember[]
  selectedStaffId: string | null
  setSelectedStaffId: (id: string) => void
  pointerArrivee: (staffId: string) => string
  pointerDepart: (staffId: string) => string
  pointerPause: (staffId: string) => string
  pointerFinPause: (staffId: string) => string
  getPointageAujourdhui: (staffId: string) => Pointage | undefined
  addStaffMember: (member: StaffMember) => void
  removeStaffMember: (staffId: string) => void
  loading: boolean
  error: string | null
  refetch: () => void
}

const StaffContext = createContext<StaffContextType | null>(null)

export function StaffProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await getStaff()
      setStaff(data)
      if (data.length > 0 && !selectedStaffId) setSelectedStaffId(data[0].id)
    } catch (e) { setError(e instanceof Error ? e.message : 'Erreur') }
    finally { setLoading(false) }
  }, [selectedStaffId])

  useEffect(() => { fetchData() }, [fetchData])
  useRealtime('pointages', '*', fetchData)

  function getPointageAujourdhui(staffId: string): Pointage | undefined {
    const member = staff.find((s) => s.id === staffId)
    return member?.pointages.find((p) => p.date === todayStr())
  }

  function pointerArrivee(staffId: string): string {
    const heure = nowHHmm()
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id !== staffId) return s
        const newPointage: Pointage = { date: todayStr(), heure_arrivee: heure, heure_depart: null }
        return { ...s, pointages: [...s.pointages, newPointage] }
      })
    )
    mutate({
      mutationFn: () => staffQ.insertPointage({ staff_id: staffId, date: todayStr(), heure_arrivee: heure }).then(() => {}),
      rollback: () => fetchData(),
      errorMessage: 'Erreur pointage arrivee',
    })
    return heure
  }

  function pointerDepart(staffId: string): string {
    const heure = nowHHmm()
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id !== staffId) return s
        return {
          ...s,
          pointages: s.pointages.map((p) =>
            p.date === todayStr() ? { ...p, heure_depart: heure, en_pause: false, heure_pause: null } : p
          ),
        }
      })
    )
    const member = staff.find((s) => s.id === staffId)
    const pointage = member?.pointages.find((p) => p.date === todayStr())
    const pointageId = pointage ? (pointage as unknown as { id?: string }).id : undefined
    if (pointageId) {
      mutate({
        mutationFn: () => staffQ.updatePointage(pointageId, { heure_depart: heure }).then(() => {}),
        rollback: () => fetchData(),
        errorMessage: 'Erreur pointage depart',
      })
    }
    return heure
  }

  function pointerPause(staffId: string): string {
    const heure = nowHHmm()
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id !== staffId) return s
        return {
          ...s,
          pointages: s.pointages.map((p) =>
            p.date === todayStr() ? { ...p, en_pause: true, heure_pause: heure } : p
          ),
        }
      })
    )
    return heure
  }

  function pointerFinPause(staffId: string): string {
    const heure = nowHHmm()
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id !== staffId) return s
        return {
          ...s,
          pointages: s.pointages.map((p) =>
            p.date === todayStr() ? { ...p, en_pause: false, heure_pause: null } : p
          ),
        }
      })
    )
    return heure
  }

  async function addStaffMember(member: StaffMember) {
    await mutate({
      optimistic: () => { const prev = staff; setStaff((p) => [...p, member]); return prev },
      mutationFn: () => staffQ.insertStaff({
        prenom: member.prenom,
        poste: member.poste,
        avatar_initiales: member.avatar_initiales,
      }).then(() => {}),
      rollback: (prev) => setStaff(prev),
      successMessage: `${member.prenom} ajoute au staff`,
      errorMessage: 'Erreur ajout staff',
    })
  }

  async function removeStaffMember(staffId: string) {
    await mutate({
      optimistic: () => { const prev = staff; setStaff((p) => p.filter((s) => s.id !== staffId)); return prev },
      mutationFn: () => staffQ.updateStaff(staffId, { actif: false }).then(() => {}),
      rollback: (prev) => setStaff(prev),
      successMessage: 'Membre retire',
      errorMessage: 'Erreur retrait staff',
    })
  }

  return (
    <StaffContext value={{
      staff, selectedStaffId, setSelectedStaffId,
      pointerArrivee, pointerDepart, pointerPause, pointerFinPause,
      getPointageAujourdhui, addStaffMember, removeStaffMember,
      loading, error, refetch: fetchData,
    }}>
      {children}
    </StaffContext>
  )
}

export function useStaff() {
  const ctx = useContext(StaffContext)
  if (!ctx) throw new Error('useStaff must be used within StaffProvider')
  return ctx
}
