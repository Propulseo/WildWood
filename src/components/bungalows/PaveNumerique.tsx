'use client'

const BILLETS = [500, 600, 700, 1000, 1500, 2000] as const

interface PaveNumeriqueProps {
  total: number
  onSelect: (value: number) => void
}

export function PaveNumerique({ total, onSelect }: PaveNumeriqueProps) {
  const relevant = BILLETS.filter((b) => b >= total).slice(0, 4)
  if (relevant.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelect(total)}
        className="px-4 py-2.5 rounded-xl text-sm font-display font-bold bg-ww-lime/15 text-ww-lime border border-ww-lime/30 hover:bg-ww-lime/25 transition-colors"
      >
        Exact
      </button>
      {relevant.map((billet) => (
        <button
          key={billet}
          type="button"
          onClick={() => onSelect(billet)}
          className="px-4 py-2.5 rounded-xl text-sm font-display font-bold bg-ww-surface-2 text-ww-text border border-ww-border hover:border-ww-orange/50 transition-colors"
        >
          ฿ {billet.toLocaleString()}
        </button>
      ))}
    </div>
  )
}
