# Depenses & Recus + Acces QR Code — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add two new modules to the WildWood ERP: (1) a Depenses & Recus page with photo upload and comptabilite integration, (2) a QR Code access system with pass generation and camera scanner.

**Architecture:** Both modules follow the existing pattern: mock JSON data → data-access layer → React Context → 'use client' pages. Module 1 extends the existing ExpensesContext with new categories, photo support, and a dedicated page. Module 2 introduces an ActivePassesContext for purchased gym passes with QR tokens, a QR display dialog after POS checkout, and a full-screen scanner page using html5-qrcode.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS v4, shadcn/ui, lucide-react, date-fns, qrcode.react (new), html5-qrcode (new), sonner for toasts.

---

## Task 1: Update Expense type, create depenses.json, update data-access

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/mock-data/depenses.json`
- Modify: `src/lib/data-access.ts`

**Step 1: Update the Expense interface in types.ts**

Replace the Expense interface at lines 112-122 with:

```typescript
/** Depense manuelle saisie par l'owner */
export interface Expense {
  id: string
  /** Categorie de depense */
  categorie:
    | 'Bungalow'
    | 'F&B / Nourriture'
    | 'Maintenance'
    | 'Staff / Salaires'
    | 'Courses quotidiennes'
    | 'Fournisseurs'
    | 'Energie / Eau'
    | 'Autre'
  /** Montant en baht thailandais */
  montant: number
  /** Date de la depense -- format ISO YYYY-MM-DD */
  date: string
  /** Note explicative optionnelle */
  note?: string
  /** Photo du recu en base64 (data URI) */
  photo?: string
}
```

**Step 2: Create depenses.json**

Create `src/lib/mock-data/depenses.json` with 10 entries spanning Feb-Mar 2026 using the new categories. Use a tiny base64 placeholder image for the `photo` field (a small gray PNG rectangle):

```json
[
  {
    "id": "dep-001",
    "categorie": "Staff / Salaires",
    "montant": 22000,
    "date": "2026-02-15",
    "note": "Salaire Nong fevrier",
    "photo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA0CAYAAAAhUo07AAAAOklEQVR42u3OQQEAAAQAMJIL/R4B3whCb0lNOt0FIBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEvgUtFwA1LuaYjgAAAABJRU5ErkJggg=="
  },
  {
    "id": "dep-002",
    "categorie": "Courses quotidiennes",
    "montant": 1850,
    "date": "2026-02-18",
    "note": "Marche du matin - fruits et legumes",
    "photo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA0CAYAAAAhUo47AAAAOklEQVR42u3OQQEAAAQAMJIL/R4B3whCb0lNOt0FIBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEvgUtFwA1LuaYjgAAAABJRU5ErkJggg=="
  },
  {
    "id": "dep-003",
    "categorie": "Maintenance",
    "montant": 3500,
    "date": "2026-02-20",
    "note": "Reparation plomberie bungalow 7",
    "photo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA0CAYAAAAhUo47AAAAOklEQVR42u3OQQEAAAQAMJIL/R4B3whCb0lNOt0FIBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEvgUtFwA1LuaYjgAAAABJRU5ErkJggg=="
  },
  {
    "id": "dep-004",
    "categorie": "F&B / Nourriture",
    "montant": 5800,
    "date": "2026-02-25",
    "note": "Achat proteines et supplements bar",
    "photo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA0CAYAAAAhUo47AAAAOklEQVR42u3OQQEAAAQAMJIL/R4B3whCb0lNOt0FIBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEvgUtFwA1LuaYjgAAAABJRU5ErkJggg=="
  },
  {
    "id": "dep-005",
    "categorie": "Energie / Eau",
    "montant": 4200,
    "date": "2026-02-28",
    "note": "Facture electricite fevrier",
    "photo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA0CAYAAAAhUo47AAAAOklEQVR42u3OQQEAAAQAMJIL/R4B3whCb0lNOt0FIBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEvgUtFwA1LuaYjgAAAABJRU5ErkJggg=="
  },
  {
    "id": "dep-006",
    "categorie": "Bungalow",
    "montant": 8500,
    "date": "2026-03-01",
    "note": "Remplacement matelas bungalow 2",
    "photo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA0CAYAAAAhUo47AAAAOklEQVR42u3OQQEAAAQAMJIL/R4B3whCb0lNOt0FIBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEvgUtFwA1LuaYjgAAAABJRU5ErkJggg=="
  },
  {
    "id": "dep-007",
    "categorie": "Fournisseurs",
    "montant": 12000,
    "date": "2026-03-01",
    "note": "Livraison boissons Singha + Chang",
    "photo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA0CAYAAAAhUo47AAAAOklEQVR42u3OQQEAAAQAMJIL/R4B3whCb0lNOt0FIBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEvgUtFwA1LuaYjgAAAABJRU5ErkJggg=="
  },
  {
    "id": "dep-008",
    "categorie": "Courses quotidiennes",
    "montant": 950,
    "date": "2026-03-01",
    "note": "Recharge eau potable distributeur",
    "photo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA0CAYAAAAhUo47AAAAOklEQVR42u3OQQEAAAQAMJIL/R4B3whCb0lNOt0FIBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEvgUtFwA1LuaYjgAAAABJRU5ErkJggg=="
  },
  {
    "id": "dep-009",
    "categorie": "Staff / Salaires",
    "montant": 18000,
    "date": "2026-03-01",
    "note": "Salaire Ploy mars",
    "photo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA0CAYAAAAhUo47AAAAOklEQVR42u3OQQEAAAQAMJIL/R4B3whCb0lNOt0FIBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEvgUtFwA1LuaYjgAAAABJRU5ErkJggg=="
  },
  {
    "id": "dep-010",
    "categorie": "Autre",
    "montant": 1500,
    "date": "2026-03-01",
    "note": "Impression menus et affiches",
    "photo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA0CAYAAAAhUo47AAAAOklEQVR42u3OQQEAAAQAMJIL/R4B3whCb0lNOt0FIBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEvgUtFwA1LuaYjgAAAABJRU5ErkJggg=="
  }
]
```

**Step 3: Update data-access.ts**

Replace the expenses import and function:

```typescript
// Change the import:
import depensesData from './mock-data/depenses.json'

