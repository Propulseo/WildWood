'use client'

import type { PlanningShift } from '@/lib/types'

function formatHeure(h: string) {
  return h.replace(':', 'h')
}

interface ShiftCellProps {
  shifts: PlanningShift[]
  isAdmin: boolean
  isToday: boolean
  isOwnLine: boolean
  onEdit: (shift: PlanningShift) => void
  onAddClick: () => void
}

export function ShiftCell({ shifts, isAdmin, isToday, isOwnLine, onEdit, onAddClick }: ShiftCellProps) {
  if (shifts.length === 0) {
    return (
      <div
        className={`h-full min-h-[56px] flex items-center justify-center rounded-lg ${
          isAdmin ? 'group/cell cursor-pointer hover:bg-ww-surface-2' : ''
        }`}
        onClick={isAdmin ? onAddClick : undefined}
      >
        <span className="text-ww-muted text-sm">&mdash;</span>
        {isAdmin && (
          <span className="hidden group-hover/cell:inline text-ww-orange text-lg ml-1 font-bold">
            +
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {shifts.map((shift) => {
        const isReception = shift.poste_shift === 'reception'
        const bgColor = isReception ? 'rgba(201,78,10,0.15)' : 'rgba(139,107,61,0.15)'
        const borderColor = isReception ? 'var(--ww-orange)' : 'var(--ww-wood)'

        return (
          <div
            key={shift.id}
            className="relative rounded-lg px-2 py-1.5 text-xs border transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: bgColor, borderColor }}
          >
            <p className="font-display font-semibold text-[13px] text-ww-text">
              {formatHeure(shift.heure_debut)} &rarr; {formatHeure(shift.heure_fin)}
            </p>
            {isOwnLine && shift.repas_inclus && (
              <p className="text-[11px] font-body mt-0.5" style={{ color: 'var(--ww-lime)' }}>
                🍽️ Repas inclus
              </p>
            )}
            {shift.note && (
              <span className="absolute top-1 right-1 cursor-default" title={shift.note}>
                💬
              </span>
            )}
            {shift.repas_inclus && !isOwnLine && (
              <span
                className="absolute bottom-1 right-1 text-[11px] cursor-default"
                style={{ right: isAdmin ? '22px' : '4px' }}
                title="Repas inclus · WildWood"
              >
                🍽️
              </span>
            )}
            {isAdmin && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(shift) }}
                className="absolute bottom-1 right-1 text-[11px] opacity-60 hover:opacity-100 transition-opacity"
                title="Modifier"
              >
                ✏️
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
