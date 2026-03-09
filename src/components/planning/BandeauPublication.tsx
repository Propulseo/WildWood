'use client'

interface BandeauPublicationProps {
  weekLabel: string
  hasUnpublished: boolean
  onPublier: () => void
}

export function BandeauPublication({ weekLabel, hasUnpublished, onPublier }: BandeauPublicationProps) {
  if (!hasUnpublished) return null

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-xl bg-amber-900/30 border border-amber-700/40 text-sm">
      <p className="text-amber-200 font-body">
        <span className="mr-1.5">⚠️</span>
        Ce planning contient des shifts non publies — le staff ne les voit pas encore
      </p>
      <button
        onClick={onPublier}
        className="shrink-0 px-4 py-1.5 rounded-lg font-display font-bold text-xs uppercase tracking-wide text-ww-bg transition-all hover:-translate-y-0.5 active:scale-[0.97]"
        style={{ backgroundColor: 'var(--ww-lime)' }}
      >
        Publier la semaine &rarr;
      </button>
    </div>
  )
}
