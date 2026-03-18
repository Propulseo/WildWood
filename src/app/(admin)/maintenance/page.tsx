'use client'

import { useState } from 'react'
import { useMaintenance } from '@/lib/hooks/useMaintenance'
import { BungalowMaintenanceCard } from '@/components/maintenance/BungalowMaintenanceCard'
import { AjoutTacheModal } from '@/components/maintenance/AjoutTacheModal'

function MaintenanceSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-9 w-56 bg-ww-surface rounded-lg" />
          <div className="flex gap-3 mt-3">
            <div className="h-7 w-24 bg-ww-surface rounded-full" />
            <div className="h-7 w-28 bg-ww-surface rounded-full" />
            <div className="h-7 w-24 bg-ww-surface rounded-full" />
          </div>
        </div>
        <div className="h-10 w-44 bg-ww-surface rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-ww-surface rounded-xl border border-ww-border" />
        ))}
      </div>
    </div>
  )
}

export default function MaintenancePage() {
  const { bungalows, tasks, countByStatut, getTasksByBungalow, addTask, loading, error, refetch } = useMaintenance()
  const [showAjout, setShowAjout] = useState(false)
  const [ajoutBungalowId, setAjoutBungalowId] = useState('bung-1')

  if (loading) return <MaintenanceSkeleton />
  if (error) return <p className="text-center py-16 text-ww-danger font-sans">{error}</p>

  const aFaire = countByStatut('a_faire')
  const enCours = countByStatut('en_cours')
  const fait = countByStatut('fait')

  function handleSignaler() {
    setAjoutBungalowId('bung-1')
    setShowAjout(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ww-text tracking-tight">
            MAINTENANCE
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-display font-bold bg-ww-danger/15 text-ww-danger">
              {aFaire} A FAIRE
            </span>
            <span className="text-ww-border">·</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-display font-bold bg-ww-orange/15 text-ww-orange">
              {enCours} EN COURS
            </span>
            <span className="text-ww-border">·</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-display font-bold bg-ww-lime/15 text-ww-lime">
              {fait} REGLES
            </span>
          </div>
        </div>

        <button
          onClick={handleSignaler}
          className="px-4 py-2.5 text-sm font-display font-bold text-white bg-ww-orange rounded-lg hover:brightness-110 transition-all active:scale-[0.97] shrink-0"
        >
          + Signaler un probleme
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {bungalows.map((b) => (
          <BungalowMaintenanceCard
            key={b.id}
            bungalowId={b.id}
            bungalowNumero={b.numero}
            tasks={getTasksByBungalow(b.id)}
          />
        ))}
      </div>

      <AjoutTacheModal
        bungalowId={ajoutBungalowId}
        open={showAjout}
        onClose={() => { setShowAjout(false); refetch() }}
        onAdd={addTask}
      />
    </div>
  )
}
