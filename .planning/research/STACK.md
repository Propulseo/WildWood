# Stack Research

**Domain:** Touch-friendly POS / Resort ERP (frontend-only MVP prototype)
**Researched:** 2026-03-01
**Confidence:** MEDIUM

> **Verification note:** WebSearch, WebFetch, Bash (npm view), and MCP documentation tools were all unavailable during this research session. Version numbers are based on training data (cutoff May 2025) and the project's own PRD constraints. Versions marked with `*` could not be verified against live registries and should be confirmed with `npm view <package> version` before `create-next-app` is run.

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| Next.js | 15.x* (App Router) | Framework, routing, SSG | The PRD specifies Next.js 14, but Next.js 15 was stable by late 2024. App Router is the only actively developed routing paradigm. Static export (`output: 'export'`) produces a pure-static site ideal for a mock-data prototype on Vercel. Use 15 unless the team has a specific reason to pin 14. | MEDIUM |
| React | 19.x* | UI library | Ships with Next.js 15. React 19 brings `use()`, Server Components improvements, and better Suspense -- all useful even for a prototype. React 18 ships with Next.js 14 if you stay on 14. | MEDIUM |
| TypeScript | 5.7+* | Type safety | Non-negotiable for any 2025+ project. Catches mock-data shape bugs at compile time. Strongly typed mock data means the UI contracts are ready when Supabase is added in Phase 2. | HIGH (stable major) |
| Tailwind CSS | 4.x* | Utility-first CSS | Tailwind v4 was released early 2025 with CSS-first config, Lightning CSS engine, and simplified setup. If v4 has compatibility issues with shadcn/ui at the time of project init, fall back to 3.4.x which is battle-tested. Check shadcn/ui docs for Tailwind v4 support before committing. | MEDIUM |
| shadcn/ui | latest (CLI-installed) | Component library | Not a package -- components are copied into your project via `npx shadcn@latest init`. Gives full ownership of source. Components are built on Radix UI primitives (accessibility baked in) and styled with Tailwind. Perfect for heavy customization needed for POS buttons (120x80px, dark theme). | HIGH |
| Recharts | 2.15+* | Charts for dashboards | Declarative, React-native charting. Simpler API than Visx or Nivo. Lightweight enough for a prototype. Covers bar charts (daily revenue), line charts (monthly trends), pie charts (revenue by center). The PRD already specifies Recharts or Chart.js -- Recharts wins because it is React-native (no imperative canvas API). | MEDIUM |

### Supporting Libraries

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| Radix UI primitives | latest | Accessible headless components | Installed automatically by shadcn/ui. Dialog, Popover, Select, Tabs, Toast -- all used heavily in POS flows. | HIGH |
| lucide-react | latest | Icon set | Default icon library for shadcn/ui. Consistent, tree-shakable. Used for POS category icons, navigation icons, status indicators. | HIGH |
| date-fns | 4.x* | Date manipulation | Bungalow calendar calculations, pass expiration logic, daily/monthly accounting periods. Lightweight, tree-shakable, locale-aware (fr locale for French dates). Preferred over dayjs for better TypeScript support. | MEDIUM |
| clsx + tailwind-merge | latest | Conditional class names | Already included by shadcn/ui setup (`cn()` utility). Used everywhere for conditional styling (active states, selected items, role-based visibility). | HIGH |
| react-day-picker | 9.x* | Calendar component | Bungalow booking calendar (month view, 8 rows). shadcn/ui wraps this as its Calendar component. Supports range selection, custom day rendering (occupancy colors). | MEDIUM |
| nuqs | 2.x* | URL state management | Encode POS filters, active tab, selected date range in URL search params. Keeps state shareable and survives page refresh without a backend. Lightweight alternative to full state management. | LOW |
| next-intl or none | -- | i18n (deferred) | The PRD says French-only, so hardcode French strings. Do NOT add an i18n library for a single language. If Phase 2 needs EN/TH, add next-intl then. | HIGH (anti-rec) |

### Development Tools

| Tool | Purpose | Notes | Confidence |
|------|---------|-------|------------|
| ESLint | Linting | Ships with `create-next-app`. Use the default Next.js ESLint config. | HIGH |
| Prettier | Code formatting | Add `prettier-plugin-tailwindcss` for automatic class sorting. Consistent code across the team. | HIGH |
| VS Code | Editor | Recommended extensions: Tailwind CSS IntelliSense, ESLint, Prettier. | HIGH |

---

## Installation

