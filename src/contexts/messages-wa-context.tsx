'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import type { MessageClientWA, MessageTemplateWA } from '@/lib/types'
import { getMessagesClientsWA, getMessageTemplatesWA } from '@/lib/data-access'

interface MessagesWAContextType {
  messages: MessageClientWA[]
  templates: MessageTemplateWA[]
  addMessage: (msg: MessageClientWA) => void
  updateMessage: (id: string, patch: Partial<MessageClientWA>) => void
  updateTemplate: (id: string, patch: Partial<MessageTemplateWA>) => void
  getMessagesPlanifies: () => MessageClientWA[]
  getMessagesAEnvoyerAujourdhui: () => MessageClientWA[]
  getMessagesParReservation: (resId: string) => MessageClientWA[]
}

const MessagesWAContext = createContext<MessagesWAContextType | null>(null)

const TODAY = '2026-03-09'

export function MessagesWAProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<MessageClientWA[]>([])
  const [templates, setTemplates] = useState<MessageTemplateWA[]>([])

  useEffect(() => {
    getMessagesClientsWA().then(setMessages)
    getMessageTemplatesWA().then(setTemplates)
  }, [])

  function addMessage(msg: MessageClientWA) {
    setMessages((prev) => [...prev, msg])
  }

  function updateMessage(id: string, patch: Partial<MessageClientWA>) {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    )
  }

  function updateTemplate(id: string, patch: Partial<MessageTemplateWA>) {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    )
  }

  function getMessagesPlanifies() {
    return messages.filter((m) => m.statut === 'planifie')
  }

  function getMessagesAEnvoyerAujourdhui() {
    return messages.filter(
      (m) => m.statut === 'planifie' && m.planifie_le <= TODAY,
    )
  }

  function getMessagesParReservation(resId: string) {
    return messages.filter((m) => m.reservation_id === resId)
  }

  return (
    <MessagesWAContext
      value={{
        messages,
        templates,
        addMessage,
        updateMessage,
        updateTemplate,
        getMessagesPlanifies,
        getMessagesAEnvoyerAujourdhui,
        getMessagesParReservation,
      }}
    >
      {children}
    </MessagesWAContext>
  )
}

export function useMessagesWA() {
  const ctx = useContext(MessagesWAContext)
  if (!ctx) throw new Error('useMessagesWA must be used within MessagesWAProvider')
  return ctx
}
