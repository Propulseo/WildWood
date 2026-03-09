'use client'

import { useState, useMemo } from 'react'
import { X } from 'lucide-react'
import type { MaintenanceTask } from '@/lib/types'
import { useMaintenance } from '@/contexts/maintenance-context'
import { TacheItem } from './TacheItem'
import { AjoutTacheModal } from './AjoutTacheModal'

type FilterTab = 'toutes' | 'a_faire' | 'en_cours' | 'fait'

const TABS: { value: FilterTab; label: string }[] = [
  { value: 'toutes', label: 'TOUTES' },
  { value: 'a_faire', label: 'A FAIRE' },
  { value: 'en_cours', label: 'EN COURS' },
  { value: 'fait', label: 'REGLEES' },
]

export function MaintenanceModal({
  bungalowId,
  bungalowNumero,
  open,
  onClose,
}: {
  bungalowId: string
  bungalowNumero: number
  open: boolean
  onClose: () => void
}) {
  const { getTasksByBungalow, updateTaskStatut, deleteTask, addTask } = useMaintenance()
  const [activeTab, setActiveTab] = useState<FilterTab>('toutes')
  const [showAjout, setShowAjout] = useState(false)

  const allTasks = getTasksByBungalow(bungalowId)

  const filtered = useMemo(() => {
    const list = activeTab === 'toutes'
      ? allTasks
      : allTasks.filter((t) => t.statut === activeTab)

    return [...list].sort((a, b) => {
      if (a.statut === 'fait' && b.statut !== 'fait') return 1
      if (a.statut !== 'fait' && b.statut === 'fait') return -1
      const prio = { haute: 0, normale: 1, basse: 2 }
      return prio[a.priorite] - prio[b.priorite]
    })
  }, [allTasks, activeTab])

  if (!open) return null

  function handleChangeStatut(taskId: string, statut: MaintenanceTask['statut']) {
    updateTaskStatut(taskId, statut, 'Staff')
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />

        <div className="relative bg-ww-bg border border-ww-border rounded-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-ww-border shrink-0">
            <h2 className="font-display text-xl font-extrabold text-ww-text">
              BUNGALOW {bungalowNumero}
              <span className="text-ww-muted text-sm font-sans font-normal ml-2">
                {allTasks.length} tache{allTasks.length > 1 ? 's' : ''}
              </span>
            </h2>
            <button
              onClick={onClose}
              className="text-ww-muted hover:text-ww-text p-1 rounded hover:bg-ww-surface-2 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-4 pt-3 shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3 py-1.5 text-xs font-display font-bold rounded-md transition-all duration-150 ${
                  activeTab === tab.value
                    ? 'bg-ww-orange text-white'
                    : 'text-ww-muted hover:bg-ww-surface-2 hover:text-ww-text'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Task list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
            {filtered.length === 0 ? (
              <p className="text-center text-ww-muted text-sm font-sans py-8">
                Aucune tache
              </p>
            ) : (
              filtered.map((task) => (
                <TacheItem
                  key={task.id}
                  task={task}
                  onChangeStatut={handleChangeStatut}
                  onDelete={deleteTask}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-ww-border shrink-0">
            <button
              onClick={() => setShowAjout(true)}
              className="w-full px-4 py-2.5 text-sm font-display font-bold text-white bg-ww-orange rounded-lg hover:brightness-110 transition-all active:scale-[0.97]"
            >
              + Ajouter une tache
            </button>
          </div>
        </div>
      </div>

      <AjoutTacheModal
        bungalowId={bungalowId}
        open={showAjout}
        onClose={() => setShowAjout(false)}
        onAdd={addTask}
      />
    </>
  )
}
