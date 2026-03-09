'use client'

import { useMemo, useState } from 'react'
import { parseISO, format, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Bungalow, Reservation } from '@/lib/types'

interface BungalowListMobileProps {
  bungalows: Bungalow[]
  clientMap: Map<string, string>
  currentMonth: Date
  chargedResIds?: Set<string>
  onReservationClick: (res: Reservation, bungalowNumero: number) => void
}

function getStatusBadge(res: Reservation) {
  if (res.statut === 'checked_out') return { label: 'Check-out', color: 'bg-ww-muted/20 text-ww-muted' }
  if (res.statut === 'no_show') return { label: 'No Show', color: 'bg-purple-600/20 text-purple-400' }
  if (isToday(parseISO(res.dateDebut))) return { label: "Arrivee aujourd'hui", color: 'bg-ww-lime/20 text-ww-lime' }
  if (res.source === 'manuel') return { label: 'Manuel', color: 'bg-ww-wood/20 text-ww-wood' }
  return { label: 'Confirmee', color: 'bg-ww-orange/20 text-ww-orange' }
}

export function BungalowListMobile({
  bungalows, clientMap, currentMonth, chargedResIds, onReservationClick,
}: BungalowListMobileProps) {
  const [filtreBung, setFiltreBung] = useState<number | null>(null)

  const sorted = useMemo(() => [...bungalows].sort((a, b) => a.numero - b.numero).slice(0, 6), [bungalows])

  const reservations = useMemo(() => {
    const list: { res: Reservation; bungalowNumero: number }[] = []
    for (const b of sorted) {
      if (filtreBung !== null && b.numero !== filtreBung) continue
      for (const r of b.reservations) {
        if (r.statut === 'annulee') continue
        const d = parseISO(r.dateDebut)
        if (d.getMonth() !== currentMonth.getMonth() || d.getFullYear() !== currentMonth.getFullYear()) {
          const dEnd = parseISO(r.dateFin)
          if (dEnd.getMonth() !== currentMonth.getMonth() || dEnd.getFullYear() !== currentMonth.getFullYear()) continue
        }
        list.push({ res: r, bungalowNumero: b.numero })
      }
    }
    return list.sort((a, b) => a.res.dateDebut.localeCompare(b.res.dateDebut))
  }, [sorted, currentMonth, filtreBung])

  return (
    <div className="space-y-3">
      {/* Bungalow filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFiltreBung(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-display font-bold shrink-0 transition-colors ${
            filtreBung === null ? 'bg-ww-orange text-white' : 'bg-ww-surface border border-ww-border text-ww-muted'
          }`}
        >
          Tous
        </button>
        {sorted.map((b) => (
          <button
            key={b.id}
            onClick={() => setFiltreBung(b.numero)}
            className={`px-3 py-1.5 rounded-full text-xs font-display font-bold shrink-0 transition-colors ${
              filtreBung === b.numero ? 'bg-ww-orange text-white' : 'bg-ww-surface border border-ww-border text-ww-muted'
            }`}
          >
            B{b.numero}
          </button>
        ))}
      </div>

      {/* Reservation cards */}
      {reservations.length === 0 ? (
        <p className="text-center py-8 text-ww-muted text-sm">Aucune reservation ce mois</p>
      ) : (
        reservations.map(({ res, bungalowNumero }) => {
          const name = clientMap.get(res.clientId) ?? 'Inconnu'
          const status = getStatusBadge(res)
          const hasCharge = chargedResIds?.has(res.id)
          return (
            <button
              key={res.id}
              onClick={() => onReservationClick(res, bungalowNumero)}
              className="w-full text-left bg-ww-surface border border-ww-border rounded-xl p-4 transition-all hover:border-ww-orange active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display font-bold text-sm text-ww-text">
                    Bungalow {bungalowNumero}
                    <span className="text-ww-muted font-sans font-normal mx-1.5">·</span>
                    {name}
                  </p>
                  <p className="text-xs text-ww-muted mt-1 font-sans">
                    {format(parseISO(res.dateDebut), 'dd MMM', { locale: fr })}
                    <span className="mx-1">→</span>
                    {format(parseISO(res.dateFin), 'dd MMM', { locale: fr })}
                    <span className="mx-1.5">·</span>
                    {res.nuits}n
                    <span className="mx-1.5">·</span>
                    <span className="text-ww-text">฿ {res.montant.toLocaleString()}</span>
                  </p>
                </div>
                <span className={`shrink-0 text-[10px] font-display font-bold px-2 py-1 rounded-full ${status.color}`}>
                  {status.label}
                </span>
              </div>
              {hasCharge && (
                <span className="inline-block mt-2 text-[10px] font-display font-bold px-2 py-0.5 rounded-full bg-ww-danger/20 text-ww-danger">
                  ฿ NOTE F&B
                </span>
              )}
            </button>
          )
        })
      )}
    </div>
  )
}
