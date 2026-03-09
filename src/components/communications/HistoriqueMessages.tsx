'use client'

import { useState } from 'react'
import { useMessagesWA } from '@/contexts/messages-wa-context'
import type { MessageClientWA } from '@/lib/types'

const TYPE_STYLES: Record<string, { label: string; bg: string }> = {
  j_moins_2: { label: 'J-2', bg: 'var(--ww-orange)' },
  j_plus_3: { label: 'J+3', bg: 'var(--ww-lime)' },
  manuel: { label: 'MANUEL', bg: 'var(--ww-danger)' },
}

const STATUT_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  planifie: { label: 'Planifie', bg: 'var(--ww-surface-2)', text: 'var(--ww-muted)' },
  envoye: { label: 'Envoye', bg: 'var(--ww-wood)', text: 'var(--ww-bg)' },
  lu: { label: 'Lu', bg: 'var(--ww-surface-2)', text: 'var(--ww-text)' },
  repondu: { label: 'Repondu', bg: 'var(--ww-lime)', text: 'var(--ww-bg)' },
}

function formatDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export function HistoriqueMessages() {
  const { messages, updateMessage } = useMessagesWA()
  const [replyingId, setReplyingId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const sorted = [...messages]
    .filter((m) => m.statut !== 'planifie')
    .sort((a, b) => (b.envoye_le ?? b.planifie_le).localeCompare(a.envoye_le ?? a.planifie_le))

  function handleSaveReply(msg: MessageClientWA) {
    updateMessage(msg.id, { reponse_client: replyText, statut: 'repondu' })
    setReplyingId(null)
    setReplyText('')
  }

  return (
    <div className="bg-ww-surface border border-ww-border rounded-xl p-5">
      <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ww-muted mb-4">
        Historique des messages
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ww-border text-left">
              <th className="pb-2 pr-3 text-[10px] font-display font-bold uppercase text-ww-muted">Date</th>
              <th className="pb-2 pr-3 text-[10px] font-display font-bold uppercase text-ww-muted">Client</th>
              <th className="pb-2 pr-3 text-[10px] font-display font-bold uppercase text-ww-muted hidden sm:table-cell">Bungalow</th>
              <th className="pb-2 pr-3 text-[10px] font-display font-bold uppercase text-ww-muted">Type</th>
              <th className="pb-2 pr-3 text-[10px] font-display font-bold uppercase text-ww-muted">Statut</th>
              <th className="pb-2 text-[10px] font-display font-bold uppercase text-ww-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => {
              const typeS = TYPE_STYLES[m.type]
              const statS = STATUT_STYLES[m.statut]
              return (
                <tr key={m.id} className="border-b border-ww-border/30 hover:bg-ww-surface-2/50 transition-colors">
                  <td className="py-2.5 pr-3 text-xs text-ww-muted font-mono whitespace-nowrap">
                    {formatDate(m.envoye_le ?? m.planifie_le)}
                  </td>
                  <td className="py-2.5 pr-3 text-ww-text font-sans whitespace-nowrap">{m.client_nom}</td>
                  <td className="py-2.5 pr-3 text-ww-muted font-mono hidden sm:table-cell">B{m.bungalow_id.replace('bung-', '')}</td>
                  <td className="py-2.5 pr-3">
                    <span className="px-1.5 py-0.5 text-[10px] font-display font-bold rounded-full text-ww-bg" style={{ background: typeS?.bg }}>
                      {typeS?.label}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className="px-1.5 py-0.5 text-[10px] font-display font-bold rounded-full" style={{ background: statS?.bg, color: statS?.text }}>
                      {statS?.label}
                    </span>
                  </td>
                  <td className="py-2.5">
                    {m.reponse_client ? (
                      <span className="text-xs text-ww-lime font-sans italic">&quot;{m.reponse_client}&quot;</span>
                    ) : replyingId === m.id ? (
                      <div className="flex gap-1.5">
                        <input
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Reponse..."
                          className="bg-ww-bg border border-ww-border rounded px-2 py-1 text-xs text-ww-text w-32 focus:outline-none focus:border-ww-orange"
                        />
                        <button onClick={() => handleSaveReply(m)} className="text-[10px] font-display font-bold text-ww-lime hover:underline">OK</button>
                        <button onClick={() => setReplyingId(null)} className="text-[10px] text-ww-muted hover:underline">×</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setReplyingId(m.id); setReplyText('') }}
                        className="text-[10px] font-display font-bold text-ww-muted hover:text-ww-text transition-colors underline"
                      >
                        Noter reponse
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {sorted.length === 0 && (
        <p className="text-sm text-ww-muted text-center py-6">Aucun message envoye</p>
      )}
    </div>
  )
}