```bash
# Scaffold the project
npx create-next-app@latest wildwood-erp --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Initialize shadcn/ui (follow prompts for style, color, CSS variables)
npx shadcn@latest init

# Add shadcn components used across the app
npx shadcn@latest add button card dialog tabs table input select badge calendar chart toast separator avatar dropdown-menu popover sheet

# Supporting libraries
npm install recharts date-fns lucide-react

# Dev tools
npm install -D prettier prettier-plugin-tailwindcss
```

> **Note on shadcn/ui:** It is NOT installed as an npm dependency. The CLI copies component source files into `src/components/ui/`. This is by design -- you own and customize every component.

---

## Alternatives Considered

| Category | Recommended | Alternative | When to Use Alternative |
|----------|-------------|-------------|-------------------------|
| Framework | Next.js 15 (App Router) | Vite + React Router | If you need zero framework opinions and pure SPA. But you lose Vercel's zero-config deployment, image optimization, and static export ergonomics. Not worth it for this project. |
| Framework | Next.js 15 (App Router) | Remix / React Router v7 | Better for data-heavy apps with server loaders. Overkill for a frontend-only prototype with mock JSON. |
| Components | shadcn/ui | Ant Design (antd) | If you want a batteries-included enterprise UI. But antd is opinionated on styling (not Tailwind), heavy (~1MB+), and harder to customize for a unique POS dark-theme look. |
| Components | shadcn/ui | Material UI (MUI) | Same issues as antd: opinionated design system, harder to customize, heavier bundle. Also imposes Material Design which clashes with the WildWood wood/orange aesthetic. |
| Components | shadcn/ui | Radix Themes | Closer to shadcn/ui but less community adoption, fewer examples. shadcn/ui is the de facto standard for Tailwind + Radix projects. |
| Charts | Recharts | Chart.js (react-chartjs-2) | More chart types, canvas-based (sharper at scale). But imperative API, less React-idiomatic. For a prototype with 5-6 chart types, Recharts is simpler. |
| Charts | Recharts | Nivo | Beautiful defaults, more chart types. But heavier, steeper learning curve. Overkill for prototype dashboards. |
| Charts | Recharts | Visx (Airbnb) | Low-level D3 wrapper for React. Maximum control but maximum effort. Wrong choice for a prototype. |
| Dates | date-fns | dayjs | Slightly smaller bundle but weaker TypeScript types and less tree-shakable. date-fns v4 is ESM-native and works better with Next.js. |
| Dates | date-fns | Luxon | Heavier, class-based API. Overkill for date formatting and diff calculations. |
| Calendar | react-day-picker (via shadcn) | FullCalendar | Powerful but heavy (200KB+), GPL-licensed for open source. The bungalow calendar is a simple month grid -- react-day-picker customized with shadcn handles it fine. |
| State | useState/useContext | Zustand | If state complexity grows beyond 3-4 contexts. For this MVP with mock data, React built-ins are sufficient. Revisit if prop drilling becomes painful. |
| State | useState/useContext | Redux Toolkit | Massive overkill for a frontend-only prototype. Never use Redux for a project this size. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Pages Router (Next.js) | Legacy routing paradigm. All new Next.js documentation, examples, and features target App Router. Starting with Pages Router creates migration debt. | App Router (app/ directory) |
| CSS Modules / Styled Components / CSS-in-JS | Tailwind CSS is the project standard. Mixing styling paradigms creates inconsistency and increases cognitive load. CSS-in-JS libraries also have SSR hydration issues with App Router. | Tailwind CSS utility classes |
| Redux / MobX / Recoil | Massive overengineering for a mock-data prototype. These add boilerplate, learning curve, and devtools complexity for zero benefit at this scale. | React useState + useContext |
| next-i18next / react-intl / i18n libraries | The interface is French-only. Adding an i18n library for one language adds abstraction, key management, and bundle size for zero user value. Hardcode French strings. | Hardcoded French strings in components |
| Prisma / Drizzle / any ORM | There is no database. Mock data lives in JSON files. Adding an ORM creates false architecture that will be torn out when Supabase is added in Phase 2. | Static JSON files in /lib/mock-data/ |
| NextAuth / Clerk / Auth libraries | Authentication is simulated with a role toggle. Real auth is Phase 2 with Supabase Auth. | Simple React context with hardcoded roles |
| Storybook | Adds significant devtool complexity (build pipeline, config, stories). For a prototype with one developer and rapid iteration, test components in the app directly. | Develop and test in-app |
| Jest / Vitest / Testing libraries | No tests for a prototype meant for client validation. Tests add value when the architecture stabilizes (Phase 2). Writing tests against mock data is testing the mocks, not the app. | Manual testing during prototype |
| Framer Motion (for MVP) | Animation polish is Phase 2 work. Every animation added now is a distraction from getting POS flows right. Exception: if a micro-interaction is essential for UX clarity (e.g., cart item added confirmation), use CSS transitions instead. | CSS transitions (Tailwind `transition-*` utilities) |
| TanStack Query (React Query) | There are no API calls to cache or manage. TanStack Query solves server-state synchronization -- irrelevant for static mock data. Add it in Phase 2 when Supabase API calls exist. | Direct import of mock data JSON |

