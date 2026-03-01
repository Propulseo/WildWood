'use client'

import { useState, useEffect, useMemo } from 'react'
import { getClients, getBungalows } from '@/lib/data-access'
import type { Client, Bungalow, Reservation } from '@/lib/types'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  endOfWeek,
  addMonths,
  subMonths,
  format,
  parseISO,
  getDaysInMonth,
  isToday,
  isWeekend,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/** Color classes by reservation status */
const STATUS_COLORS: Record<Reservation['statut'], string> = {
  'en-cours': 'bg-wildwood-lime text-white',
  confirmee: 'bg-wildwood-orange text-white',
  terminee: 'bg-muted text-muted-foreground',
  annulee: 'bg-destructive/30 text-destructive line-through',
}

export default function BungalowsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [bungalows, setBungalows] = useState<Bungalow[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    Promise.all([getClients(), getBungalows()]).then(([c, b]) => {
      setClients(c)
      setBungalows(b)
    })
  }, [])

  // Map clientId -> "prenom nom"
  const clientMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of clients) {
      map.set(c.id, `${c.prenom} ${c.nom}`)
    }
    return map
  }, [clients])

  // Month computation
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = getDaysInMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Capitalize French month name
  const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: fr })
  const capitalizedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  /**
   * Compute grid column span for a reservation, clamped to current month.
   * Returns null if no overlap.
   */
  function getReservationColumns(res: Reservation): { start: number; end: number } | null {
    const resStart = parseISO(res.dateDebut)
    const resEnd = parseISO(res.dateFin)
    if (resEnd < monthStart || resStart > monthEnd) return null
    const start = resStart < monthStart ? 1 : resStart.getDate()
    const end = resEnd > monthEnd ? daysInMonth + 1 : resEnd.getDate() + 1
    // +1 offset for bungalow label column
    return { start: start + 1, end: end + 1 }
  }

  // ---------------------------------------------------------------------------
  // Occupancy: monthly
  // ---------------------------------------------------------------------------
  const { occupancyRate, occupiedSlots, totalSlots } = useMemo(() => {
    const total = 8 * daysInMonth
    let occupied = 0
    for (const bungalow of bungalows) {
      for (const res of bungalow.reservations) {
        if (res.statut === 'annulee') continue
        const resStart = parseISO(res.dateDebut)
        const resEnd = parseISO(res.dateFin)
        const overlapStart = resStart < monthStart ? monthStart : resStart
        const overlapEnd = resEnd > monthEnd ? monthEnd : resEnd
        if (overlapStart <= overlapEnd) {
          occupied += eachDayOfInterval({ start: overlapStart, end: overlapEnd }).length
        }
      }
    }
    return {
      occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
      occupiedSlots: occupied,
      totalSlots: total,
    }
  }, [bungalows, monthStart, monthEnd, daysInMonth])

  // ---------------------------------------------------------------------------
  // Occupancy: weekly breakdown
  // ---------------------------------------------------------------------------
  const weeklyBreakdown = useMemo(() => {
    const weeks = eachWeekOfInterval(
      { start: monthStart, end: monthEnd },
      { weekStartsOn: 1 }
    )
    return weeks.map((weekStartDate) => {
      const weekEnd = endOfWeek(weekStartDate, { weekStartsOn: 1 })
      const clampedStart = weekStartDate < monthStart ? monthStart : weekStartDate
      const clampedEnd = weekEnd > monthEnd ? monthEnd : weekEnd
      const daysInWeek = eachDayOfInterval({ start: clampedStart, end: clampedEnd }).length
      const total = 8 * daysInWeek
      let occupied = 0
      for (const bungalow of bungalows) {
        for (const res of bungalow.reservations) {
          if (res.statut === 'annulee') continue
          const resStart = parseISO(res.dateDebut)
          const resEnd = parseISO(res.dateFin)
          const overlapStart = resStart < clampedStart ? clampedStart : resStart
          const overlapEnd = resEnd > clampedEnd ? clampedEnd : resEnd
          if (overlapStart <= overlapEnd) {
            occupied += eachDayOfInterval({ start: overlapStart, end: overlapEnd }).length
          }
        }
      }
      return {
        label: 'S' + format(weekStartDate, 'w'),
        rate: total > 0 ? Math.round((occupied / total) * 100) : 0,
      }
    })
  }, [bungalows, monthStart, monthEnd])

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="font-display text-3xl font-bold">Bungalows</h1>
        <p className="text-muted-foreground">Calendrier des reservations</p>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-display text-xl font-bold min-w-[200px] text-center">
          {capitalizedMonth}
        </h2>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <div
          className="relative"
          style={{
            display: 'grid',
            gridTemplateColumns: `120px repeat(${daysInMonth}, minmax(32px, 1fr))`,
            gridTemplateRows: `40px repeat(8, 56px)`,
          }}
        >
          {/* ---- Header row ---- */}
          {/* Top-left empty cell */}
          <div className="sticky left-0 z-10 bg-muted border-b border-r border-border" />

          {days.map((day, i) => {
            const weekend = isWeekend(day)
            const today = isToday(day)
            return (
              <div
                key={i}
                className={`flex flex-col items-center justify-center text-xs border-b border-border ${
                  today ? 'bg-wildwood-orange/10 font-bold' : weekend ? 'text-muted-foreground/60' : ''
                }`}
              >
                <span>{format(day, 'd')}</span>
                <span className="text-[10px]">{format(day, 'EEE', { locale: fr })}</span>
              </div>
            )
          })}

          {/* ---- Bungalow rows ---- */}
          {bungalows
            .sort((a, b) => a.numero - b.numero)
            .map((bungalow) => {
              const gridRow = bungalow.numero + 1 // header is row 1

              return (
                <div key={bungalow.id} className="contents">
                  {/* Bungalow label */}
                  <div
                    className="sticky left-0 z-10 bg-background flex items-center px-3 font-medium text-sm border-b border-r border-border"
                    style={{ gridRow, gridColumn: 1 }}
                  >
                    Bungalow {bungalow.numero}
                  </div>

                  {/* Day background cells */}
                  {days.map((day, i) => {
                    const weekend = isWeekend(day)
                    const today = isToday(day)
                    return (
                      <div
                        key={i}
                        className={`border-b border-r border-border/30 ${
                          today ? 'bg-wildwood-orange/5' : weekend ? 'bg-muted/30' : ''
                        }`}
                        style={{ gridRow, gridColumn: i + 2 }}
                      />
                    )
                  })}

                  {/* Reservation bars */}
                  {bungalow.reservations.map((res) => {
                    const cols = getReservationColumns(res)
                    if (!cols) return null
                    const clientName = clientMap.get(res.clientId) ?? 'Inconnu'
                    const isActive = res.statut === 'en-cours'
                    return (
                      <div
                        key={res.id}
                        className={`${STATUS_COLORS[res.statut]} rounded-md px-2 py-1 text-xs truncate h-[40px] flex items-center gap-1 z-[5] my-auto mx-0.5`}
                        style={{
                          gridRow,
                          gridColumn: `${cols.start} / ${cols.end}`,
                        }}
                        title={`${clientName} - ${res.nuits}n - ${res.montant.toLocaleString()} THB (${res.statut})`}
                      >
                        {isActive && (
                          <Dumbbell className="h-3 w-3 shrink-0" aria-label="Acces gym inclus" />
                        )}
                        <span className="truncate">
                          {clientName} - {res.nuits}n - {res.montant.toLocaleString()} THB
                        </span>
                      </div>
                    )
                  })}
                </div>
              )
            })}
        </div>
      </div>

      {/* Occupancy section */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Monthly rate */}
        <Card className="w-full md:w-64 shrink-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taux d&apos;occupation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display text-wildwood-bois">
              {occupancyRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {occupiedSlots} / {totalSlots} nuits-bungalow
            </p>
          </CardContent>
        </Card>

        {/* Weekly breakdown */}
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Occupation par semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weeklyBreakdown.map((week) => (
                <div key={week.label} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-8 shrink-0">{week.label}</span>
                  <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-wildwood-lime rounded-full transition-all"
                      style={{ width: `${week.rate}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-10 text-right">{week.rate}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
