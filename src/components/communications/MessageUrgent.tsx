'use client'

import { useState, useEffect, useMemo } from 'react'
import { AlertTriangle, Send } from 'lucide-react'
import { getBungalows } from '@/lib/data-access'
import type { Bungalow } from '@/lib/types'
import { useMessagesWA } from '@/contexts/messages-wa-context'
import { replaceVariables, buildVariableData } from '@/lib/message-templates'
import { openWhatsApp } from '@/lib/whatsapp'

interface GuestOption {
  resId: string
  clientNom: string
  telephone: string
  bungalowNum: number
  dateDebut: string
  dateFin: string
}

export function MessageUrgent() {
  const { templates } = useMessagesWA()
  const [bungalows, setBungalows] = useState<Bungalow[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [templateId, setTemplateId] = useState('')
  const [messageLibre, setMessageLibre] = useState('')

  useEffect(() => { getBungalows().then(setBungalows) }, [])

  const guests = useMemo<GuestOption[]>(() => {
    const list: GuestOption[] = []
    for (const b of bungalows) {
      for (const r of b.reservations) {
        if (r.statut !== 'confirmee' && r.statut !== 'en-cours') continue
        if (!r.telephone) continue
        list.push({
          resId: r.id,
          clientNom: r.clientNom ?? `Client ${r.clientId}`,
          telephone: r.telephone,
          bungalowNum: b.numero,
          dateDebut: r.dateDebut,
          dateFin: r.dateFin,
        })
      }
    }
    return list
  }, [bungalows])

  const tpl = templates.find((t) => t.id === templateId)

  function getPreview(guest: GuestOption) {
    if (!tpl) return messageLibre || '(selectionnez un template)'
    const vars = buildVariableData(guest.clientNom, guest.dateDebut, guest.dateFin, guest.bungalowNum, messageLibre)
    return replaceVariables(tpl.contenu, vars)
  }

  function toggleGuest(resId: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(resId) ? next.delete(resId) : next.add(resId)
      return next
    })
  }

  function handleSendAll() {
    const targets = guests.filter((g) => selected.has(g.resId))
    targets.forEach((guest, i) => {
      setTimeout(() => openWhatsApp(guest.telephone, getPreview(guest)), i * 500)
    })
  }

  const firstSelected = guests.find((g) => selected.has(g.resId))

  return (
    <div className="bg-ww-surface border border-ww-border rounded-xl p-5" style={{ borderLeftWidth: 3, borderLeftColor: 'var(--ww-danger)' }}>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-4 w-4 text-ww-danger" />
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ww-text">
          Message urgent / manuel
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left: guest selection */}
        <div className="space-y-3">
          <p className="text-xs text-ww-muted font-display font-bold uppercase">Destinataires</p>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {guests.map((g) => (
              <label key={g.resId} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-ww-surface-2 border border-ww-border/50 cursor-pointer hover:border-ww-border transition-colors text-sm">
                <input
                  type="checkbox"
                  checked={selected.has(g.resId)}
                  onChange={() => toggleGuest(g.resId)}
                  className="accent-[var(--ww-orange)] h-3.5 w-3.5"
                />
                <span className="text-ww-text font-sans">{g.clientNom}</span>
                <span className="text-ww-muted font-mono text-xs ml-auto">B{g.bungalowNum}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Right: template + message */}
        <div className="space-y-3">
          <div>
            <p className="text-xs text-ww-muted font-display font-bold uppercase mb-1.5">Template</p>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full bg-ww-bg border border-ww-border rounded-lg px-3 py-2 text-sm text-ww-text font-sans focus:outline-none focus:border-ww-orange"
            >
              <option value="">-- Choisir un template --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-xs text-ww-muted font-display font-bold uppercase mb-1.5">Message libre</p>
            <textarea
              value={messageLibre}
              onChange={(e) => setMessageLibre(e.target.value)}
              placeholder="Texte libre ou complement au template..."
              rows={3}
              className="w-full bg-ww-bg border border-ww-border rounded-lg px-3 py-2 text-sm text-ww-text font-sans resize-none focus:outline-none focus:border-ww-orange"
            />
          </div>

          {firstSelected && (
            <div className="bg-ww-bg border border-ww-border/50 rounded-lg p-3">
              <p className="text-[10px] font-display font-bold uppercase text-ww-muted mb-1">Apercu</p>
              <p className="text-xs text-ww-text font-sans whitespace-pre-wrap">{getPreview(firstSelected)}</p>
            </div>
          )}

          <button
            onClick={handleSendAll}
            disabled={selected.size === 0 || (!tpl && !messageLibre)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-display font-bold text-sm uppercase tracking-wider transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--ww-lime)', color: 'var(--ww-bg)' }}
          >
            <Send className="h-4 w-4" />
            OUVRIR WHATSAPP × {selected.size}
          </button>
        </div>
      </div>
    </div>
  )
}
