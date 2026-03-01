# Phase 1: Foundation + Design System - Research

**Researched:** 2026-03-01
**Domain:** Next.js 16 App Router scaffold, Tailwind CSS v4, shadcn/ui, WildWood design system, mock data architecture
**Confidence:** HIGH

## Summary

This phase establishes the project scaffold (Next.js 16 + Tailwind CSS v4 + shadcn/ui), the WildWood design system (dual-theme with dark POS and light admin), TypeScript type definitions, realistic mock data with a data access abstraction layer, simulated authentication with role toggle, and the prototype banner. All subsequent phases build on this foundation.

The critical finding is that **the prior research assumed Next.js 15 but the current stable version is Next.js 16.1.6** (React 19.2.4, Tailwind CSS 4.2.1, TypeScript 5.9.3). Next.js 16 introduces breaking changes: Turbopack is now the default bundler, the `middleware` file is renamed to `proxy`, async request APIs are mandatory, and `tailwindcss-animate` is replaced by `tw-animate-css` in the shadcn/ui ecosystem. shadcn/ui has full compatibility with Next.js 16 and Tailwind v4 confirmed by multiple production projects.

The architecture uses Next.js route groups -- `(pos)` for dark POS layout and `(admin)` for light admin layout -- which are separate layout shells sharing a root layout that provides fonts, global CSS, and the AuthContext provider. This is NOT a dark-mode toggle pattern; it is two structurally separate layouts resolved by the file system. No `next-themes` library is needed. For fonts, **Oswald is recommended over Bebas Neue** because Oswald is a variable font (weights 200-700) offering design flexibility, while Bebas Neue is a single-weight (400 only) display font that cannot be used at different weights.

**Primary recommendation:** Use `npx create-next-app@latest wildwood-erp --yes` (Next.js 16 defaults: TypeScript, Tailwind CSS v4, ESLint, App Router, Turbopack), then `npx shadcn@latest init` to configure shadcn/ui with OKLCH CSS variables. Do NOT use `output: 'export'` -- deploy normally to Vercel for best DX and zero configuration.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | Framework, routing, SSG | Current stable. Turbopack default. App Router is the only active paradigm. |
| React | 19.2.4 | UI library | Ships with Next.js 16. Includes View Transitions, useEffectEvent, Activity. |
| TypeScript | 5.9.3 | Type safety | Non-negotiable. Types become Supabase schema contract in Phase 2. |
| Tailwind CSS | 4.2.1 | Utility-first CSS | CSS-first config via `@theme inline`. No `tailwind.config.js` needed. |
| shadcn/ui | latest (CLI) | Component primitives | Full source ownership. Built on Radix UI. Supports Tailwind v4 natively. |
| tw-animate-css | 1.4.0 | Animation utilities | Replaces deprecated `tailwindcss-animate`. Default in new shadcn/ui projects. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.575.0 | Icon set | Navigation icons, status indicators. Bundled with shadcn/ui. |
| date-fns | 4.1.0 | Date math | Pass expiration, calendar periods, accounting aggregation. ESM-native. |
| Recharts | 3.7.0 | Charts | Phase 5 (accounting). Not needed in Phase 1 but install now. |
| class-variance-authority (cva) | latest | Variant management | Bundled with shadcn/ui. Used for custom button `size="pos"` variant. |
| clsx + tailwind-merge | latest | Class merging | Bundled with shadcn/ui as `cn()` utility. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Oswald (recommended) | Bebas Neue | Bebas Neue is single-weight only (400). Oswald is variable (200-700), offering more design flexibility for headings at different sizes. |
| Standard Vercel deploy | `output: 'export'` (static) | Static export works but loses image optimization and SSR flexibility. Standard deploy is zero-config on Vercel and faster DX. |
| Route-group theming | next-themes | next-themes solves user-toggled dark mode. WildWood has layout-based theming (POS always dark, Admin always light) -- route groups handle this without any library. |
| No React Compiler | React Compiler (`reactCompiler: true`) | React Compiler auto-memoizes but increases build time. Skip for prototype speed; can enable in Phase 7 polish. |