// Replace getExpenses:
export async function getExpenses(): Promise<Expense[]> {
  return depensesData as Expense[]
}
```

Remove the old `expensesData` import line. Keep all other functions unchanged.

**Step 4: Update the DepenseDialog categories**

In `src/components/comptabilite/depense-dialog.tsx`, update the CATEGORIES array at line 28-34:

```typescript
const CATEGORIES: Expense['categorie'][] = [
  'Bungalow',
  'F&B / Nourriture',
  'Maintenance',
  'Staff / Salaires',
  'Courses quotidiennes',
  'Fournisseurs',
  'Energie / Eau',
  'Autre',
]
```

**Step 5: Commit**

```bash
git add src/lib/types.ts src/lib/mock-data/depenses.json src/lib/data-access.ts src/components/comptabilite/depense-dialog.tsx
git commit -m "feat(depenses): update Expense type with new categories and photo support"
```

---

## Task 2: Update ExpensesContext with deleteExpense

**Files:**
- Modify: `src/contexts/expenses-context.tsx`

**Step 1: Add deleteExpense to the context type and provider**

Update the context interface to add `deleteExpense`:

```typescript
interface ExpensesContextType {
  expenses: Expense[]
  addExpense: (exp: Expense) => void
  deleteExpense: (id: string) => void
  resetExpenses: () => void
}
```

Add the function in the provider:

```typescript
function deleteExpense(id: string) {
  setExpenses((prev) => prev.filter((e) => e.id !== id))
}
```

Update the context value:

```typescript
<ExpensesContext value={{ expenses, addExpense, deleteExpense, resetExpenses }}>
```

**Step 2: Commit**

```bash
git add src/contexts/expenses-context.tsx
git commit -m "feat(depenses): add deleteExpense to ExpensesContext"
```

---

## Task 3: Create shadcn Textarea component

**Files:**
- Create: `src/components/ui/textarea.tsx`

**Step 1: Create the textarea component**

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
```

**Step 2: Commit**

```bash
git add src/components/ui/textarea.tsx
git commit -m "feat(ui): add shadcn Textarea component"
```

---

## Task 4: Create the Depenses page with all components

**Files:**
- Create: `src/app/(admin)/depenses/page.tsx`

This is a single-file page component containing all the UI: header with monthly total, filters, expense list, add dialog, and detail modal. This keeps things simple and follows the prototype pattern.

**Step 1: Create the depenses page**

Create `src/app/(admin)/depenses/page.tsx`:

