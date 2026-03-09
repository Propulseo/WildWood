'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { Search, UserCheck, ChevronDown, ChevronUp } from 'lucide-react'
import { useActivePasses } from '@/contexts/active-passes-context'
import { toast } from 'sonner'

const TODAY = '2026-03-06'
const MIN_H = 52
const DEFAULT_H = 280
const MAX_H = 600

export function CheckinSection() {
  const { activePasses, addCheckin } = useActivePasses()
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const [height, setHeight] = useState(DEFAULT_H)
  const dragging = useRef(false)
  const startY = useRef(0)
  const startH = useRef(0)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true
    startY.current = e.clientY
    startH.current = height
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [height])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    const delta = startY.current - e.clientY
    setHeight(Math.min(MAX_H, Math.max(MIN_H, startH.current + delta)))
  }, [])

  const onPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  const activeOnly = useMemo(
    () => activePasses.filter((p) => p.actif && p.dateExpiration >= TODAY),
    [activePasses]
  )

  const todayCount = useMemo(
    () => activeOnly.reduce((n, p) => n + p.checkins.filter((c) => c.date === TODAY).length, 0),
    [activeOnly]
  )

  const filtered = useMemo(() => {
    if (search.trim().length < 2) return activeOnly
    const q = search.toLowerCase()
    return activeOnly.filter((p) => p.clientNom.toLowerCase().includes(q))
  }, [search, activeOnly])

  function handleCheckin(passId: string, clientNom: string) {
    const now = new Date()
    const heure = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    addCheckin(passId, { date: TODAY, heure })
    toast.success(`${clientNom} enregistre`, { description: `Entree a ${heure}` })
  }

  return (
    <div className="shrink-0 flex flex-col" style={{ height: collapsed ? 'auto' : height }}>
      {/* Drag handle */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="h-3 flex items-center justify-center cursor-row-resize bg-ww-surface border-y border-ww-border select-none touch-none"
      >
        <div className="w-10 h-1 rounded-full bg-ww-muted/40" />
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-5 pt-3 gap-3">
        {/* Header */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex items-center justify-between w-full cursor-pointer shrink-0"
        >
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-ww-lime" />
            <h3 className="font-display font-bold text-lg uppercase tracking-wide text-ww-text">
              Check-in
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ww-lime opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ww-lime" />
            </span>
            <span className="font-display font-bold text-ww-lime text-lg">{todayCount}</span>
            <span className="text-ww-muted text-xs font-sans">aujourd&apos;hui</span>
            {collapsed ? (
              <ChevronDown className="h-4 w-4 text-ww-muted ml-1" />
            ) : (
              <ChevronUp className="h-4 w-4 text-ww-muted ml-1" />
            )}
          </div>
        </button>

        {!collapsed && (
          <>
            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ww-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un client..."
                className="w-full h-10 pl-10 pr-3 rounded-lg bg-ww-bg border border-ww-border text-sm text-ww-text font-sans placeholder:text-ww-muted focus:outline-none focus:border-ww-orange transition-colors"
              />
            </div>

            <div className="flex-1 overflow-auto space-y-2 min-h-0">
              {filtered.map((pass) => {
                const already = pass.checkins.some((c) => c.date === TODAY)
                const initials = pass.clientNom.split(' ').map((n) => n[0]).join('').toUpperCase()
                return (
                  <div key={pass.id} className="flex items-center gap-3 p-3 rounded-lg bg-ww-bg border border-ww-border">
                    <div className="h-9 w-9 rounded-full bg-ww-surface-2 flex items-center justify-center text-xs font-display font-bold text-ww-text shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm font-medium text-ww-text truncate">{pass.clientNom}</p>
                      <p className="text-xs text-ww-muted font-sans">
                        {pass.passNom} &middot; exp. {pass.dateExpiration.split('-').reverse().join('/')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCheckin(pass.id, pass.clientNom)}
                      disabled={already}
                      className={`px-3 py-1.5 rounded-lg font-display font-bold text-xs uppercase tracking-wide transition-all duration-150 active:scale-[0.97] ${
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
                <p className="text-ww-muted text-sm font-sans text-center py-4">Aucun pass actif</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
