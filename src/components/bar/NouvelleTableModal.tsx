'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'

interface CartItem { id: string; nom: string; prix: number; quantite: number }
interface NouvelleTableModalProps {
  items: CartItem[]
  staffId: string
  onSuccess: () => void
  onBack: () => void
}

const EMPLACEMENTS = ['Comptoir', 'Terrasse 1', 'Terrasse 2', 'Plage 1', 'Plage 2', 'Hamac', 'Piscine', 'Salle']

export function NouvelleTableModal({ items, staffId, onSuccess, onBack }: NouvelleTableModalProps) {
  const [emplacement, setEmplacement] = useState('')
  const [clientNom, setClientNom] = useState('')
  const [loading, setLoading] = useState(false)
  const total = items.reduce((s, i) => s + i.prix * i.quantite, 0)

  async function handleSubmit() {
    setLoading(true)
    try {
      const { createTableBar } = await import('@/lib/supabase/queries/tables-bar')
      await createTableBar({
        nomTable: emplacement,
        clientNom: clientNom || undefined,
        typeClient: 'externe',
        items: items.map(i => ({ nom: i.nom, prix_unitaire: i.prix, quantite: i.quantite })),
        staffId,
      })
      onSuccess()
    } catch {
      const { toast } = await import('sonner')
      toast.error("Erreur lors de l'ouverture de la table")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onBack} />
      <div className="relative bg-ww-surface border border-ww-border rounded-xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <button onClick={onBack} className="text-ww-muted hover:text-ww-text transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h3 className="font-display text-lg font-bold text-ww-text">NOUVELLE TABLE</h3>
        </div>

        {/* Order recap */}
        <div className="bg-ww-surface-2 rounded-lg p-3 mb-4 space-y-1">
          {items.map(item => (
            <div key={item.id} className="flex justify-between text-sm font-body text-ww-text">
              <span>{item.nom} x{item.quantite}</span>
              <span>฿ {(item.prix * item.quantite).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-display font-bold text-ww-orange pt-1 border-t border-ww-border">
            <span>Total</span>
            <span>฿ {total.toLocaleString()}</span>
          </div>
        </div>

        {/* Emplacement */}
        <label className="text-sm font-body text-ww-muted mb-2 block">Emplacement</label>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {EMPLACEMENTS.map(emp => (
            <button key={emp} onClick={() => setEmplacement(emp)} className={`font-display font-bold text-xs py-2 rounded-lg text-center transition-all active:scale-[0.97] ${
              emplacement === emp
                ? 'bg-ww-orange text-white border border-ww-orange'
                : 'bg-ww-surface-2 border border-ww-border text-ww-muted hover:text-ww-text'
            }`}>{emp}</button>
          ))}
        </div>

        {/* Client name */}
        <label className="text-sm font-body text-ww-muted mb-1 block">Nom du client (optionnel)</label>
        <input type="text" value={clientNom} onChange={e => setClientNom(e.target.value)}
          placeholder="Ex: John, Table 3..."
          className="bg-ww-surface-2 border border-ww-border rounded-lg p-2.5 text-sm font-body text-ww-text w-full placeholder:text-ww-muted/50 focus:outline-none focus:ring-2 focus:ring-ww-orange/50" />

        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          <button onClick={onBack} className="flex-1 py-2.5 rounded-lg border border-ww-border font-display font-bold text-sm text-ww-muted hover:text-ww-text transition-colors">
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={!emplacement || loading}
            className="flex-1 py-2.5 rounded-lg bg-ww-orange text-white font-display font-bold text-sm uppercase active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            {loading ? 'Ouverture...' : 'OUVRIR LA TABLE'}
          </button>
        </div>
      </div>
    </div>
  )
}
