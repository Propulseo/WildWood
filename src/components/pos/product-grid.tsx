import type { GymPass, FnbProduct } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GymPassGrid } from './gym-pass-grid'
import { FnbGrid } from './fnb-grid'

// =============================================================================
// ProductGrid -- Tabbed container switching between Passes Gym and F&B grids
// =============================================================================

interface ProductGridProps {
  gymPasses: GymPass[]
  fnbProducts: FnbProduct[]
  onSelectGymPass: (pass: GymPass) => void
  onAddFnbItem: (product: FnbProduct) => void
}

export function ProductGrid({
  gymPasses,
  fnbProducts,
  onSelectGymPass,
  onAddFnbItem,
}: ProductGridProps) {
  return (
    <Tabs defaultValue="gym" className="flex flex-col h-full">
      <TabsList className="w-full h-12 grid grid-cols-2 bg-secondary">
        <TabsTrigger
          value="gym"
          className="text-base font-display uppercase data-[state=active]:bg-wildwood-orange data-[state=active]:text-white"
        >
          Passes Gym
        </TabsTrigger>
        <TabsTrigger
          value="fnb"
          className="text-base font-display uppercase data-[state=active]:bg-wildwood-orange data-[state=active]:text-white"
        >
          F&B
        </TabsTrigger>
      </TabsList>

      <TabsContent value="gym" className="flex-1 overflow-hidden">
        <GymPassGrid gymPasses={gymPasses} onSelectPass={onSelectGymPass} />
      </TabsContent>

      <TabsContent value="fnb" className="flex-1 overflow-hidden">
        <FnbGrid fnbProducts={fnbProducts} onAddItem={onAddFnbItem} />
      </TabsContent>
    </Tabs>
  )
}
