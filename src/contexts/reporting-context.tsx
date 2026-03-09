'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import type { ReportRevenue, ReportExpenseDaily, ReportExpenseMonthly, CashClosing, BusinessUnit } from '@/lib/types-reporting'
import { getReportData } from '@/lib/data-access'

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
}

const ReportingContext = createContext<ReportingContextType | null>(null)

export function ReportingProvider({ children }: { children: ReactNode }) {
  const [revenues, setRevenues] = useState<ReportRevenue[]>([])
  const [expensesDaily, setExpensesDaily] = useState<ReportExpenseDaily[]>([])
  const [expensesMonthly, setExpensesMonthly] = useState<ReportExpenseMonthly[]>([])
  const [cashClosings, setCashClosings] = useState<CashClosing[]>([])

  useEffect(() => {
    getReportData().then((data) => {
      setRevenues(data.revenues)
      setExpensesDaily(data.expensesDaily)
      setExpensesMonthly(data.expensesMonthly)
      setCashClosings(data.cashClosings)
    })
  }, [])

  const mockToday = useMemo(() => {
    if (revenues.length === 0) return new Date().toISOString().slice(0, 10)
    return revenues.reduce((max, r) => (r.date > max ? r.date : max), revenues[0].date)
  }, [revenues])

  function updateTodayRevenues(bu: BusinessUnit, entries: ReportRevenue[]) {
    setRevenues((prev) => {
      const without = prev.filter((r) => !(r.date === mockToday && r.bu === bu))
      return [...without, ...entries]
    })
  }

  function addExpenseDaily(exp: ReportExpenseDaily) {
    setExpensesDaily((prev) => [exp, ...prev])
  }

  function removeExpenseDaily(id: string) {
    setExpensesDaily((prev) => prev.filter((e) => e.id !== id))
  }

  function addExpenseMonthly(exp: ReportExpenseMonthly) {
    setExpensesMonthly((prev) => [exp, ...prev])
  }

  function closeCash(closing: CashClosing) {
    setCashClosings((prev) => [closing, ...prev])
  }

  return (
    <ReportingContext value={{
      revenues, expensesDaily, expensesMonthly, cashClosings,
      mockToday, updateTodayRevenues, addExpenseDaily, removeExpenseDaily, addExpenseMonthly, closeCash,
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
