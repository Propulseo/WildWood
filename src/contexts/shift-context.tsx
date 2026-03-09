'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import type { ShiftState, StaffMember } from '@/lib/types'
import { useStaff } from './staff-context'

interface ShiftContextType {
  shiftState: ShiftState
  prendreShift: (poste: 'reception' | 'bar', newStaffId: string, note?: string) => void
  getStaffActif: (poste: 'reception' | 'bar') => StaffMember | null
  getShiftInfo: (poste: 'reception' | 'bar') => { staffId: string; depuis: string } | null
}

const ShiftContext = createContext<ShiftContextType | null>(null)

const STORAGE_KEY = 'wildwood-shift-state'

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

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ShiftState
        setShiftState(parsed)
      }
    } catch {
      // use default
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shiftState))
  }, [shiftState])

  function prendreShift(poste: 'reception' | 'bar', newStaffId: string, _note?: string) {
    const heure = nowHHmm()
    setShiftState((prev) => ({
      ...prev,
      [poste]: { staffId: newStaffId, depuis: heure },
    }))
    const member = staff.find((s) => s.id === newStaffId)
    if (member) {
      const todayPointage = member.pointages.find(
        (p) => p.date === new Date().toISOString().slice(0, 10)
      )
      if (!todayPointage) {
        pointerArrivee(newStaffId)
      }
    }
  }

  function getStaffActif(poste: 'reception' | 'bar'): StaffMember | null {
    const info = shiftState[poste]
    if (!info) return null
    return staff.find((s) => s.id === info.staffId) ?? null
  }

  function getShiftInfo(poste: 'reception' | 'bar') {
    return shiftState[poste]
  }

  return (
    <ShiftContext value={{ shiftState, prendreShift, getStaffActif, getShiftInfo }}>
      {children}
    </ShiftContext>
  )
}

export function useShift() {
  const ctx = useContext(ShiftContext)
  if (!ctx) throw new Error('useShift must be used within ShiftProvider')
  return ctx
}
