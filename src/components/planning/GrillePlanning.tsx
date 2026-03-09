'use client'

import { useMemo } from 'react'
import type { PlanningShift, StaffMember } from '@/lib/types'
import { ShiftCell } from './ShiftCell'

const JOURS_COURTS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM']

interface GrillePlanningProps {
  shifts: PlanningShift[]
  weekDates: string[]
  todayStr: string
  isAdmin: boolean
  staffActifId: string | null
  filtrePoste: 'tous' | 'reception' | 'bar'
  onEditShift: (shift: PlanningShift) => void
  onAddShift: (date: string, staffId: string) => void
}

export function GrillePlanning({
  shifts, weekDates, todayStr, isAdmin, staffActifId, filtrePoste,
  onEditShift, onAddShift,
}: GrillePlanningProps) {
  const staffRows = useMemo(() => {
    const map = new Map<string, { id: string; nom: string; prenom: string; poste: string; initiales: string; couleur: string }>()
    for (const s of shifts) {
      if (!map.has(s.staff_id)) {
        const parts = s.staff_nom.split(' ')
        map.set(s.staff_id, {
          id: s.staff_id,
          prenom: parts[0],
          nom: parts.slice(1).join(' '),
          poste: s.staff_poste,
          initiales: parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
          couleur: s.poste_shift === 'reception' ? 'var(--ww-orange)' : 'var(--ww-wood)',
        })
      }
    }
    let rows = Array.from(map.values())
    if (filtrePoste !== 'tous') {
      rows = rows.filter((r) => r.poste === filtrePoste)
    }
    return rows
  }, [shifts, filtrePoste])

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Header */}
        <div className="grid grid-cols-[160px_repeat(7,1fr)] gap-1 mb-1">
          <div />
          {weekDates.map((d, i) => {
            const day = new Date(d + 'T00:00:00')
            const isToday = d === todayStr
            return (
              <div
                key={d}
                className={`text-center py-2 rounded-lg font-display font-bold text-xs tracking-wider ${
                  isToday ? 'text-ww-orange' : 'text-ww-muted'
                }`}
                style={isToday ? { backgroundColor: 'var(--ww-orange-glow)' } : undefined}
              >
                {JOURS_COURTS[i]} {String(day.getDate()).padStart(2, '0')}
              </div>
            )
          })}
        </div>

        {/* Rows */}
        {staffRows.map((staff, rowIdx) => {
          const isMe = staff.id === staffActifId
          return (
            <div
              key={staff.id}
              className={`grid grid-cols-[160px_repeat(7,1fr)] gap-1 py-2 px-1 rounded-lg ${
                isMe ? 'bg-ww-surface-2' : rowIdx % 2 === 0 ? 'bg-ww-surface' : 'bg-ww-surface-2'
              }`}
            >
              {/* Staff label */}
              <div className="flex items-center gap-2 px-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-display font-bold text-white shrink-0"
                  style={{ backgroundColor: staff.couleur }}
                >
                  {staff.initiales}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-body font-medium text-ww-text truncate">
                      {staff.prenom}
                    </span>
                    {isMe && (
                      <span className="text-[10px] font-display font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--ww-lime)', color: 'var(--ww-bg)' }}>
                        MOI
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-display font-bold uppercase tracking-wider text-ww-muted">
                    {staff.poste}
                  </span>
                </div>
              </div>

              {/* Day cells */}
              {weekDates.map((d) => {
                const dayShifts = shifts.filter(
                  (s) => s.staff_id === staff.id && s.date === d
                )
                return (
                  <ShiftCell
                    key={d}
                    shifts={dayShifts}
                    isAdmin={isAdmin}
                    isToday={d === todayStr}
                    isOwnLine={isMe}
                    onEdit={onEditShift}
                    onAddClick={() => onAddShift(d, staff.id)}
                  />
                )
              })}
            </div>
          )
        })}

        {staffRows.length === 0 && (
          <div className="text-center py-12 text-ww-muted font-body">
            Aucun shift pour cette semaine
          </div>
        )}
      </div>
    </div>
  )
}
