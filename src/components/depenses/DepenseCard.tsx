'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Receipt } from 'lucide-react'
import type { Expense } from '@/lib/types'
import { CATEGORY_LABELS, MODE_LABELS } from './depenses-shared'

interface Props {
  expense: Expense
  onDelete: (id: string) => void
}

export function DepenseCard({ expense, onDelete }: Props) {
  const gc = expense.grande_categorie
  const dotColor = gc === 'gym' ? 'var(--ww-orange)' : gc === 'fnb' ? 'var(--ww-wood)' : 'var(--ww-lime)'

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="flex items-center gap-3 py-3">
        <div
          className="w-1 self-stretch rounded-full shrink-0"
          style={{ backgroundColor: dotColor }}
        />
        <div className="w-10 h-10 rounded-lg bg-ww-surface-2 flex items-center justify-center shrink-0 overflow-hidden border border-ww-border">
          {expense.photo_base64 ? (
            <img src={expense.photo_base64} alt="Recu" className="w-full h-full object-cover" />
          ) : (
            <Receipt className="h-4 w-4 text-ww-muted" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-base text-ww-text truncate">
              {expense.titre}
            </span>
            <span className="text-xs text-ww-muted shrink-0">
              {CATEGORY_LABELS[expense.categorie] || expense.categorie}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-ww-muted mt-0.5">
            <span>{MODE_LABELS[expense.mode_paiement]}</span>
            {expense.note && <><span>·</span><span className="truncate">{expense.note}</span></>}
          </div>
        </div>
        <span className="font-display font-bold text-base text-ww-orange shrink-0">
          ฿ {expense.montant_thb.toLocaleString()}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive shrink-0 h-8 w-8"
          onClick={() => onDelete(expense.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  )
}
