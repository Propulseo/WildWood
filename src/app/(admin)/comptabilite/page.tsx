'use client'

import { useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import VueJournaliere from '@/components/comptabilite/vue-journaliere'
import VueMensuelle from '@/components/comptabilite/vue-mensuelle'
import VueHebdomadaire from '@/components/comptabilite/vue-hebdomadaire'
import VueAnnuelle from '@/components/comptabilite/vue-annuelle'
import { ModalDepense } from '@/components/depenses/ModalDepense'
import { useServiettes } from '@/contexts/serviettes-context'
import { ListeEnCours } from '@/components/serviettes/ListeEnCours'
import { isSameMonth, parseISO } from 'date-fns'

export default function ComptabilitePage() {
  const { serviettes } = useServiettes()

  const stats = useMemo(() => {
    const now = new Date()
    const enCours = serviettes.filter((s) => s.statut === 'en_cours')
    const perduesCeMois = serviettes.filter(
      (s) => s.statut === 'perdue' && s.date_retour && isSameMonth(parseISO(s.date_retour), now)
    )
    return {
      nbEnCours: enCours.length,
      depots: enCours.length * 500,
      nbPerdues: perduesCeMois.length,
      revenuPerdues: perduesCeMois.length * 500,
    }
  }, [serviettes])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-extrabold text-ww-text text-3xl">Comptabilite</h1>
          <p className="ww-label">Suivi des revenus et depenses</p>
        </div>
        <ModalDepense />
      </div>

      <Tabs defaultValue="journaliere">
        <TabsList>
          <TabsTrigger value="journaliere">Journaliere</TabsTrigger>
          <TabsTrigger value="hebdomadaire">Hebdomadaire</TabsTrigger>
          <TabsTrigger value="mensuelle">Mensuelle</TabsTrigger>
          <TabsTrigger value="annuelle">Annuelle</TabsTrigger>
        </TabsList>
        <TabsContent value="journaliere"><VueJournaliere /></TabsContent>
        <TabsContent value="hebdomadaire"><VueHebdomadaire /></TabsContent>
        <TabsContent value="mensuelle"><VueMensuelle /></TabsContent>
        <TabsContent value="annuelle"><VueAnnuelle /></TabsContent>
      </Tabs>

      {/* Serviettes section */}
      <div>
        <h2 className="font-display font-bold text-xl text-ww-text mb-3">SERVIETTES</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Card className="p-4">
            <div className="ww-label mb-1">DEPOTS EN CIRCULATION</div>
            <div className="font-display font-extrabold text-2xl text-ww-orange">
              {stats.nbEnCours} serviettes · &#3647; {stats.depots.toLocaleString()}
            </div>
          </Card>
          <Card className="p-4">
            <div className="ww-label mb-1">PERDUES CE MOIS (REVENU)</div>
            <div className="font-display font-extrabold text-2xl text-ww-lime">
              {stats.nbPerdues} perdue{stats.nbPerdues !== 1 ? 's' : ''} · &#3647; {stats.revenuPerdues.toLocaleString()}
            </div>
          </Card>
        </div>
        <ListeEnCours serviettes={serviettes} />
      </div>
    </div>
  )
}
