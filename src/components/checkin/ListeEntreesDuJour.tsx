'use client'

import type { CheckinEntry } from '@/lib/types'
import { EntreeRow } from './EntreeRow'

interface ListeEntreesDuJourProps {
  entries: CheckinEntry[]
  today: string
  onUpgrade: (entry: CheckinEntry) => void
}

export function ListeEntreesDuJour({ entries, today, onUpgrade }: ListeEntreesDuJourProps) {
  const todayEntries = entries
    .filter((e) => e.date_entree === today)
    .sort((a, b) => b.heure_entree.localeCompare(a.heure_entree))

  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg font-bold uppercase tracking-wide text-ww-text">
        Entrees du jour
      </h2>

      {todayEntries.length === 0 ? (
        <p className="text-ww-muted text-sm font-sans text-center py-8">
          Aucune entree enregistree aujourd&apos;hui
        </p>
      ) : (
        <div className="space-y-2">
          {todayEntries.map((entry) => (
            <EntreeRow
              key={entry.id}
              entry={entry}
              isToday={entry.date_entree === today}
              onUpgrade={onUpgrade}
            />
          ))}
        </div>
      )}
    </div>
  )
}
