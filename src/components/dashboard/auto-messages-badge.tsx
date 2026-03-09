'use client'

import { useMemo } from 'react'
import { parseISO, addDays } from 'date-fns'
import type { Bungalow, TemplateAutomatique } from '@/lib/types'

interface Props {
  bungalows: Bungalow[]
  templates: TemplateAutomatique[]
}

export function AutoMessagesBadge({ bungalows, templates }: Props) {
  const autoCount = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let count = 0
    for (const tpl of templates) {
      if (!tpl.actif) continue
      for (const b of bungalows) {
        for (const r of b.reservations) {
          if (r.statut === 'annulee' || r.statut === 'no_show' || r.statut === 'checked_out') continue
          const ref = tpl.declencheur.includes('arrivee') ? parseISO(r.dateDebut) : parseISO(r.dateFin)
          const trigger = addDays(ref, tpl.delai_jours)
          trigger.setHours(0, 0, 0, 0)
          if (trigger.getTime() === today.getTime()) count++
        }
      }
    }
    return count
  }, [bungalows, templates])

  if (autoCount === 0) return null

  return (
    <div className="text-[13px] font-body text-ww-text px-4 py-2.5 rounded-lg" style={{ background: 'rgba(122,182,72,0.08)', borderLeft: '3px solid var(--ww-lime)' }}>
      &#9993;&#65039; {autoCount} message{autoCount > 1 ? 's' : ''} automatique{autoCount > 1 ? 's' : ''} prevu{autoCount > 1 ? 's' : ''} aujourd&apos;hui
    </div>
  )
}
