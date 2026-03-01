# Phase 4: Core Admin Modules - Research

**Researched:** 2026-03-01
**Domain:** Client database (paginated table, search/filter, profile pages) and bungalow calendar (month grid, occupancy rates)
**Confidence:** HIGH

## Summary

Phase 4 builds two core admin modules: a **Client management section** (list + profile pages) and a **Bungalow calendar** (month view with occupancy rates). Both modules consume existing mock data through `data-access.ts` and `TransactionsContext`, with all labels in French.

The client module requires: a paginated table with 35 clients (7 columns), search-as-you-type filtering across name/email/phone, dropdown filters for pass type and time period, a detail profile page per client with purchase history and computed stats, bungalow resident badge detection, and a newsletter toggle button. The bungalow module requires: a month-view calendar grid with 8 bungalow rows, reservation bars spanning date ranges, client name resolution, and weekly/monthly occupancy rate calculation.

The critical architectural finding is that the admin layout is a Client Component with `TransactionsProvider` already wrapping children. Client and bungalow pages need additional data (clients, bungalows, gym passes) not currently in any context. The best approach is to **load this data via `useEffect` in each page** (same pattern as `TransactionsContext`), since the dataset is small (35 clients, 8 bungalows) and this avoids creating unnecessary provider complexity for read-only data. For client profile pages, the dynamic route `[id]` renders a Client Component that fetches a single client by ID.

**Primary recommendation:** Install shadcn Table and Select components. Build the client list as a Client Component with `useState` for search/filter/pagination state and `useMemo` for derived filtered results. Build client profiles as dynamic route pages `/clients/[id]`. Build the bungalow calendar as a custom CSS grid (8 rows x days-in-month columns) using `date-fns` for all date math. No new external dependencies needed beyond shadcn component additions.

## Standard Stack

### Core (Already installed -- no new dependencies needed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.3 | useState for filters, useMemo for derived data, useEffect for data loading | Built-in, no external state library needed |
| Tailwind CSS | v4 | Table styling, calendar grid layout, responsive design | Already configured with WildWood theme |
| date-fns | 4.1.0 | Month navigation, date range checking, day counting, formatting | Already installed, tree-shakable |
| lucide-react | 0.575.0 | Search icon, filter icon, calendar navigation arrows, badge icons | Already installed |
| radix-ui | 1.4.3 | Select primitive for filter dropdowns (via shadcn Select) | Already installed as monorepo package |

### New shadcn Components to Install
| Component | Purpose | Install Command |
|-----------|---------|-----------------|
| Table | Client list table structure | `npx shadcn@latest add table` |
| Select | Filter dropdowns (type de pass, periode) | `npx shadcn@latest add select` |

**Note:** Use `npx` not `pnpm dlx` (project uses npm per decision [02-01]).

### date-fns Functions Needed
| Function | Import | Purpose |
|----------|--------|---------|
| `parseISO` | `date-fns` | Parse ISO date strings from mock data |
| `format` | `date-fns` | Format dates for display (DD/MM/YYYY) |
| `isWithinInterval` | `date-fns` | Check if a reservation spans a given date |
| `eachDayOfInterval` | `date-fns` | Generate array of days for calendar columns |
| `startOfMonth` | `date-fns` | Get first day of displayed month |
| `endOfMonth` | `date-fns` | Get last day of displayed month |
| `addMonths` | `date-fns` | Navigate to next month |
| `subMonths` | `date-fns` | Navigate to previous month |
| `getDaysInMonth` | `date-fns` | Calculate total days for occupancy rate denominator |
| `differenceInDays` | `date-fns` | Count reservation nights within a date range |
| `isSameMonth` | `date-fns` | Check if a date falls within displayed month |
| `isSameDay` | `date-fns` | Compare dates for reservation boundary detection |
| `isToday` | `date-fns` | Already used in dashboard, highlight current day |
| `startOfWeek` | `date-fns` | Week boundary for weekly occupancy calculation |
| `endOfWeek` | `date-fns` | Week boundary for weekly occupancy calculation |
| `getWeeksInMonth` | `date-fns` | Number of weeks for weekly occupancy breakdown |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn Table (recommended) | TanStack Table | TanStack Table is overkill for 35 rows with client-side filtering. Adds 30KB+ dependency. Simple shadcn Table with manual pagination is cleaner. |
| useState for search | External search library (fuse.js) | Dataset is 35 clients. Simple `.filter()` with `.toLowerCase().includes()` is instant. No fuzzy search needed. |
| Custom calendar grid | react-big-calendar, FullCalendar | These are generic calendar libraries designed for event scheduling. The bungalow calendar is a specific 8-row Gantt-style grid. Custom CSS grid matches the requirement precisely with less code and zero dependency. |
| Select for filters | Tabs for filters | Select is better for filters with many options (9 pass types). Tabs work for 2-3 options but not 9+. |
| useEffect data loading | Additional React Context | Creating ClientsContext and BungalowsContext adds provider nesting complexity for read-only data that never changes in the prototype. useEffect + useState in each page is simpler and follows the existing TransactionsContext pattern internally. |

