'use client'

import { useState, useRef } from 'react'
import type { StaffMember, Pointage } from '@/lib/types'
import { Check } from 'lucide-react'

function formatHeure(h: string) {
  return h.replace(':', 'h')
}

function heuresTravaillees(arrivee: string, depart: string): string {
  const [ah, am] = arrivee.split(':').map(Number)
  const [dh, dm] = depart.split(':').map(Number)
  const totalMin = (dh * 60 + dm) - (ah * 60 + am)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return `${h}h${String(m).padStart(2, '0')}`
}

function progressPct(arrivee: string): number {
  const [ah, am] = arrivee.split(':').map(Number)
  const startMin = ah * 60 + am
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const worked = Math.max(0, nowMin - startMin)
  return Math.min(100, (worked / 480) * 100) // 480 = 8h base
}

interface StaffCardProps {
  member: StaffMember
  pointage: Pointage | undefined
  onArrivee: () => void
  onDepart: () => void
  onPause: () => void
  onFinPause: () => void
}

export function StaffCard({ member, pointage, onArrivee, onDepart, onPause, onFinPause }: StaffCardProps) {
  const [flash, setFlash] = useState(false)
  const [glowColor, setGlowColor] = useState<'lime' | 'danger' | 'orange' | null>(null)
  const flashTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const glowTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isArrive = !!pointage
  const isParti = !!pointage?.heure_depart
  const enPause = !!pointage?.en_pause

  function triggerFeedback(color: 'lime' | 'danger' | 'orange') {
    setFlash(true)
    setGlowColor(color)
    if (flashTimeout.current) clearTimeout(flashTimeout.current)
    if (glowTimeout.current) clearTimeout(glowTimeout.current)
    flashTimeout.current = setTimeout(() => setFlash(false), 300)
    glowTimeout.current = setTimeout(() => setGlowColor(null), 500)
  }

  function handleArrivee() {
    triggerFeedback('lime')
    onArrivee()
  }

  function handleDepart() {
    triggerFeedback('danger')
    onDepart()
  }

  function handlePause() {
    triggerFeedback('orange')
    onPause()
  }

  function handleFinPause() {
    triggerFeedback('lime')
    onFinPause()
  }

  // Card styles based on state
  const cardBorder = isArrive && !isParti && enPause
    ? 'border-2 border-[var(--ww-orange)] shadow-[0_0_16px_var(--ww-orange-glow)]'
    : isArrive && !isParti
    ? 'border-2 border-[var(--ww-lime)] shadow-[0_0_16px_var(--ww-lime-glow)]'
    : 'border border-ww-border'
  const cardOpacity = isParti ? 'opacity-50' : ''
  const flashScale = flash ? 'scale-[1.05]' : 'scale-100'

  // Avatar glow
  const avatarGlow = glowColor === 'lime'
    ? 'shadow-[0_0_16px_var(--ww-lime)]'
    : glowColor === 'danger'
    ? 'shadow-[0_0_16px_var(--ww-danger)]'
    : glowColor === 'orange'
    ? 'shadow-[0_0_16px_var(--ww-orange)]'
    : ''

  return (
    <div
      className={`relative bg-ww-surface rounded-xl p-5 flex flex-col items-center gap-3 transition-all duration-300 ${cardBorder} ${cardOpacity} ${flashScale}`}
    >
      {/* Checkmark for "parti" */}
      {isParti && (
        <div className="absolute top-3 right-3">
          <Check className="h-4 w-4 text-ww-muted" />
        </div>
      )}

      {/* Avatar */}
      <div
        className={`w-[72px] h-[72px] rounded-full flex items-center justify-center text-xl font-display font-bold text-white transition-shadow duration-500 ${avatarGlow}`}
        style={{ backgroundColor: member.couleur_avatar }}
      >
        {member.avatar_initiales}
      </div>

      {/* Name + role */}
      <div className="text-center">
        <p className="font-display font-bold text-xl text-ww-text">
          {member.prenom}
        </p>
        <p className="font-sans text-[13px] text-ww-muted">
          {member.poste === 'reception' ? 'Reception' : member.poste === 'bar' ? 'Bar' : 'Admin'}
        </p>
      </div>

      {/* Status info */}
      {isArrive && !isParti && !enPause && pointage && (
        <p className="text-sm font-sans text-[var(--ww-lime)]">
          Arrive · {formatHeure(pointage.heure_arrivee)}
        </p>
      )}
      {isArrive && !isParti && enPause && pointage && (
        <p className="text-sm font-sans text-[var(--ww-orange)]">
          En pause · {formatHeure(pointage.heure_pause!)}
        </p>
      )}
      {isParti && pointage && (
        <p className="text-sm font-sans text-ww-muted">
          {formatHeure(pointage.heure_arrivee)} → {formatHeure(pointage.heure_depart!)} · {heuresTravaillees(pointage.heure_arrivee, pointage.heure_depart!)}
        </p>
      )}

      {/* Action buttons */}
      {!isArrive && (
        <button
          onClick={handleArrivee}
          className="w-full h-[52px] rounded-lg bg-[var(--ww-lime)] text-white font-display font-bold text-base uppercase tracking-wider transition-all duration-150 hover:brightness-110 active:scale-[0.97]"
        >
          ▶ ARRIVEE
        </button>
      )}
      {isArrive && !isParti && !enPause && (
        <div className="w-full flex gap-2">
          <button
            onClick={handlePause}
            className="flex-1 h-[44px] rounded-lg bg-[var(--ww-orange)] text-white font-display font-bold text-sm uppercase tracking-wider transition-all duration-150 hover:brightness-110 active:scale-[0.97]"
          >
            ⏸ PAUSE
          </button>
          <button
            onClick={handleDepart}
            className="flex-1 h-[44px] rounded-lg bg-ww-danger text-white font-display font-bold text-sm uppercase tracking-wider transition-all duration-150 hover:brightness-110 active:scale-[0.97]"
          >
            ■ DEPART
          </button>
        </div>
      )}
      {isArrive && !isParti && enPause && (
        <div className="w-full flex gap-2">
          <button
            onClick={handleFinPause}
            className="flex-1 h-[44px] rounded-lg bg-[var(--ww-lime)] text-white font-display font-bold text-sm uppercase tracking-wider transition-all duration-150 hover:brightness-110 active:scale-[0.97]"
          >
            ▶ REPRISE
          </button>
          <button
            onClick={handleDepart}
            className="flex-1 h-[44px] rounded-lg bg-ww-danger text-white font-display font-bold text-sm uppercase tracking-wider transition-all duration-150 hover:brightness-110 active:scale-[0.97]"
          >
            ■ DEPART
          </button>
        </div>
      )}

      {/* Progress bar (present state only) */}
      {isArrive && !isParti && pointage && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-ww-surface-2 rounded-b-xl overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${enPause ? 'bg-[var(--ww-orange)] animate-pulse' : 'bg-[var(--ww-lime)]'}`}
            style={{ width: `${progressPct(pointage.heure_arrivee)}%` }}
          />
        </div>
      )}
    </div>
  )
}
