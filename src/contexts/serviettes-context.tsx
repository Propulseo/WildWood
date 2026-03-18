'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import type { Serviette } from '@/lib/types'
import { getServiettes } from '@/lib/data-access'
import * as serviettesQ from '@/lib/supabase/queries/serviettes'
import { mutate } from '@/lib/mutation'

interface ServiettesContextType {
  serviettes: Serviette[]
  enStock: number
  empruntees: number
  sales: number
  enLavage: number
  addEmprunt: (entry: Serviette) => void
  validerRetour: (id: string, statut: 'rendue' | 'perdue', staffRetour: string, note?: string) => void
  receptionnerLavage: (nbComptees: number, staffId: string) => Promise<{ nbRemises: number; nbCreees: number }>
  loading: boolean
  error: string | null
  refetch: () => void
}

const ServiettesContext = createContext<ServiettesContextType | null>(null)

export function ServiettesProvider({ children }: { children: ReactNode }) {
  const [serviettes, setServiettes] = useState<Serviette[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try { setServiettes(await getServiettes()) }
    catch (e) { setError(e instanceof Error ? e.message : 'Erreur') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const enStock = useMemo(
    () => serviettes.filter((s) => s.statut === 'disponible' && s.etat === 'propre').length,
    [serviettes]
  )
  const empruntees = useMemo(
    () => serviettes.filter((s) => s.statut === 'en_cours').length,
    [serviettes]
  )
  const sales = useMemo(
    () => serviettes.filter((s) => s.statut === 'rendue' && s.etat === 'sale').length,
    [serviettes]
  )
  const enLavage = useMemo(
    () => serviettes.filter((s) => s.etat === 'en_lavage').length,
    [serviettes]
  )

  async function addEmprunt(entry: Serviette) {
    await mutate({
      optimistic: () => { const prev = serviettes; setServiettes((p) => [entry, ...p]); return prev },
      mutationFn: () => serviettesQ.insertServiette({
        client_nom: entry.client_nom,
        client_id: entry.client_id || undefined,
        depot_thb: entry.deposit_montant,
        statut: 'en_cours',
        etat: 'propre',
        staff_emprunt: entry.staff_emprunt || undefined,
      }).then(() => {}),
      rollback: (prev) => setServiettes(prev),
      successMessage: 'Serviette empruntee',
      errorMessage: 'Erreur emprunt serviette',
    })
  }

  async function validerRetour(id: string, statut: 'rendue' | 'perdue', staffRetour: string, note?: string) {
    const etat = statut === 'rendue' ? 'sale' : 'propre'
    await mutate({
      optimistic: () => {
        const prev = serviettes
        setServiettes((p) =>
          p.map((s) =>
            s.id === id
              ? { ...s, statut, etat, date_retour: new Date().toISOString().slice(0, 10), staff_retour: staffRetour, note: note || s.note }
              : s
          )
        )
        return prev
      },
      mutationFn: () => serviettesQ.updateServiette(id, {
        statut,
        etat,
        retour_at: new Date().toISOString(),
        staff_retour: staffRetour,
      }).then(() => {}),
      rollback: (prev) => setServiettes(prev),
      successMessage: statut === 'rendue' ? 'Serviette rendue · Mise en attente lavage' : 'Serviette perdue enregistree',
      errorMessage: 'Erreur retour serviette',
    })
  }

  async function handleReceptionLavage(nbComptees: number, staffId: string) {
    const result = await serviettesQ.receptionnerLavage(nbComptees, staffId)
    await fetchData()
    return result
  }

  return (
    <ServiettesContext value={{
      serviettes, enStock, empruntees, sales, enLavage,
      addEmprunt, validerRetour, receptionnerLavage: handleReceptionLavage,
      loading, error, refetch: fetchData,
    }}>
      {children}
    </ServiettesContext>
  )
}

export function useServiettes() {
  const ctx = useContext(ServiettesContext)
  if (!ctx) throw new Error('useServiettes must be used within ServiettesProvider')
  return ctx
}
