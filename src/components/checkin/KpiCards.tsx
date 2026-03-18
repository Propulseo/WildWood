'use client'

import { useTranslations } from 'next-intl'

interface KpiCardsProps {
  gymCount: number
  residentCount: number
  totalEncaisse: number
}

export function KpiCards({ gymCount, residentCount, totalEncaisse }: KpiCardsProps) {
  const t = useTranslations('checkin')
  const cards = [
    { value: String(gymCount), label: t('gym') },
    { value: String(residentCount), label: t('residents') },
    { value: `฿ ${totalEncaisse.toLocaleString('fr-FR')}`, label: t('collected') },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-ww-surface border border-ww-border rounded-lg p-4"
        >
          <p className="font-display font-extrabold text-4xl text-ww-orange leading-none">
            {card.value}
          </p>
          <p className="font-sans text-[11px] uppercase text-ww-muted tracking-wide mt-2">
            {card.label}
          </p>
        </div>
      ))}
    </div>
  )
}