```tsx
'use client'

import { useState, useMemo } from 'react'
import { useExpenses } from '@/contexts/expenses-context'
import { format, parseISO, isToday, startOfWeek, endOfWeek, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Receipt, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import type { Expense } from '@/lib/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES: Expense['categorie'][] = [
  'Bungalow',
  'F&B / Nourriture',
  'Maintenance',
  'Staff / Salaires',
  'Courses quotidiennes',
  'Fournisseurs',
  'Energie / Eau',
  'Autre',
]

const PERIODES = [
  { value: 'all', label: 'Toutes' },
  { value: 'today', label: "Aujourd'hui" },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
] as const

type Periode = (typeof PERIODES)[number]['value']

// ---------------------------------------------------------------------------
// Category color helper
// ---------------------------------------------------------------------------

function categorieBadgeColor(cat: string): string {
  const map: Record<string, string> = {
    'Bungalow': 'bg-amber-100 text-amber-800',
    'F&B / Nourriture': 'bg-green-100 text-green-800',
    'Maintenance': 'bg-blue-100 text-blue-800',
    'Staff / Salaires': 'bg-purple-100 text-purple-800',
    'Courses quotidiennes': 'bg-orange-100 text-orange-800',
    'Fournisseurs': 'bg-cyan-100 text-cyan-800',
    'Energie / Eau': 'bg-yellow-100 text-yellow-800',
    'Autre': 'bg-gray-100 text-gray-800',
  }
  return map[cat] || 'bg-gray-100 text-gray-800'
}

// ---------------------------------------------------------------------------
// Add Expense Dialog
// ---------------------------------------------------------------------------

function AddDepenseDialog() {
  const { addExpense } = useExpenses()
  const [open, setOpen] = useState(false)
  const [categorie, setCategorie] = useState('')
  const [montant, setMontant] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)

  const isValid = categorie !== '' && Number(montant) > 0

  function resetForm() {
    setCategorie('')
    setMontant('')
    setDate(new Date().toISOString().slice(0, 10))
    setNote('')
    setPhoto(null)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhoto(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit() {
    if (!isValid) return

    const expense: Expense = {
      id: `dep-${Date.now()}`,
      categorie: categorie as Expense['categorie'],
      montant: Number(montant),
      date,
      note: note || undefined,
      photo: photo || undefined,
    }

    addExpense(expense)
    toast.success('Depense enregistree')
    resetForm()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une depense
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle depense</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Montant (THB) *</Label>
            <Input
              type="number"
              placeholder="Montant en THB"
              min="0"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Categorie *</Label>
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
            <Label>Note</Label>
            <Textarea
              placeholder="Note optionnelle..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Photo du recu</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('photo-input')?.click()}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                {photo ? 'Changer la photo' : 'Prendre une photo'}
              </Button>
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {photo && (
              <div className="mt-2 relative">
                <img
                  src={photo}
                  alt="Preview recu"
                  className="w-full max-h-48 object-contain rounded-md border"
                />
                <Button
                  variant="destructive"
                  size="xs"
                  className="absolute top-1 right-1"
                  onClick={() => setPhoto(null)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
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

// ---------------------------------------------------------------------------
// Detail Modal
// ---------------------------------------------------------------------------

function DepenseDetailModal({
  expense,
  open,
  onOpenChange,
}: {
  expense: Expense | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  if (!expense) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detail de la depense</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {expense.photo && (
            <img
              src={expense.photo}
              alt="Recu"
              className="w-full max-h-80 object-contain rounded-md border bg-muted"
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Montant</p>
              <p className="text-2xl font-bold font-display">
                {expense.montant.toLocaleString()} THB
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">
                {format(parseISO(expense.date), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Categorie</p>
              <Badge className={categorieBadgeColor(expense.categorie)}>
                {expense.categorie}
              </Badge>
            </div>
            {expense.note && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Note</p>
                <p>{expense.note}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Fermer</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function DepensesPage() {
  const { expenses, deleteExpense } = useExpenses()
  const [filterCategorie, setFilterCategorie] = useState<string>('all')
  const [filterPeriode, setFilterPeriode] = useState<Periode>('all')
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Filtered expenses
  const filtered = useMemo(() => {
    const now = new Date()
    return expenses
      .filter((exp) => {
        if (filterCategorie !== 'all' && exp.categorie !== filterCategorie) return false
        if (filterPeriode === 'today') return isToday(parseISO(exp.date))
        if (filterPeriode === 'week') {
          return isWithinInterval(parseISO(exp.date), {
            start: startOfWeek(now, { weekStartsOn: 1 }),
            end: endOfWeek(now, { weekStartsOn: 1 }),
          })
        }
        if (filterPeriode === 'month') {
          return isWithinInterval(parseISO(exp.date), {
            start: startOfMonth(now),
            end: endOfMonth(now),
          })
        }
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [expenses, filterCategorie, filterPeriode])

  // Monthly total for current month
  const monthTotal = useMemo(() => {
    const now = new Date()
    return expenses
      .filter((exp) =>
        isWithinInterval(parseISO(exp.date), {
          start: startOfMonth(now),
          end: endOfMonth(now),
        })
      )
      .reduce((sum, exp) => sum + exp.montant, 0)
  }, [expenses])

  function handleDelete(id: string) {
    deleteExpense(id)
    toast.success('Depense supprimee')
  }

  function handleClick(exp: Expense) {
    setSelectedExpense(exp)
    setDetailOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Depenses & Recus</h1>
          <p className="text-muted-foreground">
            Total ce mois :{' '}
            <span className="font-display font-bold text-wildwood-orange text-lg">
              {monthTotal.toLocaleString()} THB
            </span>
          </p>
        </div>
        <AddDepenseDialog />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterCategorie} onValueChange={setFilterCategorie}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Categorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterPeriode} onValueChange={(v) => setFilterPeriode(v as Periode)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Periode" />
          </SelectTrigger>
          <SelectContent>
            {PERIODES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expense list */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          Aucune depense trouvee
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((exp) => (
            <Card
              key={exp.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleClick(exp)}
            >
              <CardContent className="flex items-center gap-4 py-3">
                {/* Photo thumbnail */}
                <div className="w-14 h-14 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden border">
                  {exp.photo ? (
                    <img
                      src={exp.photo}
                      alt="Recu"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Receipt className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-lg">
                      {exp.montant.toLocaleString()} THB
                    </span>
                    <Badge className={categorieBadgeColor(exp.categorie)}>
                      {exp.categorie}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{format(parseISO(exp.date), 'dd/MM/yyyy')}</span>
                    {exp.note && (
                      <>
                        <span>—</span>
                        <span className="truncate">{exp.note}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(exp.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail modal */}
      <DepenseDetailModal
        expense={selectedExpense}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/(admin)/depenses/page.tsx
git commit -m "feat(depenses): create Depenses & Recus page with filters, add dialog, and detail modal"
```

