'use client'

import { Send } from 'lucide-react'
import { useMessagesWA } from '@/contexts/messages-wa-context'
import { openWhatsApp } from '@/lib/whatsapp'

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  j_moins_2: { label: 'J-2', color: 'var(--ww-orange)' },
  j_plus_3: { label: 'J+3', color: 'var(--ww-lime)' },
  manuel: { label: 'MANUEL', color: 'var(--ww-danger)' },
}

const STATUT_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  planifie: { label: 'Planifie', bg: 'var(--ww-surface-2)', text: 'var(--ww-muted)' },
  envoye: { label: 'Envoye', bg: 'var(--ww-wood)', text: 'var(--ww-bg)' },
  lu: { label: 'Lu', bg: 'var(--ww-surface-2)', text: 'var(--ww-text)' },
  repondu: { label: 'Repondu', bg: 'var(--ww-lime)', text: 'var(--ww-bg)' },
}

function formatDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export function ReservationMessages({
  reservationId,
  telephone,
  clientName,
  bungalowNumero,
}: {
  reservationId: string
  telephone: string | null
  clientName: string
  bungalowNumero: number
}) {
  const { getMessagesParReservation, templates } = useMessagesWA()
  const msgs = getMessagesParReservation(reservationId)

  const noPhone = !telephone
  const urgenceTpl = templates.find((t) => t.type === 'urgence')

  function handleSend() {
    if (noPhone || !urgenceTpl) return
    const msg = urgenceTpl.contenu.replace('{{prenom}}', clientName.split(' ')[0]).replace('{{message_libre}}', '')
    openWhatsApp(telephone!, msg)
  }

  return (
    <div className="space-y-3">
      {msgs.length === 0 ? (
        <p className="text-sm text-ww-muted font-sans text-center py-4">Aucun message pour cette reservation</p>
      ) : (
        msgs.map((m) => {
          const typeS = TYPE_LABELS[m.type]
          const statS = STATUT_LABELS[m.statut]
          return (
            <div key={m.id} className="bg-ww-surface-2 border border-ww-border/50 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-1.5 py-0.5 text-[10px] font-display font-bold rounded-full text-ww-bg" style={{ background: typeS?.color }}>
                  {typeS?.label}
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-display font-bold rounded-full" style={{ background: statS?.bg, color: statS?.text }}>
                  {statS?.label}
                </span>
                <span className="text-xs text-ww-muted font-mono ml-auto">
                  {formatDate(m.envoye_le ?? m.planifie_le)}
                </span>
              </div>
              <p className="text-xs text-ww-muted font-sans line-clamp-2">{m.message_contenu}</p>
              {m.reponse_client && (
                <p className="text-xs text-ww-lime font-sans italic">&quot;{m.reponse_client}&quot;</p>
              )}
            </div>
          )
        })
      )}

      <button
        onClick={handleSend}
        disabled={noPhone}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-display font-bold text-sm transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: noPhone ? 'var(--ww-surface-2)' : 'var(--ww-lime)', color: noPhone ? 'var(--ww-muted)' : 'var(--ww-bg)' }}
      >
        <Send className="h-3.5 w-3.5" />
        {noPhone ? 'Pas de telephone' : 'Envoyer un message'}
      </button>
    </div>
  )
}
