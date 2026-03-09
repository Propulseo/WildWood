'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RotateCcw, X as XIcon } from 'lucide-react'

interface FacturePreviewProps {
  /** base64 data URL for images, or object URL */
  src: string
  fileName?: string
  isPdf: boolean
  onReplace: () => void
  onRemove: () => void
}

export function FacturePreview({ src, fileName, isPdf, onReplace, onRemove }: FacturePreviewProps) {
  const [lightbox, setLightbox] = useState(false)

  return (
    <>
      <div className="flex items-center gap-3">
        {isPdf ? (
          <PdfBadge fileName={fileName} />
        ) : (
          <button
            onClick={() => setLightbox(true)}
            className="w-[120px] h-[90px] rounded-md overflow-hidden border border-ww-border flex-shrink-0 hover:border-ww-orange transition-colors"
          >
            <img src={src} alt="Recu" className="w-full h-full object-cover" />
          </button>
        )}

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onReplace} className="text-xs text-ww-muted">
            <RotateCcw className="mr-1 h-3 w-3" />Remplacer
          </Button>
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-xs text-ww-muted">
            <XIcon className="mr-1 h-3 w-3" />Supprimer
          </Button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && !isPdf && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') setLightbox(false) }}
          role="button"
          tabIndex={0}
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <XIcon className="h-8 w-8" />
          </button>
          <img
            src={src}
            alt="Recu agrandi"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}

function PdfBadge({ fileName }: { fileName?: string }) {
  const display = fileName
    ? (fileName.length > 25 ? fileName.slice(0, 22) + '...' : fileName)
    : 'document.pdf'

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl">📄</span>
      <span className="text-sm font-body text-ww-text">{display}</span>
      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ww-wood/20 text-ww-wood border border-ww-wood/30">
        PDF
      </span>
    </div>
  )
}
