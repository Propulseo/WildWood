'use client'

import type { TableOuverte } from '@/lib/types'
import { Plus, CreditCard, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface TableCardLargeProps {
  table: TableOuverte
  onAdd: (tableId: string) => void
  onEncaisser: (tableId: string) => void
}

export function TableCardLarge({ table, onAdd, onEncaisser }: TableCardLargeProps) {
  const t = useTranslations('tables')
  const tc = useTranslations('common')
  const heure = new Date(table.heure_ouverture).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const isHotel = table.type_client === 'hotel'

  const typeBadge = {
    externe: { label: t('external'), cls: 'bg-ww-surface-2 text-ww-muted border-ww-border' },
    gym: { label: 'Gym', cls: 'bg-ww-lime/15 text-ww-lime border-ww-lime/30' },
    hotel: { label: t('hotel'), cls: 'bg-ww-wood/20 text-ww-wood border-ww-wood/30' },
  }[table.type_client]

  return (
    <div className="bg-ww-surface border border-ww-border rounded-xl p-5 flex flex-col gap-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display font-bold text-base text-ww-text">{table.nom_table}</span>
            <span className={`text-[10px] font-display font-bold uppercase px-2 py-0.5 rounded border ${typeBadge.cls}`}>
              {typeBadge.label}
            </span>
          </div>
          <p className="text-sm text-ww-text font-sans font-medium">{table.client_nom}</p>
          <div className="flex items-center gap-1 mt-1 text-xs text-ww-muted">
            <Clock className="h-3 w-3" />
            <span>{t('openedAt')} {heure} {t('openedBy')} {table.staff_ouverture}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display font-extrabold text-xl text-ww-orange">&#3647; {table.total_thb.toLocaleString()}</p>
          <p className="text-[10px] text-ww-muted">{table.items.length} {t('articles')}</p>
        </div>
      </div>

      {/* Items list */}
      <div className="bg-ww-bg rounded-lg p-3 space-y-1.5">
        {table.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm font-sans">
            <span className="text-ww-text">
              {item.nom}
              {item.quantite > 1 && <span className="text-ww-muted ml-1">x{item.quantite}</span>}
            </span>
            <span className="text-ww-muted tabular-nums">&#3647; {(item.prix * item.quantite).toLocaleString()}</span>
          </div>
        ))}
        <div className="border-t border-ww-border pt-1.5 flex justify-between">
          <span className="font-display font-bold text-sm text-ww-text">{tc('total').toUpperCase()}</span>
          <span className="font-display font-extrabold text-ww-orange">&#3647; {table.total_thb.toLocaleString()}</span>
        </div>
      </div>

      {/* Hotel notice */}
      {isHotel && (
        <div className="text-xs font-display font-bold uppercase tracking-wider text-ww-wood bg-ww-wood/10 border border-ww-wood/20 rounded-lg px-3 py-2 text-center">
          {t('hotelCheckout')}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-auto">
        <a
          href="/pos?tab=fnb"
          onClick={() => onAdd(table.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-ww-surface-2 border border-ww-border text-sm font-display font-bold text-ww-text hover:border-ww-orange hover:text-ww-orange transition-all duration-150 active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" />
          {t('addItems').toUpperCase()}
        </a>
        {!isHotel && (
          <button
            onClick={() => onEncaisser(table.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-ww-orange text-white text-sm font-display font-bold hover:bg-ww-orange/90 transition-all duration-150 active:scale-[0.97]"
          >
            <CreditCard className="h-4 w-4" />
            {t('collect').toUpperCase()}
          </button>
        )}
      </div>
    </div>
  )
}
