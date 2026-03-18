'use client'

import { useState } from 'react'
import { useServiettes } from '@/contexts/serviettes-context'
import { useStaff } from '@/contexts/staff-context'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface ReceptionLavageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReceptionLavageModal({ open, onOpenChange }: ReceptionLavageModalProps) {
  const { sales, receptionnerLavage } = useServiettes()
  const { staff } = useStaff()
  const [count, setCount] = useState(0)
  const [staffId, setStaffId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const nbRemisesPreview = Math.min(count, sales)
  const nbCreeesPreview = Math.max(0, count - sales)
  const resteAttente = Math.max(0, sales - count)

  async function handleSubmit() {
    if (count <= 0 || !staffId) return
    setSubmitting(true)
    try {
      const result = await receptionnerLavage(count, staffId)
      const parts: string[] = []
      if (result.nbRemises > 0) parts.push(`${result.nbRemises} remise${result.nbRemises > 1 ? 's' : ''} en stock`)
      if (result.nbCreees > 0) parts.push(`${result.nbCreees} nouvelle${result.nbCreees > 1 ? 's' : ''} creee${result.nbCreees > 1 ? 's' : ''}`)
      toast.success(`Reception lavage · ${parts.join(' · ')}`)
      setCount(0); setStaffId('')
      onOpenChange(false)
    } catch {
      toast.error('Erreur reception lavage')
    } finally {
      setSubmitting(false)
    }
  }

  function handleOpenChange(v: boolean) {
    if (!v) { setCount(0); setStaffId('') }
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-xl uppercase">
            Reception serviettes lavees
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="bg-ww-surface-2 rounded-lg px-4 py-3 text-center">
            <p className="text-sm text-ww-muted">
              <span className="font-display font-bold text-ww-danger text-lg">{sales}</span>{' '}
              serviette{sales > 1 ? 's' : ''} en attente de lavage
            </p>
          </div>

          <div>
            <label className="text-sm font-sans text-ww-muted mb-1.5 block">Nombre comptees</label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setCount((c) => Math.max(0, c - 1))}
                className="w-12 h-12 rounded-lg bg-ww-surface border border-ww-border text-ww-text font-display font-bold text-2xl transition-all hover:border-ww-orange active:scale-[0.97]"
              >
                -
              </button>
              <input
                type="number"
                min={0}
                value={count}
                onChange={(e) => setCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-20 h-12 text-center bg-ww-surface border border-ww-border rounded-lg font-display font-extrabold text-2xl text-ww-text focus:outline-none focus:border-ww-orange"
              />
              <button
                onClick={() => setCount((c) => c + 1)}
                className="w-12 h-12 rounded-lg bg-ww-surface border border-ww-border text-ww-text font-display font-bold text-2xl transition-all hover:border-ww-orange active:scale-[0.97]"
              >
                +
              </button>
            </div>
          </div>

          {count > 0 && (
            <div className="bg-ww-surface rounded-lg px-4 py-3 border border-ww-border space-y-1">
              <p className="text-sm text-[var(--ww-lime)]">
                {nbRemisesPreview} remise{nbRemisesPreview > 1 ? 's' : ''} en stock
              </p>
              {resteAttente > 0 && (
                <p className="text-sm text-ww-muted">
                  {resteAttente} encore en attente
                </p>
              )}
              {nbCreeesPreview > 0 && (
                <p className="text-sm text-ww-orange">
                  {nbCreeesPreview} nouvelle{nbCreeesPreview > 1 ? 's' : ''} creee{nbCreeesPreview > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-sm font-sans text-ww-muted mb-1.5 block">Staff qui valide</label>
            <Select value={staffId} onValueChange={setStaffId}>
              <SelectTrigger><SelectValue placeholder="Choisir un staff" /></SelectTrigger>
              <SelectContent>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.prenom} {s.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={handleSubmit}
            disabled={count <= 0 || !staffId || submitting}
            className="w-full h-12 bg-[var(--ww-wood)] text-white font-display font-bold text-base uppercase tracking-wider rounded-lg transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'EN COURS...' : 'CONFIRMER LA RECEPTION'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
