'use client'

import { useMemo } from 'react'
import { useClosings } from '@/contexts/closings-context'
import { useReporting } from '@/contexts/reporting-context'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react'

export default function ClosingCard() {
  const { closings, updateStatut } = useClosings()
  const { mockToday } = useReporting()

  const pending = useMemo(
    () => closings.filter((c) => c.date === mockToday && c.statut === 'soumis'),
    [closings, mockToday]
  )

  if (pending.length === 0) return null

  return (
    <div className="space-y-3">
      {pending.map((c) => (
        <div
          key={c.id}
          className="bg-ww-surface border border-ww-orange/40 rounded-xl p-5"
          style={{ borderLeftWidth: 3, borderLeftColor: 'var(--ww-orange)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-ww-orange" />
            <span className="font-display font-bold text-ww-orange text-sm">
              Closing en attente de validation
            </span>
            <span className="text-xs text-ww-muted ml-auto">
              par {c.soumis_par} a {c.soumis_a}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <MiniBlock label="CA du jour" value={c.ca_jour} />
            <MiniBlock label="Cash compte" value={c.cash_compte} />
            <div className="p-2 rounded-lg bg-ww-bg border border-ww-border/50">
              <p className="text-[10px] text-ww-muted uppercase">Ecart</p>
              <p className={`font-display font-bold text-lg ${
                Math.abs(c.ecart) <= 50 ? 'text-ww-lime' : 'text-ww-danger'
              }`}>
                {c.ecart >= 0 ? '+' : ''}{c.ecart.toLocaleString()}
              </p>
            </div>
          </div>

          {c.note_ecart && (
            <p className="text-xs text-ww-muted mb-4 italic">
              Note: {c.note_ecart}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => updateStatut(c.id, 'valide_admin', 'Admin')}
              size="sm"
              className="gap-1.5 flex-1"
            >
              <CheckCircle className="h-3.5 w-3.5" /> Valider
            </Button>
            <Button
              onClick={() => updateStatut(c.id, 'litige', 'Admin')}
              variant="outline"
              size="sm"
              className="gap-1.5 text-ww-danger border-ww-danger/30 hover:bg-ww-danger/10"
            >
              <AlertTriangle className="h-3.5 w-3.5" /> Litige
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

function MiniBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-2 rounded-lg bg-ww-bg border border-ww-border/50">
      <p className="text-[10px] text-ww-muted uppercase">{label}</p>
      <p className="font-display font-bold text-lg text-ww-text">
        {value.toLocaleString()}
      </p>
    </div>
  )
}
