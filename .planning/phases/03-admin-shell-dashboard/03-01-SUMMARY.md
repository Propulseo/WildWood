---
phase: 03-admin-shell-dashboard
plan: 01
subsystem: admin-ui
tags: [sidebar, dashboard, kpi, transactions-context, localStorage]

dependency_graph:
  requires: [01-03, 01-04, 02-03]
  provides: [collapsible-sidebar, dashboard-kpis, admin-transactions-provider]
  affects: [03-02, 04-xx, 05-xx]

tech_stack:
  added: []
  patterns: [isHydrated-guard, useMemo-derived-data, localStorage-persistence]

key_files:
  created: []
  modified:
    - src/app/(admin)/layout.tsx
    - src/app/(admin)/dashboard/page.tsx

decisions:
  - id: 03-01-01
    decision: "Sidebar collapse persists via localStorage key wildwood-sidebar-collapsed with isHydrated guard"
  - id: 03-01-02
    decision: "TransactionsProvider placed in admin layout wrapping children, not in root layout"
  - id: 03-01-03
    decision: "Dashboard uses useMemo for derived stats, not useEffect+useState"
  - id: 03-01-04
    decision: "Revenue center cards use WildWood brand colors: orange (Gym), lime (F&B), bois (Bungalows)"

metrics:
  duration: 2min
  completed: 2026-03-01
---

# Phase 3 Plan 1: Admin Collapsible Sidebar + Dashboard Summary

Collapsible admin sidebar with localStorage persistence and dashboard page showing today's KPIs (revenue, passes, reservations) and revenue breakdown by center using TransactionsContext and useMemo.

## What Was Built

### Task 1: Collapsible Sidebar + TransactionsProvider (de5409e)

Enhanced the admin layout with a fully collapsible sidebar:

- **Collapse toggle**: PanelLeftClose/PanelLeftOpen button at sidebar bottom
- **Width transition**: w-64 (expanded) to w-16 (collapsed) with `transition-all duration-300 ease-in-out`
- **Persistence**: localStorage key `wildwood-sidebar-collapsed` with isHydrated guard pattern (from 01-03)
- **Collapsed mode**: Icons centered, labels hidden, native `title` tooltips on hover
- **Branding**: Full "WildWood / Administration" when expanded, single "W" when collapsed
- **TransactionsProvider**: Wraps `{children}` inside `<main>` for dashboard data access

### Task 2: Dashboard with Stat Cards (1f556ee)

Replaced placeholder dashboard with a data-driven KPI page:

- **Top row (3 cards)**: Revenus du jour, Passes vendus, Nouvelles reservations
- **Bottom row (3 cards)**: Revenue by Gym (orange), F&B (lime), Bungalows (bois)
- **Data pipeline**: useTransactions -> useMemo with isToday(parseISO(txn.date)) filtering
- **Pass counting**: Sums item quantities (not transaction count) for accuracy
- **French labels** throughout, THB currency formatting via toLocaleString()

Expected values on 2026-03-01 (verified against mock data):
- Revenus du jour: 21,590 THB
- Passes vendus: 6
- Nouvelles reservations: 0
- Gym: 19,600 THB | F&B: 1,990 THB | Bungalows: 0 THB

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| 03-01-01 | localStorage with isHydrated guard for sidebar state | Avoids SSR mismatch; consistent with 01-03 pattern |
| 03-01-02 | TransactionsProvider in admin layout, not root | Only admin pages need transaction data; keeps POS isolated |
| 03-01-03 | useMemo for derived stats | Derived data should not use useEffect+useState; avoids extra renders |
| 03-01-04 | Brand colors for revenue centers | Visual distinction using established WildWood palette |

## Deviations from Plan

None -- plan executed exactly as written.

## Commit Log

| Commit | Type | Description |
|--------|------|-------------|
| de5409e | feat | Add collapsible sidebar and TransactionsProvider to admin layout |
| 1f556ee | feat | Build dashboard with stat cards and revenue breakdown |

## Verification Results

- [x] `npm run build` passes without errors
- [x] isCollapsed state management in layout.tsx
- [x] TransactionsProvider wrapping children in layout.tsx
- [x] PanelLeftClose/PanelLeftOpen toggle icons
- [x] localStorage persistence for sidebar collapse
- [x] transition-all CSS animation class
- [x] 'use client' directive on dashboard page
- [x] useTransactions hook for data access
- [x] useMemo for reactive stat computation
- [x] isToday + parseISO for date filtering
- [x] CardTitle shadcn Card components
- [x] toLocaleString THB currency formatting

## Next Phase Readiness

Plan 03-02 can proceed immediately. The TransactionsProvider is now available in the admin layout, and the dashboard pattern establishes the template for additional admin pages.
