'use client'

import { useMemo } from 'react'
import {
  format, parseISO, isToday, eachDayOfInterval,
  endOfWeek, differenceInCalendarDays, isSameDay,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Bungalow, Reservation } from '@/lib/types'
import { getAlertBungalowIds, isAlertCell, AlerteBadge } from './AlerteBungalow'
import { MaintenanceBadge } from './MaintenanceBadge'

const BUNGALOW_COUNT = 6

function getCheckinIcon(res: Reservation, today: Date): string | null {
  if (res.statut === 'no_show' || res.statut === 'annulee' || res.statut === 'checked_out') return null
  if (!isSameDay(parseISO(res.dateDebut), today)) return null
  if (res.checkin_fait && res.tm30_fait && res.clef_remise) return null
  if (!res.checkin_fait) return '\u23F3'
  if (!res.tm30_fait) return '\uD83D\uDCCB'
  return '\uD83D\uDD11'
}

function getResStyle(res: Reservation, today: Date, hasNoShowBehind: boolean) {
  if (res.statut === 'checked_out') {
    return { background: 'var(--ww-surface-2)', opacity: 0.5 }
  }
  if (res.statut === 'no_show') {
    return { background: '#6D28D9', border: '1px solid #7C3AED' }
  }
  if (hasNoShowBehind) {
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

export function VueSemaine({
  bungalows,
  clientMap,
  weekStart,
  searchQuery,
  chargedResIds,
  onReservationClick,
}: {
  bungalows: Bungalow[]
  clientMap: Map<string, string>
  weekStart: Date
  searchQuery: string
  chargedResIds?: Set<string>
  onReservationClick: (res: Reservation, bungalowNumero: number) => void
}) {
  const wEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: wEnd })
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

  function findAllRes(b: Bungalow, day: Date): Reservation[] {
    return b.reservations.filter(r => {
      if (r.statut === 'annulee') return false
      const s = parseISO(r.dateDebut)
      const e = parseISO(r.dateFin)
      return day >= s && day < e
    })
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-ww-border">
      <div
        className="relative"
        style={{
          display: 'grid',
          gridTemplateColumns: `80px repeat(${BUNGALOW_COUNT}, minmax(110px, 1fr))`,
          gridTemplateRows: `48px repeat(7, minmax(64px, auto))`,
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
          const label = format(day, 'EEE. dd MMM', { locale: fr }).toUpperCase()

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
                const allRes = findAllRes(b, day)
                const active = allRes.find(r => r.statut !== 'no_show')
                const noShow = allRes.find(r => r.statut === 'no_show')
                const alert = allRes.length === 0 && isAlertCell(b.id, day, today, alertIds)

                if (!active && !noShow) {
                  return (
                    <div
                      key={b.id}
                      className={`border-b border-r border-ww-border/30 ${
                        isT ? 'bg-ww-surface-2'
                          : alert ? 'bg-ww-danger/[0.08] border-dashed !border-ww-danger' : 'bg-ww-bg'
                      }`}
                      style={{ gridRow: row, gridColumn: bi + 2 }}
                    >
                      {alert && <span className="float-right text-[10px] mt-1 mr-1 opacity-60">⚠️</span>}
                    </div>
                  )
                }

                const primary = active ?? noShow!
                const hasNoShowBehind = !!active && !!noShow
                const isNs = primary.statut === 'no_show'
                const isCo = primary.statut === 'checked_out'
                const hasCharge = !isNs && !isCo && chargedResIds?.has(primary.id)
                const name = clientMap.get(primary.clientId) ?? 'Inconnu'
                const nightNum = differenceInCalendarDays(day, parseISO(primary.dateDebut)) + 1
                const dim = matchIds !== null && !matchIds.has(primary.id)
                const style = getResStyle(primary, today, hasNoShowBehind)
                const oldName = hasNoShowBehind ? (clientMap.get(noShow!.clientId) ?? 'Inconnu') : null

                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onReservationClick(primary, b.numero)}
                    className={`text-white rounded-md px-2 py-1 font-body z-10 mx-1 my-[2px] cursor-pointer transition-all duration-150 hover:border-2 hover:border-white active:scale-[0.97] flex flex-col justify-center overflow-hidden ${
                      !isNs && !hasNoShowBehind && primary.source !== 'manuel' ? 'bg-ww-orange' : ''
                    } ${dim ? 'opacity-30' : ''} ${hasCharge ? 'ring-2 ring-ww-danger ring-offset-1 ring-offset-ww-bg animate-pulse' : ''}`}
                    style={{ gridRow: row, gridColumn: bi + 2, ...style }}
                    title={`${name} — Nuit ${nightNum}/${primary.nuits}`}
                  >
                    {primary.source === 'manuel' && !isNs && !isCo && (
                      <span className="absolute top-0 left-0.5 text-[9px] leading-none mt-0.5">✏️</span>
                    )}
                    {!isNs && !isCo && !oldName && (
                      <span className="absolute top-0 left-0.5 text-[9px] leading-none mt-0.5" style={{ left: primary.source === 'manuel' ? 14 : 2 }}>
                        {primary.reservation_directe ? <span className="text-[9px] font-display font-bold" style={{ color: 'var(--ww-lime)' }}>DIRECT</span>
                          : primary.tarif_type === 'flex' ? <span className="text-[9px] opacity-70">{'\u{1F7E2}'}</span>
                          : primary.tarif_type === 'non_remb' ? <span className="text-[9px] opacity-70">{'\u{1F512}'}</span>
                          : null}
                      </span>
                    )}
                    {oldName ? (
                      <>
                        <span className="truncate text-[10px] line-through opacity-70">{oldName}</span>
                        <span className="truncate text-[12px] font-bold">{name}</span>
                      </>
                    ) : (
                      <span className={`truncate text-sm font-medium ${isNs ? 'line-through opacity-70' : ''}`}>
                        {name}
                      </span>
                    )}
                    {!oldName && (
                      <span className="text-[11px] opacity-80">
                        {isNs ? 'NO SHOW' : isCo ? 'CHECK-OUT ✓' : `Nuit ${nightNum}/${primary.nuits}`}
                      </span>
                    )}
                    {hasCharge && (
                      <span className="absolute top-0 right-0 bg-ww-danger text-white text-[9px] font-display font-bold px-1.5 py-0.5 rounded-bl-md rounded-tr-md shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                        ฿ NOTE
                      </span>
                    )}
                    {isSameDay(day, parseISO(primary.dateDebut)) && (() => { const ci = getCheckinIcon(primary, today); return ci ? <span className="text-[10px] leading-none">{ci}</span> : null })()}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
