'use client'

import { useState } from 'react'
import type { MaintenanceTask } from '@/lib/types'
import { MaintenanceModal } from './MaintenanceModal'
import { AlertTriangle } from 'lucide-react'

const STATUT_COLOR: Record<MaintenanceTask['statut'], string> = {
  a_faire: 'bg-ww-danger',
  en_cours: 'bg-ww-orange',
  fait: 'bg-ww-lime',
}

export function BungalowMaintenanceCard({
  bungalowId,
  bungalowNumero,
  tasks,
}: {
  bungalowId: string
  bungalowNumero: number
  tasks: MaintenanceTask[]
}) {
  const [showModal, setShowModal] = useState(false)

  const aFaire = tasks.filter((t) => t.statut === 'a_faire').length
  const sorted = [...tasks].sort((a, b) => {
    const order = { a_faire: 0, en_cours: 1, fait: 2 }
    return order[a.statut] - order[b.statut]
  })

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="w-full text-left bg-ww-surface border border-ww-border rounded-xl p-4 hover:border-ww-orange/50 hover:-translate-y-[2px] transition-all duration-150 active:scale-[0.97] cursor-pointer"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-display text-sm font-bold text-ww-text uppercase tracking-wide">
            Bungalow {bungalowNumero}
          </span>
          {aFaire > 0 && (
            <span className="bg-ww-danger text-white text-[11px] font-display font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              {aFaire} <AlertTriangle className="h-3 w-3" />
            </span>
          )}
        </div>

        <div className="h-px bg-ww-border mb-2.5" />

        {/* Task list preview */}
        <div className="space-y-1.5">
          {sorted.length === 0 ? (
            <p className="text-xs text-ww-lime font-sans">{'\u2713'} RAS</p>
          ) : (
            sorted.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-2 text-xs font-sans ${
                  task.statut === 'fait' ? 'opacity-50' : ''
                }`}
              >
                <span className={`shrink-0 w-2 h-2 rounded-full ${STATUT_COLOR[task.statut]}`} />
                <span className="text-ww-text truncate">{task.titre}</span>
              </div>
            ))
          )}
        </div>
      </button>

      <MaintenanceModal
        bungalowId={bungalowId}
        bungalowNumero={bungalowNumero}
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}
