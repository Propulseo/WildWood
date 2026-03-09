'use client'

import { useMessagesWA } from '@/contexts/messages-wa-context'
import { MessageCard } from './MessageCard'

const TODAY = '2026-03-09'

export function MessagesPlanifies() {
  const { getMessagesPlanifies } = useMessagesWA()
  const planifies = getMessagesPlanifies()

  const aujourdhui = planifies.filter((m) => m.planifie_le <= TODAY)
  const cetteSemaine = planifies.filter((m) => {
    if (m.planifie_le <= TODAY) return false
    const d = new Date(m.planifie_le)
    const end = new Date(TODAY)
    end.setDate(end.getDate() + 7)
    return d <= end
  })

  if (planifies.length === 0) {
    return (
      <div className="bg-ww-surface border border-ww-border rounded-xl p-6">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ww-muted">
          Messages planifies
        </h2>
        <p className="text-sm text-ww-muted mt-3">Aucun message planifie</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {aujourdhui.length > 0 && (
        <div className="bg-ww-surface border border-ww-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ww-text">
              A envoyer aujourd&apos;hui
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-display font-bold rounded-full bg-ww-orange text-ww-bg">
              {aujourdhui.length}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {aujourdhui.map((m) => (
              <MessageCard key={m.id} message={m} />
            ))}
          </div>
        </div>
      )}

      {cetteSemaine.length > 0 && (
        <div className="bg-ww-surface border border-ww-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ww-muted">
              Cette semaine
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-display font-bold rounded-full bg-ww-surface-2 text-ww-muted">
              {cetteSemaine.length}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {cetteSemaine.map((m) => (
              <MessageCard key={m.id} message={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
