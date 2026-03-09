'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import type { ChatMessage } from '@/lib/types'
import { getChatMessages } from '@/lib/data-access'

interface ChatContextType {
  messages: ChatMessage[]
  addMessage: (msg: ChatMessage) => void
  getMessagesByCanal: (canal: string) => ChatMessage[]
}

const ChatContext = createContext<ChatContextType | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    getChatMessages().then(setMessages)
  }, [])

  function addMessage(msg: ChatMessage) {
    setMessages((prev) => [...prev, msg])
  }

  function getMessagesByCanal(canal: string): ChatMessage[] {
    return messages.filter((m) => m.canal === canal)
  }

  return (
    <ChatContext value={{ messages, addMessage, getMessagesByCanal }}>
      {children}
    </ChatContext>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
