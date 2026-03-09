'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { useMessagesWA } from '@/contexts/messages-wa-context'
import { replaceVariables } from '@/lib/message-templates'

const TYPE_COLORS: Record<string, string> = {
  j_moins_2: 'var(--ww-orange)',
  j_plus_3: 'var(--ww-lime)',
  urgence: 'var(--ww-danger)',
}

const SAMPLE_DATA: Record<string, string> = {
  prenom: 'Sophie',
  nom: 'Dupont',
  date_debut: '15/03/2026',
  bungalow_numero: '3',
  nuits: '4',
  message_libre: 'ceci est un message libre...',
}

export function TemplateEditorWA() {
  const { templates, updateTemplate } = useMessagesWA()
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  function getDraft(id: string, original: string) {
    return drafts[id] ?? original
  }

  function setDraft(id: string, value: string) {
    setDrafts((prev) => ({ ...prev, [id]: value }))
  }

  function handleSave(id: string) {
    const content = drafts[id]
    if (!content) return
    updateTemplate(id, { contenu: content })
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    toast.success('Template sauvegarde')
  }

  function insertVariable(id: string, variable: string, original: string) {
    const current = getDraft(id, original)
    setDraft(id, current + `{{${variable}}}`)
  }

  return (
    <div className="space-y-4">
      {templates.map((tpl) => {
        const draft = getDraft(tpl.id, tpl.contenu)
        const preview = replaceVariables(draft, SAMPLE_DATA)
        const color = TYPE_COLORS[tpl.type] ?? 'var(--ww-muted)'
        const isDirty = drafts[tpl.id] !== undefined

        return (
          <div
            key={tpl.id}
            className="bg-ww-surface border border-ww-border rounded-xl p-5"
            style={{ borderLeftWidth: 3, borderLeftColor: color }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="px-2 py-0.5 text-[10px] font-display font-bold uppercase rounded-full text-ww-bg"
                style={{ background: color }}
              >
                {tpl.type}
              </span>
              <h3 className="font-display font-bold text-sm text-ww-text">{tpl.nom}</h3>
            </div>

            <textarea
              value={draft}
              onChange={(e) => setDraft(tpl.id, e.target.value)}
              rows={4}
              className="w-full bg-ww-bg border border-ww-border rounded-lg px-3 py-2 text-sm text-ww-text font-sans resize-none focus:outline-none focus:border-ww-orange mb-2"
            />

            <div className="flex flex-wrap gap-1.5 mb-3">
              {tpl.variables.map((v) => (
                <button
                  key={v}
                  onClick={() => insertVariable(tpl.id, v, tpl.contenu)}
                  className="px-2 py-0.5 text-[10px] font-mono rounded bg-ww-surface-2 border border-ww-border/50 text-ww-muted hover:text-ww-text hover:border-ww-orange transition-colors"
                >
                  {`{{${v}}}`}
                </button>
              ))}
            </div>

            <div className="bg-ww-bg border border-ww-border/50 rounded-lg p-3 mb-3">
              <p className="text-[10px] font-display font-bold uppercase text-ww-muted mb-1">
                Apercu
              </p>
              <p className="text-xs text-ww-text font-sans whitespace-pre-wrap">{preview}</p>
            </div>

            <button
              onClick={() => handleSave(tpl.id)}
              disabled={!isDirty}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: isDirty ? 'var(--ww-orange)' : 'var(--ww-surface-2)', color: isDirty ? 'var(--ww-bg)' : 'var(--ww-muted)' }}
            >
              <Save className="h-3.5 w-3.5" /> Sauvegarder
            </button>
          </div>
        )
      })}
    </div>
  )
}
