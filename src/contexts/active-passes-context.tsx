'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import type { ActiveGymPass, Checkin } from '@/lib/types'
import { getActivePasses } from '@/lib/data-access'

interface ActivePassesContextType {
  activePasses: ActiveGymPass[]
  addActivePass: (pass: ActiveGymPass) => void
  findByQrToken: (token: string) => ActiveGymPass | undefined
  addCheckin: (passId: string, checkin: Checkin) => void
  removeCheckin: (passId: string, date: string, heure: string) => void
}

const ActivePassesContext = createContext<ActivePassesContextType | null>(null)

export function ActivePassesProvider({ children }: { children: ReactNode }) {
  const [activePasses, setActivePasses] = useState<ActiveGymPass[]>([])

  useEffect(() => {
    getActivePasses().then(setActivePasses)
  }, [])

  function addActivePass(pass: ActiveGymPass) {
    setActivePasses((prev) => [pass, ...prev])
  }

  function findByQrToken(token: string) {
    return activePasses.find((p) => p.qrToken === token)
  }

  function addCheckin(passId: string, checkin: Checkin) {
    setActivePasses((prev) =>
      prev.map((p) =>
        p.id === passId ? { ...p, checkins: [...p.checkins, checkin] } : p
      )
    )
  }

  function removeCheckin(passId: string, date: string, heure: string) {
    setActivePasses((prev) =>
      prev.map((p) =>
        p.id === passId
          ? { ...p, checkins: p.checkins.filter((c) => !(c.date === date && c.heure === heure)) }
          : p
      )
    )
  }

  return (
    <ActivePassesContext value={{ activePasses, addActivePass, findByQrToken, addCheckin, removeCheckin }}>
      {children}
    </ActivePassesContext>
  )
}

export function useActivePasses() {
  const ctx = useContext(ActivePassesContext)
  if (!ctx)
    throw new Error(
      'useActivePasses must be used within ActivePassesProvider'
    )
  return ctx
}
