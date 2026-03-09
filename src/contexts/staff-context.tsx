'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import type { StaffMember, Pointage } from '@/lib/types'
import { getStaff } from '@/lib/data-access'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

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
}

const StaffContext = createContext<StaffContextType | null>(null)

export function StaffProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)

  useEffect(() => {
    getStaff().then((data) => {
      setStaff(data)
      if (data.length > 0) setSelectedStaffId(data[0].id)
    })
  }, [])

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

  function addStaffMember(member: StaffMember) {
    setStaff((prev) => [...prev, member])
  }

  function removeStaffMember(staffId: string) {
    setStaff((prev) => prev.filter((s) => s.id !== staffId))
  }

  return (
    <StaffContext value={{ staff, selectedStaffId, setSelectedStaffId, pointerArrivee, pointerDepart, pointerPause, pointerFinPause, getPointageAujourdhui, addStaffMember, removeStaffMember }}>
      {children}
    </StaffContext>
  )
}

export function useStaff() {
  const ctx = useContext(StaffContext)
  if (!ctx) throw new Error('useStaff must be used within StaffProvider')
  return ctx
}
