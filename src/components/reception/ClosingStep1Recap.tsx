'use client'

import { useMemo } from 'react'
import { useReporting } from '@/contexts/reporting-context'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ArrowRight, Receipt } from 'lucide-react'

interface RecapLine {
  label: string
  montant: number
}

export default function ClosingStep1Recap({ onNext }: { onNext: (caJour: number) => void }) {
  const { revenues, mockToday } = useReporting()

  const { lines, total } = useMemo(() => {
    const todayRevs = revenues.filter((r) => r.date === mockToday)

    const groups: Record<string, number> = {}
    for (const r of todayRevs) {
      const key = r.bu === 'GYM'
        ? r.categorie === 'passes_gym' ? 'Passes Gym'
        : r.categorie === 'fnb_bar' ? 'F&B Bar'
        : r.categorie === 'sauna' ? 'Sauna'
        : r.categorie === 'cours_prives' ? 'Cours prives'
        : 'Autre GYM'
        : r.categorie === 'bungalows' ? 'Bungalows'
        : r.categorie === 'services_extras' ? 'Services extras'
        : r.categorie === 'laverie' ? 'Laverie'
        : 'Autre RESORT'
      groups[key] = (groups[key] || 0) + r.montant
    }

    const lines: RecapLine[] = Object.entries(groups)
      .filter(([, m]) => m > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([label, montant]) => ({ label, montant }))

    const total = lines.reduce((s, l) => s + l.montant, 0)
    return { lines, total }
  }, [revenues, mockToday])

  const dateLabel = format(parseISO(mockToday), 'EEEE d MMMM', { locale: fr })

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-ww-orange/15 flex items-center justify-center">
          <Receipt className="h-5 w-5 text-ww-orange" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-ww-text">Recap du jour</h2>
          <p className="text-sm text-ww-muted capitalize">{dateLabel}</p>
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {lines.length === 0 ? (
          <p className="text-ww-muted text-sm py-8 text-center">Aucun revenu enregistre aujourd&apos;hui</p>
        ) : (
          lines.map((l) => (
            <div key={l.label} className="flex items-center justify-between py-2 px-3 rounded-lg bg-ww-surface-2 border border-ww-border/50">
              <span className="text-sm text-ww-text">{l.label}</span>
              <span className="font-display font-bold text-ww-text">
                {l.montant.toLocaleString()} <span className="text-xs text-ww-muted">THB</span>
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-ww-border">
        <div className="flex items-center justify-between mb-4">
          <span className="font-display font-bold text-lg text-ww-text">CA du jour</span>
          <span className="font-display font-extrabold text-2xl text-ww-orange">
            {total.toLocaleString()} <span className="text-sm text-ww-muted">THB</span>
          </span>
        </div>
        <Button onClick={() => onNext(total)} className="w-full gap-2" disabled={total === 0}>
          Passer au comptage <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
