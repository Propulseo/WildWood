---
phase: "05-accounting-reports"
plan: "01"
subsystem: "data-layer"
tags: ["expenses", "context", "mock-data", "types"]
depends_on:
  requires: ["01-02"]
  provides: ["expense-type", "expenses-context", "mock-expenses", "getExpenses"]
  affects: ["05-02", "05-03"]
tech_stack:
  added: []
  patterns: ["context-provider", "data-access-layer"]
key_files:
  created:
    - "src/lib/mock-data/expenses.json"
    - "src/contexts/expenses-context.tsx"
  modified:
    - "src/lib/types.ts"
    - "src/lib/data-access.ts"
    - "src/app/(admin)/layout.tsx"
decisions:
  - id: "05-01-exp-id"
    decision: "Expense IDs use exp-XXX convention matching project ID patterns"
  - id: "05-01-categories"
    decision: "5 expense categories: Fournitures, Salaires, Maintenance, Marketing, Divers"
  - id: "05-01-provider-nesting"
    decision: "ExpensesProvider wraps TransactionsProvider (outer position) in admin layout"
metrics:
  duration: "2min"
  completed: "2026-03-01"
---

# Phase 5 Plan 1: Expense Data Layer Summary

**Expense type, 25 mock expenses across 5 categories and 12 months, ExpensesContext with addExpense wired into admin layout.**

## What Was Done

### Task 1: Add Expense type, mock data, and data-access function
- Added `Expense` interface to `src/lib/types.ts` with id, categorie (union of 5), montant, date, note fields
- Created `src/lib/mock-data/expenses.json` with 25 realistic mock expenses:
  - Spans March 2025 through March 2026 (12 months)
  - All 5 categories covered: Fournitures, Salaires, Maintenance, Marketing, Divers
  - Realistic THB amounts: Salaires 18000-25000, Maintenance 3500-14000, Fournitures 2800-7200, Marketing 1500-4800, Divers 850-2200
  - French notes throughout (e.g., "Reparation toit bungalow 3", "Salaire Nong mars")
  - 3 expenses on 2026-03-01 for daily view data
- Added `getExpenses()` to `src/lib/data-access.ts` following existing pattern

### Task 2: Create ExpensesContext and wire into admin layout
- Created `src/contexts/expenses-context.tsx` following exact TransactionsContext pattern:
  - React 19 context syntax (`<ExpensesContext value={...}>` not `.Provider`)
  - `useExpenses()` hook with null-check error throw
  - `addExpense` prepends to array
- Wrapped admin layout children: `ExpensesProvider > TransactionsProvider > children`

## Commits

| Hash | Message |
|------|---------|
| `7969526` | feat(05-01): add Expense type, mock data, and data-access function |
| `cc0409c` | feat(05-01): create ExpensesContext and wire into admin layout |

## Verification Results

- `npx tsc --noEmit`: Zero errors
- `npm run build`: Success, all 9 routes generated
- expenses.json: 25 entries, 5 categories, date range 2025-03-15 to 2026-03-01
- Admin layout: Both ExpensesProvider and TransactionsProvider nested correctly

## Deviations from Plan

None -- plan executed exactly as written.

## Next Phase Readiness

Plan 05-02 can proceed immediately. The following are available:
- `useExpenses()` hook callable from any admin page
- `Expense` type exported from types.ts
- 25 mock expenses with enough spread for charts and tables
- `addExpense()` for the expense entry form
