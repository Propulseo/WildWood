'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Client } from '@/lib/types'
import type { CartItem } from './cart-reducer'
import { X } from 'lucide-react'
import { CashChangeDialog } from './cash-change-dialog'

// =============================================================================
// Cart Bottom Bar — Horizontal sticky bar at bottom of POS
// =============================================================================

interface CartSidebarProps {
  items: CartItem[]
  client: Client | null
  isBungalowResident: boolean
  onRemoveItem: (produitId: string) => void
  onUpdateQuantity: (produitId: string, quantite: number) => void
  onCheckout: () => void
  onFnbAssign?: () => void
  activeTableName?: string | null
}

export function CartSidebar({
  items,
  client,
  isBungalowResident,
  onRemoveItem,
  onUpdateQuantity,
  onCheckout,
  onFnbAssign,
  activeTableName,
}: CartSidebarProps) {
  const t = useTranslations('pos')
  const tc = useTranslations('common')
  const [cashDialogOpen, setCashDialogOpen] = useState(false)

  const total = items.reduce((sum, item) => {
    if (isBungalowResident && item.type === 'gym-pass') return sum
    return sum + item.prixUnitaire * item.quantite
  }, 0)

  const hasFnbOnly = items.length > 0 && items.every((i) => i.type === 'fnb')

  function handleEncaisser() {
    if (hasFnbOnly && onFnbAssign) {
      onFnbAssign()
      return
    }
    setCashDialogOpen(true)
  }

  return (
    <div className="bg-ww-surface-2 border-t border-ww-border">
      {/* Main cart bar - always visible */}
      <div className="h-auto md:h-20 px-3 md:px-5 py-3 md:py-0 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        {/* Left: item pills */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto min-w-0">
          {items.length === 0 ? (
            <span className="text-ww-muted text-sm font-sans">{tc('noItems')}</span>
          ) : (
            items.map((item) => (
              <span
                key={item.produitId}
                className="inline-flex items-center gap-1.5 bg-ww-surface border border-ww-border rounded-full px-3 py-1.5 text-sm text-ww-text shrink-0"
              >
                <span className="font-sans">
                  {item.nom}
                  {item.quantite > 1 && (
                    <span className="text-ww-muted ml-1">x{item.quantite}</span>
                  )}
                </span>
                <button
                  onClick={() => onRemoveItem(item.produitId)}
                  className="text-ww-muted hover:text-ww-danger transition-colors ml-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))
          )}
          {isBungalowResident && (
            <span className="inline-flex items-center bg-ww-lime/15 border border-ww-lime/30 rounded-full px-3 py-1.5 text-xs text-ww-lime shrink-0 font-display font-bold uppercase tracking-wider">
              {tc('resident')}
            </span>
          )}
          {activeTableName && (
            <span className="inline-flex items-center bg-ww-orange/15 border border-ww-orange/30 rounded-full px-3 py-1.5 text-xs text-ww-orange shrink-0 font-display font-bold uppercase tracking-wider">
              {t('addToTable')} {activeTableName}
            </span>
          )}
        </div>

        {/* Right: total + checkout */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <span className="font-display font-extrabold text-2xl md:text-[28px] text-ww-orange tracking-tight">
            ฿ {total.toLocaleString()}
          </span>
          <button
            disabled={items.length === 0}
            onClick={handleEncaisser}
            className="bg-ww-orange text-white font-display font-bold text-sm md:text-base uppercase tracking-wider px-4 py-2.5 md:px-6 md:py-3 rounded-lg flex-1 md:flex-none md:min-w-[160px] h-12 md:h-auto transition-all duration-150 hover:bg-ww-orange/90 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {activeTableName ? t('addToTable').toUpperCase() : t('collect').toUpperCase()}
          </button>
        </div>
      </div>

      <CashChangeDialog
        total={total}
        open={cashDialogOpen}
        onConfirm={() => { setCashDialogOpen(false); onCheckout() }}
        onCancel={() => setCashDialogOpen(false)}
      />
    </div>
  )
}
