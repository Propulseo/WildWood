'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import type { Transaction } from '@/lib/types'
import { getTransactions } from '@/lib/data-access'

interface TransactionsContextType {
  transactions: Transaction[]
  addTransaction: (txn: Transaction) => void
  resetTransactions: () => void
}

const TransactionsContext = createContext<TransactionsContextType | null>(null)

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    getTransactions().then(setTransactions)
  }, [])

  function addTransaction(txn: Transaction) {
    setTransactions((prev) => [txn, ...prev])
  }

  function resetTransactions() {
    getTransactions().then(setTransactions)
  }

  return (
    <TransactionsContext value={{ transactions, addTransaction, resetTransactions }}>
      {children}
    </TransactionsContext>
  )
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext)
  if (!ctx)
    throw new Error(
      'useTransactions must be used within TransactionsProvider'
    )
  return ctx
}
