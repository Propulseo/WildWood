'use client'

interface LiveCounterProps {
  count: number
}

export function LiveCounter({ count }: LiveCounterProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ww-orange opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-ww-orange" />
      </span>
      <span className="font-display font-bold text-[28px] text-ww-orange">
        {count}
      </span>
      <span className="text-ww-muted text-sm font-sans">
        entree{count !== 1 ? 's' : ''} aujourd&apos;hui
      </span>
    </div>
  )
}
