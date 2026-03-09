'use client'

import { useState, useMemo } from 'react'
import { X } from 'lucide-react'
import { isToday, parseISO } from 'date-fns'
import type { Client, Bungalow, ActiveGymPass } from '@/lib/types'

type Mode = null | 'bungalow' | 'client' | 'externe'

interface FnbAssignPopupProps {
  open: boolean
  onClose: () => void
  bungalows: Bungalow[]
  clients: Client[]
  activePasses: ActiveGymPass[]
  onBungalowSelect: (client: Client, bungalowNumero: number) => void
  onClientSelect: (clientName: string, clientId?: string) => void
  onExterne: () => void
}

export function FnbAssignPopup({
  open, onClose, bungalows, clients, activePasses,
  onBungalowSelect, onClientSelect, onExterne,
}: FnbAssignPopupProps) {
  const [mode, setMode] = useState<Mode>(null)
  const [search, setSearch] = useState('')

  const residents = useMemo(() => {
    const result: { client: Client; bungalowNumero: number }[] = []
    for (const b of bungalows) {
      for (const r of b.reservations) {
        if (r.statut !== 'confirmee' && r.statut !== 'en-cours') continue
        const c = clients.find((cl) => cl.id === r.clientId)
        if (c) result.push({ client: c, bungalowNumero: b.numero })
      }
    }
    return result
  }, [bungalows, clients])

  const todayClients = useMemo(() => {
    const seen = new Set<string>()
    const result: { id: string; nom: string }[] = []
    for (const pass of activePasses) {
      if (seen.has(pass.clientId)) continue
      const hasToday = pass.checkins.some((c) => isToday(parseISO(c.date)))
      if (hasToday) {
        seen.add(pass.clientId)
        result.push({ id: pass.clientId, nom: pass.clientNom })
      }
    }
    return result
  }, [activePasses])

  const filteredClients = search.trim()
    ? todayClients.filter((c) => c.nom.toLowerCase().includes(search.toLowerCase()))
    : todayClients

  const handleClose = () => { setMode(null); setSearch(''); onClose() }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={handleClose} />
      <div className="relative bg-ww-surface border border-ww-border rounded-xl p-6 w-full max-w-md shadow-lg shadow-black/30">
        <button onClick={handleClose} className="absolute top-4 right-4 text-ww-muted hover:text-ww-text transition-colors">
          <X className="h-5 w-5" />
        </button>

        <h3 className="font-display text-lg font-bold text-ww-text mb-1">ASSIGNER LA COMMANDE</h3>
        <p className="text-xs text-ww-muted font-body mb-5">Qui paie cette commande F&B ?</p>

        {/* Mode selector */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {([
            { key: 'bungalow' as const, icon: '🏠', label: 'BUNGALOW' },
            { key: 'client' as const, icon: '👤', label: 'CLIENT' },
            { key: 'externe' as const, icon: '💵', label: 'EXTERNE' },
          ]).map((opt) => (
            <button
              key={opt.key}
              onClick={() => { setMode(opt.key); setSearch('') }}
              className={`flex flex-col items-center gap-1.5 py-4 rounded-lg border text-sm font-display font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.97] cursor-pointer ${
                mode === opt.key
                  ? 'bg-ww-orange/15 border-ww-orange text-ww-orange'
                  : 'bg-ww-surface-2 border-ww-border text-ww-muted hover:text-ww-text hover:border-ww-text/30'
              }`}
            >
              <span className="text-xl">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Bungalow mode */}
        {mode === 'bungalow' && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {residents.length === 0 ? (
              <p className="text-sm text-ww-muted text-center py-4">Aucun resident actif</p>
            ) : residents.map((r) => (
              <button
                key={r.client.id}
                onClick={() => { onBungalowSelect(r.client, r.bungalowNumero); handleClose() }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-ww-surface-2 border border-ww-border hover:border-ww-orange transition-colors cursor-pointer"
              >
                <span className="text-sm font-body text-ww-text">{r.client.prenom} {r.client.nom}</span>
                <span className="text-xs font-display font-bold text-ww-wood">B{r.bungalowNumero}</span>
              </button>
            ))}
          </div>
        )}

        {/* Client mode */}
        {mode === 'client' && (
          <div className="space-y-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Prenom du client..."
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg bg-ww-bg border border-ww-border text-ww-text text-sm font-body placeholder:text-ww-muted/50 focus:outline-none focus:ring-2 focus:ring-ww-orange/50"
            />
            {filteredClients.length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {filteredClients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { onClientSelect(c.nom, c.id); handleClose() }}
                    className="w-full text-left px-3 py-2 rounded-lg bg-ww-surface-2 border border-ww-border hover:border-ww-lime text-sm font-body text-ww-text transition-colors cursor-pointer"
                  >
                    {c.nom}
                  </button>
                ))}
              </div>
            )}
            {search.trim() && filteredClients.length === 0 && (
              <button
                onClick={() => { onClientSelect(search.trim()); handleClose() }}
                className="w-full py-2.5 rounded-lg bg-ww-orange text-white text-sm font-display font-bold transition-all hover:bg-ww-orange/90 active:scale-[0.97]"
              >
                ASSIGNER A &ldquo;{search.trim()}&rdquo;
              </button>
            )}
          </div>
        )}

        {/* Externe mode */}
        {mode === 'externe' && (
          <div className="text-center py-2">
            <p className="text-sm text-ww-muted font-body mb-4">Paiement especes direct</p>
            <button
              onClick={() => { onExterne(); handleClose() }}
              className="w-full py-2.5 rounded-lg bg-ww-orange text-white text-sm font-display font-bold transition-all hover:bg-ww-orange/90 active:scale-[0.97]"
            >
              ENCAISSER EN ESPECES
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
