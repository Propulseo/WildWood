'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import VueJournaliere from '@/components/comptabilite/vue-journaliere'
import VueMensuelle from '@/components/comptabilite/vue-mensuelle'
import VueAnnuelle from '@/components/comptabilite/vue-annuelle'
import DepenseDialog from '@/components/comptabilite/depense-dialog'

export default function ComptabilitePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Comptabilite</h1>
          <p className="text-muted-foreground">
            Suivi des revenus et depenses
          </p>
        </div>
        <DepenseDialog />
      </div>

      <Tabs defaultValue="journaliere">
        <TabsList>
          <TabsTrigger value="journaliere">Journaliere</TabsTrigger>
          <TabsTrigger value="mensuelle">Mensuelle</TabsTrigger>
          <TabsTrigger value="annuelle">Annuelle</TabsTrigger>
        </TabsList>

        <TabsContent value="journaliere">
          <VueJournaliere />
        </TabsContent>

        <TabsContent value="mensuelle">
          <VueMensuelle />
        </TabsContent>

        <TabsContent value="annuelle">
          <VueAnnuelle />
        </TabsContent>
      </Tabs>
    </div>
  )
}
