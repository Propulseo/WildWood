# Phase 2: POS Cash Register - Research

**Researched:** 2026-03-01
**Domain:** Touch-first POS cash register interface (Next.js + React + shadcn/ui on tablet)
**Confidence:** HIGH

## Summary

This phase builds a complete POS cash register UI inside the existing `(pos)` route group. The domain is a touch-first tablet interface for WildWood gym staff to ring up gym passes and F&B products in under 3 taps. The technical challenge is purely client-side: a stateful interactive page with product grids, tabbed navigation, a cart sidebar, a client entry modal (with existing client detection), bungalow resident handling, and checkout confirmation -- all within the existing dark POS theme, no-scroll constraint, and Phase 1 design system.

The entire POS page will be a Client Component (needs `'use client'`). The POS layout from Phase 1 remains a Server Component. State management uses React's built-in `useReducer` + Context for the cart (no external state library needed for this scope). shadcn/ui provides all needed UI primitives: Dialog for the client popup, Tabs for Passes Gym / F&B switching, Badge for bungalow resident indicator, Button with existing `pos` and `pos-accent` variants, and Sonner for checkout confirmation toast. New shadcn components to install: `dialog`, `tabs`, `input`, `label`, `sonner`, `scroll-area`.

Data comes exclusively from the `data-access.ts` async functions established in Phase 1. Client detection logic (email/phone match) runs against the in-memory client list. Transactions are stored in React state (in-memory context) -- not persisted to any backend.

**Primary recommendation:** Build the POS page as a single Client Component tree with `useReducer` for cart state, shadcn Dialog for client entry, shadcn Tabs for product category switching, and Sonner toast for checkout confirmation. Keep the layout grid simple: left 2/3 for product grid, right 1/3 for cart sidebar.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already installed -- Phase 1)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router, route groups | Already configured with `(pos)` group |
| React | 19.2.3 | UI rendering, hooks (`useReducer`, `useState`, `useEffect`) | Built-in state management sufficient for cart |
| Tailwind CSS | v4 | CSS-first utility styling | Already configured with `@theme inline` and POS theme variables |
| shadcn/ui | latest (new-york style) | Accessible UI primitives | Already in project with unified `radix-ui` package |
| lucide-react | 0.575.0 | Icons | Already installed |
| class-variance-authority | 0.7.1 | Button variants | Already used for `pos` and `pos-accent` variants |

### shadcn Components to Add
| Component | Install Command | Purpose | When to Use |
|-----------|----------------|---------|-------------|
| Dialog | `pnpm dlx shadcn@latest add dialog` | Client entry popup modal | When staff taps a gym pass -- modal for client info |
| Tabs | `pnpm dlx shadcn@latest add tabs` | Passes Gym / F&B switching | Top-level product category tabs |
| Input | `pnpm dlx shadcn@latest add input` | Form fields in client popup | prenom, nom, email, telephone fields |
| Label | `pnpm dlx shadcn@latest add label` | Form field labels | Accessible labels for inputs |
| Sonner | `pnpm dlx shadcn@latest add sonner` | Checkout success toast | "Encaisser" confirmation feedback |
| Scroll-Area | `pnpm dlx shadcn@latest add scroll-area` | Cart item list scrolling | When cart has many items |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useReducer | Zustand | Zustand adds a dependency; useReducer is sufficient for single-page cart state with ~5 action types |
| Sonner toast | Custom animation overlay | Sonner handles positioning, accessibility, auto-dismiss; no reason to hand-roll |
| Dialog (modal) | Sheet (slide-in panel) | Dialog is better for focused data entry; Sheet better for navigation panels |
| Tabs component | Custom tab buttons | Tabs component handles keyboard navigation, ARIA, focus management for free |

**Installation (all new components at once):**
```bash
pnpm dlx shadcn@latest add dialog tabs input label sonner scroll-area
```

## Architecture Patterns

### Recommended Project Structure
```
src/app/(pos)/pos/
  page.tsx                    # Server Component shell -- fetches data, passes to client
src/components/pos/
  pos-register.tsx            # 'use client' -- Main POS register (cart reducer, layout grid)
  product-grid.tsx            # Product grid with tabs (Passes Gym / F&B)
  gym-pass-grid.tsx           # 9 gym pass buttons
  fnb-grid.tsx                # F&B products organized by category sub-tabs
  cart-sidebar.tsx            # Cart display with items, total, Encaisser button
  cart-item.tsx               # Individual cart item row with quantity controls
  client-popup.tsx            # Dialog for client entry (prenom, nom, email, telephone)
  checkout-confirmation.tsx   # Sonner toast wrapper for success feedback
```

