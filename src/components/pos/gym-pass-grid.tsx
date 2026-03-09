import type { GymPass } from '@/lib/types'

// =============================================================================
// GymPassGrid -- 2x2 grid of gym pass buttons for POS register
// =============================================================================

interface GymPassGridProps {
  gymPasses: GymPass[]
  onSelectPass: (pass: GymPass) => void
}

export function GymPassGrid({ gymPasses, onSelectPass }: GymPassGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-5">
      {gymPasses.map((pass) => {
        const isGuest = pass.prix === 0
        return (
          <button
            key={pass.id}
            onClick={() => onSelectPass(pass)}
            className={`rounded-xl py-4 px-3 flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] cursor-pointer border-2 ${
              isGuest
                ? 'bg-ww-lime/10 border-ww-lime/40 hover:border-ww-lime hover:shadow-[0_0_16px_var(--ww-lime-glow)]'
                : 'bg-ww-surface border-ww-border hover:border-ww-orange hover:shadow-[0_0_16px_var(--ww-orange-glow)]'
            }`}
          >
            <span className="font-display font-extrabold text-xl text-ww-text uppercase tracking-tight leading-tight text-center">
              {pass.nom}
            </span>
            <span className={`font-display font-bold text-base ${isGuest ? 'text-ww-lime' : 'text-ww-orange'}`}>
              {isGuest ? 'GRATUIT' : `${pass.prix.toLocaleString()} THB`}
            </span>
          </button>
        )
      })}
    </div>
  )
}
