'use client'

import { useMemo } from 'react'
import type { PlanningShift } from '@/lib/types'

const JOURS_MAP: Record<string, string> = {
  '1': 'Lun', '2': 'Mar', '3': 'Mer', '4': 'Jeu', '5': 'Ven', '6': 'Sam', '0': 'Dim',
}

interface PlanningListMobileProps {
  shifts: PlanningShift[]
  weekDates: string[]
  todayStr: string
  staffActifId: string | null
  filtrePoste: 'tous' | 'reception' | 'bar'
  onEditShift: (shift: PlanningShift) => void
}

export function PlanningListMobile({
  shifts, weekDates, todayStr, staffActifId, filtrePoste, onEditShift,
}: PlanningListMobileProps) {
  const staffGroups = useMemo(() => {
    const map = new Map<string, { id: string; nom: string; poste: string; initiales: string; couleur: string; shifts: PlanningShift[] }>()
    const filtered = filtrePoste === 'tous' ? shifts : shifts.filter(s => s.staff_poste === filtrePoste)
    for (const s of filtered) {
      if (!map.has(s.staff_id)) {
        const parts = s.staff_nom.split(' ')
        map.set(s.staff_id, {
          id: s.staff_id,
          nom: s.staff_nom,
          poste: s.staff_poste,
          initiales: parts.map(p => p[0]).join('').slice(0, 2).toUpperCase(),
          couleur: s.poste_shift === 'reception' ? 'var(--ww-orange)' : 'var(--ww-wood)',
          shifts: [],
        })
      }
      map.get(s.staff_id)!.shifts.push(s)
    }
    return Array.from(map.values())
  }, [shifts, filtrePoste])

  if (staffGroups.length === 0) {
    return <p className="text-center py-8 text-ww-muted text-sm">Aucun shift cette semaine</p>
  }

  return (
    <div className="space-y-3">
      {staffGroups.map((staff) => {
        const isMe = staff.id === staffActifId
        return (
          <div key={staff.id} className={`bg-ww-surface border rounded-xl p-4 ${isMe ? 'border-ww-lime/40' : 'border-ww-border'}`}>
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-display font-bold text-white shrink-0"
                style={{ backgroundColor: staff.couleur }}
              >
                {staff.initiales}
              </div>
              <div>
                <span className="text-sm font-sans font-medium text-ww-text">{staff.nom}</span>
                {isMe && (
                  <span className="ml-2 text-[10px] font-display font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--ww-lime)', color: 'var(--ww-bg)' }}>MOI</span>
                )}
                <p className="text-[10px] font-display font-bold uppercase tracking-wider text-ww-muted">{staff.poste}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {weekDates.map((d) => {
                const dayShifts = staff.shifts.filter(s => s.date === d)
                const day = new Date(d + 'T00:00:00')
                const jourLabel = JOURS_MAP[String(day.getDay())]
                const isToday = d === todayStr
                if (dayShifts.length === 0) {
                  return (
                    <span key={d} className={`text-[10px] font-display font-bold px-2 py-1 rounded ${isToday ? 'bg-ww-surface-2 text-ww-muted' : 'text-ww-border'}`}>
                      {jourLabel} —
                    </span>
                  )
                }
                return dayShifts.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onEditShift(s)}
                    className={`text-[11px] font-sans px-2.5 py-1 rounded-lg transition-colors ${
                      isToday ? 'bg-ww-orange/15 text-ww-orange border border-ww-orange/30' : 'bg-ww-surface-2 text-ww-text border border-ww-border'
                    }`}
                  >
                    <span className="font-display font-bold">{jourLabel}</span> {s.heure_debut.replace(':', 'h')}→{s.heure_fin.replace(':', 'h')}
                  </button>
                ))
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
