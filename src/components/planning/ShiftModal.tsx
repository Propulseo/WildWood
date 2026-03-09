'use client'

import { useState, useMemo, useEffect } from 'react'
import type { PlanningShift } from '@/lib/types'
import { usePlanning } from '@/contexts/planning-context'
import { useStaff } from '@/contexts/staff-context'
import { toast } from 'sonner'

const HEURES = Array.from({ length: 36 }, (_, i) => {
  const h = Math.floor(i / 2) + 6
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
})

const JOURS_SEMAINE = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function formatDate(d: string) {
  const date = new Date(d + 'T00:00:00')
  const day = JOURS_SEMAINE[date.getDay() === 0 ? 6 : date.getDay() - 1]
  return `${day} ${String(date.getDate()).padStart(2, '0')}`
}

function calculerDureeMin(debut: string, fin: string) {
  const [hd, md] = debut.split(':').map(Number)
  const [hf, mf] = fin.split(':').map(Number)
  return (hf * 60 + mf) - (hd * 60 + md)
}

function formatDuree(minutes: number) {
  if (minutes <= 0) return null
  return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}`
}

interface ShiftModalProps {
  weekDates: string[]
  editShift: PlanningShift | null
  defaultDate?: string
  onClose: () => void
}

export function ShiftModal({ weekDates, editShift, defaultDate, onClose }: ShiftModalProps) {
  const { shifts, addShift, updateShift, removeShift } = usePlanning()
  const { staff } = useStaff()

  const staffList = useMemo(() => staff.filter((s) => s.poste !== 'admin'), [staff])

  const [staffId, setStaffId] = useState(editShift?.staff_id ?? staffList[0]?.id ?? '')
  const [date, setDate] = useState(editShift?.date ?? defaultDate ?? weekDates[0])
  const [poste, setPoste] = useState<'reception' | 'bar'>(editShift?.poste_shift ?? 'reception')
  const [debut, setDebut] = useState(editShift?.heure_debut ?? '08:00')
  const [fin, setFin] = useState(editShift?.heure_fin ?? '16:00')
  const [note, setNote] = useState(editShift?.note ?? '')
  const [repasInclus, setRepasInclus] = useState(editShift?.repas_inclus ?? true)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!editShift && staffList.length > 0 && !staffId) setStaffId(staffList[0].id)
  }, [staffList, editShift, staffId])

  const dureeMin = calculerDureeMin(debut, fin)
  const duree = formatDuree(dureeMin)
  const isFullDay = dureeMin >= 480
  const selectedStaff = staffList.find((s) => s.id === staffId)

  useEffect(() => {
    if (isFullDay) setRepasInclus(true)
    else setRepasInclus(false)
  }, [debut, fin, isFullDay])

  const conflit = useMemo(() => {
    const existing = shifts.find(
      (s) => s.staff_id === staffId && s.date === date && s.id !== editShift?.id
    )
    return existing ?? null
  }, [shifts, staffId, date, editShift])

  const canSave = !!staffId && !!date && !!duree && !conflit

  function handleSave() {
    if (!canSave || !selectedStaff) return
    const data = {
      staff_id: staffId,
      staff_nom: `${selectedStaff.prenom} ${selectedStaff.nom}`,
      staff_poste: selectedStaff.poste,
      date, heure_debut: debut, heure_fin: fin,
      poste_shift: poste,
      note: note.trim() || null,
      publie: false,
      repas_inclus: repasInclus,
    } satisfies Omit<PlanningShift, 'id'>

    if (editShift) {
      updateShift(editShift.id, data)
      toast.success('Shift modifie')
    } else {
      addShift(data)
      toast.success('Shift ajoute')
    }
    onClose()
  }

  function handleDelete() {
    if (!editShift) return
    if (!confirmDelete) { setConfirmDelete(true); return }
    removeShift(editShift.id)
    toast.success('Shift supprime')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-ww-surface border border-ww-border rounded-xl w-full max-w-md p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}>

        <h2 className="font-display font-extrabold text-xl text-ww-text uppercase tracking-wide">
          {editShift ? 'Modifier le shift' : 'Ajouter un shift'}
        </h2>

        <div>
          <label className="ww-label mb-1.5 block">Staff</label>
          <select value={staffId} onChange={(e) => setStaffId(e.target.value)}
            className="w-full bg-ww-bg border border-ww-border rounded-lg px-3 py-2 text-sm text-ww-text font-body">
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>{s.prenom} {s.nom} — {s.poste}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="ww-label mb-1.5 block">Jour</label>
          <div className="flex gap-1.5 flex-wrap">
            {weekDates.map((d) => (
              <button key={d} onClick={() => setDate(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-display font-bold transition-all ${
                  date === d ? 'bg-ww-orange text-white' : 'bg-ww-bg border border-ww-border text-ww-muted hover:text-ww-text'
                }`}>{formatDate(d)}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="ww-label mb-1.5 block">Poste</label>
          <div className="flex gap-2">
            {(['reception', 'bar'] as const).map((p) => (
              <button key={p} onClick={() => setPoste(p)}
                className={`flex-1 py-2 rounded-lg text-xs font-display font-bold uppercase transition-all ${
                  poste === p ? (p === 'reception' ? 'bg-ww-orange/20 border-ww-orange text-ww-orange border' : 'bg-ww-wood/20 border-ww-wood text-ww-wood border') : 'bg-ww-bg border border-ww-border text-ww-muted'
                }`}>
                {p === 'reception' ? '🏨 Reception' : '🍹 Bar'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="ww-label mb-1.5 block">Horaires</label>
          <div className="flex items-center gap-3">
            <select value={debut} onChange={(e) => setDebut(e.target.value)}
              className="flex-1 bg-ww-bg border border-ww-border rounded-lg px-3 py-2 text-sm text-ww-text font-body">
              {HEURES.map((h) => <option key={h} value={h}>{h.replace(':', 'h')}</option>)}
            </select>
            <span className="text-ww-muted text-sm">&rarr;</span>
            <select value={fin} onChange={(e) => setFin(e.target.value)}
              className="flex-1 bg-ww-bg border border-ww-border rounded-lg px-3 py-2 text-sm text-ww-text font-body">
              {HEURES.map((h) => <option key={h} value={h}>{h.replace(':', 'h')}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            {duree ? (
              <p className="text-xs" style={{ color: 'var(--ww-lime)' }}>Duree calculee : {duree} {isFullDay ? '🍽️' : ''}</p>
            ) : (
              <p className="text-xs text-ww-danger">Horaires invalides</p>
            )}
          </div>
          {conflit && (
            <p className="text-xs mt-1 text-ww-danger">
              ⚠️ {conflit.staff_nom} a deja un shift ce jour ({conflit.heure_debut.replace(':', 'h')} &rarr; {conflit.heure_fin.replace(':', 'h')})
            </p>
          )}
        </div>

        {/* Repas inclus toggle */}
        <div className="bg-ww-bg border border-ww-border rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-body text-ww-text">Repas inclus</p>
              <p className="text-[11px] font-body text-ww-muted mt-0.5">
                {isFullDay ? 'WildWood prend en charge le repas' : 'Repas inclus uniquement pour les journees completes (8h+)'}
              </p>
            </div>
            <button
              onClick={() => isFullDay && setRepasInclus((v) => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                repasInclus ? '' : 'bg-ww-border'
              } ${!isFullDay ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              style={repasInclus ? { backgroundColor: 'var(--ww-lime)' } : undefined}
              title={!isFullDay ? 'Repas inclus uniquement pour les journees completes (8h+)' : undefined}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                repasInclus ? 'left-5.5' : 'left-0.5'
              }`} />
            </button>
          </div>
        </div>

        <div>
          <label className="ww-label mb-1.5 block">Note (optionnel)</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex: Remplace Marco"
            className="w-full bg-ww-bg border border-ww-border rounded-lg px-3 py-2 text-sm text-ww-text font-body" />
        </div>

        <div className="flex items-center justify-between pt-2">
          {editShift ? (
            <button onClick={handleDelete} className="text-xs text-ww-danger hover:underline font-body">
              {confirmDelete ? '⚠️ Confirmer la suppression ?' : '🗑️ Supprimer ce shift'}
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-body text-ww-muted hover:text-ww-text transition-colors">
              Annuler
            </button>
            <button onClick={handleSave} disabled={!canSave}
              className="px-5 py-2 rounded-lg text-sm font-display font-bold uppercase bg-ww-orange text-white transition-all hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none">
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
