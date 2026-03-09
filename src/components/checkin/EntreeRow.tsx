'use client'

import { ArrowUp } from 'lucide-react'
import type { CheckinEntry } from '@/lib/types'

const PASS_LABELS: Record<string, string> = {
  '1_jour': 'PASS 1 JOUR',
  '3_jours': 'PASS 3 JOURS',
  '1_semaine': 'PASS 1 SEMAINE',
  '1_mois': 'PASS 1 MOIS',
  resident: 'RESIDENT',
}

function formatHeure(h: string) {
  return h.replace(':', 'h')
}

function formatPrix(n: number) {
  if (n === 0) return 'gratuit'
  return `฿ ${n.toLocaleString('fr-FR')}`
}

interface EntreeRowProps {
  entry: CheckinEntry
  isToday: boolean
  onUpgrade: (entry: CheckinEntry) => void
}

export function EntreeRow({ entry, isToday, onUpgrade }: EntreeRowProps) {
  const initials = entry.client_nom
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const isResident = entry.type_entree === 'hotel_resident'
  const is1Jour = entry.type_pass === '1_jour'
  const upgraded = entry.upgrade_effectue !== false

  const canUpgrade = is1Jour && isToday && !upgraded

  return (
    <div className="flex items-center gap-4 px-4 py-4 min-h-[72px] rounded-lg bg-ww-surface border border-ww-border">
      <div className="h-11 w-11 rounded-full bg-ww-surface-2 flex items-center justify-center text-sm font-display font-bold text-ww-text shrink-0">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <span className="font-display font-bold text-lg text-ww-text">
          {entry.client_nom}
        </span>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {isResident ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-display font-bold uppercase tracking-wide bg-[var(--ww-wood)]/20 text-[var(--ww-wood)]">
              Resident · Bungalow {entry.bungalow_numero}
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-display font-bold uppercase tracking-wide bg-ww-orange/15 text-ww-orange">
              {upgraded && entry.upgrade_effectue
                ? PASS_LABELS[entry.upgrade_effectue.vers] || entry.upgrade_effectue.vers
                : PASS_LABELS[entry.type_pass]}
            </span>
          )}
        </div>
      </div>

      <span className="font-mono text-sm text-ww-muted shrink-0">
        {formatHeure(entry.heure_entree)}
      </span>

      <span className="font-display font-bold text-xl text-ww-text shrink-0 w-[90px] text-right">
        {formatPrix(entry.prix_paye)}
      </span>

      <div className="w-[140px] shrink-0 flex justify-end">
        {canUpgrade && (
          <button
            onClick={() => onUpgrade(entry)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ww-orange/15 text-ww-orange text-sm font-display font-bold uppercase tracking-wide hover:bg-ww-orange/25 hover:translate-y-[-2px] active:scale-[0.97] transition-all duration-150"
          >
            Upgrade <ArrowUp className="h-4 w-4" />
          </button>
        )}
        {upgraded && entry.upgrade_effectue && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-display font-bold uppercase tracking-wide text-[var(--ww-lime)]">
            Upgrade → {PASS_LABELS[entry.upgrade_effectue.vers] || entry.upgrade_effectue.vers} ✓
          </span>
        )}
      </div>
    </div>
  )
}
