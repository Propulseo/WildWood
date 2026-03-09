'use client'

import { useState } from 'react'
import type { ActiveGymPass } from '@/lib/types'

interface ClientResultCardProps {
  pass: ActiveGymPass
  alreadyCheckedIn: boolean
  onCheckin: (passId: string) => void
}

export function ClientResultCard({ pass, alreadyCheckedIn, onCheckin }: ClientResultCardProps) {
  const [flash, setFlash] = useState(false)
  const initials = pass.clientNom
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  function handleClick() {
    if (alreadyCheckedIn) return
    onCheckin(pass.id)
    setFlash(true)
    setTimeout(() => setFlash(false), 600)
  }

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
        flash
          ? 'bg-[rgba(122,182,72,0.15)] border-ww-lime'
          : 'bg-ww-surface border-ww-border'
      }`}
    >
      <div className="h-10 w-10 rounded-full bg-ww-surface-2 flex items-center justify-center text-sm font-display font-bold text-ww-text shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-sans font-medium text-ww-text truncate">{pass.clientNom}</p>
        <p className="text-xs text-ww-muted font-sans">
          {pass.passNom} &middot; exp. {pass.dateExpiration}
        </p>
      </div>
      <button
        onClick={handleClick}
        disabled={alreadyCheckedIn}
        className={`px-4 py-2 rounded-lg font-display font-bold text-sm uppercase tracking-wide transition-all duration-150 active:scale-[0.97] ${
          alreadyCheckedIn
            ? 'bg-ww-surface-2 text-ww-muted cursor-not-allowed'
            : 'bg-ww-lime text-ww-bg hover:translate-y-[-2px]'
        }`}
      >
        {alreadyCheckedIn ? 'PRESENT' : 'ENREGISTRER'}
      </button>
    </div>
  )
}
