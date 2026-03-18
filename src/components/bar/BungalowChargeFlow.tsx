'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SignaturePad } from '@/components/pos/SignaturePad'
interface CartItem { id: string; nom: string; prix: number; quantite: number }
interface Props { items: CartItem[]; staffId: string; onSuccess: () => void; onBack: () => void }

export function BungalowChargeFlow({ items, staffId, onSuccess, onBack }: Props) {
  type R = { id: string; client_nom: string; bungalow_id: number }
  const [step, setStep] = useState<'select' | 'signature'>('select')
  const [residents, setResidents] = useState<R[]>([])
  const [selected, setSelected] = useState<R | null>(null)
  const [loading, setLoading] = useState(true)
  const [signatureData, setSignatureData] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('reservations').select('id, client_nom, bungalow_id')
      .eq('statut', 'confirme').order('bungalow_id')
      .then(({ data }: { data: R[] | null }) => { setResidents(data || []); setLoading(false) })
  }, [])

  const total = items.reduce((s, i) => s + i.prix * i.quantite, 0)

  async function handleConfirm() {
    if (!selected || !signatureData) return
    setLoading(true)
    try {
      const { createRoomChargeFromBar } = await import('@/lib/supabase/queries/bungalows')
      await createRoomChargeFromBar({
        reservationId: selected.id, bungalowId: selected.bungalow_id,
        items: items.map(i => ({ nom: i.nom, prix_unitaire: i.prix, quantite: i.quantite })),
        signatureBase64: signatureData, staffId,
      })
      onSuccess()
    } catch {
      const { toast } = await import('sonner')
      toast.error('Erreur room charge')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onBack} />
      <div className="relative bg-ww-surface border border-ww-border rounded-xl p-6 w-full max-w-md shadow-lg shadow-black/30">
        {step === 'select' ? (
          <>
            <div className="flex items-center gap-3 mb-5">
              <button onClick={onBack} className="text-ww-muted hover:text-ww-text transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h3 className="font-display text-lg font-bold text-ww-text">NOTE DE BUNGALOW</h3>
            </div>
            {loading ? <p className="text-sm text-ww-muted">Chargement...</p>
              : residents.length === 0 ? <p className="text-sm text-ww-muted">Aucun resident actif</p>
              : <div className="space-y-2 max-h-72 overflow-y-auto">{residents.map(r => (
                <button key={r.id} onClick={() => { setSelected(r); setStep('signature') }}
                  className="w-full bg-ww-surface-2 border border-ww-border rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-ww-wood transition-all active:scale-[0.97]">
                  <div className="text-left">
                    <p className="font-display font-bold text-ww-text text-sm">Bungalow {r.bungalow_id}</p>
                    <p className="text-xs text-ww-muted">{r.client_nom}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-ww-muted" />
                </button>
              ))}</div>}
          </>
        ) : selected && (
          <>
            <h3 className="font-display text-lg font-bold text-ww-text mb-1">SIGNATURE — Bungalow {selected.bungalow_id}</h3>
            <p className="text-sm text-ww-muted mb-1">{selected.client_nom}</p>
            <p className="text-ww-orange font-display font-bold text-xl mb-4">&#3647; {total.toLocaleString()}</p>
            <SignaturePad onSignature={setSignatureData} onClear={() => setSignatureData(null)} width={380} height={160} />
            <div className="flex gap-2 mt-5">
              <button onClick={() => { setStep('select'); setSignatureData(null) }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-ww-surface-2 text-ww-muted border border-ww-border hover:bg-ww-surface-2/80 transition-colors">
                Retour
              </button>
              <button disabled={!signatureData || loading} onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold bg-ww-orange text-white hover:bg-ww-orange/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                CONFIRMER
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