**Installation:**
```bash
# Step 1: Scaffold the project (Next.js 16 defaults: TS, Tailwind v4, ESLint, App Router, Turbopack)
npx create-next-app@latest wildwood-erp --yes

# Step 2: Initialize shadcn/ui
cd wildwood-erp
npx shadcn@latest init

# Step 3: Add shadcn components needed for Phase 1
npx shadcn@latest add button card badge separator avatar

# Step 4: Supporting libraries
npm install date-fns lucide-react recharts

# Step 5: Dev tools
npm install -D prettier prettier-plugin-tailwindcss
```

> **Important:** `create-next-app --yes` uses saved preferences or defaults (TypeScript, ESLint, Tailwind CSS, App Router, Turbopack). On a fresh machine with no saved prefs, it uses the recommended defaults. The `src/` directory option is NOT in the defaults -- if needed, run without `--yes` and choose it explicitly.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── layout.tsx              # Root layout: html, body, fonts, AuthProvider, PrototypeBanner
│   ├── page.tsx                # Redirect to /login or /pos based on auth state
│   ├── login/
│   │   └── page.tsx            # Simulated login (role selection)
│   ├── (pos)/
│   │   ├── layout.tsx          # Dark POS layout: bg-[#1F1F1F], no sidebar, full-screen
│   │   ├── pos/
│   │   │   └── page.tsx        # POS main screen (Phase 2 builds here)
│   │   └── ...
│   ├── (admin)/
│   │   ├── layout.tsx          # Light admin layout: cream bg, sidebar, responsive
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Admin dashboard (Phase 3 builds here)
│   │   └── ...
│   └── globals.css             # Tailwind imports, @theme inline, CSS variables
├── components/
│   ├── ui/                     # shadcn/ui components (auto-generated)
│   ├── prototype-banner.tsx    # "PROTOTYPE -- Donnees fictives" bar
│   ├── role-toggle.tsx         # Admin/Staff badge toggle in header
│   └── ...
├── lib/
│   ├── types.ts                # All TypeScript interfaces (single source of truth)
│   ├── data-access.ts          # Abstraction layer: async functions returning Promise<T>
│   ├── contexts/
│   │   └── auth-context.tsx    # AuthContext: role, login/logout, localStorage persistence
│   ├── mock-data/
│   │   ├── clients.json        # 30-40 fictional clients
│   │   ├── gym-passes.json     # 9 pass types with real pricing
│   │   ├── fnb-products.json   # F&B products by category with pricing
│   │   ├── bungalows.json      # 8 bungalows with 3-month reservations
│   │   └── transactions.json   # Historical transactions
│   └── utils.ts                # Utility functions (cn, formatters, etc.)
└── styles/
    └── fonts.ts                # Font definitions (Oswald + Inter via next/font)
```

### Pattern 1: Route Groups for Dual-Theme Layouts
**What:** Next.js route groups `(pos)` and `(admin)` create two completely separate layout shells without affecting URL paths. The `(pos)` folder creates routes like `/pos/...` and the `(admin)` folder creates routes like `/dashboard/...`.
**When to use:** When the same app needs fundamentally different visual shells (dark POS vs light admin).
**Key caveat:** Navigating between routes in different route groups with different root layouts triggers a full page reload. For WildWood this is acceptable since switching between POS and Admin is an intentional role change.

```typescript
// src/app/(pos)/layout.tsx
// Source: Next.js 16 official docs - Route Groups
export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#1F1F1F] text-white">
      {/* POS header with role toggle */}
      <main className="h-dvh overflow-hidden">
        {children}
      </main>
    </div>
  )
}

// src/app/(admin)/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#FAF7F2]">
      {/* Sidebar navigation + header with role toggle */}
      <div className="flex">
        <aside className="w-64 bg-[#3D2B1F] text-white min-h-dvh">
          {/* Navigation links */}
        </aside>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Pattern 2: Root Layout with Global Providers
**What:** The root `layout.tsx` wraps the entire app with fonts, global CSS, AuthContext, and the PrototypeBanner. Route-group layouts inherit from this.
**When to use:** Always -- this is the single entry point for global concerns.

