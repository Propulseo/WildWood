'use client'

import { useMemo } from 'react'
import {
  format, parseISO, isToday, startOfMonth, endOfMonth,
  getDaysInMonth, eachDayOfInterval, isSameDay,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Bungalow, Reservation } from '@/lib/types'
import { getAlertBungalowIds, isAlertCell, AlerteBadge } from './AlerteBungalow'
import { MaintenanceBadge } from './MaintenanceBadge'

const BUNGALOW_COUNT = 6

function findNoShowOverlap(b: Bungalow, res: Reservation): Reservation | null {
  if (res.statut === 'no_show' || res.statut === 'annulee') return null
  return b.reservations.find(o =>
    o.statut === 'no_show' && o.dateDebut < res.dateFin && o.dateFin > res.dateDebut
  ) ?? null
}

function getCheckinIcon(res: Reservation, today: Date): string | null {
  if (res.statut === 'no_show' || res.statut === 'annulee' || res.statut === 'checked_out') return null
  if (!isSameDay(parseISO(res.dateDebut), today)) return null
  if (res.checkin_fait && res.tm30_fait && res.clef_remise) return null
  if (!res.checkin_fait) return '\u23F3'
  if (!res.tm30_fait) return '\uD83D\uDCCB'
  return '\uD83D\uDD11'
}

function getBlockStyle(res: Reservation, today: Date, noShowOverlap: Reservation | null) {
  if (res.statut === 'checked_out') {
    return { background: 'var(--ww-surface-2)', opacity: 0.5 }
  }
  if (res.statut === 'no_show') {
    return { background: '#6D28D9', border: '1px solid #7C3AED' }
  }
  if (noShowOverlap) {
    return { background: 'linear-gradient(135deg, #6D28D9 0%, var(--ww-orange) 100%)' }
  }
  if ((res.statut === 'confirmee' || res.statut === 'en-cours') && isSameDay(parseISO(res.dateDebut), today)) {
    return { background: 'var(--ww-lime)' }
  }
  if (res.source === 'manuel') {
    return { background: 'var(--ww-wood)' }
  }
  return {}
}

