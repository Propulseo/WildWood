'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { Expense } from '@/lib/types'
import { getExpenses } from '@/lib/data-access'
import * as depensesQ from '@/lib/supabase/queries/depenses'
import { mutate } from '@/lib/mutation'

interface ExpensesContextType {
  expenses: Expense[]
  addExpense: (exp: Expense) => void
  deleteExpense: (id: string) => void
  resetExpenses: () => void
  loading: boolean
  error: string | null
  refetch: () => void
}

const ExpensesContext = createContext<ExpensesContextType | null>(null)

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try { setExpenses(await getExpenses()) }
    catch (e) { setError(e instanceof Error ? e.message : 'Erreur') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function addExpense(exp: Expense) {
    await mutate({
      optimistic: () => { const prev = expenses; setExpenses((p) => [exp, ...p]); return prev },
      mutationFn: () => depensesQ.insertDepense({
        date: exp.date,
        titre: exp.titre,
        grande_categorie: exp.grande_categorie,
        categorie: exp.categorie,
        montant_thb: exp.montant_thb,
        mode_paiement: exp.mode_paiement,
        photo_url: exp.photo_base64 || undefined,
        staff_id: exp.staff_saisie,
        note: exp.note,
      }).then(() => {}),
      rollback: (prev) => setExpenses(prev),
      successMessage: 'Depense ajoutee',
      errorMessage: 'Erreur ajout depense',
    })
  }

  async function deleteExpense(id: string) {
    await mutate({
      optimistic: () => { const prev = expenses; setExpenses((p) => p.filter((e) => e.id !== id)); return prev },
      mutationFn: () => depensesQ.deleteDepense(id),
      rollback: (prev) => setExpenses(prev),
      successMessage: 'Depense supprimee',
      errorMessage: 'Erreur suppression depense',
    })
  }

  function resetExpenses() { fetchData() }

  return (
    <ExpensesContext value={{ expenses, addExpense, deleteExpense, resetExpenses, loading, error, refetch: fetchData }}>
      {children}
    </ExpensesContext>
  )
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext)
  if (!ctx) throw new Error('useExpenses must be used within ExpensesProvider')
  return ctx
}
