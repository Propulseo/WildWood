'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { MessageClientWA, MessageTemplateWA } from '@/lib/types'
import { getMessagesClientsWA, getMessageTemplatesWA } from '@/lib/data-access'
import * as commsQ from '@/lib/supabase/queries/communications'
import { mutate } from '@/lib/mutation'

interface MessagesWAContextType {
  messages: MessageClientWA[]
  templates: MessageTemplateWA[]
  addMessage: (msg: MessageClientWA) => void
  updateMessage: (id: string, patch: Partial<MessageClientWA>) => void
  updateTemplate: (id: string, patch: Partial<MessageTemplateWA>) => void
  getMessagesPlanifies: () => MessageClientWA[]
  getMessagesAEnvoyerAujourdhui: () => MessageClientWA[]
  getMessagesParReservation: (resId: string) => MessageClientWA[]
  loading: boolean
  error: string | null
  refetch: () => void
}

const MessagesWAContext = createContext<MessagesWAContextType | null>(null)

const TODAY = new Date().toISOString().split('T')[0]

export function MessagesWAProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<MessageClientWA[]>([])
  const [templates, setTemplates] = useState<MessageTemplateWA[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [msgs, tmpls] = await Promise.all([getMessagesClientsWA(), getMessageTemplatesWA()])
      setMessages(msgs); setTemplates(tmpls)
    } catch (e) { setError(e instanceof Error ? e.message : 'Erreur') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function addMessage(msg: MessageClientWA) {
    await mutate({
      optimistic: () => { const prev = messages; setMessages((p) => [...p, msg]); return prev },
      mutationFn: () => commsQ.insertMessageClient({
        reservation_id: msg.reservation_id,
        client_nom: msg.client_nom,
        telephone: msg.telephone || undefined,
        type: msg.type,
        statut: msg.statut,
        message_contenu: msg.message_contenu,
        planifie_le: msg.planifie_le,
      }).then(() => {}),
      rollback: (prev) => setMessages(prev),
      successMessage: 'Message ajoute',
      errorMessage: 'Erreur ajout message',
    })
  }

  async function updateMessage(id: string, patch: Partial<MessageClientWA>) {
    await mutate({
      optimistic: () => {
        const prev = messages
        setMessages((p) => p.map((m) => (m.id === id ? { ...m, ...patch } : m)))
        return prev
      },
      mutationFn: () => commsQ.updateMessageClient(id, patch).then(() => {}),
      rollback: (prev) => setMessages(prev),
      errorMessage: 'Erreur mise a jour message',
    })
  }

  async function updateTemplate(id: string, patch: Partial<MessageTemplateWA>) {
    await mutate({
      optimistic: () => {
        const prev = templates
        setTemplates((p) => p.map((t) => (t.id === id ? { ...t, ...patch } : t)))
        return prev
      },
      mutationFn: () => commsQ.updateMessageTemplate(id, { nom: patch.nom, contenu: patch.contenu }).then(() => {}),
      rollback: (prev) => setTemplates(prev),
      successMessage: 'Template mis a jour',
      errorMessage: 'Erreur mise a jour template',
    })
  }

  function getMessagesPlanifies() { return messages.filter((m) => m.statut === 'planifie') }
  function getMessagesAEnvoyerAujourdhui() { return messages.filter((m) => m.statut === 'planifie' && m.planifie_le <= TODAY) }
  function getMessagesParReservation(resId: string) { return messages.filter((m) => m.reservation_id === resId) }

  return (
    <MessagesWAContext value={{
      messages, templates, addMessage, updateMessage, updateTemplate,
      getMessagesPlanifies, getMessagesAEnvoyerAujourdhui, getMessagesParReservation,
      loading, error, refetch: fetchData,
    }}>
      {children}
    </MessagesWAContext>
  )
}

export function useMessagesWA() {
  const ctx = useContext(MessagesWAContext)
  if (!ctx) throw new Error('useMessagesWA must be used within MessagesWAProvider')
  return ctx
}