---

## Stack Patterns by Variant

**If staying on Next.js 14 (as per original PRD):**
- Use React 18 (ships with Next.js 14)
- Use Tailwind CSS 3.4.x (guaranteed compatibility with shadcn/ui)
- Everything else remains the same
- This is the safer choice if the team wants zero risk of compatibility issues

**If upgrading to Next.js 15 (recommended):**
- Use React 19 (ships with Next.js 15)
- Verify Tailwind v4 compatibility with shadcn/ui before adopting; fall back to 3.4.x if issues
- Benefit: latest App Router improvements, better static export, newer React features
- This is the better long-term choice since Phase 2 will be built on this foundation

**For pure static export (no server at all):**
- Add `output: 'export'` in `next.config.js`
- All pages must be client components or statically generated
- No API routes, no server actions, no middleware
- This is the correct mode for a mock-data prototype deployed to Vercel static hosting

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Next.js 15.x | React 19.x, Tailwind 4.x or 3.4.x | Verify shadcn/ui Tailwind v4 support at project init time |
| Next.js 14.x | React 18.x, Tailwind 3.4.x | Safe fallback, all shadcn/ui examples target this |
| shadcn/ui (latest CLI) | Next.js 14 or 15, Tailwind 3.4+ or 4.x | CLI auto-detects framework and configures accordingly |
| Recharts 2.x | React 18 or 19 | No known issues with either React version |
| date-fns 4.x | Any React version | Pure utility library, no React dependency |
| react-day-picker 9.x | React 18 or 19 | Used internally by shadcn/ui Calendar component |

---

## POS-Specific Stack Considerations

These considerations are specific to the touch-friendly POS interface requirement:

### Touch Target Sizing
- Minimum button size: 120x80px (per PRD requirement, exceeds Apple's 44x44pt guideline)
- Use Tailwind's arbitrary values: `min-w-[120px] min-h-[80px]`
- shadcn/ui Button component needs a custom `size="pos"` variant added to the component source

### Zero-Scroll POS Layout
- Use CSS Grid (`grid-cols-3` or `grid-cols-4`) for product grids that fill the viewport
- `h-screen` or `h-dvh` (dynamic viewport height for mobile) on the POS container
- `overflow-hidden` on the POS page, scrollable only in cart sidebar if needed

### Dark Theme for POS
- shadcn/ui supports dark mode natively via CSS variables and `class` strategy
- POS screens use dark background (reduces glare on tablet in outdoor/beach setting)
- Admin/dashboard screens can use light theme
- Implement with a layout-level theme toggle, not a global dark mode

### Tablet 10" Viewport
- Primary breakpoint: 768px-1024px (iPad / Android tablet portrait and landscape)
- Use Tailwind responsive prefixes: `md:` for tablet, `lg:` for desktop admin
- Test with Chrome DevTools device emulation at 1024x768 (landscape) and 768x1024 (portrait)

---

## Sources

| Source | What Was Verified | Confidence |
|--------|-------------------|------------|
| PROJECT.md (local) | Stack constraints from PRD: Next.js 14, Tailwind, shadcn/ui, Recharts, Vercel | HIGH -- primary source of truth |
| Claude training data (cutoff May 2025) | Library versions, API patterns, ecosystem status | MEDIUM -- may be 10 months stale |
| npm registry (attempted) | Could not verify -- Bash tool was denied | NOT VERIFIED |
| Official docs (attempted) | Could not fetch -- WebFetch tool was denied | NOT VERIFIED |
| WebSearch (attempted) | Could not search -- WebSearch tool was denied | NOT VERIFIED |

### Verification TODOs (run before project init)

Before running `create-next-app`, execute these commands to confirm versions:

```bash
npm view next version          # Expected: 15.x
npm view react version         # Expected: 19.x
npm view tailwindcss version   # Expected: 4.x
npm view recharts version      # Expected: 2.15+
npm view typescript version    # Expected: 5.7+
npm view date-fns version      # Expected: 4.x

# Check shadcn/ui Tailwind v4 compatibility
npx shadcn@latest init --help
```

If Next.js 15 is not yet stable or shadcn/ui does not support Tailwind v4, fall back to:
- Next.js 14.2.x + React 18.3.x + Tailwind CSS 3.4.x (known-good combination)

---
*Stack research for: WildWood ERP -- Touch-friendly POS / Resort ERP prototype*
*Researched: 2026-03-01*
