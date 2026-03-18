'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'
import type { TableOuverte } from '@/lib/types'
import { useTranslations } from 'next-intl'

interface TablesPayeesSectionProps {
  tables: TableOuverte[]
}

export function TablesPayeesSection({ tables }: TablesPayeesSectionProps) {
  const t = useTranslations('tables')
  const [expanded, setExpanded] = useState(false)

  if (tables.length === 0) return null

  const total = tables.reduce((s, t) => s + t.total_thb, 0)

  return (
    <div>
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex items-center gap-2 text-sm text-ww-muted hover:text-ww-text transition-colors mb-3"
      >
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        <span className="font-display font-bold uppercase tracking-wider">
          {tables.length} {t('paidTables')}
        </span>
        <span className="text-ww-lime">&middot; &#3647; {total.toLocaleString()}</span>
      </button>

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tables.map((table) => {
            const heure = new Date(table.heure_ouverture).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            return (
              <div key={table.id} className="bg-ww-surface/50 border border-ww-border/50 rounded-xl p-4 opacity-60">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-display font-bold text-sm text-ww-text">{table.nom_table}</span>
                    <p className="text-xs text-ww-muted">{table.client_nom} &middot; {heure}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-ww-lime" />
                    <span className="font-display font-bold text-sm text-ww-lime">&#3647; {table.total_thb.toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  {table.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs text-ww-muted">
                      <span>{item.nom}{item.quantite > 1 && ` x${item.quantite}`}</span>
                      <span>&#3647; {(item.prix * item.quantite).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
