'use client'

import { useState, useMemo } from 'react'
import { Search, UserCheck } from 'lucide-react'
import { useActivePasses } from '@/contexts/active-passes-context'
import { toast } from 'sonner'

const TODAY = new Date().toISOString().split('T')[0]

export function MembresTab() {
  const { activePasses, addCheckin } = useActivePasses()
  const [search, setSearch] = useState('')

  const membres = useMemo(() =>
    activePasses.filter((p) => {
      if (!p.actif || p.dateExpiration < TODAY) return false
      const d0 = new Date(p.dateAchat).getTime()
      const d1 = new Date(p.dateExpiration).getTime()
      return (d1 - d0) / 86_400_000 > 1
    }),
    [activePasses]
  )

  const todayCount = useMemo(
    () => membres.reduce((n, p) => n + p.checkins.filter((c) => c.date === TODAY).length, 0),
    [membres]
  )

  const filtered = useMemo(() => {
    if (search.trim().length < 2) return membres
    const q = search.toLowerCase()
    return membres.filter((p) => p.clientNom.toLowerCase().includes(q))
  }, [search, membres])

  function handleCheckin(passId: string, clientNom: string) {
    const now = new Date()
    const heure = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    addCheckin(passId, { date: TODAY, heure })
    toast.success(`${clientNom} enregistre`, { description: `Entree a ${heure}` })
  }

  return (
    <div className="flex flex-col h-full p-5 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-ww-lime" />
          <h3 className="font-display font-bold text-lg uppercase tracking-wide text-ww-text">
            Membres actifs
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ww-lime opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ww-lime" />
          </span>
          <span className="font-display font-bold text-ww-lime text-lg">{todayCount}</span>
          <span className="text-ww-muted text-xs font-sans">aujourd&apos;hui</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ww-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un membre..."
          className="w-full h-11 pl-10 pr-3 rounded-lg bg-ww-bg border border-ww-border text-sm text-ww-text font-sans placeholder:text-ww-muted focus:outline-none focus:border-ww-orange transition-colors"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto space-y-2 min-h-0">
        {filtered.map((pass) => {
          const already = pass.checkins.some((c) => c.date === TODAY)
          const initials = pass.clientNom.split(' ').map((n) => n[0]).join('').toUpperCase()
          const expDate = pass.dateExpiration.split('-').reverse().join('/')
          return (
            <div key={pass.id} className="flex items-center gap-3 p-3 rounded-xl bg-ww-surface border border-ww-border">
              <div className="h-10 w-10 rounded-full bg-ww-surface-2 flex items-center justify-center text-xs font-display font-bold text-ww-text shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm font-medium text-ww-text truncate">{pass.clientNom}</p>
                <p className="text-xs text-ww-muted font-sans">
                  {pass.passNom} &middot; exp. {expDate}
                </p>
              </div>
              <button
                onClick={() => handleCheckin(pass.id, pass.clientNom)}
                disabled={already}
                className={`px-4 py-2 rounded-lg font-display font-bold text-sm uppercase tracking-wide transition-all duration-150 active:scale-[0.97] cursor-pointer ${
                  already
                    ? 'bg-ww-lime/10 text-ww-lime cursor-default'
                    : 'bg-ww-lime text-ww-bg hover:translate-y-[-1px]'
                }`}
              >
                {already ? 'PRESENT' : 'CHECK-IN'}
              </button>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className="text-ww-muted text-sm font-sans text-center py-8">Aucun membre actif</p>
        )}
      </div>
    </div>
  )
}
