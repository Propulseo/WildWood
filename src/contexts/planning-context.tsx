'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import type { PlanningShift } from '@/lib/types'
import { getPlanning } from '@/lib/data-access'

interface PlanningContextType {
  shifts: PlanningShift[]
  addShift: (shift: Omit<PlanningShift, 'id'>) => void
  updateShift: (id: string, data: Partial<PlanningShift>) => void
  removeShift: (id: string) => void
  publierSemaine: (weekDates: string[]) => void
}

const PlanningContext = createContext<PlanningContextType | null>(null)

export function PlanningProvider({ children }: { children: ReactNode }) {
  const [shifts, setShifts] = useState<PlanningShift[]>([])

  useEffect(() => {
    getPlanning().then(setShifts)
  }, [])

  function addShift(data: Omit<PlanningShift, 'id'>) {
    const id = `shift-${Date.now()}`
    setShifts((prev) => [...prev, { ...data, id }])
  }

  function updateShift(id: string, data: Partial<PlanningShift>) {
    setShifts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    )
  }

  function removeShift(id: string) {
    setShifts((prev) => prev.filter((s) => s.id !== id))
  }

  function publierSemaine(weekDates: string[]) {
    setShifts((prev) =>
      prev.map((s) =>
        weekDates.includes(s.date) ? { ...s, publie: true } : s
      )
    )
  }

  return (
    <PlanningContext value={{ shifts, addShift, updateShift, removeShift, publierSemaine }}>
      {children}
    </PlanningContext>
  )
}

export function usePlanning() {
  const ctx = useContext(PlanningContext)
  if (!ctx) throw new Error('usePlanning must be used within PlanningProvider')
  return ctx
}
