'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react'
import type { ReportRevenue, ReportExpenseDaily, ReportExpenseMonthly, CashClosing, BusinessUnit } from '@/lib/types-reporting'
import { getReportData } from '@/lib/data-access'
import * as reportingQ from '@/lib/supabase/queries/reporting'
import * as transactionsQ from '@/lib/supabase/queries/transactions'
import * as depensesQ from '@/lib/supabase/queries/depenses'
import { mutate } from '@/lib/mutation'

interface ReportingContextType {
  revenues: ReportRevenue[]
  expensesDaily: ReportExpenseDaily[]
  expensesMonthly: ReportExpenseMonthly[]
  cashClosings: CashClosing[]
  mockToday: string
  updateTodayRevenues: (bu: BusinessUnit, entries: ReportRevenue[]) => void
  addExpenseDaily: (exp: ReportExpenseDaily) => void
  removeExpenseDaily: (id: string) => void
  addExpenseMonthly: (exp: ReportExpenseMonthly) => void
  closeCash: (closing: CashClosing) => void
  loading: boolean
  error: string | null
  refetch: () => void
}

const ReportingContext = createContext<ReportingContextType | null>(null)

const BU_MAP: Record<string, string> = { GYM: 'gym', RESORT: 'resort' }

export function ReportingProvider({ children }: { children: ReactNode }) {
  const [revenues, setRevenues] = useState<ReportRevenue[]>([])
  const [expensesDaily, setExpensesDaily] = useState<ReportExpenseDaily[]>([])
  const [expensesMonthly, setExpensesMonthly] = useState<ReportExpenseMonthly[]>([])
  const [cashClosings, setCashClosings] = useState<CashClosing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await getReportData()
      setRevenues(data.revenues)
      setExpensesDaily(data.expensesDaily)
      setExpensesMonthly(data.expensesMonthly)
      setCashClosings(data.cashClosings)
    } catch (e) { setError(e instanceof Error ? e.message : 'Erreur') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const mockToday = useMemo(() => {
    if (revenues.length === 0) return new Date().toISOString().slice(0, 10)
    return revenues.reduce((max, r) => (r.date > max ? r.date : max), revenues[0].date)
  }, [revenues])

  async function updateTodayRevenues(bu: BusinessUnit, entries: ReportRevenue[]) {
    await mutate({
      optimistic: () => {
        const prev = revenues
        setRevenues((p) => {
          const without = p.filter((r) => !(r.date === mockToday && r.bu === bu))
          return [...without, ...entries]
        })
        return prev
      },
      mutationFn: async () => {
        for (const entry of entries) {
          await transactionsQ.insertTransaction({
            date: entry.date,
            type: 'income',
            business_unit: BU_MAP[entry.bu] || 'fnb',
            categorie: entry.categorie,
            montant_thb: entry.montant,
            note: entry.note,
          })
        }
      },
      rollback: (prev) => setRevenues(prev),
      successMessage: 'Revenus enregistres',
      errorMessage: 'Erreur enregistrement revenus',
    })
  }

  async function addExpenseDaily(exp: ReportExpenseDaily) {
    await mutate({
      optimistic: () => { const prev = expensesDaily; setExpensesDaily((p) => [exp, ...p]); return prev },
      mutationFn: () => depensesQ.insertDepense({
        date: exp.date,
        grande_categorie: exp.bu === 'GYM' ? 'gym' : 'resort',
        categorie: exp.categorie,
        montant_thb: exp.montant,
        mode_paiement: exp.source,
        note: exp.note,
      }).then(() => {}),
      rollback: (prev) => setExpensesDaily(prev),
      successMessage: 'Depense ajoutee',
      errorMessage: 'Erreur ajout depense',
    })
  }

  async function removeExpenseDaily(id: string) {
    await mutate({
      optimistic: () => { const prev = expensesDaily; setExpensesDaily((p) => p.filter((e) => e.id !== id)); return prev },
      mutationFn: () => depensesQ.deleteDepense(id),
      rollback: (prev) => setExpensesDaily(prev),
      successMessage: 'Depense supprimee',
      errorMessage: 'Erreur suppression depense',
    })
  }

  async function addExpenseMonthly(exp: ReportExpenseMonthly) {
    await mutate({
      optimistic: () => { const prev = expensesMonthly; setExpensesMonthly((p) => [exp, ...p]); return prev },
      mutationFn: () => depensesQ.insertDepenseMensuelle({
        mois: exp.mois,
        business_unit: BU_MAP[exp.bu] || 'gym',
        categorie: exp.categorie,
        montant_thb: exp.montant,
        note: exp.note,
      }).then(() => {}),
      rollback: (prev) => setExpensesMonthly(prev),
      successMessage: 'Charge mensuelle ajoutee',
      errorMessage: 'Erreur ajout charge mensuelle',
    })
  }

  async function closeCash(closing: CashClosing) {
    await mutate({
      optimistic: () => { const prev = cashClosings; setCashClosings((p) => [closing, ...p]); return prev },
      mutationFn: () => reportingQ.insertClosing({
        date: closing.date,
        ca_jour: closing.solde_calcule,
        cash_compte: closing.solde_compte,
        ecart: closing.ecart,
      }).then(() => {}),
      rollback: (prev) => setCashClosings(prev),
      successMessage: 'Cloture caisse enregistree',
      errorMessage: 'Erreur cloture caisse',
    })
  }

  return (
    <ReportingContext value={{
      revenues, expensesDaily, expensesMonthly, cashClosings,
      mockToday, updateTodayRevenues, addExpenseDaily, removeExpenseDaily, addExpenseMonthly, closeCash,
      loading, error, refetch: fetchData,
    }}>
      {children}
    </ReportingContext>
  )
}

export function useReporting() {
  const ctx = useContext(ReportingContext)
  if (!ctx) throw new Error('useReporting must be used within ReportingProvider')
  return ctx
}