### Pattern 1: Server Component Data Fetching + Client Component Interactivity
**What:** The POS page.tsx remains a Server Component that calls `data-access.ts` async functions to fetch gym passes, F&B products, and clients. It passes this data as props to a `'use client'` PosRegister component that handles all interactivity.
**When to use:** Always for this page -- separates data fetching from UI state.
**Example:**
```typescript
// src/app/(pos)/pos/page.tsx (Server Component)
import { getGymPasses, getFnbProducts, getClients } from '@/lib/data-access'
import { PosRegister } from '@/components/pos/pos-register'

export default async function PosPage() {
  const [gymPasses, fnbProducts, clients] = await Promise.all([
    getGymPasses(),
    getFnbProducts(),
    getClients(),
  ])

  return (
    <PosRegister
      gymPasses={gymPasses}
      fnbProducts={fnbProducts}
      clients={clients}
    />
  )
}
```

### Pattern 2: useReducer for Cart State
**What:** A reducer with discriminated union action types manages the cart. Actions: ADD_ITEM, REMOVE_ITEM, UPDATE_QUANTITY, CLEAR_CART, SET_CLIENT.
**When to use:** For all cart state mutations throughout the POS register.
**Example:**
```typescript
// Cart state and actions
interface CartState {
  items: CartItem[]
  client: Client | null
  isBungalowResident: boolean
}

interface CartItem {
  produitId: string
  nom: string
  prixUnitaire: number
  quantite: number
  type: 'gym-pass' | 'fnb'
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { produitId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { produitId: string; quantite: number } }
  | { type: 'SET_CLIENT'; payload: { client: Client; isBungalowResident: boolean } }
  | { type: 'CLEAR_CART' }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.produitId === action.payload.produitId)
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.produitId === action.payload.produitId
              ? { ...i, quantite: i.quantite + 1 }
              : i
          ),
        }
      }
      return { ...state, items: [...state.items, { ...action.payload, quantite: 1 }] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.produitId !== action.payload.produitId) }
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: action.payload.quantite <= 0
          ? state.items.filter(i => i.produitId !== action.payload.produitId)
          : state.items.map(i =>
              i.produitId === action.payload.produitId
                ? { ...i, quantite: action.payload.quantite }
                : i
            ),
      }
    case 'SET_CLIENT':
      return { ...state, client: action.payload.client, isBungalowResident: action.payload.isBungalowResident }
    case 'CLEAR_CART':
      return { items: [], client: null, isBungalowResident: false }
    default:
      return state
  }
}
```

### Pattern 3: Controlled Dialog for Client Popup
**What:** The client popup dialog is controlled via `open`/`onOpenChange` state. It opens when staff taps a gym pass, collects client info, detects existing clients by email/phone match, and dispatches SET_CLIENT to the cart.
**When to use:** Gym pass flow only (F&B sales are anonymous by default).
**Example:**
```typescript
// Controlled dialog pattern
const [dialogOpen, setDialogOpen] = useState(false)
const [selectedPass, setSelectedPass] = useState<GymPass | null>(null)

function handleGymPassTap(pass: GymPass) {
  setSelectedPass(pass)
  setDialogOpen(true)
}

// In JSX:
<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Client pour {selectedPass?.nom}</DialogTitle>
    </DialogHeader>
    {/* Client form fields */}
  </DialogContent>
</Dialog>
```

