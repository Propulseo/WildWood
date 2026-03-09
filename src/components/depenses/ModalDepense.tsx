'use client'

import { useState } from 'react'
import { useExpenses } from '@/contexts/expenses-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { Plus, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import type { Expense, GrandeCategorie, CategorieDepense, ModePaiement } from '@/lib/types'
import { GRANDE_CATEGORIE_LABELS } from './depenses-shared'
import { SelectCategorie } from './SelectCategorie'
import { SelectModePaiement } from './SelectModePaiement'
import { CaptureFacture } from './CaptureFacture'

export function ModalDepense() {
  const { addExpense } = useExpenses()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [grandeCategorie, setGrandeCategorie] = useState<GrandeCategorie | ''>('')
  const [categorie, setCategorie] = useState<CategorieDepense | ''>('')
  const [modePaiement, setModePaiement] = useState<ModePaiement | ''>('')
  const [titre, setTitre] = useState('')
  const [montant, setMontant] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [photoBase64, setPhotoBase64] = useState<string | null>(null)
  const [photoFileName, setPhotoFileName] = useState<string | undefined>()

  const isValid = categorie !== '' && modePaiement !== '' && titre.trim() !== '' && Number(montant) > 0

  function resetForm() {
    setStep(1)
    setGrandeCategorie('')
    setCategorie('')
    setModePaiement('')
    setTitre('')
    setMontant('')
    setDate(new Date().toISOString().slice(0, 10))
    setNote('')
    setPhotoBase64(null)
    setPhotoFileName(undefined)
  }

  function handleSelectGrande(gc: GrandeCategorie) {
    setGrandeCategorie(gc)
    setCategorie('')
    setStep(2)
  }

  function handleSubmit() {
    if (!isValid || grandeCategorie === '') return
    const expense: Expense = {
      id: `dep-${Date.now()}`,
      titre: titre.trim(),
      montant_thb: Number(montant),
      date,
      note: note || undefined,
      grande_categorie: grandeCategorie,
      categorie: categorie as CategorieDepense,
      mode_paiement: modePaiement as ModePaiement,
      photo_base64: photoBase64,
      staff_saisie: 'staff-006',
      created_at: new Date().toISOString(),
    }
    addExpense(expense)
    toast.success('Depense enregistree')
    resetForm()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" />Ajouter une depense</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Type de depense' : `Nouvelle depense · ${GRANDE_CATEGORIE_LABELS[grandeCategorie as GrandeCategorie]}`}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="grid grid-cols-3 gap-4 py-4">
            {(['gym', 'fnb', 'resort'] as GrandeCategorie[]).map((gc) => (
              <button
                key={gc}
                onClick={() => handleSelectGrande(gc)}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border border-ww-border bg-ww-surface hover:border-ww-orange transition-all hover:scale-[1.02]"
              >
                <span className="text-3xl">{gc === 'gym' ? '🏋️' : gc === 'fnb' ? '🍹' : '🏠'}</span>
                <span className="font-display font-bold text-lg text-ww-text">{GRANDE_CATEGORIE_LABELS[gc]}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-ww-muted">
              <ArrowLeft className="mr-1 h-4 w-4" />Retour
            </Button>
            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input placeholder="Ex: Livraison boissons" value={titre} onChange={(e) => setTitre(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Montant (THB) *</Label>
              <Input type="number" placeholder="0" min="0" value={montant} onChange={(e) => setMontant(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Categorie *</Label>
              <SelectCategorie grandeCategorie={grandeCategorie as GrandeCategorie} value={categorie} onChange={setCategorie} />
            </div>
            <div className="space-y-2">
              <Label>Mode de paiement *</Label>
              <SelectModePaiement value={modePaiement} onChange={setModePaiement} />
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea placeholder="Note optionnelle..." value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Recu / Facture</Label>
              <CaptureFacture
                value={photoBase64}
                fileName={photoFileName}
                onChange={(b64, name) => { setPhotoBase64(b64); setPhotoFileName(name) }}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button onClick={handleSubmit} disabled={!isValid}>Enregistrer</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
