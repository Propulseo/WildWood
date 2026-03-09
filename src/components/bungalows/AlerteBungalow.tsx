'use client'

import { addDays, parseISO, isSameDay } from 'date-fns'
import type { Bungalow } from '@/lib/types'

/** Returns set of bungalow IDs that have NO reservation on BOTH J+1 and J+2 */
export function getAlertBungalowIds(bungalows: Bungalow[], today: Date): Set<string> {
  const j1 = addDays(today, 1)
  const j2 = addDays(today, 2)
  const alertIds = new Set<string>()

  for (const b of bungalows) {
    const freeJ1 = !b.reservations.some((r) => {
      if (r.statut === 'annulee' || r.statut === 'no_show') return false
      const start = parseISO(r.dateDebut)
      const end = parseISO(r.dateFin)
      return start <= j1 && end > j1
    })
    const freeJ2 = !b.reservations.some((r) => {
      if (r.statut === 'annulee' || r.statut === 'no_show') return false
      const start = parseISO(r.dateDebut)
      const end = parseISO(r.dateFin)
      return start <= j2 && end > j2
    })
    if (freeJ1 && freeJ2) alertIds.add(b.id)
  }

  return alertIds
}

/** Check if a specific day is an alert day (J+1 or J+2) for a bungalow in alert */
export function isAlertCell(
  bungalowId: string,
  day: Date,
  today: Date,
  alertIds: Set<string>
): boolean {
  if (!alertIds.has(bungalowId)) return false
  const j1 = addDays(today, 1)
  const j2 = addDays(today, 2)
  return isSameDay(day, j1) || isSameDay(day, j2)
}

/** Badge component for bungalow header column */
export function AlerteBadge() {
  return (
    <span className="inline-block ml-2 px-1.5 py-0.5 text-[11px] font-body font-medium bg-ww-danger/15 text-ww-danger rounded">
      LIBRE J+2
    </span>
  )
}
