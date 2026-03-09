'use client'

import { useState, useMemo } from 'react'
import { useServiettes } from '@/contexts/serviettes-context'
import { EmpruntModal } from './EmpruntModal'
import { RetourModal } from './RetourModal'
import { StockEditor } from './StockEditor'

export function ServiettesTab() {
  const { serviettes, stockTotal } = useServiettes()
  const [empruntOpen, setEmpruntOpen] = useState(false)
  const [retourOpen, setRetourOpen] = useState(false)
  const [stockEditorOpen, setStockEditorOpen] = useState(false)

  const enCours = useMemo(
    () => serviettes.filter((s) => s.statut === 'en_cours'),
    [serviettes]
  )

  const totalDepots = enCours.length * 500
  const disponibles = stockTotal - enCours.length

  return (
    <div className="p-5 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Stock total - clickable to edit */}
        <button
          onClick={() => setStockEditorOpen(true)}
          className="bg-ww-surface border border-ww-border rounded-xl p-4 text-center transition-all hover:border-ww-orange active:scale-[0.97]"
        >
          <p className="font-display font-extrabold text-3xl text-ww-text tracking-tight">
            {stockTotal}
          </p>
          <p className="font-sans text-xs text-ww-muted mt-1 uppercase">Stock total</p>
          <p className="font-mono text-[10px] text-ww-orange mt-1">modifier</p>
        </button>

        {/* En circulation */}
        <div className="bg-ww-surface border border-ww-border rounded-xl p-4 text-center">
          <p className="font-display font-extrabold text-3xl text-ww-orange tracking-tight">
            {enCours.length}
          </p>
          <p className="font-sans text-xs text-ww-muted mt-1 uppercase">En circulation</p>
        </div>

        {/* Disponibles */}
        <div className="bg-ww-surface border border-ww-border rounded-xl p-4 text-center">
          <p className={`font-display font-extrabold text-3xl tracking-tight ${disponibles <= 3 ? 'text-ww-danger' : 'text-[var(--ww-lime)]'}`}>
            {disponibles}
          </p>
          <p className="font-sans text-xs text-ww-muted mt-1 uppercase">Disponibles</p>
        </div>
      </div>

      {/* Depots en cours */}
      <p className="text-center font-display font-semibold text-lg text-ww-muted">
        {String.fromCharCode(3647)} {totalDepots.toLocaleString()} de depots en cours
      </p>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setEmpruntOpen(true)}
          className="bg-ww-orange text-white rounded-xl p-6 text-center transition-all hover:brightness-110 active:scale-[0.97]"
        >
          <p className="font-display font-bold text-xl uppercase tracking-wider">+ EMPRUNT</p>
          <p className="font-sans text-sm mt-2 opacity-80">Donner une serviette</p>
          <p className="font-display font-bold text-base mt-1">+ 500{String.fromCharCode(3647)} depot</p>
        </button>

        <button
          onClick={() => setRetourOpen(true)}
          className="bg-[var(--ww-lime)] text-white rounded-xl p-6 text-center transition-all hover:brightness-110 active:scale-[0.97]"
        >
          <p className="font-display font-bold text-xl uppercase tracking-wider">RETOUR</p>
          <p className="font-sans text-sm mt-2 opacity-80">Recuperer une serviette</p>
          <p className="font-display font-bold text-base mt-1">- 500{String.fromCharCode(3647)} rendu</p>
        </button>
      </div>

      {/* En cours list */}
      <div>
        <p className="ww-label mb-2">EMPRUNTS EN COURS</p>
        <div className="space-y-1.5">
          {enCours.length === 0 ? (
            <p className="text-sm text-ww-muted">Aucune serviette en circulation</p>
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

      <EmpruntModal open={empruntOpen} onOpenChange={setEmpruntOpen} />
      <RetourModal open={retourOpen} onOpenChange={setRetourOpen} />
      <StockEditor open={stockEditorOpen} onOpenChange={setStockEditorOpen} />
    </div>
  )
}
