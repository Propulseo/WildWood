'use client'

import { useState, useRef } from 'react'
import { useStaff } from '@/contexts/staff-context'
import { Play, Square, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

function formatHeure(h: string) {
  return h.replace(':', 'h')
}

export function PointageButton() {
  const { staff, selectedStaffId, setSelectedStaffId, pointerArrivee, pointerDepart, getPointageAujourdhui } = useStaff()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [glowClass, setGlowClass] = useState('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentStaff = staff.find((s) => s.id === selectedStaffId)
  const pointage = selectedStaffId ? getPointageAujourdhui(selectedStaffId) : undefined
  const isArrive = !!pointage
  const isParti = !!pointage?.heure_depart

  function triggerGlow(variant: 'lime' | 'danger') {
    setGlowClass(variant === 'lime' ? 'ww-pointage-glow' : 'ww-pointage-glow-danger')
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setGlowClass(''), 350)
  }

  function handleArrivee() {
    if (!selectedStaffId) return
    const heure = pointerArrivee(selectedStaffId)
    triggerGlow('lime')
    toast.success(`Arrivee enregistree — ${formatHeure(heure)}`)
  }

  function handleDepart() {
    if (!selectedStaffId) return
    const heure = pointerDepart(selectedStaffId)
    triggerGlow('danger')
    toast.success(`Depart enregistre — ${formatHeure(heure)}`)
  }

  if (staff.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      {/* Staff selector */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 bg-ww-surface border border-ww-border rounded-lg px-2.5 py-1.5 text-sm font-sans text-ww-text hover:bg-ww-surface-2 transition-colors"
        >
          {currentStaff && (
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ backgroundColor: currentStaff.couleur_avatar }}
            >
              {currentStaff.avatar_initiales}
            </span>
          )}
          <span className="max-w-[80px] truncate">{currentStaff?.prenom}</span>
          <ChevronDown className="h-3.5 w-3.5 text-ww-muted" />
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-50 bg-ww-surface border border-ww-border rounded-lg shadow-lg py-1 min-w-[180px]">
              {staff.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedStaffId(s.id); setDropdownOpen(false) }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-sans transition-colors ${
                    s.id === selectedStaffId ? 'bg-ww-orange/10 text-ww-orange' : 'text-ww-text hover:bg-ww-surface-2'
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ backgroundColor: s.couleur_avatar }}
                  >
                    {s.avatar_initiales}
                  </span>
                  {s.prenom} {s.nom}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pointage action */}
      {!isArrive ? (
        <button
          onClick={handleArrivee}
          className={`flex items-center gap-1.5 bg-ww-lime text-white font-display font-bold text-xs uppercase tracking-wider px-3 py-2 rounded-lg transition-all ${glowClass}`}
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          ARRIVEE
        </button>
      ) : isParti ? (
        <span className="text-xs font-sans text-ww-muted px-2">
          {formatHeure(pointage!.heure_arrivee)} — {formatHeure(pointage!.heure_depart!)}
        </span>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs font-sans text-ww-success">
            {formatHeure(pointage!.heure_arrivee)}
          </span>
          <button
            onClick={handleDepart}
            className={`flex items-center gap-1.5 bg-ww-danger text-white font-display font-bold text-xs uppercase tracking-wider px-3 py-2 rounded-lg transition-all ${glowClass}`}
          >
            <Square className="h-3 w-3 fill-current" />
            DEPART
          </button>
        </div>
      )}
    </div>
  )
}
