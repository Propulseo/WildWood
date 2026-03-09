'use client'

import type { TableOuverte } from '@/lib/types'
import { Plus, CreditCard } from 'lucide-react'

interface TableCardProps {
  table: TableOuverte
  onAdd: (tableId: string) => void
  onEncaisser: (tableId: string) => void
}

export function TableCard({ table, onAdd, onEncaisser }: TableCardProps) {
  const heure = new Date(table.heure_ouverture).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const isHotel = table.type_client === 'hotel'

  const typeBadge = {
    externe: { label: 'Externe', cls: 'bg-ww-surface-2 text-ww-muted' },
    gym: { label: 'Gym', cls: 'bg-ww-lime/15 text-ww-lime' },
    hotel: { label: 'Hotel', cls: 'bg-ww-wood/20 text-ww-wood' },
  }[table.type_client]

  return (
    <div className="bg-ww-surface border border-ww-border rounded-xl p-4 flex flex-col gap-3 transition-all duration-150 hover:-translate-y-0.5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-ww-text">{table.nom_table}</span>
            <span className={`text-[10px] font-display font-bold uppercase px-1.5 py-0.5 rounded ${typeBadge.cls}`}>
              {typeBadge.label}
            </span>
          </div>
          <p className="text-xs text-ww-muted font-sans mt-0.5">
            {table.client_nom} &middot; {heure}
          </p>
        </div>
        <span className="font-display font-extrabold text-ww-orange text-base">
          &#3647; {table.total_thb.toLocaleString()}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-0.5">
        {table.items.slice(0, 4).map((item, i) => (
          <div key={i} className="flex justify-between text-xs font-sans">
            <span className="text-ww-muted">
              {item.nom}{item.quantite > 1 && <span className="ml-1">x{item.quantite}</span>}
            </span>
            <span className="text-ww-muted">&#3647; {(item.prix * item.quantite).toLocaleString()}</span>
          </div>
        ))}
        {table.items.length > 4 && (
          <p className="text-[10px] text-ww-muted">+{table.items.length - 4} autres</p>
        )}
      </div>

      {/* Hotel notice */}
      {isHotel && (
        <div className="text-[10px] font-display font-bold uppercase tracking-wider text-ww-wood bg-ww-wood/10 rounded px-2 py-1 text-center">
          Reglement au check-out
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onAdd(table.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-ww-surface-2 border border-ww-border text-xs font-display font-bold text-ww-text hover:border-ww-orange hover:text-ww-orange transition-all duration-150 active:scale-[0.97]"
        >
          <Plus className="h-3.5 w-3.5" />
          AJOUTER
        </button>
        {!isHotel && (
          <button
            onClick={() => onEncaisser(table.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-ww-orange text-white text-xs font-display font-bold hover:bg-ww-orange/90 transition-all duration-150 active:scale-[0.97]"
          >
            <CreditCard className="h-3.5 w-3.5" />
            ENCAISSER
          </button>
        )}
      </div>
    </div>
  )
}