```typescript
// src/app/layout.tsx
// Source: Next.js 16 official docs
import { Inter, Oswald } from 'next/font/google'
import { AuthProvider } from '@/lib/contexts/auth-context'
import { PrototypeBanner } from '@/components/prototype-banner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const oswald = Oswald({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-oswald',
})

export const metadata = {
  title: 'WildWood ERP',
  description: 'WildWood Beach Fitness & Resort - Systeme de gestion',
  robots: 'noindex, nofollow', // Prototype: never index
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${oswald.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <PrototypeBanner />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### Pattern 3: Data Access Layer Abstraction
**What:** All components access mock data through `lib/data-access.ts` functions that return `Promise<T>`. No component ever imports JSON directly.
**When to use:** Always. This is the Phase 2 migration seam -- only `data-access.ts` changes when Supabase replaces JSON.

```typescript
// src/lib/data-access.ts
import type { Client, GymPass, FnbProduct, Bungalow, Transaction } from './types'
import clientsData from './mock-data/clients.json'
import gymPassesData from './mock-data/gym-passes.json'
import fnbProductsData from './mock-data/fnb-products.json'
import bungalowsData from './mock-data/bungalows.json'
import transactionsData from './mock-data/transactions.json'

// Simulate async API calls -- Phase 2 replaces these internals with Supabase queries
export async function getClients(): Promise<Client[]> {
  return clientsData as Client[]
}

export async function getClientById(id: string): Promise<Client | undefined> {
  return (clientsData as Client[]).find(c => c.id === id)
}

export async function getGymPasses(): Promise<GymPass[]> {
  return gymPassesData as GymPass[]
}

export async function getFnbProducts(): Promise<FnbProduct[]> {
  return fnbProductsData as FnbProduct[]
}

export async function getBungalows(): Promise<Bungalow[]> {
  return bungalowsData as Bungalow[]
}

export async function getTransactions(): Promise<Transaction[]> {
  return transactionsData as Transaction[]
}
```

### Pattern 4: AuthContext with localStorage Persistence
**What:** Simple React Context holding the current role (admin/staff/null). Persisted in localStorage so role survives page refresh. Must be a Client Component.
**When to use:** Phase 1 only. Phase 2 replaces with Supabase Auth.

```typescript
// src/lib/contexts/auth-context.tsx
'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type Role = 'admin' | 'staff'

