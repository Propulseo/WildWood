'use client'

import { useMemo } from 'react'
import type { Serviette } from '@/lib/types'

function joursDepuis(date: string): number {
  const d = new Date(date)
  const now = new Date()
  return Math.floor((now.getTime() - d.getTime()) / 86400000)
}

interface ListeAttenteLavageProps {
  serviettes: Serviette[]
}

export function ListeAttenteLavage({ serviettes }: ListeAttenteLavageProps) {
  const triees = useMemo(
    () => [...serviettes].sort((a, b) =>
      (a.date_retour ?? '').localeCompare(b.date_retour ?? '')
    ),
    [serviettes]
  )

  if (triees.length === 0) return null

  return (
    <div className="space-y-1.5">
      {triees.map((s) => {
        const jours = s.date_retour ? joursDepuis(s.date_retour) : 0
        return (
          <div key={s.id} className="flex items-center justify-between bg-ww-surface rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-ww-danger" />
              <span className="font-sans text-sm text-ww-text">{s.client_nom}</span>
            </div>
            <span className={`text-xs font-mono ${jours >= 3 ? 'text-ww-danger' : 'text-ww-muted'}`}>
              {jours === 0 ? "aujourd'hui" : `il y a ${jours}j`}
            </span>
          </div>
        )
      })}
    </div>
  )
}
