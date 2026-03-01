'use client'

import { useState } from 'react'
import type { Client } from '@/lib/types'
import type { CartItem } from './pos-register'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Minus, Plus, X } from 'lucide-react'

// =============================================================================
// Cart Sidebar — Displays cart items, total, payment toggle, and checkout
// =============================================================================

interface CartSidebarProps {
  items: CartItem[]
  client: Client | null
  isBungalowResident: boolean
  onRemoveItem: (produitId: string) => void
  onUpdateQuantity: (produitId: string, quantite: number) => void
  onCheckout: (methode: 'especes' | 'virement') => void
}

export function CartSidebar({
  items,
  client,
  isBungalowResident,
  onRemoveItem,
  onUpdateQuantity,
  onCheckout,
}: CartSidebarProps) {
  const [methode, setMethode] = useState<'especes' | 'virement'>('especes')

  // Calculate total: gym-pass items are free for bungalow residents
  const total = items.reduce((sum, item) => {
    if (isBungalowResident && item.type === 'gym-pass') return sum
    return sum + item.prixUnitaire * item.quantite
  }, 0)

  const hasGymPassItems =
    isBungalowResident && items.some((i) => i.type === 'gym-pass')

  return (
    <div className="flex flex-col h-full">
      {/* A) Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-display text-lg font-bold uppercase tracking-wider">
          Panier
        </h2>
        {client && (
          <p className="text-sm text-muted-foreground mt-1">
            {client.prenom} {client.nom}
          </p>
        )}
        {isBungalowResident && (
          <Badge className="bg-wildwood-lime text-white mt-1">
            Resident Bungalow
          </Badge>
        )}
      </div>

      {/* B) Items list */}
      <ScrollArea className="flex-1">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground text-sm">Aucun article</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {items.map((item) => {
              const itemFree =
                isBungalowResident && item.type === 'gym-pass'
              const subtotal = itemFree
                ? 0
                : item.prixUnitaire * item.quantite

              return (
                <div
                  key={item.produitId}
                  className="flex items-start gap-2 rounded-lg border border-border p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.nom}</p>
                    <p className="text-xs text-muted-foreground">
                      {itemFree
                        ? 'Offert'
                        : `${item.prixUnitaire.toLocaleString()} THB`}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() =>
                        onUpdateQuantity(item.produitId, item.quantite - 1)
                      }
                    >
                      <Minus />
                    </Button>
                    <span className="text-sm font-medium w-6 text-center">
                      {item.quantite}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() =>
                        onUpdateQuantity(item.produitId, item.quantite + 1)
                      }
                    >
                      <Plus />
                    </Button>
                  </div>

                  {/* Subtotal */}
                  <span className="text-sm font-medium w-16 text-right">
                    {subtotal.toLocaleString()} THB
                  </span>

                  {/* Remove */}
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => onRemoveItem(item.produitId)}
                  >
                    <X />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>

      {/* C) Total section */}
      <div className="p-4 border-t border-border">
        {hasGymPassItems && (
          <p className="text-xs text-wildwood-lime mb-2">
            Pass gym offert (resident bungalow)
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-xl font-bold text-wildwood-orange">
            {total.toLocaleString()} THB
          </span>
        </div>
      </div>

      {/* D) Payment method toggle */}
      <div className="px-4 pb-2">
        <div className="flex gap-2">
          <Button
            variant={methode === 'especes' ? 'pos-accent' : 'pos'}
            size="sm"
            className="flex-1"
            onClick={() => setMethode('especes')}
          >
            Especes
          </Button>
          <Button
            variant={methode === 'virement' ? 'pos-accent' : 'pos'}
            size="sm"
            className="flex-1"
            onClick={() => setMethode('virement')}
          >
            Virement
          </Button>
        </div>
      </div>

      {/* E) Encaisser button */}
      <div className="p-4 pt-2">
        <Button
          variant="pos-accent"
          className="w-full h-12 text-lg font-bold"
          disabled={items.length === 0}
          onClick={() => onCheckout(methode)}
        >
          Encaisser
        </Button>
      </div>
    </div>
  )
}
