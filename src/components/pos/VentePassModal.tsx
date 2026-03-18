'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Minus, Plus, X } from 'lucide-react'
import { vendrePass } from '@/lib/supabase/queries/gym'
import type { GymPass } from '@/lib/types'

interface VentePassModalProps {
  pass: GymPass
  staffId?: string
  onClose: () => void
}

export function VentePassModal({ pass, staffId, onClose }: VentePassModalProps) {
  const [nom, setNom] = useState('')
  const [pax, setPax] = useState(1)
  const [loading, setLoading] = useState(false)

  const total = pass.prix * pax
  const isFree = pass.prix === 0

  async function handleEncaisser() {
    if (!nom.trim()) return
    setLoading(true)
    try {
      for (let i = 0; i < pax; i++) {
        await vendrePass({
          clientNom: nom.trim(),
          typePass: pass.slug,
          passNom: pass.nom,
          prixPaye: pass.prix,
          dureeJours: pass.dureeJours,
          staffId,
        })
      }
      const desc = pax > 1
        ? `${nom.trim()} — ${pax} pax · ฿ ${total.toLocaleString('fr-FR')}`
        : `${nom.trim()} — ฿ ${pass.prix.toLocaleString('fr-FR')}`
      toast.success(`Pass ${pass.nom} vendu`, { description: desc })
      onClose()
    } catch (e) {
      toast.error('Erreur vente pass', {
        description: e instanceof Error ? e.message : 'Erreur inconnue',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-md bg-ww-surface border border-ww-border rounded-t-2xl sm:rounded-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-extrabold text-xl text-ww-text uppercase tracking-tight">
              {pass.nom}
            </h3>
            <p className="font-display font-bold text-ww-orange">
              {isFree ? 'GRATUIT' : `฿ ${pass.prix.toLocaleString('fr-FR')} / pers.`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-ww-muted hover:text-ww-text hover:bg-ww-surface-2 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Prenom */}
        <div>
          <label className="block text-xs font-sans text-ww-muted mb-1.5 uppercase tracking-wider">
            Prenom du client
          </label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex: John"
            autoFocus
            className="w-full h-12 px-4 rounded-lg bg-ww-bg border border-ww-border text-base text-ww-text font-sans placeholder:text-ww-muted focus:outline-none focus:border-ww-orange transition-colors"
          />
        </div>

        {/* Pax */}
        <div>
          <label className="block text-xs font-sans text-ww-muted mb-1.5 uppercase tracking-wider">
            Nombre de personnes
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPax((p) => Math.max(1, p - 1))}
              disabled={pax <= 1}
              className="w-12 h-12 rounded-lg bg-ww-bg border border-ww-border flex items-center justify-center text-ww-text hover:border-ww-orange transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-default"
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="font-display font-extrabold text-3xl text-ww-text w-12 text-center">
              {pax}
            </span>
            <button
              onClick={() => setPax((p) => Math.min(20, p + 1))}
              disabled={pax >= 20}
              className="w-12 h-12 rounded-lg bg-ww-bg border border-ww-border flex items-center justify-center text-ww-text hover:border-ww-orange transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-default"
            >
              <Plus className="h-5 w-5" />
            </button>
            {pax > 1 && !isFree && (
              <span className="text-sm text-ww-muted font-sans ml-auto">
                {pax} × ฿ {pass.prix.toLocaleString('fr-FR')}
              </span>
            )}
          </div>
        </div>

        {/* Encaisser */}
        <button
          onClick={handleEncaisser}
          disabled={!nom.trim() || loading}
          className="w-full py-4 rounded-xl bg-ww-orange text-ww-bg font-display font-bold text-lg uppercase tracking-wide hover:translate-y-[-2px] active:scale-[0.97] transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          {isFree
            ? 'ENREGISTRER · GRATUIT'
            : `ENCAISSER · ฿ ${total.toLocaleString('fr-FR')}`}
        </button>
      </div>
    </div>
  )
}
