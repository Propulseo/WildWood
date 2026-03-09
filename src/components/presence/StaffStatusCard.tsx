'use client'

import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import type { StaffMember } from '@/lib/types'

function parseMins(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function formatDuree(totalMin: number): string {
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

function nowMinutes(): number {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

type Statut = 'present' | 'absent' | 'parti'

const POSTE_LABELS: Record<string, string> = {
  reception: 'Reception',
  bar: 'Bar',
  admin: 'Admin',
}

const STATUS_PILL: Record<Statut, { bg: string; text: string; dot: string; label: string }> = {
  present: {
    bg: 'bg-[rgba(122,182,72,0.15)]',
    text: 'text-[var(--ww-lime)]',
    dot: 'bg-[var(--ww-lime)]',
    label: 'PRESENT',
  },
  absent: {
    bg: 'bg-[rgba(239,68,68,0.15)]',
    text: 'text-[var(--ww-danger)]',
    dot: 'bg-[var(--ww-danger)]',
    label: 'ABSENT',
  },
  parti: {
    bg: 'bg-[rgba(201,78,10,0.15)]',
    text: 'text-ww-orange',
    dot: 'bg-ww-orange',
    label: 'PARTI',
  },
}

interface StaffStatusCardProps {
  member: StaffMember
  todayStr: string
  onRemove?: (id: string) => void
}

export function StaffStatusCard({ member, todayStr, onRemove }: StaffStatusCardProps) {
  const [nowMin, setNowMin] = useState(nowMinutes)

  useEffect(() => {
    const interval = setInterval(() => setNowMin(nowMinutes()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const pointage = member.pointages.find((p) => p.date === todayStr)
  const statut: Statut = !pointage ? 'absent' : pointage.heure_depart ? 'parti' : 'present'

  const arriveeMin = pointage ? parseMins(pointage.heure_arrivee) : 0
  const departMin = pointage?.heure_depart ? parseMins(pointage.heure_depart) : nowMin
  const dureeMin = pointage ? Math.max(0, departMin - arriveeMin) : 0
  const progressPct = pointage ? Math.min(100, (dureeMin / 480) * 100) : 0

  const pill = STATUS_PILL[statut]

  const cardClass = statut === 'present'
    ? 'border-[var(--ww-lime)] shadow-[0_0_16px_var(--ww-lime-glow)]'
    : statut === 'parti'
      ? 'opacity-50 border-ww-border border-dashed'
      : 'opacity-60 border-ww-border'

  return (
    <div className={`bg-ww-surface border rounded-xl p-6 min-h-[160px] flex flex-col gap-4 group relative ${cardClass}`}>
      {onRemove && (
        <button
          onClick={() => onRemove(member.id)}
          title={`Supprimer ${member.prenom}`}
          className="absolute top-3 right-12 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-ww-muted hover:text-ww-danger hover:bg-ww-surface-2"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      <div className="absolute top-4 right-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-display font-semibold tracking-wide ${pill.bg} ${pill.text}`}>
          <span className={`w-2 h-2 rounded-full ${pill.dot}`} />
          {pill.label}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span
          className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
          style={{ backgroundColor: member.couleur_avatar }}
        >
          {member.avatar_initiales}
        </span>
        <div className="min-w-0">
          <h3 className="font-display font-extrabold text-[22px] uppercase tracking-wide text-ww-text truncate">
            {member.prenom}
          </h3>
          <p className="text-[13px] text-ww-muted font-sans">
            {POSTE_LABELS[member.poste] || member.poste}
          </p>
        </div>
      </div>

      <div className="border-t border-ww-border" />

      {pointage ? (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[11px] text-ww-muted font-sans uppercase tracking-wide">Arrivee</p>
            <p className="font-display font-bold text-base text-[var(--ww-lime)]">
              {pointage.heure_arrivee.replace(':', 'h')}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-ww-muted font-sans uppercase tracking-wide">Depart</p>
            <p className="font-display font-bold text-base text-ww-muted">
              {pointage.heure_depart ? pointage.heure_depart.replace(':', 'h') : '—'}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-ww-muted font-sans uppercase tracking-wide">Duree</p>
            <p className="font-display font-bold text-base text-ww-orange">
              {statut === 'present' ? 'En cours' : formatDuree(dureeMin)}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-ww-muted font-sans text-center py-2">Pas pointe</p>
      )}

      {pointage && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-ww-surface-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                statut === 'present' ? 'bg-[var(--ww-lime)]' : 'bg-ww-orange'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-display font-bold text-ww-muted whitespace-nowrap">
            {formatDuree(dureeMin)} / 8h
          </span>
        </div>
      )}
    </div>
  )
}
