'use client'

import type { GymPass, FnbProduct } from '@/lib/types'
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PassesGym } from './PassesGym'
import { FnbGrid } from './fnb-grid'
import { MembresTab } from './MembresTab'
import { ServiettesTab } from '@/components/serviettes/ServiettesTab'
export type TabId = 'gym' | 'fnb' | 'serviettes' | 'membres'

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
  const t = useTranslations('pos')
  const activeDefault = defaultTab ?? visibleTabs[0]
  const showTabs = visibleTabs.length > 1

  return (
    <Tabs defaultValue={activeDefault} className="flex flex-col h-full">
      {showTabs && (
        <TabsList className={`w-full h-14 grid rounded-none bg-ww-surface-2 p-0 gap-0`} style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, 1fr)` }}>
          {visibleTabs.includes('gym') && <TabsTrigger value="gym" className={tabClass}>{t('gymPasses').toUpperCase()}</TabsTrigger>}
          {visibleTabs.includes('fnb') && <TabsTrigger value="fnb" className={tabClass}>{t('fnb')}</TabsTrigger>}
          {visibleTabs.includes('membres') && <TabsTrigger value="membres" className={tabClass}>MEMBRES</TabsTrigger>}
          {visibleTabs.includes('serviettes') && <TabsTrigger value="serviettes" className={tabClass}>{t('towels').toUpperCase()}</TabsTrigger>}
        </TabsList>
      )}

      {visibleTabs.includes('gym') && (
        <TabsContent value="gym" className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto min-h-0">
            <PassesGym />
          </div>
        </TabsContent>
      )}

      {visibleTabs.includes('fnb') && (
        <TabsContent value="fnb" className="flex-1 overflow-auto">
          <FnbGrid fnbProducts={fnbProducts} onAddItem={onAddFnbItem} />
        </TabsContent>
      )}

      {visibleTabs.includes('membres') && (
        <TabsContent value="membres" className="flex-1 overflow-hidden">
          <MembresTab />
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
