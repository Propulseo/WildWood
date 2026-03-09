'use client'

import { useMemo } from 'react'
import type { Serviette } from '@/lib/types'

function joursDepuis(date: string): number {
  const d = new Date(date)
  const now = new Date()
  return Math.floor((now.getTime() - d.getTime()) / 86400000)
}

interface ListeEnCoursProps {
  serviettes: Serviette[]
}

export function ListeEnCours({ serviettes }: ListeEnCoursProps) {
  const enCours = useMemo(
    () => serviettes
      .filter((s) => s.statut === 'en_cours')
      .sort((a, b) => a.date_emprunt.localeCompare(b.date_emprunt)),
    [serviettes]
  )

  if (enCours.length === 0) {
    return <p className="text-sm text-ww-muted">Aucune serviette en circulation</p>
  }

  return (
    <div className="space-y-1.5">
      {enCours.map((s) => {
        const jours = joursDepuis(s.date_emprunt)
        return (
          <div key={s.id} className="flex items-center justify-between bg-ww-surface rounded-lg px-3 py-2">
            <div>
              <span className="font-sans text-sm text-ww-text">{s.client_nom}</span>
              <span className="text-xs text-ww-muted ml-2">{s.date_emprunt}</span>
            </div>
            <span className={`text-xs font-mono ${jours >= 3 ? 'text-ww-danger' : 'text-ww-muted'}`}>
              {jours === 0 ? "aujourd'hui" : `${jours}j`}
            </span>
          </div>
        )
      })}
    </div>
  )
}
