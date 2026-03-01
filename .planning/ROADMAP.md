# Roadmap: WildWood ERP

## Overview

WildWood ERP is built in 7 phases that move from invisible infrastructure to the core money-making screen (POS), then expand outward into admin modules, and finish with polish and deployment. The POS cash register is the center of gravity -- it ships in Phase 2 and every subsequent phase either feeds data into it or reads data out of it. The entire MVP is a frontend-only prototype with mock data, validated on a real tablet before the client demo.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation + Design System** - Project scaffold, WildWood theme, type system, mock data, layout shells, auth simulation
- [x] **Phase 2: POS Cash Register** - Touch-first gym pass and F&B sales interface with cart and checkout
- [x] **Phase 3: Admin Shell + Dashboard** - Sidebar navigation layout and today's key numbers dashboard
- [x] **Phase 4: Core Admin Modules** - Client database with search/profiles and bungalow calendar with occupancy
- [ ] **Phase 5: Accounting + Reports** - Daily/monthly/annual revenue views, expense entry, Recharts graphs
- [ ] **Phase 6: Secondary Modules** - Newsletter contact management and Instagram stats dashboard
- [ ] **Phase 7: Polish + Deployment** - Loading states, error handling, prototype banners enforcement, Vercel deploy

## Phase Details

