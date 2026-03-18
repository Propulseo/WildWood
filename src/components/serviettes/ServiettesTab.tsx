'use client'

import { useState, useMemo } from 'react'
import { useServiettes } from '@/contexts/serviettes-context'
import { EmpruntModal } from './EmpruntModal'
import { RetourModal } from './RetourModal'
import { ReceptionLavageModal } from './ReceptionLavageModal'
import { ListeAttenteLavage } from './ListeAttenteLavage'
import { useTranslations } from 'next-intl'

export function ServiettesTab() {
  const t = useTranslations('towels')
  const { serviettes, enStock, empruntees, sales, enLavage } = useServiettes()
  const [empruntOpen, setEmpruntOpen] = useState(false)
  const [retourOpen, setRetourOpen] = useState(false)
  const [receptionOpen, setReceptionOpen] = useState(false)

  const enCours = useMemo(
    () => serviettes.filter((s) => s.statut === 'en_cours'),
    [serviettes]
  )

  const servietteSales = useMemo(
    () => serviettes.filter((s) => s.statut === 'rendue' && s.etat === 'sale'),
    [serviettes]
  )

  const totalDepots = enCours.length * 100

  return (
    <div className="p-5 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-ww-surface border border-ww-border rounded-xl p-4 text-center">
          <p className="font-display font-extrabold text-3xl text-[var(--ww-lime)] tracking-tight">
            {enStock}
          </p>
          <p className="font-sans text-xs text-ww-muted mt-1 uppercase">{t('inStock')}</p>
        </div>
        <div className="bg-ww-surface border border-ww-border rounded-xl p-4 text-center">
          <p className="font-display font-extrabold text-3xl text-ww-orange tracking-tight">
            {empruntees}
          </p>
          <p className="font-sans text-xs text-ww-muted mt-1 uppercase">{t('borrowed')}</p>
        </div>
        <div className="bg-ww-surface border border-ww-border rounded-xl p-4 text-center">
          <p className="font-display font-extrabold text-3xl text-ww-danger tracking-tight">
            {sales}
          </p>
          <p className="font-sans text-xs text-ww-muted mt-1 uppercase">{t('dirty')}</p>
        </div>
        <div className="bg-ww-surface border border-ww-border rounded-xl p-4 text-center">
          <p className="font-display font-extrabold text-3xl text-[var(--ww-wood)] tracking-tight">
            {enLavage}
          </p>
          <p className="font-sans text-xs text-ww-muted mt-1 uppercase">{t('inLaundry')}</p>
        </div>
      </div>

      {/* Depots en cours */}
      <p className="text-center font-display font-semibold text-lg text-ww-muted">
        {String.fromCharCode(3647)} {totalDepots.toLocaleString()} {t('depositsInProgress')}
      </p>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setEmpruntOpen(true)}
          className="bg-ww-orange text-white rounded-xl p-6 text-center transition-all hover:brightness-110 active:scale-[0.97]"
        >
          <p className="font-display font-bold text-xl uppercase tracking-wider">+ {t('borrow').toUpperCase()}</p>
          <p className="font-sans text-sm mt-2 opacity-80">{t('giveATowel')}</p>
          <p className="font-display font-bold text-base mt-1">+ 500{String.fromCharCode(3647)} {t('deposit')}</p>
        </button>

        <button
          onClick={() => setRetourOpen(true)}
          className="bg-[var(--ww-lime)] text-white rounded-xl p-6 text-center transition-all hover:brightness-110 active:scale-[0.97]"
        >
          <p className="font-display font-bold text-xl uppercase tracking-wider">{t('return').toUpperCase()}</p>
          <p className="font-sans text-sm mt-2 opacity-80">{t('recoverATowel')}</p>
          <p className="font-display font-bold text-base mt-1">- 500{String.fromCharCode(3647)} {t('refund')}</p>
        </button>
      </div>

      {/* Reception lavage button */}
      {sales > 0 && (
        <button
          onClick={() => setReceptionOpen(true)}
          className="w-full bg-ww-surface border border-[var(--ww-wood)] text-[var(--ww-wood)] rounded-xl p-4 text-center transition-all hover:bg-ww-surface-2 active:scale-[0.97]"
        >
          <p className="font-display font-bold text-base uppercase tracking-wider">
            {t('laundryReception').toUpperCase()} · {sales} {t('towelsWaiting')}
          </p>
        </button>
      )}

      {/* En cours list */}
      <div>
        <p className="ww-label mb-2">{t('borrowsInProgress')}</p>
        <div className="space-y-1.5">
          {enCours.length === 0 ? (
            <p className="text-sm text-ww-muted">{t('noneInCirculation')}</p>
          ) : (
            enCours.map((s) => (
              <div key={s.id} className="flex items-center justify-between bg-ww-surface rounded-lg px-3 py-2">
                <div>
                  <span className="font-sans text-sm text-ww-text">{s.client_nom}</span>
                  <span className="text-xs text-ww-muted ml-2">{s.heure_emprunt}</span>
                </div>
                <span className="text-xs font-mono text-ww-muted">{s.date_emprunt}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Attente lavage list */}
      {servietteSales.length > 0 && (
        <div>
          <p className="ww-label mb-2">{t('awaitingLaundry')}</p>
          <ListeAttenteLavage serviettes={servietteSales} />
        </div>
      )}

      <EmpruntModal open={empruntOpen} onOpenChange={setEmpruntOpen} />
      <RetourModal open={retourOpen} onOpenChange={setRetourOpen} />
      <ReceptionLavageModal open={receptionOpen} onOpenChange={setReceptionOpen} />
    </div>
  )
}
