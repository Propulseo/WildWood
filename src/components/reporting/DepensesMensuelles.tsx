'use client'

import { useState, useMemo } from 'react'
import { useReporting } from '@/contexts/reporting-context'
import type { BusinessUnit, ExpenseMonthlyCategory, ReportExpenseMonthly } from '@/lib/types-reporting'
import { parseISO, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from '@/components/ui/table'
import { Plus, X } from 'lucide-react'

const CAT_LABELS: Record<ExpenseMonthlyCategory, string> = {
  salary: 'Salaires',
  electricity: 'Electricite',
  internet: 'Internet',
  marketing: 'Marketing',
  insurance: 'Assurance',
  equipment: 'Equipement',
  invest: 'Investissement',
}

const ALL_CATS = Object.keys(CAT_LABELS) as ExpenseMonthlyCategory[]

export default function DepensesMensuelles({ activeBus }: { activeBus: BusinessUnit[] }) {
  const { expensesMonthly, mockToday, addExpenseMonthly } = useReporting()
  const currentMois = mockToday.slice(0, 7)

  const monthlyForBu = useMemo(
    () => expensesMonthly.filter((e) => e.mois === currentMois && activeBus.includes(e.bu)),
    [expensesMonthly, currentMois, activeBus]
  )

  const total = monthlyForBu.reduce((s, e) => s + e.montant, 0)
  const monthLabel = format(parseISO(`${currentMois}-01`), 'MMMM yyyy', { locale: fr })

  const [showAdd, setShowAdd] = useState(false)
  const [newBu, setNewBu] = useState<BusinessUnit>(activeBus[0])
  const [newCat, setNewCat] = useState<ExpenseMonthlyCategory>('salary')
  const [newMontant, setNewMontant] = useState(0)
  const [newNote, setNewNote] = useState('')

  function handleAdd() {
    if (newMontant <= 0) return
    const exp: ReportExpenseMonthly = {
      id: `expm-new-${Date.now()}`,
      mois: currentMois,
      bu: newBu,
      categorie: newCat,
      montant: newMontant,
      note: newNote || undefined,
    }
    addExpenseMonthly(exp)
    setNewMontant(0)
    setNewNote('')
    setShowAdd(false)
  }

  return (
    <Card>
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="font-display text-lg font-bold capitalize">
          Charges mensuelles — {monthLabel}
        </h3>
        <Button
          onClick={() => setShowAdd(!showAdd)}
          variant={showAdd ? 'ghost' : 'outline'}
          size="sm"
          className="gap-1 text-xs"
        >
          {showAdd ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showAdd ? 'Annuler' : 'Ajouter'}
        </Button>
      </div>

      <CardContent className="p-0">
        {showAdd && (
          <div className="flex flex-wrap items-end gap-3 px-5 pb-4 border-b border-ww-border">
            {activeBus.length > 1 && (
              <div className="space-y-1">
                <label className="text-[10px] text-ww-muted uppercase">BU</label>
                <select
                  value={newBu}
                  onChange={(e) => setNewBu(e.target.value as BusinessUnit)}
                  className="h-8 rounded-md border border-ww-border bg-ww-surface-2 px-2 text-sm text-ww-text"
                >
                  {activeBus.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] text-ww-muted uppercase">Categorie</label>
              <select
                value={newCat}
                onChange={(e) => setNewCat(e.target.value as ExpenseMonthlyCategory)}
                className="h-8 rounded-md border border-ww-border bg-ww-surface-2 px-2 text-sm text-ww-text"
              >
                {ALL_CATS.map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-ww-muted uppercase">Montant</label>
              <Input
                type="number"
                min={0}
                value={newMontant || ''}
                onChange={(e) => setNewMontant(Number(e.target.value) || 0)}
                className="w-28 h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-ww-muted uppercase">Note</label>
              <Input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Optionnel"
                className="w-36 h-8 text-sm"
              />
            </div>
            <Button onClick={handleAdd} size="sm" className="h-8 text-xs">
              Confirmer
            </Button>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">BU</TableHead>
              <TableHead>Categorie</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthlyForBu.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-ww-muted py-8">
                  Aucune charge mensuelle enregistree
                </TableCell>
              </TableRow>
            ) : (
              monthlyForBu.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-display font-bold`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${e.bu === 'GYM' ? 'bg-ww-orange' : 'bg-ww-lime'}`} />
                      {e.bu}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{CAT_LABELS[e.categorie] ?? e.categorie}</TableCell>
                  <TableCell className="text-right font-display font-bold text-ww-danger">
                    {e.montant.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-ww-muted text-xs">{e.note || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2} className="font-bold">TOTAL</TableCell>
              <TableCell className="text-right font-display font-bold text-ww-danger">
                {total.toLocaleString()} THB
              </TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  )
}
