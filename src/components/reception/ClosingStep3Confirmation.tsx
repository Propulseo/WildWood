'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle, Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Props {
  caJour: number
  cashCompte: number
  noteEcart: string
  staffName: string
  onSubmit: () => void
  onBack: () => void
}

export default function ClosingStep3Confirmation({
  caJour, cashCompte, noteEcart, staffName, onSubmit, onBack,
}: Props) {
  const t = useTranslations('closing')
  const tc = useTranslations('common')
  const ecart = cashCompte - caJour

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-ww-orange/15 flex items-center justify-center">
          <Lock className="h-5 w-5 text-ww-orange" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-ww-text">{t('confirmation')}</h2>
          <p className="text-sm text-ww-muted">{t('verifyBeforeSubmit')}</p>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        <SummaryRow label={t('dailyRevenue')} value={`${caJour.toLocaleString()} THB`} />
        <SummaryRow label={t('cashCounted')} value={`${cashCompte.toLocaleString()} THB`} />
        <SummaryRow
          label={t('difference')}
          value={`${ecart >= 0 ? '+' : ''}${ecart.toLocaleString()} THB`}
          valueClass={Math.abs(ecart) <= 50 ? 'text-ww-lime' : 'text-ww-danger'}
        />
        {noteEcart && <SummaryRow label={t('note')} value={noteEcart} />}
        <SummaryRow label={t('submittedBy')} value={staffName} />
      </div>

      <div className="mt-auto flex gap-3 pt-4 border-t border-ww-border">
        <Button variant="outline" onClick={onBack} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> {tc('back')}
        </Button>
        <Button onClick={onSubmit} className="flex-1 gap-2">
          <CheckCircle className="h-4 w-4" /> {t('submitClosing')}
        </Button>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, valueClass }: {
  label: string; value: string; valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-ww-surface-2 border border-ww-border/50">
      <span className="text-sm text-ww-muted">{label}</span>
      <span className={`font-display font-bold ${valueClass || 'text-ww-text'}`}>{value}</span>
    </div>
  )
}
