# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** Le staff terrain doit pouvoir enregistrer un encaissement en moins de 3 clics sur tablette, sans formation -- si la caisse POS n'est pas instantanee et intuitive, rien d'autre n'a de valeur.
**Current focus:** Phase 1 - Foundation + Design System

## Current Position

Phase: 1 of 7 (Foundation + Design System)
Plan: 4 of 5 in current phase
Status: In progress
Last activity: 2026-03-01 - Completed 01-04-PLAN.md

Progress: [█████░░░░░] ~25%

## Performance Metrics

**Velocity:**
- Total plans completed: 4
- Average duration: 4.8min
- Total execution time: 19min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Foundation | 4/5 | 19min | 4.8min |

**Recent Trend:**
- Last 5 plans: 01-01 (6min), 01-02 (5min), 01-03 (6min), 01-04 (2min)
- Trend: Accelerating, 01-04 fastest yet

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

### Pending Todos

None.

### Blockers/Concerns

- Version verification RESOLVED: Next.js 16.1.6 / React 19.2.3 / Tailwind v4.x / shadcn/ui confirmed compatible and building cleanly
- Tablet testing: POS must be tested on a real 10" tablet before client demo (hard requirement from research)

## Session Continuity

Last session: 2026-03-01
Stopped at: Completed 01-04-PLAN.md
Resume file: None
