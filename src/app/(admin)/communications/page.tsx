'use client'

import { MessagesPlanifies } from '@/components/communications/MessagesPlanifies'
import { MessageUrgent } from '@/components/communications/MessageUrgent'
import { HistoriqueMessages } from '@/components/communications/HistoriqueMessages'

export default function CommunicationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-ww-text tracking-tight uppercase">
          Communications WhatsApp
        </h1>
        <p className="text-ww-muted text-sm mt-1">
          Messages automatiques et manuels pour les guests bungalow
        </p>
      </div>

      <MessagesPlanifies />
      <MessageUrgent />
      <HistoriqueMessages />
    </div>
  )
}