---

## Task 5: Add Depenses nav entry + update comptabilite category breakdown

**Files:**
- Modify: `src/app/(admin)/layout.tsx`
- Modify: `src/components/comptabilite/vue-mensuelle.tsx`

**Step 1: Add nav items for Depenses to the sidebar**

In `src/app/(admin)/layout.tsx`, add the import for the Receipt icon:

```typescript
import {
  LayoutDashboard,
  Users,
  Home,
  Calculator,
  Mail,
  Camera,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Receipt,
} from 'lucide-react'
```

Add to navItems array (after Comptabilite):

```typescript
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/bungalows', label: 'Bungalows', icon: Home },
  { href: '/comptabilite', label: 'Comptabilite', icon: Calculator },
  { href: '/depenses', label: 'Depenses', icon: Receipt },
  { href: '/newsletter', label: 'Newsletter', icon: Mail },
  { href: '/instagram', label: 'Instagram', icon: Camera },
]
```

**Step 2: Add category breakdown to VueMensuelle**

In `src/components/comptabilite/vue-mensuelle.tsx`, add a section after the recap table that shows the current month's expenses grouped by category. Add to the imports:

```typescript
import { isSameMonth } from 'date-fns'
```

After the recap table closing `</Card>`, add this block inside the return, before the closing `</div>`:

```tsx
{/* Depenses du mois par categorie */}
<h2 className="font-display text-xl font-bold">Depenses du mois par categorie</h2>
<Card>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Categorie</TableHead>
        <TableHead className="text-right">Total</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {(() => {
        const now = new Date()
        const monthExpenses = expenses.filter((exp) =>
          isSameMonth(parseISO(exp.date), now)
        )
        const grouped = monthExpenses.reduce<Record<string, number>>(
          (acc, exp) => {
            acc[exp.categorie] = (acc[exp.categorie] || 0) + exp.montant
            return acc
          },
          {}
        )
        const entries = Object.entries(grouped).sort((a, b) => b[1] - a[1])
        if (entries.length === 0) {
          return (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-muted-foreground">
                Aucune depense ce mois
              </TableCell>
            </TableRow>
          )
        }
        return entries.map(([cat, total]) => (
          <TableRow key={cat}>
            <TableCell>{cat}</TableCell>
            <TableCell className="text-right font-display font-bold text-red-500">
              {total.toLocaleString()} THB
            </TableCell>
          </TableRow>
        ))
      })()}
    </TableBody>
    <TableFooter>
      <TableRow>
        <TableCell className="font-bold">TOTAL MOIS</TableCell>
        <TableCell className="text-right font-display font-bold text-red-500">
          {expenses
            .filter((exp) => isSameMonth(parseISO(exp.date), new Date()))
            .reduce((s, e) => s + e.montant, 0)
            .toLocaleString()}{' '}
          THB
        </TableCell>
      </TableRow>
    </TableFooter>
  </Table>
</Card>
```