### Pattern 4: Sonner Toast for Checkout Confirmation
**What:** On "Encaisser" tap, create the transaction in memory, clear the cart, show a success toast via Sonner with transaction total. Requires adding `<Toaster />` to the POS layout or the root layout.
**When to use:** Every successful checkout.
**Example:**
```typescript
import { toast } from 'sonner'

function handleEncaisser() {
  // Build transaction from cart state
  const transaction: Transaction = {
    id: `txn-${String(Date.now()).slice(-3)}`,
    date: new Date().toISOString().slice(0, 19),
    type: cartHasGymPass ? 'gym-pass' : 'fnb',
    centreRevenu: cartHasGymPass ? 'Gym' : 'F&B',
    clientId: state.client?.id,
    items: state.items.map(item => ({
      produitId: item.produitId,
      nom: item.nom,
      quantite: item.quantite,
      prixUnitaire: item.prixUnitaire,
      sousTotal: item.quantite * item.prixUnitaire,
    })),
    total: state.isBungalowResident ? 0 : totalAmount,
    methode: 'especes', // Default, can be toggled
  }

  // Store in app state (in-memory)
  addTransaction(transaction)

  // Clear cart
  dispatch({ type: 'CLEAR_CART' })

  // Show confirmation
  toast.success('Transaction enregistree', {
    description: `Total: ${transaction.total.toLocaleString()} THB`,
  })
}
```

### Pattern 5: F&B Category Sub-Navigation
**What:** F&B products are organized by 6 categories. Use a secondary row of smaller tab/filter buttons within the F&B tab to switch categories. Not full shadcn Tabs (too heavy for sub-nav) -- use simple styled buttons with active state.
**When to use:** Inside the F&B tab only.
**Example:**
```typescript
const FNB_CATEGORIES = [
  { key: 'bowls', label: 'Bowls' },
  { key: 'cocktails-proteines', label: 'Cocktails' },
  { key: 'cafes', label: 'Cafes' },
  { key: 'smoothies', label: 'Smoothies' },
  { key: 'boissons', label: 'Boissons' },
  { key: 'snacks', label: 'Snacks' },
] as const

// Filter products by selected category
const filteredProducts = fnbProducts.filter(p => p.categorie === activeCategory)
```

### Anti-Patterns to Avoid
- **Do NOT make the POS page a Server Component:** The entire register needs interactivity (cart state, tabs, dialogs). The page.tsx can be a Server Component shell for data fetching, but the main content must be `'use client'`.
- **Do NOT use React Context for cart state:** The cart state does not need to be shared across routes. A single `useReducer` in the PosRegister component is simpler and sufficient. Context adds indirection for no benefit here.
- **Do NOT add scrolling to the main layout:** The POS constraint is `overflow-hidden` on the main area. Product grids must fit within the viewport. Only the cart item list may scroll (via ScrollArea).
- **Do NOT use `onClick` on divs for touch targets:** Always use `<button>` or `<Button>` for all tappable elements. Critical for accessibility and touch feedback.
- **Do NOT fetch data inside Client Components:** Use the Server Component page.tsx to fetch, pass as props. This avoids `useEffect` data fetching patterns.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal dialog with focus trapping | Custom portal + overlay + focus trap | shadcn Dialog (Radix UI) | Focus trapping, escape key, backdrop click, scroll lock, ARIA -- all handled |
| Toast notifications | Custom notification system | Sonner (via shadcn) | Positioning, auto-dismiss, animation, stacking, accessibility |
| Tab switching with keyboard nav | Manual tab buttons + state | shadcn Tabs (Radix UI) | Arrow key navigation, ARIA roles, focus management |
| Scrollable container | `overflow-auto` div | shadcn ScrollArea (Radix UI) | Consistent cross-browser scrollbar styling in dark theme |
| Accessible form labels | Manual `htmlFor` wiring | shadcn Label | Proper label-input association |
| Touch-safe button sizing | Custom CSS | Existing `size="pos"` variant | Already has `min-h-[80px] min-w-[120px]` |

**Key insight:** shadcn/ui already provides every UI primitive needed for this phase. No new dependencies beyond shadcn component installs are required. The unified `radix-ui` package (already at v1.4.3) means all dialog, tabs, scroll-area primitives are already available -- shadcn just generates the styled wrapper components.

## Common Pitfalls

### Pitfall 1: Viewport Overflow on Tablet
**What goes wrong:** Product grid overflows the viewport, causing scroll on the fixed POS layout.
**Why it happens:** Too many buttons at `min-h-[80px]` size for the available vertical space. The POS layout height is `calc(100dvh - 1.75rem)` minus the header (~44px), leaving roughly `100dvh - 72px` for content.
**How to avoid:** Calculate available space carefully. For a 10" tablet (typically 800x1280 or 1024x768 landscape), the content area is ~700px tall. With header (44px) and tab bar (~48px), that leaves ~608px for the grid. 9 gym pass buttons in a 3x3 grid at 80px min-height = 240px + gaps. F&B with 6 category filter buttons (~40px) + product grid. Both fit comfortably.
**Warning signs:** Content overflowing `<main className="overflow-hidden">` -- clipping instead of scrolling.

