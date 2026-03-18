'use client'

import type { TableOuverte } from '@/lib/types'
import { useTranslations } from 'next-intl'

interface TablesKpiHeaderProps {
  ouvertes: TableOuverte[]
  payees: TableOuverte[]
}

export function TablesKpiHeader({ ouvertes, payees }: TablesKpiHeaderProps) {
  const t = useTranslations('tables')
  const totalEnAttente = ouvertes.reduce((s, t) => s + t.total_thb, 0)
  const totalEncaisse = payees.reduce((s, t) => s + t.total_thb, 0)
  const hotelCount = ouvertes.filter((t) => t.type_client === 'hotel').length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-ww-surface border border-ww-border rounded-xl p-4">
        <p className="text-[10px] font-display font-bold uppercase tracking-wider text-ww-muted mb-1">{t('openTablesKpi')}</p>
        <p className="font-display font-extrabold text-2xl text-ww-orange">{ouvertes.length}</p>
      </div>
      <div className="bg-ww-surface border border-ww-border rounded-xl p-4">
        <p className="text-[10px] font-display font-bold uppercase tracking-wider text-ww-muted mb-1">{t('pendingKpi')}</p>
        <p className="font-display font-extrabold text-2xl text-ww-orange">&#3647; {totalEnAttente.toLocaleString()}</p>
      </div>
      <div className="bg-ww-surface border border-ww-border rounded-xl p-4">
        <p className="text-[10px] font-display font-bold uppercase tracking-wider text-ww-muted mb-1">{t('hotelTablesKpi')}</p>
        <p className="font-display font-extrabold text-2xl text-ww-wood">{hotelCount}</p>
      </div>
      <div className="bg-ww-surface border border-ww-border rounded-xl p-4">
        <p className="text-[10px] font-display font-bold uppercase tracking-wider text-ww-muted mb-1">{t('collectedTodayKpi')}</p>
        <p className="font-display font-extrabold text-2xl text-ww-lime">&#3647; {totalEncaisse.toLocaleString()}</p>
      </div>
    </div>
  )
}
