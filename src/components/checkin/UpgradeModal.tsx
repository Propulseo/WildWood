'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowUp, X } from 'lucide-react'
import type { CheckinEntry } from '@/lib/types'

interface UpgradeOption {
  key: string
  label: string
  prixPlein: number
  prixUpgrade: number
}

function formatHeure(h: string) {
  return h.replace(':', 'h')
}

interface UpgradeModalProps {
  entry: CheckinEntry
  onClose: () => void
  onConfirm: (entry: CheckinEntry, vers: string, prixUpgrade: number) => void
}

export function UpgradeModal({ entry, onClose, onConfirm }: UpgradeModalProps) {
  const t = useTranslations('checkin')
  const tc = useTranslations('common')
  const [selected, setSelected] = useState<string | null>(null)

  const prixDaily = entry.prix_paye

  const options: UpgradeOption[] = [
    { key: '3_jours', label: '3 JOURS', prixPlein: 800, prixUpgrade: 800 - prixDaily },
    { key: '1_semaine', label: '1 SEMAINE', prixPlein: 1200, prixUpgrade: 1200 - prixDaily },
    { key: '1_mois', label: '1 MOIS', prixPlein: 2000, prixUpgrade: 2000 - prixDaily },
  ]

  const selectedOption = options.find((o) => o.key === selected)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-ww-surface border border-ww-border rounded-xl w-full max-w-md mx-4 shadow-[0_0_40px_rgba(201,78,10,0.15)]">
        <div className="flex items-center justify-between p-5 border-b border-ww-border">
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ww-text">
            {t('upgradePass')}
          </h2>
          <button
            onClick={onClose}
            className="text-ww-muted hover:text-ww-text transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <p className="text-ww-text font-sans text-sm">
            {entry.client_nom} · Entree {formatHeure(entry.heure_entree)}
          </p>

          <div className="space-y-2 text-sm font-sans">
            <div className="flex justify-between text-ww-text">
              <span>{t('currentPass')} : <span className="font-display font-bold">1 JOUR</span></span>
              <span className="font-mono">฿ {prixDaily.toLocaleString('fr-FR')}</span>
            </div>
            <div className="flex justify-between text-ww-muted">
              <span>{t('deducted')}</span>
              <span className="font-mono">-฿ {prixDaily.toLocaleString('fr-FR')}</span>
            </div>
          </div>

          <div className="border-t border-ww-border" />

          <p className="text-ww-muted text-sm font-sans">
            {t('choosePass')} :
          </p>

          <div className="grid grid-cols-3 gap-3">
            {options.map((opt) => {
              const isSelected = selected === opt.key
              return (
                <button
                  key={opt.key}
                  onClick={() => setSelected(opt.key)}
                  className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all duration-150 hover:translate-y-[-2px] active:scale-[0.97] ${
                    isSelected
                      ? 'border-ww-orange shadow-[0_0_16px_var(--ww-orange-glow)] bg-ww-orange/10'
                      : 'border-ww-border bg-ww-surface-2 hover:border-ww-muted'
                  }`}
                >
                  <span className="font-display font-bold text-sm text-ww-text uppercase tracking-wide">
                    {opt.label}
                  </span>
                  <span className="font-mono text-ww-muted text-xs line-through">
                    ฿ {opt.prixPlein.toLocaleString('fr-FR')}
                  </span>
                  <span className="font-display font-extrabold text-2xl text-[var(--ww-lime)]">
                    ฿ {opt.prixUpgrade.toLocaleString('fr-FR')}
                  </span>
                </button>
              )
            })}
          </div>

          <p className="text-ww-muted text-xs font-sans flex items-center gap-1.5">
            <span className="text-base">⚠️</span>
            {t('onlyToday')}
          </p>
        </div>

        <div className="flex items-center gap-3 p-5 border-t border-ww-border">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-ww-border text-ww-muted font-display font-bold text-sm uppercase tracking-wide hover:text-ww-text hover:border-ww-text/30 transition-all duration-150"
          >
            {tc('cancel')}
          </button>
          <button
            disabled={!selectedOption}
            onClick={() => {
              if (selectedOption) onConfirm(entry, selectedOption.key, selectedOption.prixUpgrade)
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-display font-bold text-sm uppercase tracking-wide transition-all duration-150 active:scale-[0.97] ${
              selectedOption
                ? 'bg-ww-orange text-white hover:translate-y-[-2px]'
                : 'bg-ww-surface-2 text-ww-muted cursor-not-allowed'
            }`}
          >
            {tc('confirm')} <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
