import { parseISO } from 'date-fns'
import type { Reservation } from '@/lib/types'
import { ChecklistItem } from './ChecklistItem'

export function CheckinChecklist({
  reservation,
  onToggle,
}: {
  reservation: Reservation
  onToggle: (field: 'checkin_fait' | 'tm30_fait' | 'clef_remise') => void
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const resStart = parseISO(reservation.dateDebut)
  resStart.setHours(0, 0, 0, 0)

  if (resStart > today || reservation.statut === 'no_show' || reservation.statut === 'annulee') {
    return null
  }

  const allDone = reservation.checkin_fait && reservation.tm30_fait && reservation.clef_remise

  if (allDone) {
    return (
      <div
        className="mt-4 text-center py-3 px-4 rounded-lg border border-ww-lime font-display font-bold text-ww-lime"
        style={{ background: 'rgba(122,182,72,0.08)' }}
      >
        &#9989; ARRIV&#201;E COMPL&#200;TE
      </div>
    )
  }

  return (
    <div className="mt-4">
      <p className="text-xs font-display font-bold text-ww-muted uppercase tracking-wide mb-2">
        PROC&#201;DURE D&#39;ARRIV&#201;E
      </p>
      <ChecklistItem
        label="Check-in effectu&#233;"
        checked={reservation.checkin_fait}
        locked={false}
        onToggle={() => onToggle('checkin_fait')}
      />
      <ChecklistItem
        label="TM30 effectu&#233;"
        checked={reservation.tm30_fait}
        locked={!reservation.checkin_fait}
        onToggle={() => onToggle('tm30_fait')}
      />
      <ChecklistItem
        label="Clef remise"
        checked={reservation.clef_remise}
        locked={!reservation.tm30_fait}
        onToggle={() => onToggle('clef_remise')}
      />
    </div>
  )
}
