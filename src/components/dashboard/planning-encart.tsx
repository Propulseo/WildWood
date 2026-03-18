'use client'

import Link from 'next/link'
import { usePlanning } from '@/contexts/planning-context'

const TODAY = new Date().toISOString().split('T')[0]

function formatHeure(h: string) {
  return h.replace(':', 'h')
}

export function PlanningEncart() {
  const { shifts } = usePlanning()

  const todayShifts = shifts.filter((s) => s.date === TODAY && s.publie)
    .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut))

  if (todayShifts.length === 0) return null

  return (
    <div className="bg-ww-surface border border-ww-border rounded-xl p-5" style={{ borderLeftWidth: 3, borderLeftColor: 'var(--ww-orange)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="ww-label">📅 PLANNING AUJOURD&apos;HUI</p>
        <Link href="/planning" className="text-xs font-body text-ww-orange hover:underline">
          Voir le planning &rarr;
        </Link>
      </div>
      <div className="space-y-1.5">
        {todayShifts.map((s) => {
          const prenom = (s.staff_nom ?? '').split(' ')[0] || '—'
          return (
            <div key={s.id} className="flex items-center gap-3 text-[13px] font-body">
              <span className="font-mono text-ww-muted w-[90px] shrink-0">
                {formatHeure(s.heure_debut)}&rarr;{formatHeure(s.heure_fin)}
              </span>
              <span className="text-ww-text">{prenom}</span>
              {s.repas_inclus && (
                <span className="text-[11px] text-ww-muted" title="Repas inclus">🍽️</span>
              )}
              <span className={`text-[10px] font-display font-bold uppercase px-1.5 py-0.5 rounded ${
                s.poste_shift === 'reception' ? 'text-ww-orange bg-ww-orange/10' : 'text-ww-wood bg-ww-wood/10'
              }`}>
                {s.poste_shift === 'reception' ? 'Reception' : 'Bar'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
