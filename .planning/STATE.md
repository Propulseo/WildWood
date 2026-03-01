# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** Le staff terrain doit pouvoir enregistrer un encaissement en moins de 3 clics sur tablette, sans formation -- si la caisse POS n'est pas instantanee et intuitive, rien d'autre n'a de valeur.
**Current focus:** Phase 4 - Core Admin Modules

## Current Position

Phase: 4 of 7 (Core Admin Modules)
Plan: 1 of 4 in current phase
Status: In progress
Last activity: 2026-03-01 - Completed 04-01-PLAN.md (Client List Page)

Progress: [████████░░] ~80%

## Performance Metrics

**Velocity:**
- Total plans completed: 13
- Average duration: 3.1min
- Total execution time: 40min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Foundation | 5/5 | 22min | 4.4min |
| 2 - POS Cash Register | 4/4 | 9min | 2.3min |
| 3 - Admin Shell + Dashboard | 2/2 | 3min | 1.5min |
| 4 - Core Admin Modules | 1/4 | 3min | 3.0min |

**Recent Trend:**
- Last 5 plans: 02-04 (2min), 03-01 (2min), 03-02 (1min), 04-01 (3min)
- Trend: Consistent

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: 7 phases derived from research. POS is Phase 2 (core value). Foundation first to establish types and mock data layer.
- [Roadmap]: Newsletter + Instagram are lowest priority (Phase 6). Can be reduced to placeholders if time is short.
- [01-01]: Used stone base color for shadcn/ui init, then replaced with full WildWood OKLCH palette
- [01-01]: Oswald variable font for display headings (weights 200-700), Inter for body text
- [01-01]: POS button variants use Tailwind utility classes mapped via @theme inline, not hardcoded OKLCH
- [01-01]: No React Compiler (prototype speed priority)
- [01-01]: No tailwind.config.js (CSS-first Tailwind v4)
- [01-02]: French field names in all interfaces matching WildWood domain (prenom, nom, centreRevenu)
- [01-02]: data-access.ts is sole importer of mock-data/ -- Phase 2 migration contract
- [01-02]: ID conventions: cli-XXX, pass-XX, fnb-XXX, bung-X, res-XXX, txn-XXX
- [01-03]: PrototypeBanner outside AuthProvider for immediate rendering (no hydration delay)
- [01-03]: isHydrated guard pattern: Client Components reading localStorage must delay rendering until useEffect runs
- [01-03]: Role type imported from shared types.ts, not defined locally in auth-context
- [01-04]: POS layout is Server Component (no 'use client'), Admin layout is Client Component (needs usePathname)
- [01-04]: Route groups (pos) and (admin) isolate layout shells without affecting URL paths
- [01-04]: router.push for login actions, router.replace for auto-redirects (prevents back-button loops)
- [01-05]: POS layout height uses calc(100dvh-1.75rem) to account for prototype banner offset
- [02-01]: npm used instead of pnpm (project has package-lock.json, pnpm not installed)
- [02-01]: Server Component page fetches all data via data-access.ts Promise.all, passes as props to client PosRegister
- [02-01]: Cart state via useReducer with typed CartAction discriminated union (ADD_ITEM, REMOVE_ITEM, UPDATE_QUANTITY, SET_CLIENT, CLEAR_CART)
- [02-01]: POS register two-column grid: grid-cols-[1fr_320px] (products left, 320px cart right)
- [02-02]: FnbGrid uses useState without 'use client' -- client boundary propagates from PosRegister
- [02-02]: Category filter uses Button variant toggle (pos/pos-accent) instead of nested Tabs
- [02-02]: Gym pass handler sets selectedPass + clientDialogOpen state (consumed by Plan 03 dialog)
- [02-02]: F&B items dispatch ADD_ITEM directly to cart reducer (no client popup for bar sales)
- [02-03]: React 19 context syntax: <TransactionsContext value={...}> not .Provider
- [02-03]: Dialog portal pos-theme class on DialogContent for dark theme inheritance
- [02-03]: Bungalow resident detection: client.bungalowId + active reservation (statut en-cours)
- [02-03]: Transaction ID format: txn-{last 3 digits of Date.now()}
- [02-03]: Gym pass items 0 THB for bungalow residents; F&B always charged
- [02-03]: New contexts in src/contexts/ (TransactionsContext)
- [03-01]: Custom collapsible sidebar (NOT shadcn Sidebar -- Next.js 16 bug #9189)
- [03-01]: Sidebar collapse persists via localStorage key wildwood-sidebar-collapsed with isHydrated guard
- [03-01]: TransactionsProvider placed in admin layout wrapping children, not in root layout
- [03-01]: Dashboard uses useMemo for derived stats, not useEffect+useState
- [03-01]: Revenue center cards use WildWood brand colors: orange (Gym), lime (F&B), bois (Bungalows)
- [04-01]: Client-side filtering with no debounce (35 items instant)
- [04-01]: Pass type derived from most recent gym-pass transaction per client via useMemo
- [04-01]: Period filter uses date-fns isAfter/subDays/startOfYear with preset options

### Pending Todos

None.

### Blockers/Concerns

- Version verification RESOLVED: Next.js 16.1.6 / React 19.2.3 / Tailwind v4.x / shadcn/ui confirmed compatible and building cleanly
- Tablet testing: POS must be tested on a real 10" tablet before client demo (hard requirement from research)

## Session Continuity

Last session: 2026-03-01
Stopped at: Completed 04-01-PLAN.md (Client List Page)
Resume file: None