Note: `isSameMonth` is already imported in this file. `parseISO` is also already imported.

**Step 3: Commit**

```bash
git add src/app/(admin)/layout.tsx src/components/comptabilite/vue-mensuelle.tsx
git commit -m "feat(depenses): add sidebar nav entry and comptabilite category breakdown"
```

---

## Task 6: Install QR dependencies

**Step 1: Install packages**

```bash
npm install qrcode.react html5-qrcode
```

**Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat(qr): install qrcode.react and html5-qrcode"
```

---

## Task 7: Create ActiveGymPass type, mock data, context, and data-access

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/mock-data/active-passes.json`
- Modify: `src/lib/data-access.ts`
- Create: `src/contexts/active-passes-context.tsx`
- Modify: `src/app/(admin)/layout.tsx` (wrap with ActivePassesProvider)
- Modify: `src/app/(pos)/layout.tsx` (wrap with ActivePassesProvider)

**Step 1: Add ActiveGymPass type**

Add to the end of `src/lib/types.ts` (before the Role type):

```typescript
/** Pass gym actif achete par un client, avec QR code pour le controle d'acces */
export interface ActiveGymPass {
  id: string
  /** Token unique pour le QR code -- format WW-PASS-XXXX */
  qrToken: string
  /** Reference au client */
  clientId: string
  /** Nom complet du client (denormalise pour affichage scanner) */
  clientNom: string
  /** Reference au type de pass */
  passId: string
  /** Nom du pass (denormalise) */
  passNom: string
  /** Date d'achat -- format ISO YYYY-MM-DD */
  dateAchat: string
  /** Date d'expiration -- format ISO YYYY-MM-DD */
  dateExpiration: string
}
```

**Step 2: Create active-passes.json**

Create `src/lib/mock-data/active-passes.json` with pre-existing demo entries:

```json
[
  {
    "id": "ap-001",
    "qrToken": "WW-PASS-A1B2",
    "clientId": "v-001",
    "clientNom": "Marc Dupont",
    "passId": "pass-1m",
    "passNom": "1 mois",
    "dateAchat": "2026-02-15",
    "dateExpiration": "2026-03-17"
  },
  {
    "id": "ap-002",
    "qrToken": "WW-PASS-C3D4",
    "clientId": "v-002",
    "clientNom": "Sophie Martin",
    "passId": "pass-1s",
    "passNom": "1 semaine",
    "dateAchat": "2026-02-25",
    "dateExpiration": "2026-03-04"
  },
  {
    "id": "ap-003",
    "qrToken": "WW-PASS-E5F6",
    "clientId": "v-005",
    "clientNom": "Lucas Bernard",
    "passId": "pass-6m",
    "passNom": "6 mois",
    "dateAchat": "2025-12-01",
    "dateExpiration": "2026-05-30"
  },
  {
    "id": "ap-004",
    "qrToken": "WW-PASS-G7H8",
    "clientId": "v-008",
    "clientNom": "Emma Lefevre",
    "passId": "pass-3j",
    "passNom": "3 jours",
    "dateAchat": "2026-01-10",
    "dateExpiration": "2026-01-13"
  },
  {
    "id": "ap-005",
    "qrToken": "WW-PASS-I9J0",
    "clientId": "v-010",
    "clientNom": "Yuki Tanaka",
    "passId": "pass-1a",
    "passNom": "1 an",
    "dateAchat": "2025-06-01",
    "dateExpiration": "2026-05-31"
  }
]
```

Note: ap-004 (Emma) is expired — useful for testing the scanner's "PASS EXPIRE" result.

**Step 3: Add data-access function**

Add to `src/lib/data-access.ts`:

```typescript
import type { ..., ActiveGymPass } from './types'
import activePassesData from './mock-data/active-passes.json'

// --- Active Gym Passes ---

export async function getActivePasses(): Promise<ActiveGymPass[]> {
  return activePassesData as ActiveGymPass[]
}
```

**Step 4: Create ActivePassesContext**

Create `src/contexts/active-passes-context.tsx`:

```tsx
'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import type { ActiveGymPass } from '@/lib/types'
import { getActivePasses } from '@/lib/data-access'

interface ActivePassesContextType {
  activePasses: ActiveGymPass[]
  addActivePass: (pass: ActiveGymPass) => void
  findByQrToken: (token: string) => ActiveGymPass | undefined
}

const ActivePassesContext = createContext<ActivePassesContextType | null>(null)

export function ActivePassesProvider({ children }: { children: ReactNode }) {
  const [activePasses, setActivePasses] = useState<ActiveGymPass[]>([])

  useEffect(() => {
    getActivePasses().then(setActivePasses)
  }, [])

  function addActivePass(pass: ActiveGymPass) {
    setActivePasses((prev) => [pass, ...prev])
  }

  function findByQrToken(token: string) {
    return activePasses.find((p) => p.qrToken === token)
  }

  return (
    <ActivePassesContext value={{ activePasses, addActivePass, findByQrToken }}>
      {children}
    </ActivePassesContext>
  )
}

export function useActivePasses() {
  const ctx = useContext(ActivePassesContext)
  if (!ctx)
    throw new Error(
      'useActivePasses must be used within ActivePassesProvider'
    )
  return ctx
}
```

**Step 5: Wrap layouts with ActivePassesProvider**

In `src/app/(admin)/layout.tsx`, add the import:

```typescript
import { ActivePassesProvider } from '@/contexts/active-passes-context'
```

Wrap the return JSX — add `<ActivePassesProvider>` as the outermost wrapper:

```tsx
return (
  <ActivePassesProvider>
    <ExpensesProvider>
      <TransactionsProvider>
        {/* ... existing content ... */}
      </TransactionsProvider>
    </ExpensesProvider>
  </ActivePassesProvider>
)
```

In `src/app/(pos)/layout.tsx`, do the same — add ActivePassesProvider import and wrap.

**Step 6: Commit**

```bash
git add src/lib/types.ts src/lib/mock-data/active-passes.json src/lib/data-access.ts src/contexts/active-passes-context.tsx src/app/(admin)/layout.tsx src/app/(pos)/layout.tsx
git commit -m "feat(qr): add ActiveGymPass type, mock data, context, and data-access"
```

---

## Task 8: Create QR Display dialog + integrate with POS checkout

**Files:**
- Create: `src/components/qr/qr-display-dialog.tsx`
- Modify: `src/components/pos/pos-register.tsx`

**Step 1: Create QR Display Dialog**

Create `src/components/qr/qr-display-dialog.tsx`:

```tsx
'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { QRCodeSVG } from 'qrcode.react'
import type { ActiveGymPass } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

interface QrDisplayDialogProps {
  pass: ActiveGymPass | null
  open: boolean
  onClose: () => void
}

export function QrDisplayDialog({ pass, open, onClose }: QrDisplayDialogProps) {
  if (!pass) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm text-center">
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-white p-4 rounded-xl">
            <QRCodeSVG
              value={pass.qrToken}
              size={280}
              level="H"
              includeMargin
            />
          </div>

          <div className="space-y-1">
            <p className="font-display text-xl font-bold">{pass.clientNom}</p>
            <p className="text-muted-foreground">
              Pass : <span className="font-medium text-foreground">{pass.passNom}</span>
            </p>
            <p className="text-muted-foreground">
              Valable jusqu&apos;au{' '}
              <span className="font-medium text-foreground">
                {format(parseISO(pass.dateExpiration), 'dd MMMM yyyy', { locale: fr })}
              </span>
            </p>
          </div>

          <p className="text-sm text-muted-foreground italic">
            Faites un screenshot de ce QR code
          </p>

          <Button className="w-full" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Integrate QR display into POS checkout**

In `src/components/pos/pos-register.tsx`:

Add imports:

```typescript
import { useActivePasses } from '@/contexts/active-passes-context'
import { QrDisplayDialog } from '@/components/qr/qr-display-dialog'
import type { ActiveGymPass } from '@/lib/types'
```

Inside `PosRegister` component, add state and context:

```typescript
const { addActivePass } = useActivePasses()
const [qrPass, setQrPass] = useState<ActiveGymPass | null>(null)
const [qrDialogOpen, setQrDialogOpen] = useState(false)
```

Generate a random QR token helper (add inside the component or above it):

```typescript
function generateQrToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'WW-PASS-'
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
```

Modify the `handleCheckout` function: after `addTransaction(transaction)` and before `dispatch({ type: 'CLEAR_CART' })`, add QR logic:

```typescript
// If gym pass was purchased, show QR code
if (hasGymPass && cart.client) {
  const gymPassItem = cart.items.find((i) => i.type === 'gym-pass')
  if (gymPassItem) {
    // Find the pass duration from the produitId
    const passType = gymPasses.find((p) => p.id === gymPassItem.produitId)
    const dureeJours = passType?.dureeJours || 1
    const now = new Date()
    const expiration = new Date(now)
    expiration.setDate(expiration.getDate() + dureeJours)

    const activePass: ActiveGymPass = {
      id: `ap-${Date.now()}`,
      qrToken: generateQrToken(),
      clientId: cart.client.id,
      clientNom: `${cart.client.prenom} ${cart.client.nom}`,
      passId: gymPassItem.produitId,
      passNom: gymPassItem.nom,
      dateAchat: now.toISOString().slice(0, 10),
      dateExpiration: expiration.toISOString().slice(0, 10),
    }

    addActivePass(activePass)
    setQrPass(activePass)
    setQrDialogOpen(true)
  }
}
```

Add the QR dialog to the render, after the `<ClientPopup>`:

```tsx
<QrDisplayDialog
  pass={qrPass}
  open={qrDialogOpen}
  onClose={() => {
    setQrDialogOpen(false)
    setQrPass(null)
  }}
