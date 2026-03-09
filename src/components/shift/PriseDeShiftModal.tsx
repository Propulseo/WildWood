'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useStaff } from '@/contexts/staff-context'
import { useShift } from '@/contexts/shift-context'
import { toast } from 'sonner'

interface PriseDeShiftModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  poste: 'reception' | 'bar'
}

function nowHHmm() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function PriseDeShiftModal({ open, onOpenChange, poste }: PriseDeShiftModalProps) {
  const { staff } = useStaff()
  const { prendreShift, getStaffActif } = useShift()
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [note, setNote] = useState('')

  const staffForPoste = staff.filter((s) => s.poste === poste)
  const currentStaff = getStaffActif(poste)
  const posteLabel = poste === 'reception' ? 'Reception' : 'Bar'

  function handleConfirm() {
    if (!selectedStaffId) return
    const member = staff.find((s) => s.id === selectedStaffId)
    if (!member) return

    prendreShift(poste, selectedStaffId, note || undefined)

    const heure = nowHHmm().replace(':', 'h')
    toast.success(`Shift repris — ${member.prenom} ${member.nom}`, {
      description: `${posteLabel} · ${heure}`,
    })

    setSelectedStaffId('')
    setNote('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold uppercase tracking-wide">
            Prise de shift — {posteLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {currentStaff && (
            <p className="text-sm text-ww-muted font-sans">
              Shift actuel : <span className="text-ww-text font-medium">{currentStaff.prenom} {currentStaff.nom}</span>
            </p>
          )}

          <div className="space-y-2">
            <label className="text-xs text-ww-muted font-sans">Nouveau staff</label>
            <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un membre du staff" />
              </SelectTrigger>
              <SelectContent>
                {staffForPoste.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.prenom} {s.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-ww-muted font-sans">Note de transmission</label>
            <Textarea
              placeholder="Notes pour la prise de shift..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedStaffId}>
            PRENDRE LE SHIFT
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