### Pitfall 2: Dialog Z-Index in POS Theme
**What goes wrong:** Dialog overlay does not appear over POS content, or dialog does not pick up POS dark theme variables.
**Why it happens:** The POS theme is applied via `.pos-theme` class on the layout container. Radix Dialog portals content to `document.body`, which is OUTSIDE the `.pos-theme` container.
**How to avoid:** Either (a) add `pos-theme` class to the Dialog content wrapper, or (b) use the dialog's `container` prop to portal inside the POS layout, or (c) set the CSS variables on the dialog overlay/content directly. Recommended: add `className="pos-theme"` to the `<DialogContent>` wrapper since the dialog uses CSS variables that inherit from the parent theme.
**Warning signs:** Dialog appears with light/admin theme colors instead of dark POS theme.

### Pitfall 3: Client Detection Logic Edge Cases
**What goes wrong:** Duplicate client detection fails or matches wrong client.
**Why it happens:** Email/phone matching needs to handle: (a) empty strings vs undefined, (b) partial phone number matches, (c) case-insensitive email comparison, (d) client has email but no phone (or vice versa).
**How to avoid:** Normalize before comparing: `email?.toLowerCase().trim()`, `telephone?.replace(/\s/g, '')`. Only match non-empty values. Match if EITHER email OR phone matches (not both required).
**Warning signs:** Existing client not detected when staff types their email with different casing.

### Pitfall 4: Bungalow Resident Free Pass Logic
**What goes wrong:** Bungalow resident gets charged for gym pass, or non-resident gets free pass.
**Why it happens:** The resident detection depends on: (a) client.type === 'resident', (b) client.bungalowId exists, AND (c) the client actually has an active reservation (statut === 'en-cours') at the current date.
**How to avoid:** When a client is detected as a resident, check that they have an active reservation. If yes, set `isBungalowResident: true` in cart state. When isBungalowResident is true AND the cart contains gym passes, the gym pass total is 0 THB. F&B items are still charged normally.
**Warning signs:** A past resident (reservation `terminee`) still getting free passes.

### Pitfall 5: Transaction Type Determination
**What goes wrong:** Transaction `type` and `centreRevenu` are wrong when cart has mixed items.
**Why it happens:** A single transaction should be typed by its primary content. The existing transaction data shows gym-pass transactions are separate from F&B transactions.
**How to avoid:** Keep gym pass and F&B sales as separate workflows. A gym pass tap opens the client popup, and upon confirmation creates a gym-pass transaction. F&B items go into the cart directly and create an F&B transaction. Do NOT allow mixing gym passes and F&B in the same cart/transaction -- this matches the existing data patterns.
**Warning signs:** Transactions with `type: 'gym-pass'` containing F&B items.

### Pitfall 6: Hydration Mismatch
**What goes wrong:** Server-rendered HTML does not match client-rendered HTML, causing React hydration errors.
**Why it happens:** The POS page Server Component renders initial HTML, then the Client Component takes over. If the Client Component renders differently based on client-only state (e.g., cart contents from localStorage), hydration fails.
**How to avoid:** Cart state starts empty (no persistence). The Server Component page.tsx passes data as props. No localStorage interaction in the cart. The existing `isHydrated` pattern from auth-context shows how to handle this if needed.
**Warning signs:** React console warnings about hydration mismatch.

## Code Examples

Verified patterns from the existing codebase and official sources:

### POS Layout Grid (Two-Column: Products + Cart)
```typescript
// Source: Tailwind CSS grid, existing POS theme
// Main register layout: products on left, cart sidebar on right
<div className="grid grid-cols-[1fr_320px] h-full gap-0">
  {/* Left: Product grid with tabs */}
  <div className="flex flex-col overflow-hidden border-r border-border">
    {/* Tab bar + product grid */}
  </div>

  {/* Right: Cart sidebar */}
  <div className="flex flex-col bg-card">
    {/* Cart items + total + Encaisser button */}
  </div>
</div>
```