**Installation:**
```bash
npx shadcn@latest add table select
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(admin)/
│   ├── layout.tsx                    # EXISTING: No changes needed
│   ├── dashboard/
│   │   └── page.tsx                  # EXISTING: No changes
│   ├── clients/
│   │   ├── page.tsx                  # NEW: Client list with table, search, filters, pagination
│   │   └── [id]/
│   │       └── page.tsx              # NEW: Client profile with history, stats, badge, newsletter btn
│   └── bungalows/
│       └── page.tsx                  # NEW: Bungalow calendar with month view and occupancy rates
├── components/
│   ├── admin/
│   │   ├── client-table.tsx          # NEW: Table component with search/filter/pagination
│   │   ├── client-profile.tsx        # NEW: Profile card with stats and history
│   │   └── bungalow-calendar.tsx     # NEW: Month calendar grid with reservation bars
│   └── ui/
│       ├── table.tsx                 # NEW: shadcn Table component (installed)
│       └── select.tsx                # NEW: shadcn Select component (installed)
├── contexts/
│   └── transactions-context.tsx      # EXISTING: No changes
└── lib/
    ├── data-access.ts                # EXISTING: getClients, getClientById, getBungalows used
    └── types.ts                      # EXISTING: Client, Bungalow, Reservation, Transaction types
```

### Pattern 1: Client List Page -- Data Loading + Filtering
**What:** The client list page is a Client Component that loads clients and transactions via `useEffect`, manages search/filter/pagination state with `useState`, and derives the filtered/paginated results with `useMemo`.
**When to use:** For the `/clients` page.

```typescript
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTransactions } from '@/contexts/transactions-context'
import { getClients, getBungalows } from '@/lib/data-access'
import type { Client, Bungalow } from '@/lib/types'

const ITEMS_PER_PAGE = 10

export default function ClientsPage() {
  const { transactions } = useTransactions()
  const [clients, setClients] = useState<Client[]>([])
  const [bungalows, setBungalows] = useState<Bungalow[]>([])
  const [search, setSearch] = useState('')
  const [filterPass, setFilterPass] = useState<string>('tous')
  const [filterPeriode, setFilterPeriode] = useState<string>('tous')
  const [page, setPage] = useState(1)

  useEffect(() => {
    Promise.all([getClients(), getBungalows()]).then(([c, b]) => {
      setClients(c)
      setBungalows(b)
    })
  }, [])

  // Derive "type de pass" for each client from their most recent gym-pass transaction
  const clientsWithPassType = useMemo(() => {
    return clients.map(client => {
      const clientTxns = transactions.filter(t => t.clientId === client.id && t.type === 'gym-pass')
      const lastPassTxn = clientTxns.sort((a, b) => b.date.localeCompare(a.date))[0]
      const typePass = lastPassTxn?.items[0]?.nom ?? '-'
      return { ...client, typePass }
    })
  }, [clients, transactions])

  // Search + filter logic
  const filtered = useMemo(() => {
    let result = clientsWithPassType

    // Search by name, email, phone
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        `${c.prenom} ${c.nom}`.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.telephone?.includes(q)
      )
    }

    // Filter by pass type
    if (filterPass !== 'tous') {
      result = result.filter(c => c.typePass === filterPass)
    }

    // Filter by period (derniere visite within last N days)
    if (filterPeriode !== 'tous') {
      // Implementation with date-fns subDays/isAfter
    }

    return result
  }, [clientsWithPassType, search, filterPass, filterPeriode])

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [search, filterPass, filterPeriode])

  // Render table with paginated results...
}
```

