'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'

const BILLETS = [20, 50, 100, 500, 1000] as const

export function CashChangeDialog({
  total,
  open,
  onConfirm,
  onCancel,
}: {
  total: number
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const t = useTranslations('pos')
  const tc = useTranslations('common')
  const [montantRecu, setMontantRecu] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setMontantRecu('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const recu = Number(montantRecu) || 0
  const monnaie = recu - total
  const isValid = recu >= total && montantRecu !== ''
  const isExact = recu === total

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('cashPayment')}</DialogTitle>
          <DialogDescription>
            {t('totalToCollect')} : <span className="font-bold text-ww-orange">฿ {total.toLocaleString()}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Input montant recu */}
          <div>
            <label className="text-xs text-ww-muted block mb-1.5">{t('cashReceived')}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ww-muted font-bold">฿</span>
              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                min={0}
                value={montantRecu}
                onChange={(e) => setMontantRecu(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && isValid) onConfirm() }}
                placeholder="0"
                className="w-full pl-8 pr-4 py-3 rounded-lg bg-ww-bg border border-ww-border text-ww-text text-xl font-bold text-right focus:outline-none focus:ring-2 focus:ring-ww-orange/50 focus:border-ww-orange [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Billets rapides */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMontantRecu(String(total))}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-ww-lime/15 text-ww-lime border border-ww-lime/30 hover:bg-ww-lime/25 transition-colors"
            >
              {tc('exact')}
            </button>
            {BILLETS.filter((b) => b >= total).slice(0, 3).map((billet) => (
              <button
                key={billet}
                type="button"
                onClick={() => setMontantRecu(String(billet))}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-ww-surface-2 text-ww-text border border-ww-border hover:bg-ww-surface-2/80 transition-colors"
              >
                ฿{billet.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Monnaie a rendre */}
          {montantRecu !== '' && (
            <div className={`rounded-lg p-4 text-center ${
              isExact
                ? 'bg-ww-lime/10 border border-ww-lime/30'
                : isValid
                  ? 'bg-ww-orange/10 border border-ww-orange/30'
                  : 'bg-ww-danger/10 border border-ww-danger/30'
            }`}>
              {isExact ? (
                <p className="text-ww-lime font-bold text-lg">{t('exactAmount')}</p>
              ) : isValid ? (
                <>
                  <p className="text-xs text-ww-muted mb-1">{t('changeToReturn')}</p>
                  <p className="text-ww-orange font-extrabold text-2xl font-display">
                    ฿ {monnaie.toLocaleString()}
                  </p>
                </>
              ) : (
                <p className="text-ww-danger font-bold text-sm">
                  {t('missing')} ฿ {Math.abs(monnaie).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-ww-surface-2 text-ww-muted border border-ww-border hover:bg-ww-surface-2/80 transition-colors"
          >
            {tc('cancel')}
          </button>
          <button
            type="button"
            disabled={!isValid}
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold bg-ww-orange text-white hover:bg-ww-orange/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {tc('confirm')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