/>
```

**Step 3: Commit**

```bash
git add src/components/qr/qr-display-dialog.tsx src/components/pos/pos-register.tsx
git commit -m "feat(qr): add QR display dialog and integrate with POS checkout"
```

---

## Task 9: Create Scanner page + add sidebar nav entry

**Files:**
- Create: `src/app/(admin)/scanner/page.tsx`
- Modify: `src/app/(admin)/layout.tsx`

**Step 1: Create the scanner page**

Create `src/app/(admin)/scanner/page.tsx`:

```tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useActivePasses } from '@/contexts/active-passes-context'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Html5Qrcode } from 'html5-qrcode'
import { Check, X, AlertTriangle } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ScanResult =
  | { status: 'authorized'; clientNom: string; passNom: string; dateExpiration: string }
  | { status: 'expired'; clientNom: string; dateExpiration: string }
  | { status: 'unknown' }

interface ScanHistoryEntry {
  id: string
  date: string
  clientNom: string | null
  result: ScanResult['status']
}

// ---------------------------------------------------------------------------
// Scanner Page
// ---------------------------------------------------------------------------

export default function ScannerPage() {
  const { findByQrToken } = useActivePasses()
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [history, setHistory] = useState<ScanHistoryEntry[]>([])
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isProcessingRef = useRef(false)

  // Lookup a scanned QR token
  const processToken = useCallback(
    (token: string) => {
      if (isProcessingRef.current) return
      isProcessingRef.current = true

      const pass = findByQrToken(token)
      let result: ScanResult

      if (!pass) {
        result = { status: 'unknown' }
      } else {
        const now = new Date()
        const expDate = new Date(pass.dateExpiration)
        if (expDate < now) {
          result = {
            status: 'expired',
            clientNom: pass.clientNom,
            dateExpiration: pass.dateExpiration,
          }
        } else {
          result = {
            status: 'authorized',
            clientNom: pass.clientNom,
            passNom: pass.passNom,
            dateExpiration: pass.dateExpiration,
          }
        }
      }

      setScanResult(result)

      // Add to history
      const entry: ScanHistoryEntry = {
        id: `scan-${Date.now()}`,
        date: new Date().toISOString(),
        clientNom:
          result.status === 'authorized'
            ? result.clientNom
            : result.status === 'expired'
              ? result.clientNom
              : null,
        result: result.status,
      }
      setHistory((prev) => [entry, ...prev].slice(0, 20))

      // Auto-dismiss after 3 seconds
      timeoutRef.current = setTimeout(() => {
        setScanResult(null)
        isProcessingRef.current = false
      }, 3000)
    },
    [findByQrToken]
  )

  // Start/stop camera scanner
  useEffect(() => {
    const elementId = 'qr-reader'

    // Delay to ensure DOM is ready
    const startTimeout = setTimeout(() => {
      const scanner = new Html5Qrcode(elementId)
      scannerRef.current = scanner

      scanner
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            processToken(decodedText)
          },
          () => {
            // QR scan error — ignore (no QR in view)
          }
        )
        .catch((err) => {
          console.error('Scanner start error:', err)
        })
    }, 500)

    return () => {
      clearTimeout(startTimeout)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .then(() => scannerRef.current?.clear())
      }
    }
  }, [processToken])

  return (
    <div className="fixed inset-0 bg-[#1A1A1A] text-white z-50 flex flex-col overflow-auto">
      {/* Scanner area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <h1 className="font-display text-2xl font-bold mb-4">Scanner QR Code</h1>

        {/* Camera view */}
        <div
          id="qr-reader"
          className="w-full max-w-sm rounded-xl overflow-hidden"
        />

        {/* Scan result overlay */}
        {scanResult && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            {scanResult.status === 'authorized' && (
              <div className="bg-[#22C55E] rounded-2xl p-8 text-center max-w-sm mx-4 shadow-2xl">
                <Check className="h-24 w-24 mx-auto mb-4" strokeWidth={3} />
                <h2 className="font-display text-3xl font-bold mb-2">
                  ACCES AUTORISE
                </h2>
                <p className="text-xl font-medium">{scanResult.clientNom}</p>
                <p className="text-lg opacity-90">Pass : {scanResult.passNom}</p>
                <p className="opacity-80 mt-2">
                  Expire le{' '}
                  {format(new Date(scanResult.dateExpiration), 'dd MMMM yyyy', {
                    locale: fr,
                  })}
                </p>
              </div>
            )}

            {scanResult.status === 'expired' && (
              <div className="bg-[#EF4444] rounded-2xl p-8 text-center max-w-sm mx-4 shadow-2xl">
                <X className="h-24 w-24 mx-auto mb-4" strokeWidth={3} />
                <h2 className="font-display text-3xl font-bold mb-2">
                  PASS EXPIRE
                </h2>
                <p className="text-xl font-medium">{scanResult.clientNom}</p>
                <p className="opacity-80 mt-2">
                  Expire le{' '}
                  {format(new Date(scanResult.dateExpiration), 'dd MMMM yyyy', {
                    locale: fr,
                  })}
                </p>
                <p className="mt-3 text-sm opacity-90">
                  Merci de renouveler votre pass a la reception
                </p>
              </div>
            )}

            {scanResult.status === 'unknown' && (
              <div className="bg-[#F97316] rounded-2xl p-8 text-center max-w-sm mx-4 shadow-2xl">
                <AlertTriangle className="h-24 w-24 mx-auto mb-4" strokeWidth={2} />
                <h2 className="font-display text-3xl font-bold mb-2">
                  QR INCONNU
                </h2>
                <p className="opacity-90">Pass non reconnu dans le systeme</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scan history */}
      {history.length > 0 && (
        <div className="border-t border-white/10 p-4 max-h-60 overflow-auto">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-white/60 mb-2">
            Historique des scans
          </h2>
          <div className="space-y-1">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 text-sm py-1.5 border-b border-white/5"
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    entry.result === 'authorized'
                      ? 'bg-green-400'
                      : entry.result === 'expired'
                        ? 'bg-red-400'
                        : 'bg-orange-400'
                  }`}
                />
                <span className="text-white/50 shrink-0">
                  {format(new Date(entry.date), 'HH:mm:ss')}
                </span>
                <span className="flex-1 truncate">
                  {entry.clientNom || 'Inconnu'}
                </span>
                <span
                  className={`text-xs font-medium ${
                    entry.result === 'authorized'
                      ? 'text-green-400'
                      : entry.result === 'expired'
                        ? 'text-red-400'
                        : 'text-orange-400'
                  }`}
                >
                  {entry.result === 'authorized'
                    ? 'OK'
                    : entry.result === 'expired'
                      ? 'EXPIRE'
                      : 'INCONNU'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Add Scanner nav entry to sidebar**

In `src/app/(admin)/layout.tsx`, add `ScanLine` to the lucide-react imports:

```typescript
import {
  LayoutDashboard,
  Users,
  Home,
  Calculator,
  Mail,
  Camera,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Receipt,
  ScanLine,
} from 'lucide-react'
```

Add to navItems array (at the end):

```typescript
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/bungalows', label: 'Bungalows', icon: Home },
  { href: '/comptabilite', label: 'Comptabilite', icon: Calculator },
  { href: '/depenses', label: 'Depenses', icon: Receipt },
  { href: '/newsletter', label: 'Newsletter', icon: Mail },
  { href: '/instagram', label: 'Instagram', icon: Camera },
  { href: '/scanner', label: 'Scanner QR', icon: ScanLine },
]
```

**Step 3: Commit**

```bash
git add src/app/(admin)/scanner/page.tsx src/app/(admin)/layout.tsx
git commit -m "feat(qr): create Scanner page with camera and scan history"
```

---

## Task 10: Final verification

**Step 1: Run the dev server and verify**

```bash
npm run dev
```

Verify these routes work:
- `/depenses` — Shows expense list with filters, monthly total, add dialog with photo upload, detail modal with photo zoom, delete button
- `/scanner` — Dark full-screen scanner page with camera access prompt, scan history at bottom
- `/comptabilite` (mensuelle tab) — Shows the new "Depenses du mois par categorie" breakdown table
- `/pos` — After selling a gym pass with a client selected, the QR display dialog appears with QR code, client name, pass type, and expiration date

**Step 2: Final commit**

If all works:

```bash
git add -A
git commit -m "feat: complete Depenses & Recus and QR Code Access modules"
```
