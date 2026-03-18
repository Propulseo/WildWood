'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const CATEGORIES: Record<string, string[]> = {
  gym:    ['daily_pass', 'membership_3j', 'membership_semaine', 'membership_mois', 'autre'],
  fnb:    ['fnb_comptoir', 'fnb_bungalow_checkout', 'autre'],
  resort: ['bungalow_net', 'autre'],
}

interface Props {
  staffId: string
  onClose: () => void
  onSuccess: () => void
}

export function AjouterRevenuManuelModal({ staffId, onClose, onSuccess }: Props) {
  const [bu, setBu] = useState<'gym' | 'fnb' | 'resort' | null>(null)
  const [categorie, setCategorie] = useState('')
  const [montant, setMontant] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!bu || !montant || !categorie) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('transactions').insert({
        date,
        type: 'income',
        business_unit: bu,
        categorie,
        montant_thb: parseInt(montant),
        source_fonds: 'black_box',
        saisie_type: 'manuel',
        staff_id: staffId,
        note: note || null,
      })
      if (error) throw error
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur enregistrement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-ww-surface border border-ww-border rounded-xl p-6 w-[420px] space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="font-display text-2xl font-bold">AJOUTER UN REVENU</h2>
          <button onClick={onClose} className="text-ww-muted hover:text-ww-text">✕</button>
        </div>

        {/* Business Unit */}
        <div className="grid grid-cols-3 gap-3">
          {(['gym', 'fnb', 'resort'] as const).map(b => (
            <button key={b} onClick={() => { setBu(b); setCategorie('') }}
              className={`py-3 rounded-xl font-display transition-all ${
                bu === b
                  ? 'bg-ww-orange text-white'
                  : 'bg-ww-surface-2 border border-ww-border text-ww-muted'
              }`}>
              {b.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Catégorie */}
        {bu && (
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES[bu].map(c => (
              <button key={c} onClick={() => setCategorie(c)}
                className={`py-2 px-3 rounded-lg text-sm text-left transition-all ${
                  categorie === c
                    ? 'bg-ww-orange text-white'
                    : 'bg-ww-surface-2 border border-ww-border text-ww-muted'
                }`}>
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Montant + date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-ww-muted text-xs uppercase tracking-widest">Montant (฿)</label>
            <input type="number" value={montant}
              onChange={e => setMontant(e.target.value)}
              className="w-full mt-1 bg-ww-surface-2 border border-ww-border rounded-lg
                         px-4 py-3 text-ww-text text-xl text-center focus:border-ww-orange outline-none" />
          </div>
          <div>
            <label className="text-ww-muted text-xs uppercase tracking-widest">Date</label>
            <input type="date" value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full mt-1 bg-ww-surface-2 border border-ww-border rounded-lg
                         px-4 py-3 text-ww-text focus:border-ww-orange outline-none" />
          </div>
        </div>

        {/* Note */}
        <input value={note} onChange={e => setNote(e.target.value)}
          placeholder="Note / description (optionnel)"
          className="w-full bg-ww-surface-2 border border-ww-border rounded-lg
                     px-4 py-3 text-ww-text focus:border-ww-orange outline-none" />

        <button
          onClick={handleSubmit}
          disabled={!bu || !montant || !categorie || loading}
          className="w-full py-4 bg-ww-orange text-white font-display text-lg
                     rounded-xl disabled:opacity-40">
          {loading ? 'Enregistrement...' : `ENREGISTRER · ฿ ${parseInt(montant || '0').toLocaleString()}`}
        </button>
      </div>
    </div>
  )
}
