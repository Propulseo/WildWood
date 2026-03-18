'use client'

import { useState, useMemo, useCallback } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { usePlanning } from '@/lib/hooks/usePlanning'
import { useExpenses } from '@/contexts/expenses-context'
import { useShift } from '@/contexts/shift-context'
import type { PlanningShift, Expense } from '@/lib/types'
import { useDevice } from '@/lib/useDevice'
import { GrillePlanning } from '@/components/planning/GrillePlanning'
import { PlanningListMobile } from '@/components/planning/PlanningListMobile'
import { BandeauPublication } from '@/components/planning/BandeauPublication'
import { ShiftModal } from '@/components/planning/ShiftModal'
import { toast } from 'sonner'

const TODAY = new Date().toISOString().split('T')[0]
const REPAS_MONTANT = 120

function getWeekDates(offset: number): string[] {
  const ref = new Date(TODAY + 'T00:00:00')
  const day = ref.getDay() === 0 ? 6 : ref.getDay() - 1
  const monday = new Date(ref)
  monday.setDate(ref.getDate() - day + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

function formatWeekLabel(dates: string[]) {
  const start = new Date(dates[0] + 'T00:00:00')
  const end = new Date(dates[6] + 'T00:00:00')
  const mois = ['janv.', 'fevr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'aout', 'sept.', 'oct.', 'nov.', 'dec.']
  return `Semaine du ${start.getDate()} au ${end.getDate()} ${mois[end.getMonth()]} ${end.getFullYear()}`
}

function PlanningSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-9 w-48 bg-ww-surface rounded-lg" />
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-ww-surface rounded-lg" />
          <div className="h-8 w-20 bg-ww-surface rounded-lg" />
        </div>
      </div>
      <div className="h-12 bg-ww-surface border border-ww-border rounded-xl" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 21 }).map((_, i) => (
          <div key={i} className="h-20 bg-ww-surface rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export default function PlanningPage() {
  const { role } = useAuth()
  const { shifts, publierSemaine, loading, error, refetch } = usePlanning()
  const { expenses, addExpense } = useExpenses()
  const { shiftState } = useShift()
  const isAdmin = role === 'admin'

  const [weekOffset, setWeekOffset] = useState(0)
  const [filtrePoste, setFiltrePoste] = useState<'tous' | 'reception' | 'bar'>('tous')
  const [modalState, setModalState] = useState<{ open: boolean; shift: PlanningShift | null; defaultDate?: string }>({ open: false, shift: null })

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset])
  const weekLabel = useMemo(() => formatWeekLabel(weekDates), [weekDates])

  const visibleShifts = useMemo(() => {
    const inWeek = shifts.filter((s) => weekDates.includes(s.date))
    if (!isAdmin) return inWeek.filter((s) => s.publie)
    return inWeek
  }, [shifts, weekDates, isAdmin])

  const hasUnpublished = useMemo(
    () => isAdmin && visibleShifts.some((s) => !s.publie),
    [isAdmin, visibleShifts]
  )

  const staffActifId = useMemo(() => {
    if (role === 'reception') return shiftState.reception?.staffId ?? null
    if (role === 'bar') return shiftState.bar?.staffId ?? null
    return null
  }, [role, shiftState])

  const handlePublier = useCallback(async () => {
    const unpublished = shifts.filter((s) => weekDates.includes(s.date) && !s.publie)
    await publierSemaine(weekDates)

    const repasShifts = unpublished.filter((s) => s.repas_inclus && s.date === TODAY)
    let count = 0
    for (const s of repasShifts) {
      const alreadyExists = expenses.some(
        (e) => (e as Expense & { auto_generated?: boolean }).auto_generated && e.note?.includes(s.staff_nom) && e.date === s.date
      )
      if (alreadyExists) continue
      const prenom = s.staff_nom.split(' ')[0]
      const expense: Expense = {
        id: `dep-auto-${Date.now()}-${count}`,
        titre: 'Staff Meal',
        montant_thb: REPAS_MONTANT,
        date: s.date,
        note: `Repas · ${prenom} · ${s.date}`,
        grande_categorie: 'gym',
        categorie: 'staff_meal',
        mode_paiement: 'black_box',
        staff_saisie: 'Systeme (auto)',
        created_at: new Date().toISOString(),
      }
      addExpense(expense)
      count++
    }

    toast.success(`Planning publie · ${weekLabel}`)
    if (count > 0) {
      toast.info(`🍽️ ${count} repas enregistre${count > 1 ? 's' : ''} automatiquement en depenses (Staff Meal)`)
    }
  }, [shifts, weekDates, publierSemaine, weekLabel, expenses, addExpense])

  const onEditShift = useCallback((shift: PlanningShift) => {
    setModalState({ open: true, shift, defaultDate: shift.date })
  }, [])

  const onAddShift = useCallback((date: string) => {
    setModalState({ open: true, shift: null, defaultDate: date })
  }, [])

  const { isMobile } = useDevice()
  const showEmptyNextWeek = !isAdmin && weekOffset > 0 && visibleShifts.length === 0

  if (loading) return <PlanningSkeleton />
  if (error) return <p className="text-center py-16 text-ww-danger font-sans">{error}</p>

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold text-ww-text tracking-tight uppercase">
          Planning
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          {(['tous', 'reception', 'bar'] as const).map((p) => (
            <button key={p} onClick={() => setFiltrePoste(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wide transition-all ${
                filtrePoste === p ? 'bg-ww-orange text-white' : 'bg-ww-surface-2 text-ww-muted hover:text-ww-text border border-ww-border'
              }`}>
              {p === 'tous' ? 'Tous' : p === 'reception' ? 'Reception' : 'Bar'}
            </button>
          ))}
          {isAdmin && (
            <button onClick={() => setModalState({ open: true, shift: null })}
              className="px-4 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wide bg-ww-orange text-white transition-all hover:-translate-y-0.5 active:scale-[0.97]">
              ＋ Ajouter un shift
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 bg-ww-surface border border-ww-border rounded-xl px-4 py-2.5">
        <button onClick={() => setWeekOffset((o) => o - 1)}
          className="text-ww-muted hover:text-ww-text transition-colors font-display font-bold text-sm">
          &larr; Sem. prec.
        </button>
        <span className="font-display font-bold text-sm text-ww-text uppercase tracking-wide">
          {weekLabel}
        </span>
        <button onClick={() => setWeekOffset((o) => o + 1)}
          className="text-ww-muted hover:text-ww-text transition-colors font-display font-bold text-sm">
          Sem. suiv. &rarr;
        </button>
      </div>

      {weekOffset !== 0 && (
        <div className="flex justify-center">
          <button onClick={() => setWeekOffset(0)}
            className="px-4 py-1 rounded-full text-xs font-display font-bold bg-ww-surface-2 border border-ww-border text-ww-muted hover:text-ww-text transition-colors">
            Semaine en cours
          </button>
        </div>
      )}

      {isAdmin && <BandeauPublication weekLabel={weekLabel} hasUnpublished={hasUnpublished} onPublier={handlePublier} />}

      {showEmptyNextWeek ? (
        <div className="text-center py-16 text-ww-muted font-body">
          <p className="text-3xl mb-3">⏳</p>
          <p>Le planning de cette semaine</p>
          <p>n&apos;est pas encore disponible</p>
        </div>
      ) : isMobile ? (
        <PlanningListMobile
          shifts={visibleShifts} weekDates={weekDates} todayStr={TODAY}
          staffActifId={staffActifId} filtrePoste={filtrePoste}
          onEditShift={onEditShift}
        />
      ) : (
        <GrillePlanning
          shifts={visibleShifts} weekDates={weekDates} todayStr={TODAY}
          isAdmin={isAdmin} staffActifId={staffActifId} filtrePoste={filtrePoste}
          onEditShift={onEditShift} onAddShift={onAddShift}
        />
      )}

      {modalState.open && (
        <ShiftModal weekDates={weekDates} editShift={modalState.shift}
          defaultDate={modalState.defaultDate}
          onClose={() => { setModalState({ open: false, shift: null }); refetch() }}
        />
      )}
    </div>
  )
}
