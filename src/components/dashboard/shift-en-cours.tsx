'use client'

import { Card } from '@/components/ui/card'
import { useShift } from '@/contexts/shift-context'

export function ShiftEnCours() {
  const { getStaffActif, getShiftInfo } = useShift()

  const receptionStaff = getStaffActif('reception')
  const barStaff = getStaffActif('bar')
  const receptionInfo = getShiftInfo('reception')
  const barInfo = getShiftInfo('bar')

  const rDepuis = receptionInfo?.depuis?.replace(':', 'h') ?? '--'
  const bDepuis = barInfo?.depuis?.replace(':', 'h') ?? '--'

  return (
    <Card className="p-4 flex items-center gap-6">
      <span className="text-xs font-display font-bold uppercase tracking-wider text-ww-muted shrink-0">
        SHIFT EN COURS
      </span>
      <div className="flex items-center gap-6 text-[13px] font-sans">
        <span>
          <span className="text-ww-muted">Reception : </span>
          <span className="text-ww-text font-medium">
            {receptionStaff ? `${receptionStaff.prenom}` : '—'}
          </span>
          <span className="text-ww-muted ml-1">(depuis {rDepuis})</span>
        </span>
        <span className="text-ww-border">|</span>
        <span>
          <span className="text-ww-muted">Bar : </span>
          <span className="text-ww-text font-medium">
            {barStaff ? `${barStaff.prenom}` : '—'}
          </span>
          <span className="text-ww-muted ml-1">(depuis {bDepuis})</span>
        </span>
      </div>
    </Card>
  )
}
