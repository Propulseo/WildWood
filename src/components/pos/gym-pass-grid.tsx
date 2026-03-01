import type { GymPass } from '@/lib/types'
import { Button } from '@/components/ui/button'

// =============================================================================
// GymPassGrid -- 3x3 grid of gym pass buttons for POS register
// =============================================================================

interface GymPassGridProps {
  gymPasses: GymPass[]
  onSelectPass: (pass: GymPass) => void
}

export function GymPassGrid({ gymPasses, onSelectPass }: GymPassGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      {gymPasses.map((pass) => (
        <Button
          key={pass.id}
          variant="pos"
          size="pos"
          className="flex flex-col items-center justify-center"
          onClick={() => onSelectPass(pass)}
        >
          <span className="font-display uppercase text-base">
            {pass.nom}
          </span>
          <span className="text-wildwood-orange font-bold">
            {pass.prix.toLocaleString()} THB
          </span>
        </Button>
      ))}
    </div>
  )
}
