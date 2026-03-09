import type { GymPass, FnbProduct } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GymPassGrid } from './gym-pass-grid'
import { FnbGrid } from './fnb-grid'
import { ServiettesTab } from '@/components/serviettes/ServiettesTab'
import { CheckinSection } from './CheckinSection'
type TabId = 'gym' | 'fnb' | 'serviettes'

interface ProductGridProps {
  gymPasses: GymPass[]
  fnbProducts: FnbProduct[]
  onSelectGymPass: (pass: GymPass) => void
  onAddFnbItem: (product: FnbProduct) => void
  visibleTabs?: TabId[]
  defaultTab?: TabId
}

const tabClass = "rounded-none h-full font-display text-lg font-bold uppercase tracking-wider text-ww-muted data-[state=active]:bg-ww-orange data-[state=active]:text-white data-[state=active]:shadow-none transition-all duration-200"

export function ProductGrid({
  gymPasses, fnbProducts, onSelectGymPass, onAddFnbItem,
  visibleTabs = ['gym', 'fnb', 'serviettes'],
  defaultTab,
}: ProductGridProps) {
  const activeDefault = defaultTab ?? visibleTabs[0]
  const showTabs = visibleTabs.length > 1

  return (
    <Tabs defaultValue={activeDefault} className="flex flex-col h-full">
      {showTabs && (
        <TabsList className={`w-full h-14 grid rounded-none bg-ww-surface-2 p-0 gap-0`} style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, 1fr)` }}>
          {visibleTabs.includes('gym') && <TabsTrigger value="gym" className={tabClass}>PASSES GYM</TabsTrigger>}
          {visibleTabs.includes('fnb') && <TabsTrigger value="fnb" className={tabClass}>F&B</TabsTrigger>}
          {visibleTabs.includes('serviettes') && <TabsTrigger value="serviettes" className={tabClass}>SERVIETTES</TabsTrigger>}
        </TabsList>
      )}

      {visibleTabs.includes('gym') && (
        <TabsContent value="gym" className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto min-h-0">
            <GymPassGrid gymPasses={gymPasses} onSelectPass={onSelectGymPass} />
          </div>
          <CheckinSection />
        </TabsContent>
      )}

      {visibleTabs.includes('fnb') && (
        <TabsContent value="fnb" className="flex-1 overflow-auto">
          <FnbGrid fnbProducts={fnbProducts} onAddItem={onAddFnbItem} />
        </TabsContent>
      )}

      {visibleTabs.includes('serviettes') && (
        <TabsContent value="serviettes" className="flex-1 overflow-auto">
          <ServiettesTab />
        </TabsContent>
      )}
    </Tabs>
  )
}
