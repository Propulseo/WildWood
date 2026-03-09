'use client'

import { useState } from 'react'
import { Send, Pencil } from 'lucide-react'
import type { MessageClientWA } from '@/lib/types'
import { openWhatsApp } from '@/lib/whatsapp'
import { useMessagesWA } from '@/contexts/messages-wa-context'

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  j_moins_2: { label: 'J-2', color: 'var(--ww-orange)' },
  j_plus_3: { label: 'J+3', color: 'var(--ww-lime)' },
  manuel: { label: 'MANUEL', color: 'var(--ww-danger)' },
}

export function MessageCard({ message }: { message: MessageClientWA }) {
  const { updateMessage } = useMessagesWA()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(message.message_contenu)

  const typeInfo = TYPE_LABELS[message.type] ?? { label: message.type, color: 'var(--ww-muted)' }
  const noPhone = !message.telephone

  function handleSend() {
    if (noPhone) return
    openWhatsApp(message.telephone!, draft)
    updateMessage(message.id, {
      statut: 'envoye',
      message_contenu: draft,
      envoye_le: new Date().toISOString(),
    })
  }

  function handleSaveDraft() {
    updateMessage(message.id, { message_contenu: draft })
    setEditing(false)
  }

  return (
    <div className="bg-ww-surface-2 border border-ww-border/50 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="shrink-0 px-2 py-0.5 text-[10px] font-display font-bold uppercase rounded-full text-ww-bg"
            style={{ background: typeInfo.color }}
          >
            {typeInfo.label}
          </span>
          <span className="font-sans font-medium text-sm text-ww-text truncate">
            {message.client_nom}
          </span>
        </div>
        <span className="text-xs text-ww-muted font-mono shrink-0">B{message.bungalow_id.replace('bung-', '')}</span>
      </div>

      <p className="text-xs text-ww-muted font-mono">
        {noPhone ? 'Pas de telephone' : message.telephone}
      </p>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="w-full bg-ww-bg border border-ww-border rounded-lg px-3 py-2 text-sm text-ww-text font-sans resize-none focus:outline-none focus:border-ww-orange"
          />
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-xs rounded-lg border border-ww-border text-ww-muted hover:text-ww-text transition-colors">
              Annuler
            </button>
            <button onClick={handleSaveDraft} className="px-3 py-1.5 text-xs rounded-lg bg-ww-surface border border-ww-border text-ww-text font-display font-bold hover:border-ww-orange transition-colors">
              Sauvegarder
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-ww-muted font-sans line-clamp-2">{draft}</p>
      )}

      <div className="flex gap-2 pt-1">
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-ww-border text-ww-muted hover:text-ww-text transition-colors"
          >
            <Pencil className="h-3 w-3" /> MODIFIER
          </button>
        )}
        <button
          onClick={handleSend}
          disabled={noPhone}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-display font-bold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: noPhone ? 'var(--ww-surface)' : 'var(--ww-lime)', color: noPhone ? 'var(--ww-muted)' : 'var(--ww-bg)' }}
        >
          <Send className="h-3 w-3" /> ENVOYER WA
        </button>
      </div>
    </div>
  )
}