### Pattern 2: Client Profile Page -- Dynamic Route
**What:** The client profile page uses a dynamic route `/clients/[id]` to display a single client's full history. It loads the client by ID, computes purchase history from transactions, detects bungalow resident status from reservations, and shows a newsletter toggle.
**When to use:** For the `/clients/[id]` page.

```typescript
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useTransactions } from '@/contexts/transactions-context'
import { getClientById, getBungalows } from '@/lib/data-access'
import type { Client, Bungalow } from '@/lib/types'

export default function ClientProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { transactions } = useTransactions()
  const [client, setClient] = useState<Client | null>(null)
  const [bungalows, setBungalows] = useState<Bungalow[]>([])

  useEffect(() => {
    Promise.all([getClientById(id), getBungalows()]).then(([c, b]) => {
      setClient(c ?? null)
      setBungalows(b)
    })
  }, [id])

  // Compute client stats from transactions
  const clientStats = useMemo(() => {
    if (!client) return null
    const clientTxns = transactions.filter(t => t.clientId === client.id)
    const montantTotal = clientTxns.reduce((sum, t) => sum + t.total, 0)
    const datesVisite = [...new Set(clientTxns.map(t => t.date.split('T')[0]))].sort().reverse()
    const historiqueAchats = clientTxns.sort((a, b) => b.date.localeCompare(a.date))
    return { montantTotal, datesVisite, historiqueAchats }
  }, [client, transactions])

  // Check bungalow resident status
  const isResident = useMemo(() => {
    if (!client?.bungalowId) return false
    const bungalow = bungalows.find(b => b.id === client.bungalowId)
    return bungalow?.reservations.some(r => r.statut === 'en-cours') ?? false
  }, [client, bungalows])

  // Render profile...
}
```

### Pattern 3: Bungalow Calendar -- CSS Grid Month View
**What:** The bungalow calendar renders a CSS grid with 8 rows (one per bungalow) and N columns (one per day of the month). Reservations are rendered as colored bars spanning multiple columns using `grid-column: start / end`. Month navigation uses `addMonths`/`subMonths`.
**When to use:** For the `/bungalows` page.

The calendar is NOT a standard week-based calendar. It is a **Gantt chart / timeline view** where:
- Y-axis = 8 bungalows (fixed rows)
- X-axis = days of the month (28-31 columns)
- Reservations = colored bars spanning their date range

```typescript
'use client'

import { useState, useEffect, useMemo } from 'react'
import { getClients, getBungalows } from '@/lib/data-access'
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  addMonths, subMonths, format, parseISO,
  isWithinInterval, getDaysInMonth, isSameDay
} from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Client, Bungalow, Reservation } from '@/lib/types'

export default function BungalowsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [clients, setClients] = useState<Client[]>([])
  const [bungalows, setBungalows] = useState<Bungalow[]>([])

  useEffect(() => {
    Promise.all([getClients(), getBungalows()]).then(([c, b]) => {
      setClients(c)
      setBungalows(b)
    })
  }, [])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = getDaysInMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Map clientId to client name for display
  const clientMap = useMemo(() => {
    const map = new Map<string, string>()
    clients.forEach(c => map.set(c.id, `${c.prenom} ${c.nom}`))
    return map
  }, [clients])

  // Calculate grid position for a reservation within the current month
  function getReservationColumns(res: Reservation): { start: number; end: number } | null {
    const resStart = parseISO(res.dateDebut)
    const resEnd = parseISO(res.dateFin)

    // Check if reservation overlaps with current month
    if (resEnd < monthStart || resStart > monthEnd) return null

    const start = resStart < monthStart ? 1 : resStart.getDate()
    const end = resEnd > monthEnd ? daysInMonth + 1 : resEnd.getDate() + 1
    return { start: start + 1, end: end + 1 } // +1 for bungalow label column
  }

  // Occupancy rate calculation
  const occupancyRate = useMemo(() => {
    const totalSlots = 8 * daysInMonth // 8 bungalows * days in month
    let occupiedSlots = 0
    bungalows.forEach(b => {
      b.reservations.forEach(r => {
        if (r.statut === 'annulee') return
        const resStart = parseISO(r.dateDebut)
        const resEnd = parseISO(r.dateFin)
        // Count days that overlap with current month
        const overlapStart = resStart < monthStart ? monthStart : resStart
        const overlapEnd = resEnd > monthEnd ? monthEnd : resEnd
        if (overlapStart <= overlapEnd) {
          const overlapDays = eachDayOfInterval({ start: overlapStart, end: overlapEnd }).length
          occupiedSlots += overlapDays
        }
      })
    })
    return Math.round((occupiedSlots / totalSlots) * 100)
  }, [bungalows, currentMonth, daysInMonth, monthStart, monthEnd])

  return (
    <div>
      {/* Month navigation header */}
      {/* CSS Grid calendar */}
      <div
        className="grid overflow-x-auto"
        style={{
          gridTemplateColumns: `120px repeat(${daysInMonth}, minmax(36px, 1fr))`,
          gridTemplateRows: `40px repeat(8, 48px)`,
        }}
      >
        {/* Header row: day numbers */}
        {/* 8 bungalow rows with reservation bars */}
      </div>
      {/* Occupancy rate display */}
    </div>
  )
}
```

