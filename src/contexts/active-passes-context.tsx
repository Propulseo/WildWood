'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { ActiveGymPass, Checkin } from '@/lib/types'
import { getActivePasses } from '@/lib/data-access'
import * as gymQ from '@/lib/supabase/queries/gym'
import { useRealtime } from '@/lib/hooks/use-realtime'
import { mutate } from '@/lib/mutation'

interface ActivePassesContextType {
  activePasses: ActiveGymPass[]
  addActivePass: (pass: ActiveGymPass) => void
  findByQrToken: (token: string) => ActiveGymPass | undefined
  addCheckin: (passId: string, checkin: Checkin) => void
  removeCheckin: (passId: string, date: string, heure: string) => void
  loading: boolean
  error: string | null
  refetch: () => void
}

const ActivePassesContext = createContext<ActivePassesContextType | null>(null)

export function ActivePassesProvider({ children }: { children: ReactNode }) {
  const [activePasses, setActivePasses] = useState<ActiveGymPass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try { setActivePasses(await getActivePasses()) }
    catch (e) { setError(e instanceof Error ? e.message : 'Erreur') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useRealtime('checkins', '*', fetchData)

  async function addActivePass(pass: ActiveGymPass) {
    await mutate({
      optimistic: () => { const prev = activePasses; setActivePasses((p) => [pass, ...p]); return prev },
      mutationFn: () => gymQ.insertGymPass({
        client_id: pass.clientId,
        client_nom: pass.clientNom,
        type_pass: pass.passId,
        prix_paye: 0,
        date_debut: pass.dateAchat,
        date_expiration: pass.dateExpiration,
      }).then(() => {}),
      rollback: (prev) => setActivePasses(prev),
      errorMessage: 'Erreur ajout pass',
    })
  }

  function findByQrToken(token: string) {
    return activePasses.find((p) => p.qrToken === token)
  }

  async function addCheckin(passId: string, checkin: Checkin) {
    const pass = activePasses.find((p) => p.id === passId)
    await mutate({
      optimistic: () => {
        const prev = activePasses
        setActivePasses((p) =>
          p.map((ap) => ap.id === passId ? { ...ap, checkins: [...ap.checkins, checkin] } : ap)
        )
        return prev
      },
      mutationFn: () => gymQ.insertCheckin({
        date: checkin.date,
        client_id: pass?.clientId || '',
        client_nom: pass?.clientNom || '',
        gym_pass_id: passId,
        type_entree: 'gym_pass',
        heure_entree: checkin.heure,
      }).then(() => {}),
      rollback: (prev) => setActivePasses(prev),
      errorMessage: 'Erreur ajout checkin',
    })
  }

  async function removeCheckin(passId: string, date: string, heure: string) {
    await mutate({
      optimistic: () => {
        const prev = activePasses
        setActivePasses((p) =>
          p.map((ap) => ap.id === passId
            ? { ...ap, checkins: ap.checkins.filter((c) => !(c.date === date && c.heure === heure)) }
            : ap
          )
        )
        return prev
      },
      mutationFn: () => gymQ.deleteCheckin(passId, date, heure),
      rollback: (prev) => setActivePasses(prev),
      errorMessage: 'Erreur suppression checkin',
    })
  }

  return (
    <ActivePassesContext value={{ activePasses, addActivePass, findByQrToken, addCheckin, removeCheckin, loading, error, refetch: fetchData }}>
      {children}
    </ActivePassesContext>
  )
}

export function useActivePasses() {
  const ctx = useContext(ActivePassesContext)
  if (!ctx) throw new Error('useActivePasses must be used within ActivePassesProvider')
  return ctx
}
