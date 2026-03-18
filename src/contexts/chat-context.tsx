'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { ChatMessage } from '@/lib/types'
import { getChatMessages } from '@/lib/data-access'

interface ChatContextType {
  messages: ChatMessage[]
  addMessage: (msg: ChatMessage) => void
  getMessagesByCanal: (canal: string) => ChatMessage[]
  loading: boolean
  error: string | null
  refetch: () => void
}

const ChatContext = createContext<ChatContextType | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try { setMessages(await getChatMessages()) }
    catch (e) { setError(e instanceof Error ? e.message : 'Erreur') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function addMessage(msg: ChatMessage) {
    setMessages((prev) => [...prev, msg])
  }

  function getMessagesByCanal(canal: string): ChatMessage[] {
    return messages.filter((m) => m.canal === canal)
  }

  return (
    <ChatContext value={{ messages, addMessage, getMessagesByCanal, loading, error, refetch: fetchData }}>
      {children}
    </ChatContext>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
