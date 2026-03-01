---
phase: 01-foundation-design-system
plan: 04
subsystem: ui
tags: [login, routing, pos-layout, admin-layout, role-toggle, next.js-app-router, route-groups]

# Dependency graph
requires:
  - phase: 01-foundation-design-system/02
    provides: TypeScript Role type in types.ts
  - phase: 01-foundation-design-system/03
    provides: AuthProvider with login/logout/toggleRole, useAuth hook, PrototypeBanner
provides:
  - Login page with Admin/Staff role selection on dark WildWood-branded screen
  - Root redirect logic (/ -> /login or /pos or /dashboard based on auth state)
  - POS layout shell (dark, full-screen, h-dvh, overflow-hidden, pos-theme CSS class)
  - Admin layout shell (cream background, dark wood sidebar with 6 nav links)
  - RoleToggle badge component for instant role switching + logout
  - POS placeholder page with Caisse heading and POS-sized button demos
  - Dashboard placeholder page for Phase 3
affects: [01-05, 02-pos-cash-register, 03-admin-dashboard, all-subsequent-phases]

# Tech tracking
tech-stack:
  added: []
  patterns: [Next.js route groups for layout isolation, Server Component layout importing Client Component children]

key-files:
  created: [src/app/login/page.tsx, src/app/page.tsx, src/app/(pos)/layout.tsx, src/app/(pos)/pos/page.tsx, src/app/(admin)/layout.tsx, src/app/(admin)/dashboard/page.tsx, src/components/role-toggle.tsx]
  modified: []

key-decisions:
  - "POS layout is Server Component importing RoleToggle (Client Component) - no 'use client' needed on layout itself"
  - "Admin layout is Client Component because it uses usePathname() for active link highlighting"
  - "Login page uses router.push (not replace) for login action so user can go back, but uses router.replace for auto-redirect to prevent back-button loops"

patterns-established:
  - "Route groups (pos) and (admin) isolate layout shells without affecting URL paths"
  - "Login redirect pattern: useEffect checks isAuthenticated, redirects if already logged in"
  - "Role-based navigation: role toggle navigates to the other layout after switching"

# Metrics
duration: 2min
completed: 2026-03-01
---

# Phase 1 Plan 4: Login Page, Layout Shells, and Role Toggle Summary

**Login page with Admin/Staff role selection, dark full-screen POS layout with pos-theme, cream admin layout with dark wood sidebar and 6 nav links, instant role toggle badge, and root redirect logic**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-01T08:22:23Z
- **Completed:** 2026-03-01T08:24:39Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Created login page with WildWood branding (Oswald display font, dark background) and two role selection buttons (Admin in wood, Staff in orange)
- Built POS layout shell using route group (pos) with pos-theme class activating dark CSS variables, h-dvh, and overflow-hidden for zero-scroll tablet interface
- Built admin layout shell using route group (admin) with cream background, dark wood sidebar containing 6 navigation links with active highlighting
- Created RoleToggle component as a clickable badge in both layout headers for instant role switching with navigation, plus logout button

## Task Commits

Each task was committed atomically:

1. **Task 1: Create login page and root redirect** - `39aa5a7` (feat)
2. **Task 2: Create POS and Admin layout shells with role toggle** - `312f899` (feat)

## Files Created/Modified
- `src/app/login/page.tsx` - Login page with WildWood branding, Admin/Staff role buttons, auto-redirect for authenticated users
- `src/app/page.tsx` - Root redirect: unauthenticated -> /login, staff -> /pos, admin -> /dashboard
- `src/app/(pos)/layout.tsx` - POS layout shell: pos-theme, h-dvh, overflow-hidden, grid layout with header and main
- `src/app/(pos)/pos/page.tsx` - POS placeholder with Caisse heading and POS button variant demos
- `src/app/(admin)/layout.tsx` - Admin layout: cream background, dark wood sidebar with 6 nav links, active link highlighting via usePathname
- `src/app/(admin)/dashboard/page.tsx` - Dashboard placeholder for Phase 3
- `src/components/role-toggle.tsx` - Clickable Badge component for role switching + LogOut button for deconnexion

## Decisions Made
- **POS layout as Server Component:** The POS layout only renders static structure plus RoleToggle (already a client component). No need for 'use client' on the layout itself -- client components imported into server components work fine in Next.js App Router.
- **Admin layout as Client Component:** Needs usePathname() for active link highlighting, requiring 'use client' directive.
- **router.push vs router.replace:** Login action uses push (allows back navigation), while auto-redirects use replace (prevents back-button loops to intermediary pages).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Complete navigable app skeleton: login -> role selection -> themed layout -> role toggle -> logout -> login
- POS layout shell ready for Phase 2 to build the cash register interface inside it
- Admin layout shell ready for Phase 3 to build dashboard widgets and admin modules
- All 6 admin nav links (Dashboard, Clients, Bungalows, Comptabilite, Newsletter, Instagram) are wired but point to pages not yet created
- Ready for Plan 01-05: Any remaining Phase 1 tasks

---
*Phase: 01-foundation-design-system*
*Completed: 2026-03-01*
