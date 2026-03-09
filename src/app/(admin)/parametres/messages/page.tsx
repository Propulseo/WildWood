'use client'

import { TemplateEditorWA } from '@/components/parametres/TemplateEditorWA'

export default function TemplatesWAPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-ww-text tracking-tight uppercase">
          Templates WhatsApp
        </h1>
        <p className="text-ww-muted text-sm mt-1">
          Configurez les messages automatiques envoyes aux guests
        </p>
      </div>

      <TemplateEditorWA />
    </div>
  )
}
