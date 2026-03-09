'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import type { TableOuverte, TableItem } from '@/lib/types'
import { getTables } from '@/lib/data-access'

interface TablesContextType {
  tables: TableOuverte[]
  addTable: (table: TableOuverte) => void
  addItemsToTable: (tableId: string, items: TableItem[]) => void
  encaisserTable: (tableId: string) => void
  getTablesOuvertes: () => TableOuverte[]
}

const TablesContext = createContext<TablesContextType | null>(null)

export function TablesProvider({ children }: { children: ReactNode }) {
  const [tables, setTables] = useState<TableOuverte[]>([])

  useEffect(() => {
    getTables().then(setTables)
  }, [])

  function addTable(table: TableOuverte) {
    setTables((prev) => [table, ...prev])
  }

  function addItemsToTable(tableId: string, newItems: TableItem[]) {
    setTables((prev) =>
      prev.map((t) => {
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
  }

  function encaisserTable(tableId: string) {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, statut: 'payee' as const } : t
      )
    )
  }

  function getTablesOuvertes() {
    return tables.filter((t) => t.statut === 'ouverte')
  }

  return (
    <TablesContext value={{ tables, addTable, addItemsToTable, encaisserTable, getTablesOuvertes }}>
      {children}
    </TablesContext>
  )
}

export function useTables() {
  const ctx = useContext(TablesContext)
  if (!ctx) throw new Error('useTables must be used within TablesProvider')
  return ctx
}
