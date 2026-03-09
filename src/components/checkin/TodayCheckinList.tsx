'use client'

import { X } from 'lucide-react'
import type { ActiveGymPass } from '@/lib/types'

interface TodayCheckinListProps {
  passes: ActiveGymPass[]
  today: string
  onRemove: (passId: string, heure: string) => void
}

export function TodayCheckinList({ passes, today, onRemove }: TodayCheckinListProps) {
  const entries = passes
    .flatMap((p) =>
      p.checkins
        .filter((c) => c.date === today)
        .map((c) => ({ passId: p.id, clientNom: p.clientNom, passNom: p.passNom, dateExpiration: p.dateExpiration, heure: c.heure }))
    )
    .sort((a, b) => b.heure.localeCompare(a.heure))

  if (entries.length === 0) {
    return (
      <p className="text-ww-muted text-sm font-sans text-center py-8">
        Aucune entree enregistree aujourd&apos;hui
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const initials = entry.clientNom.split(' ').map((n) => n[0]).join('').toUpperCase()
        return (
          <div
            key={`${entry.passId}-${entry.heure}`}
            className="flex items-center gap-3 p-3 rounded-lg bg-ww-surface border border-ww-border"
          >
            <div className="h-8 w-8 rounded-full bg-ww-surface-2 flex items-center justify-center text-xs font-display font-bold text-ww-text shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-sans text-sm text-ww-text">{entry.clientNom}</span>
              <span className="text-ww-muted text-xs ml-2">{entry.passNom}</span>
              <span className="text-ww-muted text-xs ml-2">
                exp. {entry.dateExpiration.split('-').reverse().join('/')}
              </span>
            </div>
            <span className="font-mono text-sm text-ww-muted">{entry.heure}</span>
            <button
              onClick={() => onRemove(entry.passId, entry.heure)}
              className="flex items-center gap-1 text-xs text-ww-danger hover:text-red-400 transition-colors font-sans"
            >
              <X className="h-3.5 w-3.5" />
              Annuler
            </button>
          </div>
        )
      })}
    </div>
  )
}
