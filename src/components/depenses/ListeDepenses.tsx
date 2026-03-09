'use client'

import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Expense } from '@/lib/types'
import { DepenseCard } from './DepenseCard'

interface Props {
  expenses: Expense[]
  onDelete: (id: string) => void
}

export function ListeDepenses({ expenses, onDelete }: Props) {
  const grouped = useMemo(() => {
    const map = new Map<string, Expense[]>()
    for (const exp of expenses) {
      const list = map.get(exp.date) || []
      list.push(exp)
      map.set(exp.date, list)
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [expenses])

  if (expenses.length === 0) {
    return <p className="text-center text-ww-muted py-8">Aucune depense trouvee</p>
  }

  return (
    <div className="space-y-4">
      {grouped.map(([date, items]) => {
        const total = items.reduce((s, e) => s + e.montant_thb, 0)
        return (
          <div key={date}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-sm text-ww-muted uppercase">
                {format(parseISO(date), 'EEEE d MMMM', { locale: fr })}
              </h3>
              <span className="text-sm font-display font-bold text-ww-orange">
                ฿ {total.toLocaleString()}
              </span>
            </div>
            <div className="space-y-2">
              {items.map((exp) => (
                <DepenseCard key={exp.id} expense={exp} onDelete={onDelete} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
