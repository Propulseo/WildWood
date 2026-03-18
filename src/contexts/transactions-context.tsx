'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { Transaction } from '@/lib/types'
import { getTransactions } from '@/lib/data-access'
import * as transactionsQ from '@/lib/supabase/queries/transactions'
import { useRealtime } from '@/lib/hooks/use-realtime'
import { mutate } from '@/lib/mutation'

interface TransactionsContextType {
  transactions: Transaction[]
  addTransaction: (txn: Transaction) => void
  resetTransactions: () => void
  loading: boolean
  error: string | null
  refetch: () => void
}

const TransactionsContext = createContext<TransactionsContextType | null>(null)

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try { setTransactions(await getTransactions()) }
    catch (e) { setError(e instanceof Error ? e.message : 'Erreur') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useRealtime('transactions', '*', fetchData)

  async function addTransaction(txn: Transaction) {
    const buMap: Record<string, string> = { 'Gym': 'gym', 'F&B': 'fnb', 'Bungalows': 'resort' }
    const srcMap: Record<string, string> = { 'especes': 'black_box', 'virement': 'cb_scan' }
    await mutate({
      optimistic: () => { const prev = transactions; setTransactions((p) => [txn, ...p]); return prev },
      mutationFn: () => transactionsQ.insertTransaction({
        date: txn.date.slice(0, 10),
        heure: txn.date.length > 10 ? txn.date.slice(11, 16) : undefined,
        type: 'income',
        business_unit: buMap[txn.centreRevenu] || 'fnb',
        categorie: txn.type,
        montant_thb: txn.total,
        source_fonds: srcMap[txn.methode] || 'black_box',
        client_id: txn.clientId,
      }).then(() => {}),
      rollback: (prev) => setTransactions(prev),
      errorMessage: 'Erreur ajout transaction',
    })
  }

  function resetTransactions() { fetchData() }

  return (
    <TransactionsContext value={{ transactions, addTransaction, resetTransactions, loading, error, refetch: fetchData }}>
      {children}
    </TransactionsContext>
  )
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext)
  if (!ctx) throw new Error('useTransactions must be used within TransactionsProvider')
  return ctx
}
