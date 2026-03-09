'use client'

import { useState } from 'react'
import type { MaintenanceTask } from '@/lib/types'

export function AjoutTacheModal({
  bungalowId,
  open,
  onClose,
  onAdd,
}: {
  bungalowId: string
  open: boolean
  onClose: () => void
  onAdd: (task: MaintenanceTask) => void
}) {
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [priorite, setPriorite] = useState<MaintenanceTask['priorite']>('normale')

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titre.trim()) return

    const task: MaintenanceTask = {
      id: `maint-${Date.now()}`,
      bungalow_id: bungalowId,
      titre: titre.trim(),
      description: description.trim(),
      priorite,
      statut: 'a_faire',
      date_creation: new Date().toISOString().slice(0, 10),
      date_resolution: null,
      created_by: 'Staff',
      resolved_by: null,
    }

    onAdd(task)
    setTitre('')
    setDescription('')
    setPriorite('normale')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative bg-ww-surface border border-ww-border rounded-xl w-full max-w-md mx-4 p-5">
        <h3 className="font-display text-lg font-bold text-ww-text mb-4">
          Signaler un probleme
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-sans text-ww-muted mb-1 block">Titre *</label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex: Robinet qui goutte"
              className="w-full bg-ww-surface-2 border border-ww-border rounded-lg px-3 py-2 text-sm font-sans text-ww-text placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-orange"
              required
            />
          </div>

          <div>
            <label className="text-xs font-sans text-ww-muted mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details optionnels..."
              rows={2}
              className="w-full bg-ww-surface-2 border border-ww-border rounded-lg px-3 py-2 text-sm font-sans text-ww-text placeholder:text-ww-muted/50 focus:outline-none focus:border-ww-orange resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-sans text-ww-muted mb-1 block">Priorite</label>
            <select
              value={priorite}
              onChange={(e) => setPriorite(e.target.value as MaintenanceTask['priorite'])}
              className="w-full bg-ww-surface-2 border border-ww-border rounded-lg px-3 py-2 text-sm font-sans text-ww-text cursor-pointer focus:outline-none focus:border-ww-orange"
            >
              <option value="haute">Haute</option>
              <option value="normale">Normale</option>
              <option value="basse">Basse</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-sans text-ww-muted border border-ww-border rounded-lg hover:bg-ww-surface-2 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-display font-bold text-white bg-ww-orange rounded-lg hover:brightness-110 transition-all active:scale-[0.97]"
            >
              Signaler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
