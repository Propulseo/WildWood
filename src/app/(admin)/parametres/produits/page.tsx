'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PassesTab } from '@/components/parametres/PassesTab'
import { FnbTab } from '@/components/parametres/FnbTab'

const tabClass =
  'font-display font-bold uppercase tracking-wider data-[state=active]:bg-ww-orange data-[state=active]:text-white'

export default function ProduitsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-wider text-ww-text">
        Gestion des produits
      </h1>

      <Tabs defaultValue="gym" className="w-full">
        <TabsList className="bg-ww-surface-2 border border-ww-border">
          <TabsTrigger value="gym" className={tabClass}>
            PASSES GYM
          </TabsTrigger>
          <TabsTrigger value="fnb" className={tabClass}>
            F&B
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gym" className="mt-6">
          <PassesTab />
        </TabsContent>
        <TabsContent value="fnb" className="mt-6">
          <FnbTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