### Gym Pass Button (Existing POS Button Variant)
```typescript
// Source: existing button.tsx pos variant + pos size
<Button
  variant="pos"
  size="pos"
  onClick={() => handleGymPassTap(pass)}
  className="flex flex-col items-center gap-1"
>
  <span className="font-display text-base uppercase">{pass.nom}</span>
  <span className="text-wildwood-orange font-bold">
    {pass.prix.toLocaleString()} THB
  </span>
</Button>
```

### F&B Product Button (With Emoji)
```typescript
// Source: FnbProduct type has emoji field
<Button
  variant="pos"
  size="pos"
  onClick={() => dispatch({ type: 'ADD_ITEM', payload: {
    produitId: product.id,
    nom: product.nom,
    prixUnitaire: product.prix,
    quantite: 1,
    type: 'fnb',
  }})}
  className="flex flex-col items-center gap-1"
>
  <span className="text-2xl">{product.emoji}</span>
  <span className="text-sm font-medium">{product.nom}</span>
  <span className="text-wildwood-orange text-xs font-bold">
    {product.prix} THB
  </span>
</Button>
```

### Client Detection Function
```typescript
// Source: Client type from types.ts, matching by email OR phone
function findExistingClient(
  clients: Client[],
  email?: string,
  telephone?: string,
): Client | undefined {
  const normalizedEmail = email?.toLowerCase().trim()
  const normalizedPhone = telephone?.replace(/\s+/g, '').replace(/-/g, '')

  if (!normalizedEmail && !normalizedPhone) return undefined

  return clients.find(client => {
    if (normalizedEmail && client.email?.toLowerCase().trim() === normalizedEmail) {
      return true
    }
    if (normalizedPhone && client.telephone?.replace(/\s+/g, '').replace(/-/g, '') === normalizedPhone) {
      return true
    }
    return false
  })
}
```

### Bungalow Resident Badge
```typescript
// Source: Badge component from shadcn, Client type
import { Badge } from '@/components/ui/badge'

{state.isBungalowResident && (
  <Badge className="bg-wildwood-lime text-white">
    Resident Bungalow
  </Badge>
)}
```

### Sonner Toaster Setup in Layout
```typescript
// Source: shadcn/ui Sonner docs
// Add to (pos) layout.tsx or root layout.tsx
import { Toaster } from '@/components/ui/sonner'

// Inside the layout JSX, after {children}:
<Toaster position="top-center" richColors />
```

