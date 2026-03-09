'use client'

import type { Bungalow, Reservation } from '@/lib/types'

export function findConflits(
  bungalows: Bungalow[],
  bungalowNum: number | null,
  dateDebut: string,
  dateFin: string
): Reservation[] {
  if (!bungalowNum || !dateDebut || !dateFin) return []
  const b = bungalows.find(bg => bg.numero === bungalowNum)
  if (!b) return []
  return b.reservations.filter(r => {
    if (r.statut === 'annulee' || r.statut === 'no_show' || r.statut === 'checked_out') return false
    return r.dateDebut < dateFin && r.dateFin > dateDebut
  })
}

interface ConflitDatesAlertProps {
  bungalows: Bungalow[]
  selectedBungalow: number | null
  dateDebut: string
  dateFin: string
  clientMap: Map<string, string>
}

export function ConflitDatesAlert({
  bungalows, selectedBungalow, dateDebut, dateFin, clientMap,
}: ConflitDatesAlertProps) {
  const conflits = findConflits(bungalows, selectedBungalow, dateDebut, dateFin)
  if (conflits.length === 0) return null

  return (
    <div className="space-y-1">
      {conflits.map(c => {
        const name = c.clientNom ?? clientMap.get(c.clientId) ?? 'Inconnu'
        const deb = new Date(c.dateDebut + 'T00:00').toLocaleDateString('fr-FR')
        const fin = new Date(c.dateFin + 'T00:00').toLocaleDateString('fr-FR')
        return (
          <div key={c.id} className="bg-ww-danger/20 border border-ww-danger/50 rounded-lg px-3 py-2 text-sm text-ww-danger font-body">
            ⚠️ Bungalow {selectedBungalow} deja reserve du {deb} au {fin} · {name}
          </div>
        )
      })}
    </div>
  )
}
