'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { TableOuverte, TableItem } from '@/lib/types'
import { getTables } from '@/lib/data-access'
import * as tablesQ from '@/lib/supabase/queries/tables-bar'
import { useRealtime } from '@/lib/hooks/use-realtime'
import { mutate } from '@/lib/mutation'

interface TablesContextType {
  tables: TableOuverte[]
  addTable: (table: TableOuverte) => void
  addItemsToTable: (tableId: string, items: TableItem[]) => void
  encaisserTable: (tableId: string, staffId?: string) => void
  getTablesOuvertes: () => TableOuverte[]
  loading: boolean
  error: string | null
  refetch: () => void
}

const TablesContext = createContext<TablesContextType | null>(null)

export function TablesProvider({ children }: { children: ReactNode }) {
  const [tables, setTables] = useState<TableOuverte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try { setTables(await getTables()) }
    catch (e) { setError(e instanceof Error ? e.message : 'Erreur') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useRealtime('tables_bar', '*', fetchData)
  useRealtime('table_items', '*', fetchData)

  async function addTable(table: TableOuverte) {
    await mutate({
      optimistic: () => { const prev = tables; setTables((p) => [table, ...p]); return prev },
      mutationFn: () => tablesQ.insertTable({
        nom_table: table.nom_table,
        client_nom: table.client_nom,
        type_client: table.type_client,
        staff_id: table.staff_ouverture || undefined,
        items: table.items.length > 0
          ? table.items.map((i) => ({ nom: i.nom, prix_unitaire: i.prix, quantite: i.quantite }))
          : undefined,
      }).then(() => {}),
      rollback: (prev) => setTables(prev),
      errorMessage: 'Erreur ouverture table',
    })
  }

  async function addItemsToTable(tableId: string, newItems: TableItem[]) {
    await mutate({
      optimistic: () => {
        const prev = tables
        setTables((p) =>
          p.map((t) => {
            if (t.id !== tableId) return t
            const merged = [...t.items]
            for (const ni of newItems) {
              const existing = merged.find((m) => m.nom === ni.nom && m.prix === ni.prix)
              if (existing) existing.quantite += ni.quantite
              else merged.push({ ...ni })
            }
            const total = merged.reduce((s, i) => s + i.prix * i.quantite, 0)
            return { ...t, items: merged, total_thb: total }
          })
        )
        return prev
      },
      mutationFn: async () => {
        for (const item of newItems) {
          await tablesQ.addTableItem({
            table_id: tableId,
            nom: item.nom,
            prix_unitaire: item.prix,
            quantite: item.quantite,
          })
        }
      },
      rollback: (prev) => setTables(prev),
      errorMessage: 'Erreur ajout articles',
    })
  }

  async function encaisserTable(tableId: string, staffId?: string) {
    await mutate({
      optimistic: () => {
        const prev = tables
        setTables((p) => p.map((t) => t.id === tableId ? { ...t, statut: 'payee' as const } : t))
        return prev
      },
      mutationFn: () => tablesQ.payerTable(tableId, staffId).then(() => {}),
      rollback: (prev) => setTables(prev),
      errorMessage: 'Erreur encaissement table',
    })
  }

  function getTablesOuvertes() { return tables.filter((t) => t.statut === 'ouverte') }

  return (
    <TablesContext value={{ tables, addTable, addItemsToTable, encaisserTable, getTablesOuvertes, loading, error, refetch: fetchData }}>
      {children}
    </TablesContext>
  )
}

export function useTables() {
  const ctx = useContext(TablesContext)
  if (!ctx) throw new Error('useTables must be used within TablesProvider')
  return ctx
}
