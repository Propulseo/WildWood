---
phase: 01-foundation-design-system
plan: 02
subsystem: database
tags: [typescript, mock-data, json, data-access, types]

# Dependency graph
requires:
  - phase: 01-01
    provides: Project scaffold with Next.js 16, Tailwind v4, shadcn/ui, tsconfig with resolveJsonModule
provides:
  - TypeScript interfaces for all domain objects (Client, GymPass, FnbProduct, Bungalow, Reservation, Transaction, TransactionItem, Role)
  - Realistic mock data with real WildWood pricing across 5 JSON files
  - Async data-access.ts abstraction layer (Phase 2 migration seam)
affects: [02-pos-gym, 03-pos-fnb, 04-clients-bungalows, 05-accounting, 06-newsletter-instagram]

# Tech tracking
tech-stack:
  added: []
  patterns: [data-access-abstraction, french-domain-naming, typed-json-mock-data]

key-files:
  created:
    - src/lib/types.ts
    - src/lib/mock-data/clients.json
    - src/lib/mock-data/gym-passes.json
    - src/lib/mock-data/fnb-products.json
    - src/lib/mock-data/bungalows.json
    - src/lib/mock-data/transactions.json
    - src/lib/data-access.ts
  modified: []

key-decisions:
  - "French field names in interfaces matching WildWood domain (prenom, nom, centreRevenu, etc.)"
  - "data-access.ts is the sole importer of mock-data/ -- Phase 2 migration contract"
  - "All monetary values as integers in Thai Baht (no decimals)"

patterns-established:
  - "Data access pattern: all components use async functions from data-access.ts, never import JSON directly"
  - "ID format convention: cli-XXX, pass-XX, fnb-XXX, bung-X, res-XXX, txn-XXX"
  - "French domain naming: all interfaces use French field names matching the WildWood business domain"

# Metrics
duration: 5min
completed: 2026-03-01
---

# Phase 1 Plan 2: Data Layer Summary

**TypeScript types for 8 domain objects, 5 JSON mock data files with real WildWood pricing, and async data-access.ts abstraction layer**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-01T08:08:56Z
- **Completed:** 2026-03-01T08:14:10Z
- **Tasks:** 3
- **Files created:** 7

## Accomplishments
- 8 TypeScript interfaces/types covering all WildWood domain objects with JSDoc comments
- 35 fictional clients with international name mix reflecting Koh Tao clientele (8 residents, 27 visitors)
- 9 gym passes with exact real pricing from PROJECT.md (350-15000 baht)
- 20 F&B products across 6 categories with emojis for Thai staff recognition
- 8 bungalows with 25 reservations spanning Feb-Apr 2026
- 90 historical transactions with plausible revenue distribution and full referential integrity
- Async data-access.ts layer ensuring zero direct JSON imports from any component

## Task Commits

Each task was committed atomically:

1. **Task 1: Create TypeScript type definitions** - `53b4561` (feat)
2. **Task 2: Create realistic mock data JSON files** - `fcf286a` (feat)
3. **Task 3: Create data access abstraction layer** - `f6a138c` (feat)

## Files Created/Modified
- `src/lib/types.ts` - All 8 TypeScript interfaces/types for WildWood domain objects
- `src/lib/mock-data/clients.json` - 35 fictional clients with international names
- `src/lib/mock-data/gym-passes.json` - 9 pass types with exact WildWood pricing
- `src/lib/mock-data/fnb-products.json` - 20 F&B products across 6 categories with emojis
- `src/lib/mock-data/bungalows.json` - 8 bungalows with 25 reservations (Feb-Apr 2026)
- `src/lib/mock-data/transactions.json` - 90 transactions spanning Jan-Mar 2026
- `src/lib/data-access.ts` - Async abstraction layer with 6 exported functions

## Decisions Made
- French field names in all interfaces (prenom, nom, centreRevenu, methode) to match domain language
- ID conventions: cli-XXX, pass-XX, fnb-XXX, bung-X, res-XXX, txn-XXX for consistent referential integrity
- All monetary values as integer Thai Baht (no decimals) matching real-world pricing
- data-access.ts uses `as Type[]` casts intentionally -- these disappear in Phase 2 with Supabase typed responses

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Complete typed data layer ready for consumption by all UI components
- Any component can call `const clients = await getClients()` and receive properly typed `Client[]` data
- Mock data is realistic enough to demo to the WildWood client without embarrassment
- Phase 2 migration path is clear: only data-access.ts internals change when Supabase replaces JSON

---
*Phase: 01-foundation-design-system*
*Completed: 2026-03-01*
