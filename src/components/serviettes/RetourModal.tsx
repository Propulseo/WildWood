'use client'

import { useState, useMemo } from 'react'
import { useServiettes } from '@/contexts/serviettes-context'
import { useStaff } from '@/contexts/staff-context'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface RetourModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RetourModal({ open, onOpenChange }: RetourModalProps) {
  const { serviettes, validerRetour } = useServiettes()
  const { staff } = useStaff()
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [statut, setStatut] = useState<'rendue' | 'perdue'>('rendue')
  const [note, setNote] = useState('')
  const [staffRetour, setStaffRetour] = useState('')

  const enCours = useMemo(
    () => serviettes.filter((s) => s.statut === 'en_cours'),
    [serviettes]
  )

  const filtered = useMemo(
    () => search.trim()
      ? enCours.filter((s) => s.client_nom.toLowerCase().includes(search.toLowerCase()))
      : enCours,
    [enCours, search]
  )

  const selected = selectedId ? enCours.find((s) => s.id === selectedId) : null

  function handleSubmit() {
    if (!selectedId || !staffRetour) return
    if (statut === 'perdue' && !note.trim()) return

    validerRetour(selectedId, statut, staffRetour, statut === 'perdue' ? note.trim() : undefined)

    if (statut === 'rendue') {
      toast.success(`Retour valide — 500 THB rembourse a ${selected?.client_nom}`)
    } else {
      toast('Serviette perdue enregistree — Depot conserve', { icon: '🏖️' })
    }

    setSearch('')
    setSelectedId(null)
    setStatut('rendue')
    setNote('')
    setStaffRetour('')
    onOpenChange(false)
  }

  function handleOpenChange(v: boolean) {
    if (!v) { setSelectedId(null); setSearch(''); setStatut('rendue'); setNote(''); setStaffRetour('') }
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-xl">Retour serviette</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {!selected ? (
            <>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un client..." />
              <div className="max-h-48 overflow-auto space-y-1">
                {filtered.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className="w-full text-left px-3 py-2.5 rounded-lg bg-ww-surface hover:bg-ww-surface-2 transition-colors"
                  >
                    <span className="font-sans text-sm text-ww-text">{s.client_nom}</span>
                    <span className="text-xs text-ww-muted ml-2">{s.heure_emprunt} · {s.date_emprunt}</span>
                  </button>
                ))}
                {filtered.length === 0 && <p className="text-sm text-ww-muted text-center py-4">Aucun emprunt en cours</p>}
              </div>
            </>
          ) : (
            <>
              <div className="bg-ww-surface-2 rounded-lg p-4 space-y-1">
                <p className="font-sans font-medium text-ww-text">{selected.client_nom}</p>
                <p className="text-xs text-ww-muted">Emprunt {selected.heure_emprunt} · {selected.date_emprunt}</p>
                <p className="font-display font-bold text-ww-orange mt-1">Rembourser 500 THB</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStatut('rendue')} className={`flex-1 py-2.5 rounded-lg text-sm font-display font-bold uppercase tracking-wider transition-all ${statut === 'rendue' ? 'bg-[var(--ww-lime)] text-white' : 'bg-ww-surface text-ww-muted border border-ww-border'}`}>
                  Rendue en bon etat
                </button>
                <button onClick={() => setStatut('perdue')} className={`flex-1 py-2.5 rounded-lg text-sm font-display font-bold uppercase tracking-wider transition-all ${statut === 'perdue' ? 'bg-ww-danger text-white' : 'bg-ww-surface text-ww-muted border border-ww-border'}`}>
                  Perdue / Abimee
                </button>
              </div>

              {statut === 'perdue' && (
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note obligatoire..." />
              )}

              <div>
                <label className="text-sm font-sans text-ww-muted mb-1.5 block">Staff qui valide</label>
                <Select value={staffRetour} onValueChange={setStaffRetour}>
                  <SelectTrigger><SelectValue placeholder="Choisir un staff" /></SelectTrigger>
                  <SelectContent>
                    {staff.map((s) => (
                      <SelectItem key={s.id} value={s.prenom}>{s.prenom} {s.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!staffRetour || (statut === 'perdue' && !note.trim())}
                className="w-full h-12 bg-[var(--ww-lime)] text-white font-display font-bold text-base uppercase tracking-wider rounded-lg transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                VALIDER LE RETOUR
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