export function VueMensuelle({
  bungalows,
  clientMap,
  currentMonth,
  searchQuery,
  chargedResIds,
  onReservationClick,
}: {
  bungalows: Bungalow[]
  clientMap: Map<string, string>
  currentMonth: Date
  searchQuery: string
  chargedResIds?: Set<string>
  onReservationClick: (res: Reservation, bungalowNumero: number) => void
}) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysCount = getDaysInMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const today = new Date()

  const sorted = useMemo(
    () => [...bungalows].sort((a, b) => a.numero - b.numero).slice(0, BUNGALOW_COUNT),
    [bungalows]
  )

  const alertIds = useMemo(() => getAlertBungalowIds(sorted, today), [sorted])
  const matchIds = useMemo(() => {
    if (!searchQuery.trim()) return null
    const q = searchQuery.toLowerCase()
    const ids = new Set<string>()
    for (const b of sorted)
      for (const r of b.reservations) {
        const name = clientMap.get(r.clientId) ?? ''
        if (name.toLowerCase().includes(q)) ids.add(r.id)
      }
    return ids
  }, [searchQuery, sorted, clientMap])

  function getResRows(res: Reservation) {
    const s = parseISO(res.dateDebut)
    const e = parseISO(res.dateFin)
    if (e <= monthStart || s > monthEnd) return null
    const sd = s < monthStart ? 1 : s.getDate()
    const ed = e > monthEnd ? daysCount + 1 : e.getDate()
    return { start: sd + 1, end: ed + 1 }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-ww-border">
      <div
        className="relative"
        style={{
          display: 'grid',
          gridTemplateColumns: `80px repeat(${BUNGALOW_COUNT}, minmax(100px, 1fr))`,
          gridTemplateRows: `48px repeat(${daysCount}, 32px)`,
        }}
      >
        <div className="sticky left-0 z-20 bg-ww-surface-2 border-b border-r border-ww-border" />

        {sorted.map((b, i) => (
          <div
            key={b.id}
            className="flex flex-col items-center justify-center gap-0.5 border-b border-ww-border bg-ww-surface-2 px-2"
            style={{ gridColumn: i + 2, gridRow: 1 }}
          >
            <div className="flex items-center gap-1">
              <span className="font-display text-xs font-bold text-ww-muted uppercase tracking-wide">
                Bungalow {b.numero}
              </span>
              {alertIds.has(b.id) && <AlerteBadge />}
            </div>
            <MaintenanceBadge bungalowId={b.id} bungalowNumero={b.numero} />
          </div>
        ))}

        {days.map((day, di) => {
          const row = di + 2
          const isT = isToday(day)
          const label = format(day, 'EEE. dd', { locale: fr }).toUpperCase()

          return (
            <div key={di} className="contents">
              <div
                className={`sticky left-0 z-20 flex items-center gap-2 px-2 border-b border-r border-ww-border text-xs font-body ${
                  isT ? 'bg-ww-surface-2 text-ww-orange font-bold' : 'bg-ww-surface text-ww-muted'
                }`}
                style={{ gridRow: row, gridColumn: 1 }}
              >
                {isT && (
                  <span className="bg-ww-orange text-white text-[9px] font-display font-bold px-1 py-0.5 rounded shrink-0">
                    AUJ.
                  </span>
                )}
                <span className="truncate">{label}</span>
              </div>

              {sorted.map((b, bi) => {
                const alert = isAlertCell(b.id, day, today, alertIds)
                return (
                  <div
                    key={b.id}
                    className={`border-b border-r border-ww-border/30 ${
                      isT ? 'bg-ww-surface-2'
                        : alert ? 'bg-ww-danger/[0.08] border-dashed !border-ww-danger' : 'bg-ww-bg'
                    }`}
                    style={{ gridRow: row, gridColumn: bi + 2 }}
                  >
                    {alert && <span className="float-right text-[10px] mt-0.5 mr-0.5 opacity-60">⚠️</span>}
                  </div>
                )
              })}
            </div>
          )
        })}

        {sorted.map((b, bi) =>
          b.reservations.map((res) => {
            if (res.statut === 'annulee') return null
            const r = getResRows(res)
            if (!r) return null
            const name = clientMap.get(res.clientId) ?? 'Inconnu'
            const dim = matchIds !== null && !matchIds.has(res.id)
            const noShowOvl = findNoShowOverlap(b, res)
            const isNs = res.statut === 'no_show'
            const isCo = res.statut === 'checked_out'
            const hasCharge = !isNs && !isCo && chargedResIds?.has(res.id)
            const style = getBlockStyle(res, today, noShowOvl)
            const oldName = noShowOvl ? (clientMap.get(noShowOvl.clientId) ?? 'Inconnu') : null

            return (
              <button
                key={res.id}
                type="button"
                onClick={() => onReservationClick(res, b.numero)}
                className={`text-white rounded-md px-2 text-[13px] font-body z-10 mx-1 my-[1px] cursor-pointer transition-all duration-150 hover:border-2 hover:border-white hover:-translate-y-[1px] active:scale-[0.97] flex flex-col justify-center overflow-hidden ${
                  !isNs && !noShowOvl && res.source !== 'manuel' ? 'bg-ww-orange' : ''
                } ${dim ? 'opacity-30' : ''} ${isNs ? 'z-[9]' : 'z-10'} ${hasCharge ? 'ring-2 ring-ww-danger ring-offset-1 ring-offset-ww-bg animate-pulse' : ''}`}
                style={{
                  gridColumn: bi + 2,
                  gridRow: `${r.start} / ${r.end}`,
                  ...style,
                }}
                title={`${name} — ${res.nuits}n`}
              >
                {res.source === 'manuel' && !isNs && !isCo && (
                  <span className="absolute top-0 left-0.5 text-[9px] leading-none mt-0.5">✏️</span>
                )}
                {!isNs && !isCo && (
                  <span className="absolute bottom-0 left-1 text-[9px] leading-none mb-0.5">
                    {res.reservation_directe ? <span className="font-display font-bold" style={{ color: 'var(--ww-lime)' }}>DIRECT</span>
                      : res.tarif_type === 'flex' ? <span className="opacity-70">{'\u{1F7E2}'}</span>
                      : res.tarif_type === 'non_remb' ? <span className="opacity-70">{'\u{1F512}'}</span>
                      : null}
                  </span>
                )}
                {isNs && (
                  <span className="absolute top-0 right-1 text-[9px] font-display font-bold bg-ww-danger text-white px-1 rounded-b">
                    NO SHOW
                  </span>
                )}
                {isCo && (
                  <span className="absolute top-0 right-1 text-[9px] font-display font-bold text-ww-muted">
                    CHECK-OUT ✓
                  </span>
                )}
                {hasCharge && (
                  <span className="absolute top-0 right-0 bg-ww-danger text-white text-[9px] font-display font-bold px-1.5 py-0.5 rounded-bl-md rounded-tr-md shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                    ฿ NOTE
                  </span>
                )}
                {oldName ? (
                  <>
                    <span className="truncate text-[11px] line-through opacity-70">{oldName}</span>
                    <span className="truncate text-[12px] font-bold">{name}</span>
                  </>
                ) : (
                  <span className={`truncate ${isNs ? 'line-through opacity-70' : ''}`}>{name}</span>
                )}
                {(() => { const ci = getCheckinIcon(res, today); return ci ? <span className="text-[10px] leading-none mt-0.5">{ci}</span> : null })()}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