### Pattern 4: Reservation Bar Rendering
**What:** Each reservation renders as a positioned div within the CSS grid, spanning from its start column to its end column. Color-coded by status.
**When to use:** Inside the bungalow calendar grid.

```typescript
// Status color mapping
const statutColors: Record<string, string> = {
  'en-cours': 'bg-wildwood-lime text-white',
  'confirmee': 'bg-wildwood-orange text-white',
  'terminee': 'bg-muted text-muted-foreground',
  'annulee': 'bg-destructive/30 text-destructive line-through',
}

// Inside the grid, for each bungalow row:
{bungalow.reservations.map(res => {
  const cols = getReservationColumns(res)
  if (!cols) return null
  return (
    <div
      key={res.id}
      className={`${statutColors[res.statut]} rounded-md px-2 py-1 text-xs truncate`}
      style={{
        gridRow: bungalow.numero + 1, // +1 for header row
        gridColumn: `${cols.start} / ${cols.end}`,
      }}
    >
      {clientMap.get(res.clientId)} - {res.nuits}n - {res.montant.toLocaleString()} THB
    </div>
  )
})}
```

### Pattern 5: Search-as-you-type Without Debounce
**What:** For 35 clients, filtering is instantaneous. No debouncing is needed. The search input directly updates `useState`, and `useMemo` recomputes the filtered list on every keystroke.
**When to use:** Client list search input.

```typescript
// No debounce needed for 35 items
<Input
  placeholder="Rechercher par nom, email ou telephone..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="max-w-sm"
/>
```

### Pattern 6: Pagination Reset on Filter Change
**What:** When search text or filter values change, the current page resets to 1. This prevents showing an empty page when filters reduce the result set.
**When to use:** Any paginated list with filters.

```typescript
// Reset to page 1 when filters change
useEffect(() => { setPage(1) }, [search, filterPass, filterPeriode])
```

### Anti-Patterns to Avoid
- **Do NOT use TanStack Table:** The dataset is 35 rows. TanStack Table adds 30KB+ of dependency for features (virtual scrolling, column resizing, server-side pagination) that are completely unnecessary. A simple `Array.filter().slice()` with shadcn Table markup is cleaner and faster.
- **Do NOT use a calendar library (react-big-calendar, FullCalendar):** The bungalow view is a Gantt-style timeline, not a traditional calendar. These libraries would fight the layout. A custom CSS grid with 8 fixed rows is simpler and matches requirements exactly.
- **Do NOT debounce the search:** With 35 clients, `.filter().includes()` is sub-millisecond. Debouncing adds complexity for zero benefit. Filter directly on every keystroke.
- **Do NOT create Server Component pages under the admin layout:** While technically possible (the admin layout passes children as a slot), the pages need `useTransactions()` and `useEffect` for data loading, making them Client Components. Be explicit with `'use client'`.
- **Do NOT hardcode pass type lists:** Derive available pass types from the transaction data to avoid maintaining two separate lists.
- **Do NOT put reservation data in TransactionsContext:** Bungalow reservations are a separate data domain (stored in bungalows.json, not transactions.json). Load bungalows independently in the bungalow calendar page.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Table markup | Custom div-based table | shadcn Table (Table, TableHeader, TableRow, TableHead, TableCell) | Accessible, semantic HTML table with consistent styling |
| Filter dropdowns | Custom dropdown with useState + absolute positioning | shadcn Select (Select, SelectTrigger, SelectContent, SelectItem) | Accessible, keyboard navigable, portal-rendered, handles edge cases |
| Date formatting | Manual string manipulation | `format(parseISO(date), 'dd/MM/yyyy')` from date-fns | Locale-aware, handles edge cases, already installed |
| Month navigation | Manual Date arithmetic | `addMonths(date, 1)` / `subMonths(date, 1)` from date-fns | Handles month-length differences, leap years |
| Day range generation | Manual for-loop | `eachDayOfInterval({ start, end })` from date-fns | Clean, tested, handles DST transitions |
| Resident badge detection | Manual reservation date comparison | `bungalow.reservations.some(r => r.statut === 'en-cours')` | Decision [02-03] already established this pattern |
| Number formatting | Custom regex | `amount.toLocaleString()` | Browser-native, consistent with POS and dashboard |
| Status badge colors | Inline conditionals | Object map `statutColors[res.statut]` | Maintainable, easy to update, no nested ternaries |

