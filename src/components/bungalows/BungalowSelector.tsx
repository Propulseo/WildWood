'use client'

interface BungalowSelectorProps {
  selected: number | null
  onSelect: (num: number) => void
}

export function BungalowSelector({ selected, onSelect }: BungalowSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {[1, 2, 3, 4, 5, 6].map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => onSelect(num)}
          className={`px-3 py-2 rounded-lg text-sm font-display font-bold transition-all duration-150 active:scale-[0.97] ${
            selected === num
              ? 'bg-ww-orange text-white'
              : 'bg-ww-surface-2 text-ww-muted hover:text-ww-text border border-ww-border'
          }`}
        >
          Bungalow {num}
        </button>
      ))}
    </div>
  )
}