### Transaction Creation from Cart State
```typescript
// Source: Transaction and TransactionItem types from types.ts
function createTransaction(state: CartState): Transaction {
  const total = state.isBungalowResident
    ? state.items
        .filter(i => i.type === 'fnb')
        .reduce((sum, i) => sum + i.prixUnitaire * i.quantite, 0)
    : state.items.reduce((sum, i) => sum + i.prixUnitaire * i.quantite, 0)

  const hasGymPass = state.items.some(i => i.type === 'gym-pass')

  return {
    id: `txn-${String(Date.now()).slice(-3)}`,
    date: new Date().toISOString().slice(0, 19),
    type: hasGymPass ? 'gym-pass' : 'fnb',
    centreRevenu: hasGymPass ? 'Gym' : 'F&B',
    clientId: state.client?.id,
    items: state.items.map(item => ({
      produitId: item.produitId,
      nom: item.nom,
      quantite: item.quantite,
      prixUnitaire: item.prixUnitaire,
      sousTotal: item.quantite * item.prixUnitaire,
    })),
    total,
    methode: 'especes',
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Individual `@radix-ui/react-*` packages | Unified `radix-ui` package (v1.4.3) | Feb 2026 | This project already uses unified package. shadcn components import from `radix-ui` directly |
| `useFormState` | `useActionState` (React 19) | Dec 2024 | Available but NOT needed here -- forms are simple, no server actions |
| shadcn Toast component | Sonner component | 2025 | Toast component deprecated in shadcn/ui. Use Sonner instead |
| Tailwind config file (`tailwind.config.js`) | CSS-first Tailwind v4 (`@theme inline` in CSS) | 2025 | This project already uses CSS-first. No config file |

**Deprecated/outdated:**
- shadcn `Toast` component: Deprecated. Use `Sonner` instead.
- Individual `@radix-ui/react-dialog`, `@radix-ui/react-tabs` packages: Replaced by unified `radix-ui` package. This project already migrated.

## Open Questions

Things that could not be fully resolved:

1. **Transaction storage across sessions**
   - What we know: Transactions must be stored "in-memory context (not persisted)". The existing `getTransactions()` returns mock JSON data.
   - What's unclear: Whether new transactions should be appended to a React state array that includes the existing mock transactions, or whether the POS only tracks new session transactions.
   - Recommendation: Create a simple transactions context that initializes with the mock data from `getTransactions()` and allows appending new transactions. This way, the admin dashboard (Phase 5) can also read from this context.

2. **Payment method selection**
   - What we know: Transaction.methode is `'especes' | 'virement'` (cash or bank transfer). The existing mock data shows both.
   - What's unclear: Whether the checkout flow needs a payment method selector, or defaults to `especes`.
   - Recommendation: Add a simple toggle (two buttons: "Especes" / "Virement") near the Encaisser button. Minimal UI cost, matches real-world POS flow.

3. **Mixed gym-pass + F&B transactions**
   - What we know: All mock transaction data separates gym-pass and F&B into distinct transactions. No single transaction mixes both types.
   - What's unclear: Whether the UI should prevent mixing or simply create separate transactions.
   - Recommendation: Keep the workflows separate. Gym pass tap opens client popup and immediately creates a transaction upon confirmation. F&B items are added to the cart freely and checked out separately. This is the simplest approach matching existing data patterns.

## Sources

### Primary (HIGH confidence)
- Existing codebase files: `types.ts`, `data-access.ts`, `button.tsx`, `globals.css`, `(pos)/layout.tsx`, `(pos)/pos/page.tsx` -- directly inspected
- Mock data files: `gym-passes.json` (9 passes, 200-15000 THB), `fnb-products.json` (20 products, 6 categories), `clients.json` (35 clients, 8 residents), `bungalows.json` (8 bungalows with reservations), `transactions.json` (90 transactions)
- [shadcn/ui Dialog docs](https://ui.shadcn.com/docs/components/radix/dialog) -- installation, usage, controlled pattern
- [shadcn/ui Tabs docs](https://ui.shadcn.com/docs/components/radix/tabs) -- installation, exports, usage
- [shadcn/ui Sonner docs](https://ui.shadcn.com/docs/components/radix/sonner) -- deprecated Toast, use Sonner instead
- [shadcn/ui Input docs](https://ui.shadcn.com/docs/components/input) -- installation, Field component pattern
- [shadcn/ui Label docs](https://ui.shadcn.com/docs/components/label) -- accessible label association
- [shadcn/ui February 2026 changelog](https://ui.shadcn.com/docs/changelog/2026-02-radix-ui) -- unified radix-ui package migration

### Secondary (MEDIUM confidence)
- [POS UX Design Part 1: The 16 UX Factors](https://medium.com/uxjournal/pos-ux-design-part-one-the-16-ux-factors-in-point-of-sale-b94661936eea) -- tapping speeds, queue prevention
- [POS System Design Principles](https://agentestudio.com/blog/design-principles-pos-interface) -- minimal clicks, intuitive layout
- [useReducer for cart state](https://www.56kode.com/posts/level-up-react-mastering-use-reducer-for-structured-state-management/) -- discriminated union actions, structured state
- [Touch target sizing guidelines](https://www.voiceandcode.com/our-insights/2019/7/12/ux-best-practices-minimum-target-size-on-mobile-devices) -- 44px minimum, 48px recommended, 8px spacing

### Tertiary (LOW confidence)
- None -- all findings verified with primary or secondary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All libraries already installed and verified in Phase 1 codebase. shadcn components are documented additions.
- Architecture: HIGH -- Patterns derived from existing codebase conventions (Server Component data fetching, Client Component interactivity, existing type contracts).
- Pitfalls: HIGH -- Derived from direct inspection of existing code constraints (POS theme class, overflow-hidden, layout height calc, mock data patterns, French field naming).

**Research date:** 2026-03-01
**Valid until:** 2026-03-31 (stable -- no fast-moving dependencies)