**Key insight:** The only new shadcn components needed are Table and Select. Everything else uses existing installed libraries (date-fns, lucide-react, Badge, Card, Button, Input) plus standard React patterns (useState, useMemo, useEffect).

## Common Pitfalls

### Pitfall 1: "Type de pass" is Not on the Client Object
**What goes wrong:** The Client type has no `typePass` field. Trying to display "type de pass" in the client table fails because the data doesn't exist on the client record.
**Why it happens:** Pass type is a transaction attribute, not a client attribute. A client's "type de pass" must be derived from their most recent gym-pass transaction.
**How to avoid:** In `useMemo`, join clients with transactions to find each client's last gym-pass transaction and extract the pass name (`items[0].nom`). Clients with no gym-pass transaction show "-" or "Aucun".
**Warning signs:** Empty or undefined values in the "Type de pass" column.

### Pitfall 2: Dynamic Route `[id]` Under Client Component Layout
**What goes wrong:** The `/clients/[id]` page can't use `useParams()` because it's not a Client Component, or `params` from the server side conflicts with the client layout.
**Why it happens:** In Next.js 16, pages under a Client Component layout can still be Server Components, but they need to handle the `params` prop differently.
**How to avoid:** Mark the client profile page as `'use client'` and use `useParams()` from `next/navigation` to get the `id` parameter. This is consistent with the admin section being fully client-side.
**Warning signs:** `useParams` returning undefined or page rendering errors.

### Pitfall 3: Bungalow Calendar Grid Overflow
**What goes wrong:** The calendar grid with 31 columns doesn't fit on screen, especially on tablets.
**Why it happens:** 31 columns x minimum width = potentially > 1200px.
**How to avoid:** Use `overflow-x-auto` on the grid container so it scrolls horizontally on smaller screens. Set `minmax(36px, 1fr)` for day columns so they compress but remain readable. The bungalow label column is fixed at `120px`.
**Warning signs:** Calendar content overflowing the page layout or being cut off.

### Pitfall 4: Reservation Bars Spanning Month Boundaries
**What goes wrong:** A reservation starting January 25 and ending February 10 should appear in both January and February views, but only shows the portion within the displayed month.
**Why it happens:** The `getReservationColumns` function must clamp start/end dates to the month boundaries.
**How to avoid:** Compare reservation dates with `monthStart` and `monthEnd`. If `resStart < monthStart`, use column 1. If `resEnd > monthEnd`, use column `daysInMonth + 1`. Only skip the reservation if it has zero overlap with the displayed month.
**Warning signs:** Reservations disappearing or rendering outside the grid when they span month boundaries.

### Pitfall 5: Occupancy Rate Double-Counting
**What goes wrong:** Occupancy rate exceeds 100% or is incorrect because cancelled reservations are included or overlapping reservations on the same bungalow are counted twice.
**Why it happens:** The occupancy formula doesn't filter out `annulee` status, or counts every day of overlapping reservations.
**How to avoid:** Filter out `statut === 'annulee'` reservations before counting. Since the mock data doesn't have overlapping reservations on the same bungalow (each bungalow has sequential non-overlapping reservations), simple day counting works. The formula is: `occupiedDays / (8 * daysInMonth) * 100`.
**Warning signs:** Occupancy showing > 100% or including cancelled bookings.

### Pitfall 6: Newsletter Button State Not Persisting
**What goes wrong:** The "Ajouter a la newsletter" button toggles client.newsletter, but the change is lost on page refresh.
**Why it happens:** There's no backend. The mock data reloads from JSON on every page mount.
**How to avoid:** Accept this limitation for the prototype. Show a toast confirmation ("Client ajoute a la newsletter") using Sonner. Optionally update the local state so the button reflects the change within the current session. The prototype banner communicates that data doesn't persist.
**Warning signs:** Users expecting the newsletter status to persist across page navigations.

