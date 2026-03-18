'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { ShiftState, StaffMember } from '@/lib/types'
import { useStaff } from './staff-context'
import * as staffQ from '@/lib/supabase/queries/staff'
import { useRealtime } from '@/lib/hooks/use-realtime'
import { mutate } from '@/lib/mutation'

interface ShiftContextType {
  shiftState: ShiftState
  prendreShift: (poste: 'reception' | 'bar', newStaffId: string, note?: string) => void
  getStaffActif: (poste: 'reception' | 'bar') => StaffMember | null
  getShiftInfo: (poste: 'reception' | 'bar') => { staffId: string; depuis: string } | null
  loading: boolean
  error: string | null
  refetch: () => void
}

const ShiftContext = createContext<ShiftContextType | null>(null)

function nowHHmm() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function defaultShiftState(): ShiftState {
  return {
    reception: { staffId: 'staff-001', depuis: '08:30' },
    bar: { staffId: 'staff-004', depuis: '10:00' },
  }
}

export function ShiftProvider({ children }: { children: ReactNode }) {
  const { staff, pointerArrivee } = useStaff()
  const [shiftState, setShiftState] = useState<ShiftState>(defaultShiftState)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const shifts = await staffQ.getShiftsActifs()
      if (shifts && shifts.length > 0) {
        const state: ShiftState = { reception: null, bar: null }
        for (const s of shifts) {
          const poste = (s.poste as 'reception' | 'bar')
          const staffInfo = s.staff as { id: string } | null
          if (poste && staffInfo) {
            const debut = s.debut_at ? new Date(s.debut_at as string) : new Date()
            state[poste] = {
              staffId: staffInfo.id,
              depuis: `${String(debut.getHours()).padStart(2, '0')}:${String(debut.getMinutes()).padStart(2, '0')}`,
            }
          }
        }
        setShiftState(state)
      } else {
        try {
          const stored = localStorage.getItem('wildwood-shift-state')
          if (stored) setShiftState(JSON.parse(stored) as ShiftState)
        } catch { /* use default */ }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
      try {
        const stored = localStorage.getItem('wildwood-shift-state')
        if (stored) setShiftState(JSON.parse(stored) as ShiftState)
      } catch { /* use default */ }
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useRealtime('shifts_actifs', '*', fetchData)

  useEffect(() => {
    localStorage.setItem('wildwood-shift-state', JSON.stringify(shiftState))
  }, [shiftState])

  async function prendreShift(poste: 'reception' | 'bar', newStaffId: string, note?: string) {
    const heure = nowHHmm()
    const member = staff.find((s) => s.id === newStaffId)
    if (member) {
      const todayPointage = member.pointages.find(
        (p) => p.date === new Date().toISOString().slice(0, 10)
      )
      if (!todayPointage) pointerArrivee(newStaffId)
    }

    await mutate({
      optimistic: () => {
        const prev = shiftState
        setShiftState((p) => ({ ...p, [poste]: { staffId: newStaffId, depuis: heure } }))
        return prev
      },
      mutationFn: () => staffQ.insertShiftActif({
        staff_id: newStaffId,
        poste,
        note_transmission: note,
      }).then(() => {}),
      rollback: (prev) => setShiftState(prev),
      errorMessage: 'Erreur prise de shift',
    })
  }

  function getStaffActif(poste: 'reception' | 'bar'): StaffMember | null {
    const info = shiftState[poste]
    if (!info) return null
    return staff.find((s) => s.id === info.staffId) ?? null
  }

  function getShiftInfo(poste: 'reception' | 'bar') { return shiftState[poste] }

  return (
    <ShiftContext value={{ shiftState, prendreShift, getStaffActif, getShiftInfo, loading, error, refetch: fetchData }}>
      {children}
    </ShiftContext>
  )
}

export function useShift() {
  const ctx = useContext(ShiftContext)
  if (!ctx) throw new Error('useShift must be used within ShiftProvider')
  return ctx
}