### Phase 1: Foundation + Design System
**Goal**: Every subsequent module can be built against a working, correctly-themed skeleton with realistic mock data and typed interfaces
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07
**Success Criteria** (what must be TRUE):
  1. User can toggle between admin and staff roles on a simulated login screen, and the selected role persists across page navigation
  2. The WildWood color palette (orange #C94E0A, bois #8B6B3D, lime #7AB648) is applied globally, with POS screens using a dark background and admin screens using a light sidebar layout
  3. POS layout renders at 100vh with no scroll, and all interactive elements meet the 120x80px minimum size on a 1024px-wide viewport
  4. Mock data files contain realistic WildWood pricing (9 gym passes, 6 F&B categories) with plausible client names and dates, accessible only through lib/data-access.ts (no direct JSON imports in components)
  5. A "PROTOTYPE -- Donnees fictives" banner is visible on every screen
**Plans**: 5 plans

Plans:
- [x] 01-01-PLAN.md — Scaffold Next.js 16 project and configure WildWood design system
- [x] 01-02-PLAN.md — Create TypeScript types, realistic mock data, and data access layer
- [x] 01-03-PLAN.md — Create AuthContext with localStorage persistence and prototype banner
- [x] 01-04-PLAN.md — Create login page, POS layout shell, admin layout shell, and role toggle
- [x] 01-05-PLAN.md — Automated verification and visual checkpoint for Phase 1 completion

### Phase 2: POS Cash Register
**Goal**: Staff can ring up a gym pass or F&B sale in under 3 taps on a tablet, from product selection through checkout confirmation
**Depends on**: Phase 1
**Requirements**: POS-01, POS-02, POS-03, POS-04, POS-05, POS-06, POS-07, POS-08
**Success Criteria** (what must be TRUE):
  1. User sees a grid of 9 gym pass types with correct WildWood prices (350 to 15,000 baht), each button at least 120x80px, on a dark background with no scrolling required
  2. Tapping a gym pass opens a client popup where the user can enter name/email/phone, and existing clients are detected by email or phone match
  3. User can switch to the F&B tab and see products organized by 6 categories (bowls, cocktails proteines, cafes, smoothies, boissons, snacks) with correct pricing
  4. User can add multiple items to a cart, see a running total, and complete the sale with an "Encaisser" button that shows visual confirmation feedback
  5. When a bungalow resident is detected, a badge indicates their gym pass is free and no transaction amount is charged
**Plans**: 4 plans

Plans:
- [x] 02-01-PLAN.md — Install shadcn components and create POS register shell with cart state
- [x] 02-02-PLAN.md — Build gym pass grid and F&B product grid with tabbed navigation
- [x] 02-03-PLAN.md — Client popup, bungalow detection, cart sidebar, and checkout flow
- [x] 02-04-PLAN.md — Automated verification and visual checkpoint for Phase 2

### Phase 3: Admin Shell + Dashboard
**Goal**: The owner can open the admin interface and immediately see today's key business numbers without clicking anything
**Depends on**: Phase 2
**Requirements**: DASH-01, DASH-02
**Success Criteria** (what must be TRUE):
  1. Admin layout displays a collapsible sidebar with icon-first navigation linking to all admin modules (Dashboard, Clients, Bungalows, Comptabilite, Newsletter, Instagram)
  2. Dashboard page shows today's revenue total, number of passes sold, and number of new reservations as prominent stat cards visible within 1 second of page load
  3. Dashboard displays a revenue summary broken down by the 3 revenue centers (Gym, F&B, Bungalows)
**Plans**: 2 plans

Plans:
- [x] 03-01-PLAN.md — Collapsible admin sidebar + dashboard stat cards and revenue breakdown
- [x] 03-02-PLAN.md — Automated verification and visual checkpoint for Phase 3

### Phase 4: Core Admin Modules
**Goal**: The owner can look up any client's full history and see bungalow occupancy at a glance on the calendar
**Depends on**: Phase 3
**Requirements**: CLI-01, CLI-02, CLI-03, CLI-04, CLI-05, CLI-06, BUNG-01, BUNG-02, BUNG-03, BUNG-04
**Success Criteria** (what must be TRUE):
  1. Client list page shows a paginated table with nom, prenom, email, telephone, type de pass, derniere visite, and nombre de visites, with search-as-you-type filtering by name, email, or phone
  2. User can filter the client list by type de pass or by time period
  3. Clicking a client opens a profile page showing their purchase history, total amount spent, visit dates, and a "Resident bungalow" badge if they have an active reservation
  4. Each client profile has an "Ajouter a la newsletter" button
  5. Bungalow calendar displays a month view with 8 bungalow rows, showing reservations with client name, dates, number of nights, amount, and status, plus a weekly/monthly occupancy rate
**Plans**: 4 plans

Plans:
- [x] 04-01-PLAN.md — Install shadcn Table/Select and build client list with search, filters, pagination
- [x] 04-02-PLAN.md — Build bungalow calendar with CSS grid, reservation bars, and occupancy rates
- [x] 04-03-PLAN.md — Build client profile page with history, stats, resident badge, newsletter toggle
- [x] 04-04-PLAN.md — Automated verification and visual checkpoint for Phase 4

### Phase 5: Accounting + Reports
**Goal**: The owner can answer "how much did I make today/this month/this year?" broken down by revenue center, and track expenses
**Depends on**: Phase 4
**Requirements**: COMPT-01, COMPT-02, COMPT-03, COMPT-04, COMPT-05, COMPT-06
**Success Criteria** (what must be TRUE):
  1. Daily view shows today's total revenue broken down by 3 revenue centers (Bungalows, Passes Gym, F&B) plus today's expenses
  2. Monthly view displays a Recharts bar chart of revenue vs expenses per month, with a recap table and net balance
  3. Annual view shows a 12-month table with totals for each revenue center
  4. User can manually enter an expense with category, amount, date, and note
**Plans**: 3 plans

Plans:
- [ ] 05-01-PLAN.md — Expense type, mock data, data-access function, and ExpensesContext
- [ ] 05-02-PLAN.md — Comptabilite page with daily/monthly/annual views and expense entry dialog
- [ ] 05-03-PLAN.md — Automated verification and visual checkpoint for Phase 5

### Phase 6: Secondary Modules
**Goal**: The owner has a basic view of newsletter contacts and Instagram performance, even if these modules are lighter than the core ones
**Depends on**: Phase 5
**Requirements**: NEWS-01, NEWS-02, NEWS-03, INSTA-01, INSTA-02, INSTA-03, INSTA-04
**Success Criteria** (what must be TRUE):
  1. Newsletter page shows a contact list with name, email, date added, and source
  2. User can create a campaign draft with title, subject line, and rich text body (no actual sending)
  3. Newsletter page shows a mock history of past campaigns with date, subject, and number of recipients
  4. Instagram page displays follower count with 30-day evolution and engagement rate cards
  5. Instagram page shows a top-5 posts table by engagement (with thumbnail and stats) and a Recharts line chart of follower growth over 3/6/12 month toggles
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

### Phase 7: Polish + Deployment
**Goal**: The prototype is demo-ready on Vercel with proper loading states, error handling, and clear "this is a prototype" framing throughout
**Depends on**: Phase 6
**Requirements**: DEPLOY-01
**Success Criteria** (what must be TRUE):
  1. Every page displays a loading skeleton while data loads (no blank screens, no layout shift)
  2. Error states show a French-language message ("Quelque chose n'a pas marche") with a retry option
  3. The prototype is deployed to Vercel with a shareable demo link and noindex meta tags
  4. A "Reinitialiser les donnees" button in the admin area resets all in-memory state to mock defaults
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. Foundation + Design System | 5/5 | Complete | 2026-03-01 |
| 2. POS Cash Register | 4/4 | Complete | 2026-03-01 |
| 3. Admin Shell + Dashboard | 2/2 | Complete | 2026-03-01 |
| 4. Core Admin Modules | 4/4 | Complete | 2026-03-01 |
| 5. Accounting + Reports | 0/3 | Not started | - |
| 6. Secondary Modules | 0/TBD | Not started | - |
| 7. Polish + Deployment | 0/TBD | Not started | - |
