'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'
import type { Client } from '@/lib/types'
import type { CartItem } from './cart-reducer'
import { SignaturePad } from './SignaturePad'

interface SignatureModalProps {
  open: boolean
  items: CartItem[]
  client: Client
  bungalowNumero: number
  onConfirm: (signatureBase64: string) => void
  onCancel: () => void
}

export function SignatureModal({
  open, items, client, bungalowNumero, onConfirm, onCancel,
}: SignatureModalProps) {
  const t = useTranslations('pos')
  const tc = useTranslations('common')
  const tBung = useTranslations('bungalows')
  const [signatureData, setSignatureData] = useState<string | null>(null)

  const total = items
    .filter((i) => i.type === 'fnb')
    .reduce((sum, i) => sum + i.prixUnitaire * i.quantite, 0)

  const handleSignature = useCallback((base64: string) => {
    setSignatureData(base64)
  }, [])

  const handleClear = useCallback(() => {
    setSignatureData(null)
  }, [])

  const handleConfirm = () => {
    if (signatureData) {
      onConfirm(signatureData)
      setSignatureData(null)
    }
  }

  const handleClose = () => {
    setSignatureData(null)
    onCancel()
  }

  if (!open) return null

  const fnbItems = items.filter((i) => i.type === 'fnb')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={handleClose} />
      <div className="relative bg-ww-surface border border-ww-border rounded-xl p-6 w-full max-w-lg shadow-lg shadow-black/30">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-ww-muted hover:text-ww-text transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="font-display text-lg font-bold text-ww-text mb-1">
          {tBung('roomCharges').toUpperCase()} {bungalowNumero}
        </h3>
        <p className="text-xs text-ww-muted font-body mb-4">
          {client.prenom} {client.nom} — {t('signatureRequired')}
        </p>

        <div className="bg-ww-surface-2 rounded-lg p-3 mb-4 space-y-1.5">
          {fnbItems.map((item) => (
            <div key={item.produitId} className="flex justify-between text-sm font-body">
              <span className="text-ww-text">
                {item.nom} {item.quantite > 1 && <span className="text-ww-muted">x{item.quantite}</span>}
              </span>
              <span className="text-ww-muted">
                ฿ {(item.prixUnitaire * item.quantite).toLocaleString()}
              </span>
            </div>
          ))}
          <div className="border-t border-ww-border pt-1.5 flex justify-between">
            <span className="font-display font-bold text-sm text-ww-text">{tc('total').toUpperCase()}</span>
            <span className="font-display font-extrabold text-ww-orange">
              ฿ {total.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <SignaturePad onSignature={handleSignature} onClear={handleClear} width={380} height={180} />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-lg border border-ww-border text-sm font-display font-bold text-ww-muted hover:text-ww-text transition-colors"
          >
            {tc('cancel').toUpperCase()}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!signatureData}
            className="flex-1 py-2.5 rounded-lg bg-ww-orange text-white text-sm font-display font-bold transition-all hover:bg-ww-orange/90 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {tc('confirm').toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  )
}