interface AuthContextType {
  role: Role | null
  login: (role: Role) => void
  logout: () => void
  toggleRole: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    const stored = localStorage.getItem('wildwood-role')
    if (stored === 'admin' || stored === 'staff') {
      setRole(stored)
    }
    setIsHydrated(true)
  }, [])

  // Sync to localStorage on change
  useEffect(() => {
    if (isHydrated) {
      if (role) {
        localStorage.setItem('wildwood-role', role)
      } else {
        localStorage.removeItem('wildwood-role')
      }
    }
  }, [role, isHydrated])

  const login = (newRole: Role) => setRole(newRole)
  const logout = () => setRole(null)
  const toggleRole = () => setRole(prev => prev === 'admin' ? 'staff' : 'admin')

  // Prevent hydration mismatch: render nothing meaningful until client-side state is loaded
  if (!isHydrated) {
    return null // Or a loading skeleton
  }

  return (
    <AuthContext.Provider value={{ role, login, logout, toggleRole, isAuthenticated: role !== null }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

### Pattern 5: Custom POS Button Variant
**What:** Extend the shadcn/ui Button component with a `size="pos"` variant that meets the 120x80px minimum requirement.
**When to use:** All POS interactive elements.

```typescript
// In src/components/ui/button.tsx (after shadcn generates it)
// Add to the buttonVariants cva definition:
const buttonVariants = cva(
  "inline-flex items-center justify-center ...",
  {
    variants: {
      variant: {
        // ... existing variants
        pos: "bg-[#8B6B3D] text-white hover:bg-[#A07D4E] border border-[#6B5230] shadow-md",
        "pos-accent": "bg-[#C94E0A] text-white hover:bg-[#E05A10] shadow-md",
      },
      size: {
        // ... existing sizes
        pos: "min-h-[80px] min-w-[120px] px-4 py-3 text-lg font-bold rounded-xl",
      },
    },
    // ...
  }
)
```

### Anti-Patterns to Avoid
- **Do NOT use `tailwind.config.js`:** Tailwind v4 uses CSS-first configuration via `@theme inline` in `globals.css`. There is no config file.
- **Do NOT import JSON directly in components:** Always go through `lib/data-access.ts`. This is the Phase 2 migration contract.
- **Do NOT use `next-themes` for POS/Admin theming:** The two themes are layout-based (route groups), not user-toggled. `next-themes` adds unnecessary complexity.
- **Do NOT use `middleware.ts`:** Next.js 16 renamed it to `proxy.ts`. But we don't need either for this prototype since auth is simulated client-side.
- **Do NOT use `h-screen`:** Use `h-dvh` (dynamic viewport height) for mobile/tablet compatibility. `h-screen` ignores the browser's URL bar on mobile.
- **Do NOT use `tailwindcss-animate`:** Deprecated. Use `tw-animate-css` instead (installed by default with shadcn/ui on Tailwind v4).

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Component variants (size, color) | Custom CSS classes | cva (class-variance-authority) via shadcn/ui | Type-safe variant props, consistent API, composable |
| Icon set | SVG files or emoji for navigation | lucide-react | Tree-shakable, consistent sizing, 1500+ icons, React components |
| Date formatting | Custom date string parsing | date-fns `format()` with `fr` locale | Handles edge cases (timezone, locale, DST), tree-shakable |
| CSS class merging | String concatenation | `cn()` utility (clsx + tailwind-merge) | Resolves Tailwind class conflicts correctly |
| Font loading | `<link>` tags to Google Fonts | next/font/google | Zero CLS, self-hosted, privacy-compliant, automatic preload |
| Accessible dialogs | Custom modal divs | shadcn/ui Dialog (Radix primitives) | Focus trapping, keyboard nav, screen readers, portal rendering |
| Form inputs | Raw `<input>` tags | shadcn/ui Input, Select, etc. | Consistent styling, accessible labels, error states built in |

**Key insight:** shadcn/ui components are copied into the project as source code. They are NOT black-box dependencies. You can (and should) customize them directly. The `src/components/ui/` folder is yours to modify.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch with localStorage
**What goes wrong:** Server renders HTML with no auth state. Client hydrates with localStorage state. React throws a hydration mismatch error.
**Why it happens:** localStorage is only available on the client. Server-rendered HTML cannot access it.
**How to avoid:** Use an `isHydrated` flag. Render null or a skeleton until `useEffect` has read localStorage. See AuthContext code example above.
**Warning signs:** Console errors mentioning "hydration mismatch" or "text content did not match."

### Pitfall 2: Tailwind v4 Color Format
**What goes wrong:** CSS variables defined without wrapping function (`--background: 0 0% 100%`) silently fail in Tailwind v4.
**Why it happens:** Tailwind CSS v4 requires `hsl()`, `oklch()`, or `rgb()` wrapping. Raw space-separated values (the old Tailwind v3 convention) no longer work.
**How to avoid:** Always wrap color values: `--background: oklch(1 0 0)` or `--background: hsl(0 0% 100%)`. The shadcn/ui CLI generates OKLCH by default -- do not manually revert to the old format.
**Warning signs:** Colors appearing as black or transparent despite being defined in CSS.

### Pitfall 3: POS Layout Scroll Leak
**What goes wrong:** The POS screen scrolls on tablet despite using `h-screen`. Content overflows the viewport.
**Why it happens:** `h-screen` is `100vh` which on mobile/tablet doesn't account for the browser chrome (URL bar, bottom toolbar). Also, content inside can exceed the container without `overflow-hidden`.
**How to avoid:** Use `h-dvh` (dynamic viewport height) on the POS container. Add `overflow-hidden` on the POS layout. Use CSS Grid with `grid-rows-[auto_1fr_auto]` to divide header/content/footer within the fixed viewport.
**Warning signs:** Scrollbar appearing on the POS page. Content cut off at the bottom on real tablets.

### Pitfall 4: Font Weight Mistake with Bebas Neue
**What goes wrong:** Attempting to use Bebas Neue at different weights (bold headings vs regular labels) fails -- all text renders at the same weight.
**Why it happens:** Bebas Neue is NOT a variable font. It only has weight 400. You cannot specify `font-bold` and get a heavier version.
**How to avoid:** Use **Oswald** instead. Oswald is a variable font with weights 200-700, providing the same condensed display style but with full weight flexibility. Both are Google Fonts, both are free.
**Warning signs:** Headings and body text looking the same weight despite Tailwind `font-bold` classes.

### Pitfall 5: Missing `'use client'` on Context Providers
**What goes wrong:** Build fails with "createContext is not a function" or "useState is not a function" errors.
**Why it happens:** In Next.js 16 App Router, all components are Server Components by default. Context, useState, useEffect, and other hooks require Client Components.
**How to avoid:** Add `'use client'` as the first line of any file that uses React hooks or Context. The AuthProvider, PrototypeBanner (if it uses client state), and any interactive component must be client components.
**Warning signs:** Build errors referencing "server component" or "client component" mismatch.

### Pitfall 6: Forgetting to Set `lang="fr"` on Root Layout
**What goes wrong:** Screen readers announce content in English. Browser translation popups appear.
**Why it happens:** The default `lang="en"` from create-next-app template is not changed.
**How to avoid:** Set `<html lang="fr">` in the root layout since the interface is 100% French.
**Warning signs:** Browser offering to translate the page, accessibility audit warnings.

### Pitfall 7: Sun Glare / Outdoor Contrast on POS
**What goes wrong:** POS text is unreadable on a tablet at the WildWood beach/gym.
**Why it happens:** Subtle grays and low-contrast accent colors fail in bright outdoor light.
**How to avoid:** POS must use pure white (#FFFFFF) text on very dark backgrounds (#1F1F1F). WildWood orange (#C94E0A) must NOT be used as a text color on dark backgrounds -- it only achieves ~3.8:1 contrast ratio (fails WCAG AA). Use it for button backgrounds only, with white text on top. All POS text must pass 7:1 contrast ratio (WCAG AAA).
**Warning signs:** Running a contrast checker on the POS palette and getting scores below 4.5:1.

## Code Examples

### WildWood Tailwind Theme Configuration (globals.css)
```css
/* src/app/globals.css */
/* Source: shadcn/ui Tailwind v4 theming docs */
@import "tailwindcss";
@import "tw-animate-css";

/* ===== WildWood Design System ===== */

/* Light theme (Admin) - default */
:root {
  --radius: 0.625rem;

  /* Admin palette: cream/sand background, organic feel */
  --background: oklch(0.975 0.005 85);      /* #FAF7F2 - warm cream */
  --foreground: oklch(0.2 0.02 50);         /* Dark brown text */

  --primary: oklch(0.45 0.12 55);           /* #8B6B3D - bois/wood */
  --primary-foreground: oklch(0.98 0 0);    /* White on wood */

  --secondary: oklch(0.95 0.01 85);         /* Light sand */
  --secondary-foreground: oklch(0.25 0.02 50);

  --accent: oklch(0.55 0.18 35);            /* #C94E0A - WildWood orange */
  --accent-foreground: oklch(0.98 0 0);     /* White on orange */

  --destructive: oklch(0.55 0.22 25);       /* Red for errors */
  --destructive-foreground: oklch(0.98 0 0);

  --muted: oklch(0.93 0.005 85);
  --muted-foreground: oklch(0.5 0.01 50);

  --card: oklch(0.99 0.002 85);
  --card-foreground: oklch(0.2 0.02 50);

  --popover: oklch(0.99 0.002 85);
  --popover-foreground: oklch(0.2 0.02 50);

  --border: oklch(0.88 0.01 85);
  --input: oklch(0.88 0.01 85);
  --ring: oklch(0.45 0.12 55);             /* Wood accent ring */

  /* WildWood brand colors (available everywhere) */
  --wildwood-orange: oklch(0.55 0.18 35);   /* #C94E0A */
  --wildwood-bois: oklch(0.45 0.12 55);     /* #8B6B3D */
  --wildwood-lime: oklch(0.65 0.18 135);    /* #7AB648 */
  --wildwood-dark: oklch(0.18 0 0);         /* #1F1F1F */
  --wildwood-cream: oklch(0.975 0.005 85);  /* #FAF7F2 */

  /* Sidebar (dark wood) */
  --sidebar-background: oklch(0.22 0.04 50); /* Dark wood sidebar */
  --sidebar-foreground: oklch(0.92 0.005 85);
  --sidebar-accent: oklch(0.55 0.18 35);    /* Orange accent */
  --sidebar-accent-foreground: oklch(0.98 0 0);
  --sidebar-border: oklch(0.3 0.04 50);

  /* Chart colors for Recharts (Phase 5) */
  --chart-1: oklch(0.55 0.18 35);  /* Orange */
  --chart-2: oklch(0.45 0.12 55);  /* Bois */
  --chart-3: oklch(0.65 0.18 135); /* Lime */
  --chart-4: oklch(0.6 0.15 250);  /* Blue accent */
  --chart-5: oklch(0.5 0.1 320);   /* Purple accent */

  /* Prototype banner */
  --banner-bg: oklch(0.85 0.12 85);         /* Warm amber, visible but not aggressive */
  --banner-text: oklch(0.25 0.05 50);       /* Dark brown text */
}

/* POS theme - applied via class on the (pos) layout container */
.pos-theme {
  --background: oklch(0.18 0 0);            /* #1F1F1F - dark gray */
  --foreground: oklch(0.98 0 0);            /* White text */

  --primary: oklch(0.45 0.12 55);           /* Bois wood accent */
  --primary-foreground: oklch(0.98 0 0);

  --accent: oklch(0.55 0.18 35);            /* WildWood orange */
  --accent-foreground: oklch(0.98 0 0);

  --card: oklch(0.22 0 0);                  /* Slightly lighter card */
  --card-foreground: oklch(0.98 0 0);

  --muted: oklch(0.25 0 0);
  --muted-foreground: oklch(0.7 0 0);

  --border: oklch(0.3 0 0);
  --input: oklch(0.25 0 0);
  --ring: oklch(0.55 0.18 35);
}

/* Map CSS variables to Tailwind v4 theme */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  /* WildWood brand */
  --color-wildwood-orange: var(--wildwood-orange);
  --color-wildwood-bois: var(--wildwood-bois);
  --color-wildwood-lime: var(--wildwood-lime);
  --color-wildwood-dark: var(--wildwood-dark);
  --color-wildwood-cream: var(--wildwood-cream);

  /* Sidebar */
  --color-sidebar-background: var(--sidebar-background);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);

  /* Charts */
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);

  /* Prototype banner */
  --color-banner-bg: var(--banner-bg);
  --color-banner-text: var(--banner-text);

  /* Fonts */
  --font-sans: var(--font-inter);
  --font-display: var(--font-oswald);

  /* Border radius */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

### Font Setup (Oswald + Inter)
```typescript
// src/app/layout.tsx (font imports section)
// Source: Next.js 16 official docs - Font Optimization
import { Inter, Oswald } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// Oswald is a VARIABLE font (weights 200-700) -- no need to specify weight
const oswald = Oswald({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-oswald',
})

// Apply both as CSS variables on <html>
// <html lang="fr" className={`${inter.variable} ${oswald.variable}`}>
```

Usage in components:
```html
<!-- Body text: Inter (font-sans) -->
<p class="font-sans text-base">Corps du texte en Inter</p>

<!-- Headings: Oswald (font-display) -->
<h1 class="font-display text-4xl font-bold uppercase">WILDWOOD ERP</h1>
<h2 class="font-display text-2xl font-semibold">Passes Gym</h2>
```

### Prototype Banner Component
```typescript
// src/components/prototype-banner.tsx
export function PrototypeBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-banner-bg text-banner-text text-center py-1 text-xs font-medium tracking-wide">
      PROTOTYPE — Donnees fictives
    </div>
  )
}

// Add padding-top to body or root to offset the banner height
// <body className="font-sans antialiased pt-7">
```

### TypeScript Type Definitions
```typescript
// src/lib/types.ts -- Single source of truth for all data shapes
// These types become the Supabase schema contract in Phase 2

export interface Client {
  id: string
  prenom: string
  nom: string
  email?: string
  telephone?: string
  type: 'visiteur' | 'resident'
  bungalowId?: string        // null if visiteur
  dateCreation: string        // ISO date
  derniereVisite?: string     // ISO date
  nombreVisites: number
  newsletter: boolean
}

export interface GymPass {
  id: string
  nom: string                 // "1 jour", "3 jours", "1 semaine", etc.
  prix: number                // en baht
  dureeJours: number          // 1, 3, 7, 10, 30, 180, 365
  expireJours?: number        // for "10 jours (expire 90j)" pass
  description?: string
}

export interface FnbProduct {
  id: string
  nom: string
  categorie: 'bowls' | 'cocktails-proteines' | 'cafes' | 'smoothies' | 'boissons' | 'snacks'
  prix: number                // en baht
  emoji: string               // e.g., "🥤", "☕", "🥑"
}

export interface Bungalow {
  id: string
  numero: number              // 1-8
  reservations: Reservation[]
}

export interface Reservation {
  id: string
  bungalowId: string
  clientId: string
  dateDebut: string           // ISO date
  dateFin: string             // ISO date
  nuits: number
  montant: number             // en baht
  statut: 'confirmee' | 'en-cours' | 'terminee' | 'annulee'
}

export interface Transaction {
  id: string
  date: string                // ISO datetime
  type: 'gym-pass' | 'fnb' | 'bungalow'
  centreRevenu: 'Gym' | 'F&B' | 'Bungalows'
  clientId?: string
  items: TransactionItem[]
  total: number               // en baht
  methode: 'especes' | 'virement'
}

export interface TransactionItem {
  produitId: string
  nom: string
  quantite: number
  prixUnitaire: number
  sousTotal: number
}

export type Role = 'admin' | 'staff'
```

### Login Page (Simulated)
```typescript
// src/app/login/page.tsx
'use client'

import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { Role } from '@/lib/types'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()

  const handleLogin = (role: Role) => {
    login(role)
    router.push(role === 'staff' ? '/pos' : '/dashboard')
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-wildwood-dark">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <h1 className="font-display text-5xl font-bold uppercase text-white">
            WildWood
          </h1>
          <p className="mt-2 text-wildwood-cream/70">
            Beach Fitness & Resort - Koh Tao
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => handleLogin('admin')}
            className="w-full"
            size="lg"
            variant="default"
          >
            Admin (Proprietaire)
          </Button>
          <Button
            onClick={() => handleLogin('staff')}
            className="w-full bg-wildwood-orange hover:bg-wildwood-orange/90"
            size="lg"
          >
            Staff (Caisse POS)
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### Next.js Config (next.config.ts)
```typescript
// next.config.ts
// Source: Next.js 16 official docs
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Do NOT use output: 'export' -- standard Vercel deploy is better
  // No custom webpack config -- Turbopack is default in Next.js 16
}

export default nextConfig
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Next.js 14/15 | Next.js 16.1.6 | 2025-2026 | Turbopack default, async request APIs mandatory, `middleware` renamed to `proxy` |
| `tailwind.config.js` (JS config) | `@theme inline` in CSS (CSS-first config) | Tailwind v4 (early 2025) | No config file needed. Colors defined in `globals.css`. |
| `tailwindcss-animate` | `tw-animate-css` | 2025 (shadcn/ui update) | New package name. Old one deprecated. |
| `hsl(var(--color))` pattern | `var(--color)` with OKLCH wrapping | Tailwind v4 + shadcn/ui 2025 | CSS variables now include the color function. `@theme inline` maps them directly. |
| `forwardRef` in components | Standard props (no `forwardRef`) | React 19 / shadcn/ui 2025 | Simpler component code. All shadcn/ui components updated. |
| `middleware.ts` | `proxy.ts` | Next.js 16 | File and function renamed. `edge` runtime no longer supported in `proxy`. |
| `h-screen` for full viewport | `h-dvh` (dynamic viewport height) | Broadly adopted 2024+ | Accounts for mobile browser chrome. Critical for POS tablet layout. |
| `next lint` command | Direct `eslint` CLI | Next.js 16 | `next lint` removed. Use `eslint` or `biome` directly. |

**Deprecated/outdated:**
- `tailwindcss-animate`: Replaced by `tw-animate-css`
- `tailwind.config.js`: Replaced by CSS-first `@theme inline` in Tailwind v4
- `middleware.ts`: Renamed to `proxy.ts` in Next.js 16
- `next lint`: Removed in Next.js 16. Use ESLint CLI directly.
- `forwardRef`: No longer needed in React 19 / shadcn/ui components
- `next/legacy/image`: Deprecated in Next.js 16
- `serverRuntimeConfig` / `publicRuntimeConfig`: Removed in Next.js 16

## Open Questions

1. **OKLCH Color Accuracy**
   - What we know: The hex colors from CONTEXT.md (#C94E0A, #8B6B3D, #7AB648, #1F1F1F, #FAF7F2) need to be converted to OKLCH for Tailwind v4. The OKLCH values in the code examples above are approximations.
   - What's unclear: Whether the OKLCH approximations render identically to the hex originals across browsers.
   - Recommendation: During implementation, use a hex-to-OKLCH converter and visually verify in Chrome and Safari. Alternatively, use `hsl()` wrapping instead of `oklch()` for exact hex parity -- shadcn/ui supports both.

2. **`src/` Directory in create-next-app Defaults**
   - What we know: Running `create-next-app --yes` uses recommended defaults which include TypeScript, ESLint, Tailwind, App Router, and Turbopack. The `src/` directory option is a separate prompt.
   - What's unclear: Whether `--yes` creates a `src/` directory or puts `app/` at root.
   - Recommendation: Run without `--yes` and explicitly choose `src/` directory. The project structure above assumes `src/`.

3. **Static Export vs Standard Deploy**
   - What we know: `output: 'export'` generates pure static HTML. Standard Vercel deploy handles SSR + static optimally. This project has no API routes and no server-side data fetching.
   - What's unclear: Whether standard Vercel deploy adds meaningful cost vs static export for a prototype with zero traffic.
   - Recommendation: Use standard Vercel deploy (no `output: 'export'`). It's zero-config, supports image optimization, and the free tier is more than sufficient for a prototype demo.

## Sources

### Primary (HIGH confidence)
- npm registry (live queries 2026-03-01): Next.js 16.1.6, React 19.2.4, Tailwind CSS 4.2.1, TypeScript 5.9.3, date-fns 4.1.0, Recharts 3.7.0, lucide-react 0.575.0, tw-animate-css 1.4.0, next-themes 0.4.6
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) - Breaking changes, Turbopack default, proxy rename, async APIs
- [Next.js Installation Docs](https://nextjs.org/docs/app/getting-started/installation) - create-next-app defaults, project structure
- [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts) - next/font/google API, CSS variables, Tailwind integration
- [Next.js Route Groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) - Dual layout pattern, caveats
- [shadcn/ui Tailwind v4 Guide](https://ui.shadcn.com/docs/tailwind-v4) - @theme inline, OKLCH colors, tw-animate-css
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming) - CSS variable structure, dark mode, custom colors
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next) - CLI init, component structure

### Secondary (MEDIUM confidence)
- [Next.js 16 Blog Post](https://nextjs.org/blog/next-16) - Feature overview, React 19.2, Cache Components
- [Bebas Neue on Google Fonts](https://fonts.google.com/specimen/Bebas+Neue) - Single weight (400 only)
- [Oswald on Google Fonts](https://fonts.google.com/specimen/Oswald) - Variable font, weights 200-700
- Multiple production shadcn/ui templates confirming Next.js 16 + Tailwind v4 compatibility

### Tertiary (LOW confidence)
- OKLCH color value approximations for WildWood hex colors -- need visual verification during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions verified against live npm registry. shadcn/ui + Next.js 16 + Tailwind v4 compatibility confirmed by official docs and production usage.
- Architecture: HIGH - Route groups, data access layer, Context patterns are documented official Next.js patterns. Code examples verified against Next.js 16 official documentation.
- Pitfalls: HIGH - Hydration mismatch, Tailwind v4 color format, font weight issues are well-documented. POS contrast and outdoor visibility are domain-specific but grounded in WCAG standards.

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (30 days -- stable stack, no fast-moving dependencies)
