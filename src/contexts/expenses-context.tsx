'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import type { Expense } from '@/lib/types'
import { getExpenses } from '@/lib/data-access'

interface ExpensesContextType {
  expenses: Expense[]
  addExpense: (exp: Expense) => void
}

const ExpensesContext = createContext<ExpensesContextType | null>(null)

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([])

  useEffect(() => {
    getExpenses().then(setExpenses)
  }, [])

  function addExpense(exp: Expense) {
    setExpenses((prev) => [exp, ...prev])
  }

  return (
    <ExpensesContext value={{ expenses, addExpense }}>
      {children}
    </ExpensesContext>
  )
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext)
  if (!ctx)
    throw new Error(
      'useExpenses must be used within ExpensesProvider'
    )
  return ctx
}
