'use client'

import type { MaintenanceTask } from '@/lib/types'
import { Trash2 } from 'lucide-react'

const PRIORITE_LABELS: Record<MaintenanceTask['priorite'], string> = {
  haute: 'HAUTE',
  normale: 'NORMALE',
  basse: 'BASSE',
}

const PRIORITE_COLORS: Record<MaintenanceTask['priorite'], string> = {
  haute: 'text-ww-danger',
  normale: 'text-ww-orange',
  basse: 'text-ww-muted',
}

const STATUT_OPTIONS: { value: MaintenanceTask['statut']; label: string }[] = [
  { value: 'a_faire', label: 'A faire' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'fait', label: 'Regle' },
]

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}`
}

export function TacheItem({
  task,
  onChangeStatut,
  onDelete,
}: {
  task: MaintenanceTask
  onChangeStatut: (taskId: string, statut: MaintenanceTask['statut']) => void
  onDelete: (taskId: string) => void
}) {
  const isFait = task.statut === 'fait'

  return (
    <div
      className={`rounded-lg border border-ww-border bg-ww-surface p-3 transition-all duration-150 ${
        isFait ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[11px] font-display font-bold uppercase ${PRIORITE_COLORS[task.priorite]}`}>
              {PRIORITE_LABELS[task.priorite]}
            </span>
            <span className="font-sans text-sm font-medium text-ww-text truncate">
              {task.titre}
            </span>
          </div>
          {task.description && (
            <p className="text-xs text-ww-muted font-sans mb-1.5">{task.description}</p>
          )}
          <p className="text-[11px] text-ww-muted font-sans">
            Signale le {formatDate(task.date_creation)} par {task.created_by}
            {task.date_resolution && task.resolved_by && (
              <span className="text-ww-lime"> — Regle le {formatDate(task.date_resolution)} par {task.resolved_by}</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-ww-border/50">
        <select
          value={task.statut}
          onChange={(e) => onChangeStatut(task.id, e.target.value as MaintenanceTask['statut'])}
          className="text-xs font-sans bg-ww-surface-2 border border-ww-border rounded-md px-2 py-1 text-ww-text cursor-pointer focus:outline-none focus:border-ww-orange"
        >
          {STATUT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="text-ww-muted hover:text-ww-danger transition-colors p-1 rounded hover:bg-ww-surface-2"
          title="Supprimer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
