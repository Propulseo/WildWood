'use client'

import { useState } from 'react'
import { useExpenses } from '@/contexts/expenses-context'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Expense } from '@/lib/types'

const CATEGORIES: Expense['categorie'][] = [
  'Fournitures',
  'Salaires',
  'Maintenance',
  'Marketing',
  'Divers',
]

function todayISO() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

export default function DepenseDialog() {
  const { addExpense } = useExpenses()
  const [open, setOpen] = useState(false)
  const [categorie, setCategorie] = useState('')
  const [montant, setMontant] = useState('')
  const [date, setDate] = useState(todayISO)
  const [note, setNote] = useState('')

  const isValid = categorie !== '' && Number(montant) > 0

  function resetForm() {
    setCategorie('')
    setMontant('')
    setDate(todayISO())
    setNote('')
  }

  function handleSubmit() {
    if (!isValid) return

    const expense: Expense = {
      id: `exp-${Date.now()}`,
      categorie: categorie as Expense['categorie'],
      montant: Number(montant),
      date,
      note: note || undefined,
    }

    addExpense(expense)
    toast.success('Depense enregistree')
    resetForm()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une depense
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle depense</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categorie">Categorie</Label>
            <Select value={categorie} onValueChange={setCategorie}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir une categorie" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="montant">Montant</Label>
            <Input
              id="montant"
              type="number"
              placeholder="Montant en THB"
              min="0"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Input
              id="note"
              placeholder="Note optionnelle"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
