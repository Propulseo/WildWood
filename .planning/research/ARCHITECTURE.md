# Architecture Research

**Domain:** Frontend-only ERP/POS prototype for a beach fitness resort
**Researched:** 2026-03-01
**Confidence:** HIGH (Next.js App Router structure verified via official docs; POS/ERP patterns derived from domain analysis and established frontend architecture principles)

## Standard Architecture

### System Overview

```
WildWood ERP — Frontend-Only MVP Architecture
==============================================

┌─────────────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER                            │
│                                                                     │
│  ┌──────────────────────────┐  ┌──────────────────────────────────┐ │
│  │   (pos) Route Group      │  │   (admin) Route Group            │ │
│  │   Dark theme layout      │  │   Sidebar layout                 │ │
│  │   Touch-optimized        │  │   Dashboard + data views         │ │
│  │                          │  │                                  │ │
│  │  ┌──────┐ ┌──────────┐  │  │  ┌──────────┐ ┌──────────────┐  │ │
│  │  │ Gym  │ │   F&B    │  │  │  │Dashboard │ │  Bungalows   │  │ │
│  │  │Passes│ │  Ventes  │  │  │  │  Admin   │ │  Calendrier  │  │ │
│  │  └──────┘ └──────────┘  │  │  └──────────┘ └──────────────┘  │ │
│  │  ┌──────────────────┐   │  │  ┌──────────┐ ┌──────────────┐  │ │
│  │  │   Cart + Checkout│   │  │  │  Compta  │ │   Clients    │  │ │
│  │  └──────────────────┘   │  │  └──────────┘ └──────────────┘  │ │
│  └──────────────────────────┘  │  ┌──────────┐ ┌──────────────┐  │ │
│                                │  │Newsletter│ │  Instagram   │  │ │
│                                │  └──────────┘ └──────────────┘  │ │
│                                └──────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                        SHARED UI LAYER                              │
│                                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────┐   │
│  │  shadcn/ui │ │  Recharts  │ │  Theme     │ │  POS-specific  │   │
│  │ components │ │  wrappers  │ │  provider  │ │  touch comps   │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                       STATE LAYER (React Context)                   │
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌─────────────────┐   │
│  │  Auth     │ │  Cart    │ │  Transactions│ │  UI Preferences │   │
│  │  Context  │ │  Context │ │  Context     │ │  Context        │   │
│  └──────────┘ └──────────┘ └──────────────┘ └─────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                     DATA ACCESS LAYER                               │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    lib/mock-data/                               │ │
│  │  ┌──────┐ ┌──────┐ ┌────────┐ ┌────────┐ ┌──────┐ ┌───────┐ │ │
│  │  │passes│ │ menu │ │bungalow│ │clients │ │compta│ │social │ │ │
│  │  │.json │ │.json │ │s.json  │ │.json   │ │.json │ │.json  │ │ │
│  │  └──────┘ └──────┘ └────────┘ └────────┘ └──────┘ └───────┘ │ │
│  │                                                                │ │
│  │  ┌──────────────────────────────────────────────────────────┐  │ │
│  │  │  lib/data-access.ts — typed getters, simulates API      │  │ │
│  │  └──────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Root Layout** (`app/layout.tsx`) | HTML shell, font loading, global providers (Auth, Theme) | Wraps entire app with context providers, loads Tailwind globals |
| **POS Layout** (`app/(pos)/layout.tsx`) | Dark background, no sidebar, full-screen touch container | Own root-level layout with `<html>` tag if using multiple root layouts, OR nested layout with dark theme class |
| **Admin Layout** (`app/(admin)/layout.tsx`) | Sidebar navigation, header bar, responsive container | Sidebar + main content area, collapsible on mobile |
| **Auth Context** (`lib/contexts/auth-context.tsx`) | Simulated login state, role (admin/staff), role toggle for demo | `useState` with hardcoded user objects, toggle function exposed |
| **Cart Context** (`lib/contexts/cart-context.tsx`) | POS cart items, add/remove/clear, total calculation | `useReducer` or `useState` with cart item array, computed total |
| **Transaction Context** (`lib/contexts/transaction-context.tsx`) | In-memory transaction log for the current session | Append-only array of completed sales, feeds into accounting views |
| **Data Access** (`lib/data-access.ts`) | Typed functions that read from JSON files, simulate async API calls | `getGymPasses()`, `getMenuItems()`, `getClients()`, etc. |
| **Mock Data** (`lib/mock-data/*.json`) | Static JSON files representing realistic business data | Typed interfaces matching each data domain |
| **Shared UI** (`components/ui/`) | shadcn/ui base components (Button, Card, Dialog, etc.) | Installed via shadcn CLI, customized with WildWood theme |
| **Module Components** (`components/[module]/`) | Business logic UI for each module (POS grid, calendar, charts) | Feature-specific components grouped by module |

## Recommended Project Structure

```
wildwood-erp/
├── app/
│   ├── layout.tsx                  # Root layout: providers, fonts, metadata
│   ├── page.tsx                    # Login / landing page
│   ├── globals.css                 # Tailwind directives + WildWood CSS variables
│   │
│   ├── (pos)/                      # ---- POS Route Group (staff) ----
│   │   ├── layout.tsx              # Dark bg, full-screen, no chrome
│   │   ├── caisse/
│   │   │   └── page.tsx            # POS main: tab selector (Gym | F&B)
│   │   ├── caisse/gym/
│   │   │   └── page.tsx            # Gym pass grid + cart
│   │   └── caisse/fnb/
│   │       └── page.tsx            # F&B category grid + cart
│   │
│   ├── (admin)/                    # ---- Admin Route Group (owner) ----
│   │   ├── layout.tsx              # Sidebar nav + header + main area
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Admin dashboard: KPIs du jour
│   │   ├── bungalows/
│   │   │   └── page.tsx            # Calendar view, 8 rooms
│   │   ├── comptabilite/
│   │   │   └── page.tsx            # Revenue dashboards + expense entry
│   │   ├── clients/
│   │   │   ├── page.tsx            # Paginated list + search
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Individual client profile
│   │   ├── newsletter/
│   │   │   └── page.tsx            # Contact list + campaign form
│   │   └── instagram/
│   │       └── page.tsx            # Mock social stats dashboard
│   │
│   └── api/                        # (empty for MVP — placeholder for Phase 2)
│
├── components/
│   ├── ui/                         # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   │
│   ├── layout/                     # Layout-level components
│   │   ├── sidebar.tsx             # Admin sidebar navigation
│   │   ├── header.tsx              # Admin top bar (user, role toggle)
│   │   ├── pos-header.tsx          # POS minimal header (logo, time, user)
│   │   └── role-toggle.tsx         # Demo: switch admin <-> staff
│   │
│   ├── pos/                        # POS-specific components
│   │   ├── product-grid.tsx        # Touch button grid (pass or F&B item)
│   │   ├── product-button.tsx      # Single large touch button (120x80px+)
│   │   ├── category-tabs.tsx       # F&B category selector tabs
│   │   ├── cart-panel.tsx          # Right-side cart summary
│   │   ├── cart-item.tsx           # Single cart line item
│   │   ├── checkout-dialog.tsx     # Checkout confirmation modal
│   │   └── client-lookup.tsx       # Quick client search popup
│   │
│   ├── bungalows/                  # Bungalow module components
│   │   ├── calendar-grid.tsx       # Month calendar with 8 room rows
│   │   ├── room-row.tsx            # Single room's month view
│   │   ├── booking-cell.tsx        # Day cell showing booking status
│   │   └── occupancy-stats.tsx     # Occupancy rate cards
│   │
│   ├── accounting/                 # Accounting module components
│   │   ├── revenue-chart.tsx       # Recharts revenue over time
│   │   ├── center-breakdown.tsx    # Revenue by center (Gym/F&B/Bungalows)
│   │   ├── daily-summary.tsx       # Daily revenue summary cards
│   │   ├── monthly-report.tsx      # Monthly report with charts
│   │   ├── expense-form.tsx        # Manual expense entry form
│   │   └── period-selector.tsx     # Day/Month/Year toggle
│   │
│   ├── clients/                    # Client module components
│   │   ├── client-table.tsx        # Paginated client list
│   │   ├── client-search.tsx       # Search bar with filters
│   │   ├── client-card.tsx         # Client profile header
│   │   └── purchase-history.tsx    # Transaction history list
│   │
│   ├── newsletter/                 # Newsletter module components
│   │   ├── contact-list.tsx        # Contact table
│   │   └── campaign-form.tsx       # Campaign creation form
│   │
│   ├── instagram/                  # Instagram module components
│   │   ├── follower-chart.tsx      # Follower growth chart
│   │   ├── engagement-stats.tsx    # Engagement rate cards
│   │   └── post-performance.tsx    # Post performance table
│   │
│   └── shared/                     # Cross-module shared components
│       ├── stat-card.tsx           # KPI display card
│       ├── data-table.tsx          # Generic sortable/paginated table
│       ├── date-range-picker.tsx   # Date selection for reports
│       ├── loading-skeleton.tsx    # Loading state placeholder
│       └── empty-state.tsx         # No-data placeholder
│
├── lib/
│   ├── mock-data/                  # Static JSON data files
│   │   ├── gym-passes.json         # 9 pass types with real prices
│   │   ├── menu-items.json         # F&B products by category
│   │   ├── bungalows.json          # 8 rooms + sample bookings
│   │   ├── clients.json            # ~50 sample clients
│   │   ├── transactions.json       # Sample transaction history
│   │   ├── expenses.json           # Sample expense entries
│   │   ├── newsletter-contacts.json # Sample contact list
│   │   └── instagram-stats.json    # Sample social metrics
│   │
│   ├── contexts/                   # React Context providers
│   │   ├── auth-context.tsx        # Auth state + role management
│   │   ├── cart-context.tsx         # POS cart state
│   │   └── transaction-context.tsx  # Session transaction log
│   │
│   ├── data-access.ts              # Typed getters for mock data
│   ├── types.ts                    # TypeScript interfaces for all data
│   ├── utils.ts                    # Formatting helpers (currency, dates)
│   └── constants.ts                # App constants (colors, pass types, categories)
│
├── public/
│   └── images/                     # Static images if needed
│
├── tailwind.config.ts              # WildWood theme colors + touch sizes
├── next.config.js                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json
└── components.json                 # shadcn/ui configuration
```

### Structure Rationale

- **`app/(pos)/` and `app/(admin)/` route groups:** The killer architectural decision. Route groups let these two modes have completely different layouts (dark full-screen vs. sidebar dashboard) without affecting URL paths. `/caisse/gym` and `/dashboard` both live at the root URL level, but render in fundamentally different shells. This is verified behavior from the official Next.js App Router docs -- route groups wrapped in parentheses are omitted from the URL.

- **`components/[module]/`:** Feature-grouped components keep each module self-contained. A developer working on accounting never needs to touch POS files. This mirrors the 6-module structure from the PRD and makes build-ordering straightforward.

- **`components/ui/`:** shadcn/ui components live here by convention. They are unstyled primitives that get themed with WildWood colors. Never put business logic here.

- **`lib/mock-data/`:** Centralized JSON files that simulate a database. Every module reads from here through `data-access.ts`, meaning when Phase 2 replaces mock data with Supabase, only `data-access.ts` needs to change -- all components remain untouched.

- **`lib/contexts/`:** Three focused contexts rather than one monolithic store. Auth is global (wraps everything), Cart is scoped to POS, Transaction is session-scoped. This avoids unnecessary re-renders and keeps state boundaries clean.

- **`lib/types.ts`:** Single source of truth for all TypeScript interfaces. Every component, context, and data file references these types. Prevents drift between mock data shapes and component expectations.

## Architectural Patterns

### Pattern 1: Dual Layout via Route Groups

**What:** Use Next.js route groups `(pos)` and `(admin)` to serve two completely different UI experiences from the same app, each with its own layout tree.

**When to use:** Any time a single app needs fundamentally different UI shells for different user roles or contexts.

**Trade-offs:**
- PRO: Clean separation, each layout is self-contained, no conditional rendering spaghetti
- PRO: URL paths stay clean (`/caisse/gym` not `/pos/caisse/gym`)
- CON: Shared state must be provided above both layouts (in root `layout.tsx`)
- CON: Cannot use multiple root layouts (each with own `<html>`) AND share context -- must use a single root layout with nested route group layouts

**Example:**
```typescript
// app/layout.tsx -- Root layout wraps everything, provides shared context
import { AuthProvider } from '@/lib/contexts/auth-context'
import { TransactionProvider } from '@/lib/contexts/transaction-context'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <TransactionProvider>
            {children}
          </TransactionProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

// app/(pos)/layout.tsx -- POS layout: dark, full-screen, no sidebar
export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <POSHeader />
      <main className="h-[calc(100vh-64px)] overflow-hidden">
        {children}
      </main>
    </div>
  )
}

// app/(admin)/layout.tsx -- Admin layout: sidebar, light theme
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Pattern 2: Data Access Abstraction Layer

**What:** All components read data through typed functions in `lib/data-access.ts`, never importing JSON files directly. Functions return `Promise<T>` to simulate async API behavior.

**When to use:** Any frontend-only prototype that plans to migrate to a real backend later.

**Trade-offs:**
- PRO: Phase 2 migration only touches `data-access.ts`, not 50+ components
- PRO: Components are already written with async patterns (loading states, error handling)
- PRO: TypeScript catches shape mismatches early
- CON: Slight over-engineering for a pure prototype
- CON: `Promise` wrapper adds minimal complexity

**Example:**
```typescript
// lib/types.ts
export interface GymPass {
  id: string
  name: string
  duration: string
  price: number       // in Thai Baht
  expiresIn?: number  // days, for time-limited passes
}

export interface MenuItem {
  id: string
  name: string
  category: 'bowls' | 'cocktails' | 'cafes' | 'smoothies' | 'boissons' | 'snacks'
  price: number
  icon?: string
}

export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  isResident: boolean
  bungalowId?: number
  createdAt: string
}

// lib/data-access.ts
import gymPassesData from './mock-data/gym-passes.json'
import menuItemsData from './mock-data/menu-items.json'
import clientsData from './mock-data/clients.json'
import type { GymPass, MenuItem, Client } from './types'

// Simulate async API calls -- Phase 2 replaces these with Supabase queries
export async function getGymPasses(): Promise<GymPass[]> {
  return gymPassesData as GymPass[]
}

export async function getMenuItems(category?: string): Promise<MenuItem[]> {
  const items = menuItemsData as MenuItem[]
  return category ? items.filter(i => i.category === category) : items
}

export async function getClients(page = 1, perPage = 20): Promise<{
  clients: Client[]
  total: number
  page: number
}> {
  const all = clientsData as Client[]
  const start = (page - 1) * perPage
  return {
    clients: all.slice(start, start + perPage),
    total: all.length,
    page,
  }
}

export async function getClientById(id: string): Promise<Client | null> {
  const all = clientsData as Client[]
  return all.find(c => c.id === id) ?? null
}
```

### Pattern 3: Cart State Machine via Context + Reducer

**What:** POS cart managed by a React Context wrapping `useReducer`, providing type-safe actions (add, remove, update quantity, clear) and derived state (total, item count).

**When to use:** Any shopping cart / order-building UI where multiple actions modify a shared list.

**Trade-offs:**
- PRO: Predictable state transitions, easy to debug
- PRO: `useReducer` handles complex state updates cleaner than `useState`
- PRO: Context scoped to POS routes only (not polluting admin)
- CON: Boilerplate for action types + reducer

**Example:**
```typescript
// lib/contexts/cart-context.tsx
'use client'

import { createContext, useContext, useReducer, type ReactNode } from 'react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  type: 'gym-pass' | 'fnb'
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }  // id
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR' }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.payload.id)
      const items = existing
        ? state.items.map(i =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        : [...state.items, { ...action.payload, quantity: 1 }]
      return recompute(items)
    }
    case 'REMOVE_ITEM': {
      const items = state.items.filter(i => i.id !== action.payload)
      return recompute(items)
    }
    case 'UPDATE_QUANTITY': {
      const items = state.items.map(i =>
        i.id === action.payload.id
          ? { ...i, quantity: action.payload.quantity }
          : i
      ).filter(i => i.quantity > 0)
      return recompute(items)
    }
    case 'CLEAR':
      return { items: [], total: 0, itemCount: 0 }
  }
}

function recompute(items: CartItem[]): CartState {
  return {
    items,
    total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
  }
}
```

## Data Flow

### Request Flow (Mock Data)

```
[User taps button]
    |
    v
[Page Component] ---uses---> [data-access.ts] ---reads---> [mock-data/*.json]
    |                              |
    | (data returned              (returns typed Promise<T>)
    |  as props or state)
    v
[Module Component] ---renders---> [UI Components (shadcn/ui)]
```

### POS Transaction Flow

```
[Staff taps product button]
    |
    v
[CartContext.dispatch({ type: 'ADD_ITEM', payload })]
    |
    v
[CartPanel re-renders with updated items + total]
    |
    v
[Staff taps "Encaisser"]
    |
    v
[CheckoutDialog opens — shows total, optional client link]
    |
    v
[Staff confirms payment]
    |
    v
[TransactionContext.addTransaction(cartItems, total, timestamp)]
    |
    v
[CartContext.dispatch({ type: 'CLEAR' })]
    |
    v
[Transaction stored in-memory — visible in Comptabilite module]
```

### State Management Map

```
                    ┌───────────────────────────┐
                    │       Root Layout          │
                    │   ┌───────────────────┐    │
                    │   │   AuthContext      │    │  Global: current user, role
                    │   │   TransactionCtx   │    │  Global: session sales log
                    │   └───────┬───────────┘    │
                    └───────────┼────────────────┘
                    ┌───────────┴────────────────┐
          ┌─────────┴──────────┐   ┌─────────────┴──────────┐
          │    (pos) Layout     │   │    (admin) Layout       │
          │  ┌──────────────┐  │   │                         │
          │  │  CartContext  │  │   │  No additional context  │
          │  └──────────────┘  │   │  (reads from            │
          │                    │   │   TransactionContext +   │
          │  Cart is POS-only  │   │   mock data directly)   │
          └────────────────────┘   └─────────────────────────┘
```

### Key Data Flows

1. **POS Sale:** Staff selects products from touch grid --> items accumulate in CartContext --> checkout confirms --> transaction appended to TransactionContext --> cart cleared. The transaction is available immediately in the Comptabilite module since TransactionContext is at root level.

2. **Client Lookup during POS:** Staff taps "Client" button on cart panel --> ClientLookup dialog opens --> searches `clients.json` via data-access --> staff selects client --> client ID attached to transaction. If client is a bungalow resident, gym pass is auto-marked as "inclus" (free).

3. **Accounting Views:** Comptabilite page reads from both `transactions.json` (historical mock data) and TransactionContext (session data). Merges both into unified view. Charts aggregate by day/month/year using utility functions.

4. **Bungalow Calendar:** Calendar component reads `bungalows.json` which contains an array of bookings per room. No write path in MVP -- view only. Occupancy stats computed on-render from booking date ranges.

5. **Auth Flow:** Login page presents two buttons (Admin / Staff). Clicking sets user in AuthContext with role. Root layout checks auth state -- if not logged in, redirects to login page. Role toggle button in header allows switching for demo purposes.

## Build Order (Dependency Analysis)

Build order matters because later modules depend on earlier ones for shared infrastructure.

### Phase 1: Foundation (must be first)
```
1. Project scaffolding (Next.js, Tailwind, shadcn/ui setup)
2. WildWood theme (CSS variables, tailwind.config.ts)
3. TypeScript types (lib/types.ts)
4. Mock data files (lib/mock-data/*.json)
5. Data access layer (lib/data-access.ts)
6. Auth context + simulated login page
7. Root layout with providers
```
**Rationale:** Everything depends on types, mock data, and the auth/layout shell. Building these first means every subsequent module plugs into a working skeleton.

### Phase 2: POS Cash Register (highest business value)
```
8.  (pos) route group + layout (dark theme)
9.  Cart context + reducer
10. Product grid + touch button components
11. Gym pass page (9 passes grid + cart panel)
12. F&B page (6 categories, product buttons, cart panel)
13. Checkout dialog + transaction context integration
14. Client lookup popup
```
**Rationale:** The PRD states "if the POS cash register is not instant and intuitive, nothing else has value." Building POS second (after foundation) validates the core value proposition immediately. The CartContext and TransactionContext built here feed directly into the accounting module.

### Phase 3: Admin Shell + Dashboard
```
15. (admin) route group + sidebar layout
16. Sidebar navigation component
17. Admin header with role toggle
18. Dashboard page (KPI stat cards: revenue, passes sold, bookings)
```
**Rationale:** The admin shell is required by every admin module. Dashboard is the simplest admin page (just stat cards reading from mock data) and proves the layout works.

### Phase 4: Core Admin Modules
```
19. Clients list page (paginated table, search)
20. Client detail page (profile + purchase history)
21. Bungalows calendar page (month view, 8 rooms)
22. Occupancy stats cards
```
**Rationale:** Clients and Bungalows are the next highest-value modules after POS. Clients also test the dynamic route pattern (`/clients/[id]`). These modules have no dependencies on each other and could be built in parallel.

### Phase 5: Accounting + Reports
```
23. Period selector component (day/month/year)
24. Revenue charts (Recharts integration)
25. Revenue by center breakdown (Gym/F&B/Bungalows)
26. Expense entry form
27. Monthly report view
```
**Rationale:** Accounting depends on TransactionContext being populated (from Phase 2) and benefits from having real mock data for clients and bungalows. Recharts integration here is reused by Instagram module.

### Phase 6: Secondary Modules
```
28. Newsletter contact list
29. Campaign creation form
30. Instagram stats dashboard (mock charts)
31. Follower/engagement charts
```
**Rationale:** Lowest priority modules with no dependencies on other business modules. Can be built last or in parallel with Phase 5. Recharts patterns from accounting are reused here.

### Phase 7: Polish + Deploy
```
32. Loading skeletons for each page
33. Error boundaries
34. Empty states
35. Responsive adjustments
36. Vercel deployment
```

### Dependency Graph

```
Foundation (types, data, auth, layout)
    |
    ├──> POS Cash Register (cart, products, checkout)
    |       |
    |       └──> Accounting (reads transactions from POS)
    |               |
    |               └──> Instagram (reuses Recharts patterns)
    |
    ├──> Admin Shell (sidebar, header, dashboard)
    |       |
    |       ├──> Clients (paginated list, detail page)
    |       ├──> Bungalows (calendar, stats)
    |       └──> Newsletter (contact list, campaign form)
    |
    └──> Polish + Deploy
```

## Anti-Patterns

### Anti-Pattern 1: Importing JSON Directly in Components

**What people do:** Components import from `@/lib/mock-data/clients.json` directly instead of going through `data-access.ts`.

**Why it's wrong:** When Phase 2 replaces mock data with Supabase, every component that imports JSON directly needs to be rewritten. With 30+ components, this becomes a painful migration.

**Do this instead:** Always go through `lib/data-access.ts`. Components call `getClients()`, never `import clients from './mock-data/clients.json'`. Only `data-access.ts` knows where data comes from.

### Anti-Pattern 2: One Giant Context for Everything

**What people do:** Create a single `AppContext` that holds auth state, cart, transactions, UI preferences, and everything else.

**Why it's wrong:** Any state change in any part of the context triggers re-renders in every consuming component. When the cart updates every button tap, the entire admin dashboard also re-renders. Performance degrades quickly on a 10-inch tablet.

**Do this instead:** Split into focused contexts: AuthContext (global), CartContext (POS-scoped), TransactionContext (global but write-rarely). Each context only triggers re-renders in components that actually consume it.

### Anti-Pattern 3: Conditional Layout Rendering Instead of Route Groups

**What people do:** Use a single layout with `if (role === 'admin') return <AdminLayout>` / `else return <POSLayout>`.

**Why it's wrong:** Layout state is lost on role switch. Components unmount and remount. Navigation state resets. The two UIs are fundamentally different enough that conditional rendering creates a maintenance nightmare of interleaved dark/light theme code.

**Do this instead:** Use Next.js route groups `(pos)` and `(admin)` with separate layouts. Navigation between modes is a page navigation, not a conditional render. Each layout is clean and self-contained.

### Anti-Pattern 4: Scroll-Based POS Interface

**What people do:** Build the POS as a scrollable page with small buttons, treating it like a regular web form.

**Why it's wrong:** The PRD explicitly requires "zero scroll on main screen, minimum 120x80px buttons, usable with fingers on a 10-inch tablet." A scrollable POS fails in a real service environment where staff are handling cash, food, and a tablet simultaneously.

**Do this instead:** Fix the POS layout to `100vh`. Use CSS Grid for the product grid with fixed-size cells. Cart panel is a fixed-width sidebar. Checkout is a modal overlay. Nothing scrolls on the main view -- category tabs switch the grid content instead.

### Anti-Pattern 5: Hardcoded Thai Baht Formatting

**What people do:** Sprinkle `${price} ฿` string formatting throughout components.

**Why it's wrong:** Inconsistent formatting (some show decimals, some don't), hard to change if currency display needs adjustment, violates DRY.

**Do this instead:** Create a `formatPrice(amount: number): string` utility in `lib/utils.ts` that handles the Thai Baht symbol, thousand separators, and decimal rules consistently. Use it everywhere.

## Integration Points

### External Services (MVP: None -- Phase 2 Targets)

| Service | Phase 2 Integration | MVP Simulation |
|---------|---------------------|----------------|
| Supabase (Postgres) | Replace `data-access.ts` getters with Supabase client queries | Mock JSON files |
| Supabase Auth | Replace AuthContext with Supabase auth session | Hardcoded user objects in context |
| Booking.com API | Pull real reservations into bungalow calendar | Static booking entries in `bungalows.json` |
| Instagram Graph API | Real follower/engagement metrics | Static numbers in `instagram-stats.json` |
| Resend (email) | Actually send newsletter campaigns | Console.log on form submit |

### Internal Module Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| POS --> Accounting | TransactionContext (shared context at root) | Transactions written during POS checkout are immediately readable by accounting views |
| POS --> Clients | data-access.ts (read-only client lookup) | POS searches client list to attach client to transaction |
| Bungalows --> POS | data-access.ts (resident check) | POS checks if client is bungalow resident for free gym pass logic |
| Bungalows --> Accounting | Mock data overlap in `transactions.json` | Bungalow revenue appears as a revenue center in accounting charts |
| Dashboard --> All modules | data-access.ts + TransactionContext | Dashboard KPIs aggregate from all data sources |
| Clients --> POS/Accounting | data-access.ts read | Client detail page shows purchase history from `transactions.json` |

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| MVP (1-3 users, mock data) | Current architecture is ideal. No database, no auth, pure frontend. Fast to build, fast to iterate. |
| Phase 2 (5-10 users, real data) | Replace `data-access.ts` with Supabase client. Add real auth. Add React Query or SWR for server state caching. Cart state persists to localStorage. |
| Phase 3 (10-50 users, multi-device) | Add real-time sync for POS (Supabase Realtime). Add role-based route protection middleware. Consider PWA for offline POS resilience during internet drops in Koh Tao. |

### Scaling Priorities

1. **First bottleneck (Phase 2):** Data persistence. The MVP loses all session data on page refresh. First upgrade: Supabase for persistence + localStorage for cart resilience.

2. **Second bottleneck (Phase 2-3):** Concurrent POS usage. If two tablets run POS simultaneously, TransactionContext is per-session. Need server-side transaction storage with optimistic updates.

3. **Third bottleneck (Phase 3):** Offline resilience. Koh Tao has unreliable internet. POS must work offline and sync when connection returns. This requires service worker + local queue -- significant architecture change.

## Sources

- [Next.js App Router Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) -- Official documentation (fetched 2026-03-01, v16.1.6). Verified: route groups, private folders, colocation rules, layout nesting. **HIGH confidence.**
- [Next.js Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages) -- Official documentation (fetched 2026-03-01, v16.1.6). Verified: nested layouts, dynamic segments, route group layout isolation. **HIGH confidence.**
- POS touch interface patterns: Based on established UX patterns for touch-based point-of-sale systems (fixed viewport, large touch targets per WCAG/Material Design guidance of minimum 48x48dp, grid-based product selection). **MEDIUM confidence** (no specific source fetched; derived from well-established mobile/tablet UX principles).
- React Context + useReducer for cart state: Standard React pattern documented in React official docs for complex state management without external libraries. **HIGH confidence** (core React API).
- Data abstraction layer pattern: Standard software engineering pattern (Repository/Gateway pattern adapted for frontend). **HIGH confidence** (fundamental pattern, not library-specific).

---
*Architecture research for: WildWood ERP — Frontend-only resort POS/ERP prototype*
*Researched: 2026-03-01*
