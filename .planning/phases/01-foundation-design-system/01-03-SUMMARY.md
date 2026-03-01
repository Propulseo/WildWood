---
phase: 01-foundation-design-system
plan: 03
subsystem: auth
tags: [react-context, localstorage, hydration, prototype-banner, layout]

# Dependency graph
requires:
  - phase: 01-foundation-design-system/01
    provides: Next.js scaffold, Tailwind v4 globals.css with banner CSS variables, root layout with fonts
  - phase: 01-foundation-design-system/02
    provides: TypeScript Role type in types.ts
provides:
  - AuthProvider context with role state, login/logout/toggleRole, localStorage persistence
  - useAuth() hook for any component to access role state
  - PrototypeBanner component fixed at top of every page
  - Root layout wired with AuthProvider and PrototypeBanner
affects: [01-04, 01-05, 02-pos-cash-register, all-subsequent-phases]

# Tech tracking
tech-stack:
  added: []
  patterns: [isHydrated guard for localStorage-backed context, Server Component banner outside Client Component provider]

key-files:
  created: [src/lib/contexts/auth-context.tsx, src/components/prototype-banner.tsx]
  modified: [src/app/layout.tsx]

key-decisions:
  - "PrototypeBanner placed outside AuthProvider so it renders immediately without waiting for hydration"
  - "Role type imported from @/lib/types (shared with plan 01-02) rather than defined locally"
  - "isHydrated guard returns null during SSR to prevent hydration mismatch"

patterns-established:
  - "isHydrated guard pattern: Client Components reading localStorage must delay rendering until useEffect has run"
  - "Global providers in root layout: AuthProvider wraps children, static components (banner) sit outside"
  - "localStorage sync pattern: separate read (mount) and write (change) effects with isHydrated gate on write"

# Metrics
duration: 6min
completed: 2026-03-01
---

# Phase 1 Plan 3: Auth Context and Prototype Banner Summary

**AuthContext with localStorage-persisted role (admin/staff), isHydrated guard preventing hydration mismatch, non-dismissable prototype banner, and root layout wiring both globally**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-01T08:09:05Z
- **Completed:** 2026-03-01T08:15:28Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created AuthContext with role state (admin/staff), login/logout/toggleRole functions, and localStorage persistence via wildwood-role key
- Implemented isHydrated guard pattern to prevent React hydration mismatch when reading localStorage on mount
- Created PrototypeBanner component with fixed positioning, warm amber background, and "PROTOTYPE -- Donnees fictives" text
- Wired both into root layout: banner outside AuthProvider (renders immediately), AuthProvider wrapping children

## Task Commits

Each task was committed atomically:

1. **Task 1: Create AuthContext with localStorage persistence** - `9cb00ee` (feat)
2. **Task 2: Create PrototypeBanner and update root layout** - `4832a78` (feat)

## Files Created/Modified
- `src/lib/contexts/auth-context.tsx` - AuthProvider with role state, localStorage persistence, isHydrated guard, useAuth hook
- `src/components/prototype-banner.tsx` - Fixed top banner showing "PROTOTYPE -- Donnees fictives" with warm amber background
- `src/app/layout.tsx` - Added AuthProvider wrapping children, PrototypeBanner outside it, pt-7 body padding for banner offset

## Decisions Made
- **PrototypeBanner outside AuthProvider:** The banner is a Server Component with no client dependencies. Placing it outside AuthProvider ensures it renders immediately on page load, even before auth context hydrates. AuthProvider returns null until isHydrated, so anything inside it briefly disappears during hydration.
- **Role imported from types.ts:** Plan 01-02 (running in parallel) created `src/lib/types.ts` with `export type Role = 'admin' | 'staff'`. Importing from the shared types file rather than defining locally avoids duplication.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Any component can now call `useAuth()` to get the current role and call login/logout/toggleRole
- The prototype banner is visible on every page with no way to dismiss it
- Ready for Plan 01-04: Login page, POS layout shell, admin layout shell, and role toggle badge

---
*Phase: 01-foundation-design-system*
*Completed: 2026-03-01*
