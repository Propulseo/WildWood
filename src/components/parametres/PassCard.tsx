import type { GymPass } from '@/lib/types'
import { Pencil, Trash2 } from 'lucide-react'

interface PassCardProps {
  pass: GymPass
  onEdit: (pass: GymPass) => void
  onDelete: (pass: GymPass) => void
}

export function PassCard({ pass, onEdit, onDelete }: PassCardProps) {
  const isActive = pass.actif !== false

  return (
    <div
      className={`bg-ww-surface border border-ww-border rounded-xl p-4 flex items-center justify-between transition-all duration-200 hover:border-ww-wood/50 ${
        !isActive ? 'opacity-50' : ''
      }`}
    >
      <div className="flex flex-col gap-1">
        <span className="font-display font-bold text-lg text-ww-text uppercase tracking-tight">
          {pass.nom}
        </span>
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-ww-orange">
            &#3647; {pass.prix.toLocaleString()}
          </span>
          <span className="text-xs text-ww-muted font-sans">
            {pass.dureeJours} jour{pass.dureeJours > 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isActive ? 'bg-ww-success' : 'bg-ww-muted'
            }`}
          />
          <span className="text-xs font-sans text-ww-muted">
            {isActive ? 'Actif' : 'Inactif'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(pass)}
          className="p-2 rounded-lg text-ww-muted hover:text-ww-orange hover:bg-ww-surface-2 transition-all duration-150 cursor-pointer"
          title="Modifier"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(pass)}
          className="p-2 rounded-lg text-ww-muted hover:text-ww-danger hover:bg-ww-surface-2 transition-all duration-150 cursor-pointer"
          title="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
