'use client'

import { useState } from 'react'
import { useServiettes } from '@/contexts/serviettes-context'
import { useStaff } from '@/contexts/staff-context'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { Serviette } from '@/lib/types'

interface EmpruntModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmpruntModal({ open, onOpenChange }: EmpruntModalProps) {
  const { addEmprunt } = useServiettes()
  const { staff } = useStaff()
  const [clientNom, setClientNom] = useState('')
  const [staffEmprunt, setStaffEmprunt] = useState('')

  function handleSubmit() {
    if (!clientNom.trim() || !staffEmprunt) return

    const now = new Date()
    const entry: Serviette = {
      id: `srv-${Date.now()}`,
      client_nom: clientNom.trim(),
      client_id: '',
      date_emprunt: now.toISOString().slice(0, 10),
      heure_emprunt: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      deposit_montant: 500,
      statut: 'en_cours',
      date_retour: null,
      staff_emprunt: staffEmprunt,
      staff_retour: null,
    }

    addEmprunt(entry)
    toast.success('Serviette enregistree', { description: 'Depot 500 THB encaisse' })
    setClientNom('')
    setStaffEmprunt('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-xl">Nouvel emprunt</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-sans text-ww-muted mb-1.5 block">Nom du client</label>
            <Input
              value={clientNom}
              onChange={(e) => setClientNom(e.target.value)}
              placeholder="Ex: Pierre Dumont"
            />
          </div>

          <div className="flex items-center justify-between bg-ww-surface-2 rounded-lg px-4 py-3">
            <span className="text-sm font-sans text-ww-muted">Depot encaisse</span>
            <span className="font-display font-bold text-lg text-ww-orange">500 THB</span>
          </div>

          <div>
            <label className="text-sm font-sans text-ww-muted mb-1.5 block">Staff qui encaisse</label>
            <Select value={staffEmprunt} onValueChange={setStaffEmprunt}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un staff" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.prenom}>{s.prenom} {s.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!clientNom.trim() || !staffEmprunt}
            className="w-full h-12 bg-ww-orange text-white font-display font-bold text-base uppercase tracking-wider rounded-lg transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ENREGISTRER L&apos;EMPRUNT
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
