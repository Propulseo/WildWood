---
phase: 07-polish-deployment
plan: 01
subsystem: ui-polish
tags: [skeleton, loading-state, ux, shadcn]
requires: [phase-06]
provides: [skeleton-loading-ui, polished-loading-states]
affects: []
tech-stack:
  added: [shadcn-skeleton]
  patterns: [inline-skeleton-component, early-return-loading-guard]
key-files:
  created:
    - src/components/ui/skeleton.tsx
    - src/app/(pos)/pos/loading.tsx
  modified:
    - src/app/(admin)/dashboard/page.tsx
    - src/app/(admin)/clients/page.tsx
    - src/app/(admin)/clients/[id]/page.tsx
    - src/app/(admin)/bungalows/page.tsx
    - src/app/(admin)/newsletter/page.tsx
    - src/app/(admin)/instagram/page.tsx
decisions:
  - id: "07-01-inline-skeletons"
    description: "Skeleton functions defined inline within each page file (not separate component files) for prototype simplicity"
  - id: "07-01-comptabilite-skip"
    description: "Comptabilite page skipped for skeleton -- renders immediately from context with no empty-state flash"
metrics:
  duration: "3min"
  completed: "2026-03-01"
---

# Phase 7 Plan 1: Loading Skeletons Summary

**One-liner:** shadcn Skeleton component installed and loading skeleton UI added to all 6 admin pages plus POS loading.tsx to eliminate blank screens during data fetching.

## What Was Done

### Task 1: Install Skeleton and add loading states to all admin pages

- Installed shadcn Skeleton component (`npx shadcn@latest add skeleton --yes`)
- Added inline skeleton functions and early-return loading guards to 6 admin pages:
  - **Dashboard:** `DashboardSkeleton` -- 3 stat cards + section heading + 3 revenue cards with Skeleton, triggers on `transactions.length === 0`
  - **Clients:** `ClientsSkeleton` -- heading + search/filter bar + 7-column table with 5 skeleton rows, triggers on `clients.length === 0`
  - **Client profile:** `ProfileSkeleton` -- avatar circle + name + 3 stat cards + 4-row purchase history table, replaces old "Chargement..." text on `!client`
  - **Bungalows:** `BungalowsSkeleton` -- heading + month nav + large calendar placeholder (h-[500px]) + 2 occupancy cards, triggers on `bungalows.length === 0`
  - **Newsletter:** `NewsletterSkeleton` -- heading + button + tab bar + 4-column table with 5 rows, triggers on `contacts.length === 0 && campagnes.length === 0`
  - **Instagram:** `InstagramSkeleton` -- heading + 4 stat cards + table + chart area (h-[300px]), replaces `return null` on `!stats`
- **Comptabilite:** Correctly skipped -- renders immediately from context, no loading flash

### Task 2: Create POS loading.tsx

- Created `src/app/(pos)/pos/loading.tsx` for Next.js Suspense boundary around the POS Server Component
- Two-column grid matching `grid-cols-[1fr_320px]`: product grid skeleton (tab bar + 3x3 button grid) and cart sidebar skeleton (heading + 3 items + checkout button)

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Inline skeleton functions per page file | Prototype simplicity -- no extra component files, each page self-contained |
| Comptabilite excluded from skeletons | Renders immediately from context providers, no empty-state flash to guard against |
| `length === 0` as loading signal | Prototype uses guaranteed mock data, so empty array reliably indicates pre-load state |

## Deviations from Plan

None -- plan executed exactly as written.

## Verification

- `npm run build` completes with 0 errors
- All 6 admin pages import Skeleton and have early-return loading guards
- No `return null` loading states remain in any page
- No "Chargement..." text remains
- `src/app/(pos)/pos/loading.tsx` exists and exports default component
- Comptabilite correctly has no skeleton (renders from context)

## Next Phase Readiness

All pages now show skeleton UI during data loading. No blank screens remain in the application.
