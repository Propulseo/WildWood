'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTables } from '@/contexts/tables-context'
import { TableCard } from './TableCard'

interface TablesOuvertesProps {
  onAddToTable: (tableId: string) => void
  onEncaisserTable: (tableId: string) => void
}

export function TablesOuvertes({ onAddToTable, onEncaisserTable }: TablesOuvertesProps) {
  const { getTablesOuvertes } = useTables()
  const [expanded, setExpanded] = useState(true)

  const ouvertes = getTablesOuvertes()
  if (ouvertes.length === 0) return null

  const totalEnAttente = ouvertes.reduce((s, t) => s + t.total_thb, 0)

  return (
    <div className="bg-ww-surface-2 border-b border-ww-border">
      {/* Sticky header */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-ww-surface transition-colors"
      >
        <span className="font-display font-bold text-sm text-ww-text uppercase tracking-wider">
          {ouvertes.length} TABLE{ouvertes.length > 1 ? 'S' : ''} OUVERTE{ouvertes.length > 1 ? 'S' : ''}
          <span className="text-ww-muted mx-2">&middot;</span>
          <span className="text-ww-orange">&#3647; {totalEnAttente.toLocaleString()} EN ATTENTE</span>
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-ww-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-ww-muted" />
        )}
      </button>

      {/* Grid */}
      {expanded && (
        <div className="px-5 pb-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {ouvertes.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onAdd={onAddToTable}
              onEncaisser={onEncaisserTable}
            />
          ))}
        </div>
      )}
    </div>
  )
}