### Pitfall 7: Page Count Updating When Filters Remove Results
**What goes wrong:** User is on page 3, applies a filter that reduces results to 5 items (1 page). The current page shows blank results.
**Why it happens:** Page state isn't reset when the filter result set shrinks.
**How to avoid:** Add a `useEffect` that resets `page` to 1 whenever `search`, `filterPass`, or `filterPeriode` changes. See Pattern 6 above.
**Warning signs:** Empty table after applying filters, even when filtered results exist.

### Pitfall 8: date-fns French Locale for Month Names
**What goes wrong:** Month names display in English ("March 2026") instead of French ("Mars 2026").
**Why it happens:** date-fns `format` defaults to English locale.
**How to avoid:** Import and use the French locale: `format(date, 'MMMM yyyy', { locale: fr })`. The `fr` locale is included in date-fns, no additional install needed.
**Warning signs:** English month names in the calendar header.

## Code Examples

Verified patterns from the existing codebase and official sources:

### shadcn Table Usage for Client List
```typescript
// Source: shadcn/ui Table documentation
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nom</TableHead>
      <TableHead>Prenom</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Telephone</TableHead>
      <TableHead>Type de pass</TableHead>
      <TableHead>Derniere visite</TableHead>
      <TableHead className="text-right">Nb visites</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {paginated.map(client => (
      <TableRow
        key={client.id}
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => router.push(`/clients/${client.id}`)}
      >
        <TableCell className="font-medium">{client.nom}</TableCell>
        <TableCell>{client.prenom}</TableCell>
        <TableCell>{client.email ?? '-'}</TableCell>
        <TableCell>{client.telephone ?? '-'}</TableCell>
        <TableCell>{client.typePass}</TableCell>
        <TableCell>
          {client.derniereVisite
            ? format(parseISO(client.derniereVisite), 'dd/MM/yyyy')
            : '-'}
        </TableCell>
        <TableCell className="text-right">{client.nombreVisites}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### shadcn Select for Pass Type Filter
```typescript
// Source: shadcn/ui Select documentation
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'

