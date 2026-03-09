'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useStaff } from '@/contexts/staff-context'
import type { StaffMember } from '@/lib/types'
import { toast } from 'sonner'

const POSTES: StaffMember['poste'][] = ['reception', 'bar', 'admin']
const COLORS = ['#C94E0A', '#7AB648', '#4A9ECC', '#9B6DB7', '#E8913A', '#22C55E', '#8B6B3D', '#C94E73']

interface AddStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddStaffDialog({ open, onOpenChange }: AddStaffDialogProps) {
  const { addStaffMember } = useStaff()
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [poste, setPoste] = useState<StaffMember['poste']>('reception')
  const [couleur, setCouleur] = useState(COLORS[0])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prenom.trim() || !nom.trim()) return

    const initiales = `${prenom[0]}${nom[0]}`.toUpperCase()
    const member: StaffMember = {
      id: `staff-${Date.now()}`,
      nom: nom.trim(),
      prenom: prenom.trim(),
      poste,
      avatar_initiales: initiales,
      couleur_avatar: couleur,
      pointages: [],
    }

    addStaffMember(member)
    toast.success(`${prenom} ${nom} ajoute au staff`)
    setPrenom('')
    setNom('')
    setPoste('reception')
    setCouleur(COLORS[0])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold uppercase tracking-wide">
            Ajouter un membre
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ww-muted font-sans mb-1 block">Prenom</label>
              <input
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-ww-bg border border-ww-border text-sm text-ww-text font-sans focus:outline-none focus:border-ww-orange transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-xs text-ww-muted font-sans mb-1 block">Nom</label>
              <input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-ww-bg border border-ww-border text-sm text-ww-text font-sans focus:outline-none focus:border-ww-orange transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-ww-muted font-sans mb-1 block">Poste</label>
            <div className="flex gap-2">
              {POSTES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPoste(p)}
                  className={`flex-1 py-2 rounded-lg text-sm font-sans transition-all capitalize ${
                    poste === p
                      ? 'bg-ww-orange text-white'
                      : 'bg-ww-surface-2 text-ww-muted hover:text-ww-text'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-ww-muted font-sans mb-1 block">Couleur</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCouleur(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    couleur === c ? 'ring-2 ring-ww-text ring-offset-2 ring-offset-ww-surface scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {prenom && nom && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-ww-bg border border-ww-border">
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ backgroundColor: couleur }}
              >
                {`${prenom[0]}${nom[0]}`.toUpperCase()}
              </span>
              <div>
                <p className="font-sans text-sm font-medium text-ww-text">{prenom} {nom}</p>
                <p className="text-xs text-ww-muted capitalize">{poste}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-ww-lime text-ww-bg font-display font-bold uppercase tracking-wide transition-all hover:translate-y-[-1px] active:scale-[0.97]"
          >
            Ajouter
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
