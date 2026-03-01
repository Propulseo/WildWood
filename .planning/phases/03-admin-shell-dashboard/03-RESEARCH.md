# Phase 3: Admin Shell + Dashboard - Research

**Researched:** 2026-03-01
**Domain:** Collapsible admin sidebar layout, dashboard stat cards, revenue breakdown, data aggregation from TransactionsContext
**Confidence:** HIGH

## Summary

This phase enhances the existing admin layout shell with a collapsible sidebar and builds the dashboard page showing today's key business numbers. The technical scope is well-bounded: the admin layout already exists as a Client Component with sidebar navigation, route definitions, and the WildWood design system. The work involves (1) adding collapsible behavior to the existing sidebar, (2) making TransactionsContext available to the admin layout, and (3) building a dashboard page that computes and displays today's stats from in-memory transaction data.

The critical finding is that the **shadcn/ui Sidebar component should NOT be used**. It introduces heavy abstractions (SidebarProvider, cookie persistence, many subcomponents) and has a [known bug with Next.js 16](https://github.com/shadcn-ui/ui/issues/9189) where cookie-based persistence triggers "Blocking Route Server Data" errors. Since the admin layout is already a Client Component with a working sidebar, the correct approach is to **evolve the existing sidebar** by adding `useState` for collapse state, CSS transitions for smooth animation, and conditional rendering for icon-only mode. This is simpler, bug-free, and fully under our control.

The second critical finding is that **TransactionsProvider must be added to the admin layout**. It currently only wraps the POS layout. The dashboard needs `useTransactions()` to access both mock and POS-created transactions. The provider should be added to the admin layout (not lifted to root) to keep POS and admin route groups independent.

**Primary recommendation:** Add collapsible state (`useState`) to the existing admin layout, wrap admin children with `TransactionsProvider`, and build the dashboard page as a Client Component using `useTransactions()` + `useMemo` to compute today's KPIs. Use the existing shadcn Card component for stat cards and a simple three-column grid for revenue breakdown by center.

## Standard Stack

### Core (Already installed -- no new dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.3 | useState for sidebar collapse, useMemo for dashboard computations | Built-in, no external state library needed |
| Tailwind CSS | v4 | Layout, responsive, transitions | Already configured with admin theme variables |
| shadcn/ui Card | already installed | Stat cards for KPI display | Already in project at `src/components/ui/card.tsx` |
| lucide-react | 0.575.0 | Sidebar icons (already imported), collapse toggle icons | Already installed, already used in admin layout |
| date-fns | 4.1.0 | `isToday` / `isSameDay` for filtering transactions by date | Already installed, tree-shakable ESM imports |

### Functions from date-fns
| Function | Import | Purpose |
|----------|--------|---------|
| `isToday` | `date-fns/isToday` | Check if a transaction date is today |
| `parseISO` | `date-fns/parseISO` | Parse ISO date strings from transaction data |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom collapsible sidebar (recommended) | shadcn/ui Sidebar component | shadcn Sidebar has [Next.js 16 cookie persistence bug](https://github.com/shadcn-ui/ui/issues/9189), heavy abstraction (20+ subcomponents), overkill for 6 nav items. Custom approach reuses existing code. |
| Simple stat cards | Tremor dashboard library | Tremor adds a large dependency for a simple use case. shadcn Card + manual layout is sufficient. |
| `isToday` from date-fns | Manual date comparison (`new Date().toDateString()`) | date-fns is already installed, `isToday(parseISO(txn.date))` is cleaner and handles edge cases |
| `useMemo` for computed stats | Separate state with useEffect | useMemo is the correct pattern for derived data -- recomputes when transactions change, no extra renders |

**Installation:**
```bash
# No new packages needed. All dependencies are already installed.
# shadcn components already available: Card, Badge, Button, Separator
# lucide-react icons already available: LayoutDashboard, Users, Home, Calculator, Mail, Camera
# Additional lucide icons needed: PanelLeftClose, PanelLeftOpen (or ChevronLeft/ChevronRight), TrendingUp, Ticket, CalendarPlus
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(admin)/
│   ├── layout.tsx              # MODIFY: Add collapsible sidebar state + TransactionsProvider
│   └── dashboard/
│       └── page.tsx            # REWRITE: Dashboard with today's KPIs and revenue breakdown
├── components/
│   ├── admin/
│   │   └── admin-sidebar.tsx   # NEW: Extract sidebar into its own component for cleanliness
│   └── ui/
│       └── card.tsx            # EXISTING: Used for stat cards
├── contexts/
│   └── transactions-context.tsx # EXISTING: No changes needed
└── lib/
    ├── data-access.ts          # EXISTING: getTransactions() for initial data load
    └── types.ts                # EXISTING: Transaction type with centreRevenu field
```

### Pattern 1: Collapsible Sidebar with useState + CSS Transition
**What:** A single boolean state (`isCollapsed`) controls whether the sidebar shows full labels or icon-only mode. CSS `transition-all` provides smooth width animation. The collapse state is stored in `localStorage` for persistence across page reloads.
**When to use:** For the admin layout sidebar.
**Key design decisions:**
- Expanded width: `w-64` (256px) -- current value, proven to work
- Collapsed width: `w-16` (64px) -- enough for 40px icons with 12px padding
- Transition: `transition-all duration-300 ease-in-out` for smooth collapse
- Labels: conditionally rendered with `{!isCollapsed && <span>...</span>}`
- Toggle button: positioned at the bottom of the sidebar or as a floating button on the sidebar edge

```typescript
// In admin layout or extracted AdminSidebar component
'use client'

import { useState, useEffect } from 'react'

const SIDEBAR_STORAGE_KEY = 'wildwood-sidebar-collapsed'

// Read initial state from localStorage (client-side only)
function getInitialCollapsed(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  // Hydrate from localStorage after mount
  useEffect(() => {
    setIsCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true')
  }, [])

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      return next
    })
  }

  return (
    <div className="min-h-dvh bg-background text-foreground flex">
      <aside className={`
        ${isCollapsed ? 'w-16' : 'w-64'}
        bg-sidebar-background text-sidebar-foreground
        flex flex-col shrink-0
        transition-all duration-300 ease-in-out
      `}>
        {/* Header: WildWood branding (hidden when collapsed) */}
        {/* Nav items: icon always visible, label conditionally rendered */}
        {/* Toggle button at bottom */}
      </aside>
      <div className="flex-1 flex flex-col min-h-dvh">
        {children}
      </div>
    </div>
  )
}
```

### Pattern 2: TransactionsProvider in Admin Layout
**What:** The admin layout wraps its children with `TransactionsProvider` so the dashboard page can use `useTransactions()`. This mirrors how the POS layout already wraps its children.
**When to use:** In the admin layout, wrapping {children}.
**Key insight:** Since the admin layout is already a `'use client'` component, there is no Server Component/Client Component boundary issue.

```typescript
// In admin layout.tsx
import { TransactionsProvider } from '@/contexts/transactions-context'

// Inside the JSX:
<main className="flex-1 p-6 overflow-auto">
  <TransactionsProvider>
    {children}
  </TransactionsProvider>
</main>
```

### Pattern 3: Dashboard Page with useMemo Computed Stats
**What:** The dashboard page is a Client Component that calls `useTransactions()` to get all transactions, then uses `useMemo` to compute today's KPIs. This is reactive: when POS adds a transaction (same TransactionsContext instance), the dashboard automatically updates.
**When to use:** For all dashboard data derivation.
**Important:** POS and admin are separate route groups with separate TransactionsProvider instances. They do NOT share in-memory state across routes. The dashboard will show mock data + any transactions added within the admin session. This is acceptable for the prototype.

```typescript
'use client'

import { useMemo } from 'react'
import { useTransactions } from '@/contexts/transactions-context'
import { isToday, parseISO } from 'date-fns'

export default function DashboardPage() {
  const { transactions } = useTransactions()

  const todayStats = useMemo(() => {
    const todayTxns = transactions.filter(txn => isToday(parseISO(txn.date)))

    const revenuTotal = todayTxns.reduce((sum, txn) => sum + txn.total, 0)
    const passesVendus = todayTxns.filter(txn => txn.type === 'gym-pass').length
    const nouvellesReservations = todayTxns.filter(txn => txn.type === 'bungalow').length

    // Revenue by center
    const revenueByCenter = {
      Gym: todayTxns.filter(t => t.centreRevenu === 'Gym').reduce((s, t) => s + t.total, 0),
      'F&B': todayTxns.filter(t => t.centreRevenu === 'F&B').reduce((s, t) => s + t.total, 0),
      Bungalows: todayTxns.filter(t => t.centreRevenu === 'Bungalows').reduce((s, t) => s + t.total, 0),
    }

    return { revenuTotal, passesVendus, nouvellesReservations, revenueByCenter }
  }, [transactions])

  // Render stat cards and revenue breakdown
}
```

### Pattern 4: Stat Card Layout with shadcn Card
**What:** Three prominent stat cards at the top of the dashboard showing Revenus Totaux, Passes Vendus, and Nouvelles Reservations. Below that, a three-column grid showing revenue by center (Gym, F&B, Bungalows).
**When to use:** Dashboard page layout.

```typescript
// Stat card structure using existing shadcn Card
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

<Card>
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Revenus du jour
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold font-display">
      {revenuTotal.toLocaleString()} THB
    </div>
  </CardContent>
</Card>
```

### Pattern 5: Number Formatting for THB
**What:** Use `toLocaleString()` for formatting Thai Baht amounts with thousand separators. The codebase already uses this pattern (see `pos-register.tsx` line 219).
**When to use:** All monetary amounts displayed on the dashboard.

```typescript
// Consistent with existing codebase pattern
const formatTHB = (amount: number): string => `${amount.toLocaleString()} THB`

// Examples:
// formatTHB(19600)  -> "19,600 THB"
// formatTHB(0)      -> "0 THB"
```

### Anti-Patterns to Avoid
- **Do NOT install the shadcn/ui Sidebar component:** It has a [known Next.js 16 bug](https://github.com/shadcn-ui/ui/issues/9189) with cookie persistence, and is overkill for 6 navigation items. Evolve the existing sidebar instead.
- **Do NOT lift TransactionsProvider to root layout:** Keep POS and admin route groups isolated. Each has its own provider instance. Lifting to root would create unnecessary coupling.
- **Do NOT use `useEffect` for derived data:** Dashboard stats are derived from transactions. Use `useMemo`, not `useEffect` + `useState`. The latter causes an extra render cycle and is the wrong tool for computed values.
- **Do NOT hardcode today's date:** Use `isToday()` from date-fns, which compares against the actual current date. Mock data includes transactions dated 2026-03-01 (today).
- **Do NOT use Recharts for the revenue breakdown:** The 3-center revenue summary is just 3 numbers. Cards or a simple table is better than a chart for 3 data points. Recharts is already installed for Phase 5 (comptabilite) but would be visual noise here.
- **Do NOT make the dashboard page a Server Component:** It needs `useTransactions()` (a client-side hook) to access the in-memory transaction state. It must be `'use client'`.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date comparison for "today" | Manual `new Date().toDateString()` comparison | `isToday(parseISO(date))` from date-fns | Handles timezone edge cases, already installed, tree-shakable |
| Stat card UI | Custom div structure | shadcn Card (CardHeader, CardTitle, CardContent) | Already in project, consistent styling, accessible |
| Sidebar active state detection | Custom string matching | `pathname === href \|\| pathname.startsWith(href + '/')` | Already implemented in current layout, handles nested routes |
| Number formatting with separators | Custom regex formatting | `amount.toLocaleString()` | Browser-native, locale-aware, already used in POS |
| Icon library | Custom SVGs | lucide-react icons | Already installed, consistent sizing, tree-shakable |
| CSS transitions for sidebar | JavaScript animation | `transition-all duration-300 ease-in-out` Tailwind class | GPU-accelerated, no JS overhead, smooth |

**Key insight:** This phase requires zero new dependencies. Everything needed (Card, lucide icons, date-fns, Tailwind transitions, TransactionsContext) is already installed and proven in the codebase.

## Common Pitfalls

### Pitfall 1: TransactionsProvider Missing in Admin Layout
**What goes wrong:** Dashboard page calls `useTransactions()` and throws "useTransactions must be used within TransactionsProvider" because TransactionsProvider only wraps the POS layout.
**Why it happens:** Phase 2 added TransactionsProvider to `(pos)/layout.tsx` only. The admin route group has no provider.
**How to avoid:** Add `<TransactionsProvider>` wrapping `{children}` in the admin layout. Import from `@/contexts/transactions-context`.
**Warning signs:** Runtime error on navigating to /dashboard.

### Pitfall 2: Sidebar Collapse Hydration Flash
**What goes wrong:** Sidebar renders expanded on server, then collapses on client when localStorage is read, causing a visual flash/jump.
**Why it happens:** The admin layout is a Client Component but still server-renders initially. `localStorage` is only available after hydration.
**How to avoid:** Initialize `isCollapsed` to `false` (expanded) as the default. Read localStorage in a `useEffect` and update. The visual flash is minimal (sidebar goes from 256px to 64px) and only happens if the user previously collapsed it. Alternatively, could use a CSS-only approach where the initial render matches the default (expanded).
**Warning signs:** Sidebar width "jumping" on page load when it was previously collapsed.

### Pitfall 3: Mock Data Date Mismatch
**What goes wrong:** Dashboard shows "0" for all today's stats because mock transaction dates don't match the actual current date.
**Why it happens:** Mock data has fixed dates (2026-01-03 through 2026-03-01). If the app is viewed on a date after 2026-03-01, `isToday()` will find no matching transactions.
**How to avoid:** The mock data includes 12 transactions dated 2026-03-01. For the prototype demo, this works. For resilience, consider adding a "demo mode" note or using the latest date in the transaction data as "today" instead of `new Date()`. Recommendation: use `isToday()` with real date for production correctness, and ensure the demo is shown on/around 2026-03-01. The prototype banner already signals this is fictional data.
**Warning signs:** All stat cards showing 0.

### Pitfall 4: Separate TransactionsProvider Instances
**What goes wrong:** A transaction added in POS does not appear in the admin dashboard.
**Why it happens:** POS and admin are separate route groups with separate React trees. Each has its own TransactionsProvider instance with its own state. Navigating between them triggers a full page reload (different layout groups), resetting in-memory state.
**How to avoid:** Accept this limitation for the prototype. Both POS and admin initialize from the same mock data (`getTransactions()`), so they show the same historical data. Real-time cross-route sync would require Supabase (Phase 2 migration) or lifting state to localStorage/sessionStorage. For now, the dashboard correctly shows mock data stats.
**Warning signs:** User adds a transaction in POS, switches to admin, and doesn't see it in the dashboard. The prototype banner already communicates this is a prototype.

### Pitfall 5: Sidebar Collapse Breaking Layout on Tablet
**What goes wrong:** When sidebar collapses, the main content area doesn't expand to fill the space, or the layout breaks on 10" iPad.
**Why it happens:** The sidebar uses `w-64` / `w-16` with `shrink-0`. The main content uses `flex-1`. If `transition-all` isn't applied correctly, the flex layout may not recalculate smoothly.
**How to avoid:** Use `transition-all duration-300 ease-in-out` on the sidebar `<aside>` element. The `flex-1` on the main content area automatically expands when the sidebar shrinks. Test on both expanded and collapsed states at iPad dimensions (1024x768 landscape).
**Warning signs:** Main content area not filling the gap when sidebar collapses.

### Pitfall 6: Tooltip Necessity for Collapsed Icons
**What goes wrong:** When sidebar is collapsed to icon-only mode, users don't know what each icon represents.
**Why it happens:** Icons alone are ambiguous without labels, especially for less common icons (Calculator for Comptabilite, Camera for Instagram).
**How to avoid:** Add `title` attribute on collapsed nav items for native browser tooltips, or use a simple custom tooltip on hover. Native `title` is the simplest approach and sufficient for an admin prototype.
**Warning signs:** Users hovering over collapsed sidebar icons and not knowing what they link to.

### Pitfall 7: Passes Vendus Count Logic
**What goes wrong:** "Passes vendus" count is wrong because it counts transactions instead of individual passes.
**Why it happens:** A single transaction could have multiple passes (e.g., `quantite: 2`). Counting transactions gives the number of sales, not the number of passes.
**How to avoid:** For passes vendus, sum `items.quantite` across all gym-pass transactions today, not just count transactions. Check the mock data: all gym-pass transactions have `quantite: 1` for individual items, but the correct approach is to sum quantities.

```typescript
const passesVendus = todayTxns
  .filter(txn => txn.type === 'gym-pass')
  .reduce((sum, txn) => txn.items.reduce((s, item) => s + item.quantite, 0) + sum, 0)
```
**Warning signs:** Pass count not matching expected values when a customer buys multiple passes.

## Code Examples

Verified patterns from the existing codebase and official sources:

### Admin Sidebar Navigation Items (Existing)
```typescript
// Source: src/app/(admin)/layout.tsx (already implemented)
import { LayoutDashboard, Users, Home, Calculator, Mail, Camera } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/bungalows', label: 'Bungalows', icon: Home },
  { href: '/comptabilite', label: 'Comptabilite', icon: Calculator },
  { href: '/newsletter', label: 'Newsletter', icon: Mail },
  { href: '/instagram', label: 'Instagram', icon: Camera },
]
```

### Collapsible Nav Item Rendering
```typescript
// Render each nav item with conditional label display
{navItems.map(({ href, label, icon: Icon }) => {
  const isActive = pathname === href || pathname.startsWith(href + '/')
  return (
    <Link
      key={href}
      href={href}
      title={isCollapsed ? label : undefined}  // Tooltip when collapsed
      className={`
        flex items-center gap-3 rounded-md text-sm transition-colors
        ${isCollapsed ? 'justify-center px-2 py-2' : 'px-3 py-2'}
        ${isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'hover:bg-sidebar-accent/10 text-sidebar-foreground/80'
        }
      `}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  )
})}
```

### Sidebar Toggle Button
```typescript
// Source: lucide-react icons
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

// At the bottom of the sidebar
<button
  onClick={toggleSidebar}
  className="p-2 rounded-md hover:bg-sidebar-accent/10 text-sidebar-foreground/60 transition-colors"
  title={isCollapsed ? 'Ouvrir le menu' : 'Reduire le menu'}
>
  {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
</button>
```

### Dashboard Stat Cards Layout
```typescript
// Three stat cards in a responsive grid
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <StatCard
    label="Revenus du jour"
    value={`${todayStats.revenuTotal.toLocaleString()} THB`}
    icon={TrendingUp}
  />
  <StatCard
    label="Passes vendus"
    value={String(todayStats.passesVendus)}
    icon={Ticket}
  />
  <StatCard
    label="Nouvelles reservations"
    value={String(todayStats.nouvellesReservations)}
    icon={CalendarPlus}
  />
</div>
```

### Revenue Breakdown by Center
```typescript
// Three cards for revenue centers, below the stat cards
const revenueCenters = [
  { label: 'Gym', value: todayStats.revenueByCenter.Gym, color: 'text-wildwood-orange' },
  { label: 'F&B', value: todayStats.revenueByCenter['F&B'], color: 'text-wildwood-lime' },
  { label: 'Bungalows', value: todayStats.revenueByCenter.Bungalows, color: 'text-wildwood-bois' },
]

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {revenueCenters.map(center => (
    <Card key={center.label}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {center.label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold font-display ${center.color}`}>
          {center.value.toLocaleString()} THB
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

### Today's Transaction Filtering with date-fns
```typescript
// Source: date-fns official docs, isToday + parseISO
import { isToday, parseISO } from 'date-fns'

// Transaction dates are in format "2026-03-01T08:30:00" (ISO without timezone)
const todayTxns = transactions.filter(txn => isToday(parseISO(txn.date)))

// Verify with mock data: 12 transactions have date starting with "2026-03-01"
// isToday(parseISO("2026-03-01T08:30:00")) returns true on 2026-03-01
```

### TransactionsProvider in Admin Layout
```typescript
// Source: existing pattern from (pos)/layout.tsx
import { TransactionsProvider } from '@/contexts/transactions-context'

// In admin layout JSX, wrap the main content:
<main className="flex-1 p-6 overflow-auto">
  <TransactionsProvider>
    {children}
  </TransactionsProvider>
</main>
```

### Mock Data Verification (Today's Stats)
```
Transactions dated 2026-03-01 (12 total):
- txn-079: gym-pass, Gym, 2,000 THB (1 mois)
- txn-080: fnb, F&B, 290 THB (Acai Bowl + Espresso)
- txn-081: gym-pass, Gym, 800 THB (3 jours)
- txn-082: fnb, F&B, 300 THB (Green Detox x2 + Coca)
- txn-083: gym-pass, Gym, 1,200 THB (1 semaine)
- txn-084: fnb, F&B, 340 THB (Mass Gainer + Mango Smoothie)
- txn-085: gym-pass, Gym, 15,000 THB (1 an)
- txn-086: fnb, F&B, 580 THB (Protein Bowl x2 + Americano x2)
- txn-087: gym-pass, Gym, 350 THB (1 jour)
- txn-088: fnb, F&B, 220 THB (Whey Shake)
- txn-089: gym-pass, Gym, 250 THB (Spa pass)
- txn-090: fnb, F&B, 260 THB (Latte x2 + Banana-Peanut)

Expected dashboard values for 2026-03-01:
- Revenus totaux: 21,590 THB
- Passes vendus: 6 (all have quantite: 1)
- Nouvelles reservations: 0 (no bungalow transactions today)
- Revenue Gym: 19,600 THB
- Revenue F&B: 1,990 THB
- Revenue Bungalows: 0 THB
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| shadcn/ui Sidebar component with cookie persistence | Custom collapsible sidebar with useState + localStorage | 2026 (Next.js 16 bug) | shadcn Sidebar has [open bug #9189](https://github.com/shadcn-ui/ui/issues/9189) with Next.js 16. Custom approach avoids the issue entirely. |
| Server-side cookie for sidebar state | Client-side localStorage | N/A | Admin layout is already a Client Component, so localStorage works fine. No SSR concerns. |
| External state management (Redux, Zustand) for dashboard | Built-in useMemo for derived data | React 19 standard | No external library needed for computed values from context |

**Deprecated/outdated:**
- shadcn/ui `Toast` component: Already replaced by Sonner in Phase 2. Not relevant for Phase 3 but noting for completeness.
- `tailwindcss-animate`: Already replaced by `tw-animate-css` in Phase 1.

## Open Questions

1. **Sidebar collapse persistence strategy**
   - What we know: localStorage works for client-side persistence. The admin layout is already a Client Component.
   - What's unclear: Whether there will be a visible flash when the sidebar reads localStorage on page load (expanded -> collapsed transition).
   - Recommendation: Accept the minimal flash. Initialize as expanded (default), then collapse in useEffect if localStorage says so. The flash is sub-100ms and only affects returning users who previously collapsed the sidebar. Could add a brief opacity transition to mask it if needed.

2. **Cross-route transaction sync (POS to Admin)**
   - What we know: POS and admin have separate TransactionsProvider instances. Transactions added in POS do not appear in admin.
   - What's unclear: Whether the user expects real-time sync between POS and admin for the prototype.
   - Recommendation: Accept the limitation. Document it clearly. Both views initialize from the same mock data. Real sync requires Supabase (future phase). The prototype banner already signals this is not production.

3. **Empty state for "Nouvelles reservations"**
   - What we know: Mock data has 0 bungalow transactions on 2026-03-01, so the "Nouvelles reservations" stat will show 0.
   - What's unclear: Whether showing 0 for one of the three headline stats diminishes the demo value.
   - Recommendation: Show 0 truthfully. It demonstrates the metric works and that the data pipeline is correct. The alternative (counting `confirmee` reservations from bungalows.json) would mix data sources (transactions vs bungalows) and introduce complexity. Keep it simple: dashboard shows transaction-based stats only.

## Sources

### Primary (HIGH confidence)
- Existing codebase files (directly inspected 2026-03-01):
  - `src/app/(admin)/layout.tsx` -- current admin layout with sidebar, navItems, usePathname
  - `src/app/(admin)/dashboard/page.tsx` -- placeholder page to be replaced
  - `src/app/(pos)/layout.tsx` -- TransactionsProvider usage pattern
  - `src/contexts/transactions-context.tsx` -- TransactionsContext API (transactions, addTransaction)
  - `src/lib/types.ts` -- Transaction type with centreRevenu field
  - `src/lib/data-access.ts` -- data access functions
  - `src/lib/mock-data/transactions.json` -- 90 transactions, 12 on 2026-03-01
  - `src/app/globals.css` -- design system tokens (sidebar colors, card colors, brand colors)
  - `src/components/ui/card.tsx` -- existing Card component
  - `package.json` -- all dependencies verified (date-fns 4.1.0, lucide-react 0.575.0, etc.)
- [shadcn/ui Sidebar docs](https://ui.shadcn.com/docs/components/radix/sidebar) -- evaluated and rejected for this use case
- [date-fns isToday documentation](https://date-fns.org/) -- confirmed API for date comparison

### Secondary (MEDIUM confidence)
- [shadcn/ui Sidebar + Next.js 16 bug #9189](https://github.com/shadcn-ui/ui/issues/9189) -- SidebarProvider cookie persistence triggers "Blocking Route Server Data" error in Next.js 16. Issue open, no fix. Confirmed the decision to avoid shadcn Sidebar.
- [MDN Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) -- toLocaleString() for THB formatting
- [React collapsible sidebar patterns](https://dev.to/cristiansifuentes/building-a-collapsible-admin-sidebar-with-react-router-uselocation-pro-patterns-7im) -- useState + CSS transition pattern confirmed as standard approach

### Tertiary (LOW confidence)
- None -- all findings verified with primary or secondary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Zero new dependencies. All libraries already installed and proven in Phases 1-2. Patterns verified against existing codebase.
- Architecture: HIGH -- Sidebar enhancement builds on existing admin layout. TransactionsProvider pattern copied from POS layout. Dashboard data derivation uses standard React useMemo.
- Pitfalls: HIGH -- All pitfalls derived from direct code inspection (TransactionsProvider location, mock data dates, sidebar CSS). shadcn Sidebar bug confirmed via GitHub issue.

**Research date:** 2026-03-01
**Valid until:** 2026-03-31 (stable -- no fast-moving dependencies, all libraries already locked)