<Select value={filterPass} onValueChange={setFilterPass}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Type de pass" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="tous">Tous les passes</SelectItem>
    {passTypes.map(type => (
      <SelectItem key={type} value={type}>{type}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

### Bungalow Resident Badge Detection
```typescript
// Source: Decision [02-03] -- client.bungalowId + active reservation (statut en-cours)
import { Badge } from '@/components/ui/badge'
import { Home } from 'lucide-react'

// In client profile:
{isResident && (
  <Badge className="bg-wildwood-bois text-white gap-1">
    <Home className="h-3 w-3" />
    Resident bungalow
  </Badge>
)}
```

### Newsletter Toggle Button
```typescript
// On client profile page
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'

function handleNewsletter() {
  // Toggle local state
  setClient(prev => prev ? { ...prev, newsletter: !prev.newsletter } : prev)
  toast.success(
    client?.newsletter
      ? 'Client retire de la newsletter'
      : 'Client ajoute a la newsletter'
  )
}

<Button
  variant={client.newsletter ? 'secondary' : 'default'}
  onClick={handleNewsletter}
>
  <Mail className="h-4 w-4" />
  {client.newsletter ? 'Inscrit a la newsletter' : 'Ajouter a la newsletter'}
</Button>
```

### Bungalow Calendar Month Navigation
```typescript
// Calendar header with month navigation
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format, addMonths, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'

<div className="flex items-center justify-between">
  <Button variant="outline" size="icon" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
    <ChevronLeft className="h-4 w-4" />
  </Button>
  <h2 className="font-display text-xl font-bold capitalize">
    {format(currentMonth, 'MMMM yyyy', { locale: fr })}
  </h2>
  <Button variant="outline" size="icon" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
    <ChevronRight className="h-4 w-4" />
  </Button>
</div>
```

### Occupancy Rate Display
```typescript
// Show occupancy as a percentage card
<Card>
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Taux d'occupation mensuel
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold font-display text-wildwood-bois">
      {occupancyRate}%
    </div>
    <p className="text-xs text-muted-foreground mt-1">
      {occupiedSlots} / {totalSlots} nuits-bungalow
    </p>
  </CardContent>
</Card>
```

### BUNG-04: Resident Indicator with Gym Access
```typescript
// In bungalow calendar, show gym access icon for active residents
import { Dumbbell } from 'lucide-react'

// Inside reservation bar for 'en-cours' status:
<div className="flex items-center gap-1">
  <span className="truncate">{clientMap.get(res.clientId)}</span>
  {res.statut === 'en-cours' && (
    <Dumbbell className="h-3 w-3 shrink-0" title="Acces gym inclus" />
  )}
</div>
```

### Weekly Occupancy Rate Calculation
```typescript
// BUNG-03: Weekly occupancy breakdown
import { startOfWeek, endOfWeek, eachWeekOfInterval, eachDayOfInterval } from 'date-fns'
import { fr } from 'date-fns/locale'

const weeklyOccupancy = useMemo(() => {
  const weeks = eachWeekOfInterval(
    { start: monthStart, end: monthEnd },
    { weekStartsOn: 1 } // Monday
  )
  return weeks.map(weekStart => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    // Clamp to month boundaries
    const start = weekStart < monthStart ? monthStart : weekStart
    const end = weekEnd > monthEnd ? monthEnd : weekEnd
    const daysInWeek = eachDayOfInterval({ start, end }).length
    const totalSlots = 8 * daysInWeek

    let occupied = 0
    bungalows.forEach(b => {
      b.reservations.forEach(r => {
        if (r.statut === 'annulee') return
        const resStart = parseISO(r.dateDebut)
        const resEnd = parseISO(r.dateFin)
        const overlapStart = resStart < start ? start : resStart
        const overlapEnd = resEnd > end ? end : resEnd
        if (overlapStart <= overlapEnd) {
          occupied += eachDayOfInterval({ start: overlapStart, end: overlapEnd }).length
        }
      })
    })
    return {
      label: `S${format(weekStart, 'w')}`,
      rate: Math.round((occupied / totalSlots) * 100),
    }
  })
}, [bungalows, monthStart, monthEnd])
```

### Data Verification: Mock Data Stats
```
Clients: 35 total
  - 8 residents (cli-001 to cli-008, each with bungalowId)
  - 27 visiteurs (cli-009 to cli-035)
  - Newsletter opt-in: 22 clients
  - With email: 31 clients
  - With telephone: 7 clients

Bungalows: 8 total (bung-1 to bung-8)
  - Total reservations: 25
  - Active (en-cours): 6 (bung-1, bung-2, bung-3, bung-4, bung-5, bung-7, bung-8 -- 7 actually)
  - Note: bung-6 has terminee (ended 2026-03-01) and confirmee only
  - Confirmed (future): ~11
  - Terminated (past): ~8

Transactions: 90 total
  - Gym-pass: ~38 transactions
  - F&B: ~37 transactions
  - Bungalow: ~15 transactions
  - Date range: 2026-01-03 to 2026-03-01

ITEMS_PER_PAGE = 10 gives 4 pages for 35 clients (10, 10, 10, 5)

Pagination math:
  - Page 1: clients 1-10
  - Page 2: clients 11-20
  - Page 3: clients 21-30
  - Page 4: clients 31-35
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| TanStack Table for all tables | shadcn Table for small datasets, TanStack only for large/server-side | 2024-2025 | For < 100 rows, simple Table + Array.filter is standard. TanStack Table is for 1000+ rows or server-side pagination. |
| react-big-calendar for all calendars | Custom CSS grid for Gantt/timeline views | 2024+ | Calendar libraries are for event scheduling. Gantt timelines use CSS grid with grid-column spanning. |
| debounced search for all lists | Direct filtering for small datasets | Always | Debounce is for API calls or 1000+ items. For 35 items, direct filter is instant. |
| Separate locale packages | date-fns includes locales in tree-shakable imports | date-fns v3+ | `import { fr } from 'date-fns/locale'` -- no extra install needed. |

**Deprecated/outdated:**
- `@radix-ui/react-select`: This project uses the `radix-ui` monorepo package (v1.4.3), not individual `@radix-ui/*` packages. shadcn components import as `import { Select } from "radix-ui"`.

## Open Questions

1. **Client "type de pass" derivation strategy**
   - What we know: The Client type has no `typePass` field. Pass type must be derived from transactions.
   - What's unclear: Should we show the LAST pass purchased, the MOST COMMON pass, or the CURRENT (unexpired) pass?
   - Recommendation: Show the last (most recent) pass purchased. This is the simplest derivation and most useful for the admin: "what did this client buy last?" The column header should be "Dernier pass" rather than "Type de pass" for clarity. However, the requirement says "type pass" so we use that label and show the most recent.

2. **Period filter semantics**
   - What we know: CLI-03 says "filtre par type de pass ou periode."
   - What's unclear: What "periode" means -- last 7 days, last 30 days, last 90 days? Or a custom date range?
   - Recommendation: Use preset periods as Select options: "7 derniers jours", "30 derniers jours", "90 derniers jours", "Cette annee". This is simpler than a date picker and sufficient for a prototype.

3. **Bungalow calendar scrolling on tablet**
   - What we know: 31 columns x 36px minimum = 1116px minimum grid width, plus 120px label column = 1236px total.
   - What's unclear: Whether this is comfortable on a 1024px-wide iPad in landscape.
   - Recommendation: Use `overflow-x-auto` for horizontal scrolling. Consider reducing day column minimum to 32px if needed. The calendar is an admin tool primarily used on desktop; tablet usability is secondary for this module.

## Sources

### Primary (HIGH confidence)
- Existing codebase files (directly inspected 2026-03-01):
  - `src/lib/types.ts` -- Client, Bungalow, Reservation, Transaction types with all field names
  - `src/lib/data-access.ts` -- getClients, getClientById, getBungalows, getTransactions functions
  - `src/lib/mock-data/clients.json` -- 35 clients, 8 residents with bungalowId, field shapes verified
  - `src/lib/mock-data/bungalows.json` -- 8 bungalows with 25 reservations, statut values verified
  - `src/lib/mock-data/transactions.json` -- 90 transactions, date range and type distribution verified
  - `src/app/(admin)/layout.tsx` -- Client Component, TransactionsProvider wrapping children, navItems with /clients and /bungalows routes
  - `src/app/(admin)/dashboard/page.tsx` -- Client Component pattern with useTransactions and useMemo
  - `src/contexts/transactions-context.tsx` -- useEffect data loading pattern from data-access.ts
  - `src/components/ui/badge.tsx` -- Badge component with variant support
  - `src/components/ui/button.tsx` -- Button with pos/outline/secondary variants
  - `src/components/ui/input.tsx` -- Input component for search field
  - `src/app/globals.css` -- WildWood theme tokens (wildwood-orange, wildwood-bois, wildwood-lime)
  - `package.json` -- All dependencies verified, npm confirmed (not pnpm)
- [shadcn/ui Table documentation](https://ui.shadcn.com/docs/components/radix/table) -- Install command, exports, usage pattern
- [shadcn/ui Select documentation](https://ui.shadcn.com/docs/components/radix/select) -- Install command, exports, usage pattern
- [date-fns documentation](https://date-fns.org/) -- All date functions verified as available in v4

### Secondary (MEDIUM confidence)
- [shadcn/ui Pagination documentation](https://ui.shadcn.com/docs/components/radix/pagination) -- Available but not recommended; manual pagination with Button components is simpler for 4 pages
- [Calendar grid with date-fns pattern](https://dev.to/vivekalhat/building-a-calendar-component-with-tailwind-and-date-fns-2c0i) -- Confirms eachDayOfInterval + startOfMonth/endOfMonth pattern
- [Occupancy rate calculation](https://www.siteminder.com/calculate-your-occupancy-rate/) -- Standard formula: occupied rooms / total rooms * 100

### Tertiary (LOW confidence)
- None -- all findings verified with primary or secondary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Zero new npm dependencies. Only two new shadcn components (Table, Select) added via CLI. All other libraries (date-fns, lucide-react, Badge, Card, Button, Input) already installed and proven in Phases 1-3.
- Architecture: HIGH -- Client list follows the same Client Component + useEffect + useMemo pattern already proven in dashboard and TransactionsContext. Bungalow calendar uses CSS grid which is standard for timeline views. Dynamic routes with `useParams` are a core Next.js pattern.
- Pitfalls: HIGH -- All pitfalls derived from direct analysis of the type system (missing typePass field), mock data structure (date ranges, statut values), and existing codebase patterns (TransactionsProvider location, localStorage hydration).

**Research date:** 2026-03-01
**Valid until:** 2026-03-31 (stable -- no fast-moving dependencies, all libraries already locked)
