'use client'

import { format, addMonths, subMonths, addWeeks, subWeeks, endOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ViewMode = 'mensuelle' | 'semaine'

export function CalendrierHeader({
  viewMode,
  setViewMode,
  currentMonth,
  setCurrentMonth,
  currentWeekStart,
  setCurrentWeekStart,
}: {
  viewMode: ViewMode
  setViewMode: (v: ViewMode) => void
  currentMonth: Date
  setCurrentMonth: (d: Date) => void
  currentWeekStart: Date
  setCurrentWeekStart: (d: Date) => void
}) {
  const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: fr })
  const capitalizedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  const weekLabel = `Semaine du ${format(currentWeekStart, 'd', { locale: fr })} au ${format(weekEnd, 'd', { locale: fr })}`

  const navigateBack = () => {
    if (viewMode === 'mensuelle') setCurrentMonth(subMonths(currentMonth, 1))
    else setCurrentWeekStart(subWeeks(currentWeekStart, 1))
  }

  const navigateForward = () => {
    if (viewMode === 'mensuelle') setCurrentMonth(addMonths(currentMonth, 1))
    else setCurrentWeekStart(addWeeks(currentWeekStart, 1))
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={navigateBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center min-w-[260px]">
          <h2 className="font-display text-xl font-bold uppercase tracking-wide">
            {capitalizedMonth}
          </h2>
          {viewMode === 'semaine' && (
            <p className="text-sm text-ww-muted">{weekLabel}</p>
          )}
        </div>
        <Button variant="outline" size="icon" onClick={navigateForward}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex rounded-lg overflow-hidden border border-ww-border">
        <button
          onClick={() => setViewMode('mensuelle')}
          className={`px-4 py-2 text-sm font-display font-bold transition-colors ${
            viewMode === 'mensuelle'
              ? 'bg-ww-orange text-white'
              : 'bg-ww-surface-2 text-ww-muted hover:text-ww-text'
          }`}
        >
          VUE MENSUELLE
        </button>
        <button
          onClick={() => setViewMode('semaine')}
          className={`px-4 py-2 text-sm font-display font-bold transition-colors ${
            viewMode === 'semaine'
              ? 'bg-ww-orange text-white'
              : 'bg-ww-surface-2 text-ww-muted hover:text-ww-text'
          }`}
        >
          VUE SEMAINE
        </button>
      </div>
    </div>
  )
}
