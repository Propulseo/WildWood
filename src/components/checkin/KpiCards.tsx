'use client'

interface KpiCardsProps {
  gymCount: number
  residentCount: number
  totalEncaisse: number
}

export function KpiCards({ gymCount, residentCount, totalEncaisse }: KpiCardsProps) {
  const cards = [
    { value: String(gymCount), label: 'GYM' },
    { value: String(residentCount), label: 'RESIDENTS' },
    { value: `฿ ${totalEncaisse.toLocaleString('fr-FR')}`, label: 'ENCAISSES' },
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
