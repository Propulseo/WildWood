'use client'

interface PresenceKpiCardsProps {
  presentsToday: number
  enCoursCount: number
  heuresTotal: string
}

export function PresenceKpiCards({ presentsToday, enCoursCount, heuresTotal }: PresenceKpiCardsProps) {
  const cards = [
    { value: String(presentsToday), label: 'PRESENTS', sub: "AUJOURD'HUI" },
    { value: String(enCoursCount), label: 'EN COURS', sub: 'DE SHIFT' },
    { value: heuresTotal, label: 'HEURES TOTALES', sub: 'CETTE SEMAINE' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-ww-surface border border-ww-border rounded-lg p-5"
        >
          <p className="font-display font-extrabold text-4xl text-ww-orange leading-none">
            {card.value}
          </p>
          <p className="font-sans text-[11px] uppercase text-ww-muted tracking-wide mt-2">
            {card.label}
          </p>
          <p className="font-sans text-[11px] uppercase text-ww-muted tracking-wide">
            {card.sub}
          </p>
        </div>
      ))}
    </div>
  )
}
