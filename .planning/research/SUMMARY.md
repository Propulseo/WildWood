# Project Research Summary

**Project:** WildWood ERP — Beach Fitness Resort POS & Management System
**Domain:** Touch-first POS / Resort ERP (frontend-only MVP prototype)
**Researched:** 2026-03-01
**Confidence:** MEDIUM (stack unverified against live registries; architecture HIGH; features and pitfalls MEDIUM based on domain expertise)

## Executive Summary

WildWood ERP is a custom resort management tool for a small beach fitness resort on Koh Tao (8 bungalows, gym, F&B bar). The product has no exact market equivalent: it must combine a touch-first POS (gym passes + food & beverage in one screen), a bungalow calendar, a client database, and lightweight accounting into a single unified app. The MVP is a frontend-only prototype with realistic mock data, deployed to Vercel, designed to validate the UX with the owner before committing to a Phase 2 backend (Supabase). The recommended stack — Next.js 15 App Router, Tailwind CSS, shadcn/ui, Recharts — is well-suited to this prototype-first approach and leaves clean migration seams for Phase 2.

The recommended architecture uses Next.js route groups to serve two fundamentally different shells from one codebase: a dark, full-screen touch interface for POS (staff tablet), and a light sidebar-based dashboard for admin (owner laptop/tablet). All data flows through a typed abstraction layer (`lib/data-access.ts`) backed by mock JSON files. This single pattern decision is what makes Phase 2 migration tractable — only the data access layer changes, not the 50+ components built on top of it. State is handled by three focused React Contexts (Auth, Cart, Transactions) rather than any external state library.

The single greatest risk to this project is not technical: it is demo framing. A polished frontend prototype with realistic mock data is indistinguishable from a working product to a non-technical client. Without explicit prototype banners, state persistence across refreshes (via localStorage), and a clear "what this is / isn't" framing document, the demo will mislead the owner and create expectations that Phase 2 cannot immediately meet. The second major risk is POS usability: buttons must be tested on a real 10" tablet with wet fingers in outdoor light, not just clicked with a mouse in Chrome DevTools. Both risks are preventable in Phase 1 if addressed from day one, not retrofitted later.

---

## Key Findings

### Recommended Stack

The project should be built on **Next.js 15 App Router** with **React 19**, **Tailwind CSS** (v4 if shadcn/ui supports it at init time, fallback to 3.4.x), **shadcn/ui** (installed via CLI, not npm), and **Recharts** for charts. TypeScript 5.7+ is non-negotiable — typed mock data interfaces become the Supabase schema contract in Phase 2. Supporting libraries are minimal: `date-fns` for date math, `lucide-react` for icons (bundled with shadcn/ui), and `react-day-picker` via the shadcn Calendar component. No i18n library, no ORM, no state management library beyond React built-ins, no authentication library, no testing framework for the prototype phase.

The most important stack "don'ts" are: no Pages Router, no CSS-in-JS, no Redux, no TanStack Query, no Framer Motion for MVP. Each of these would add overhead without solving any prototype-phase problem.

**Core technologies:**
- **Next.js 15 (App Router):** Framework, routing, static export — App Router is the only actively developed paradigm; `output: 'export'` gives a pure-static Vercel deployment
- **TypeScript 5.7+:** Type safety + API contract definition — typed interfaces in `lib/types.ts` become the Supabase table schema
- **Tailwind CSS 4.x / 3.4.x:** Utility-first styling — use v4 if shadcn/ui supports it at init time, fallback to 3.4.x (safe, battle-tested)
- **shadcn/ui (CLI-installed):** Accessible component primitives with full source ownership — POS buttons need custom `size="pos"` variant (120x80px+)
- **Recharts 2.15+:** React-native charting for accounting and Instagram dashboards — simpler API than Nivo or Visx, sufficient for 5-6 chart types
- **date-fns 4.x:** Date math for pass expiration, calendar periods, accounting aggregation — ESM-native, tree-shakable, better TypeScript support than dayjs

### Expected Features

The product covers six modules: POS Cash Register (gym passes + F&B), Bungalow Calendar, Accounting, Client Database, Newsletter, and Instagram Stats. The key insight from feature research is that **the integration is the feature** — no single competitor product (hotel PMS, POS system, or gym software) covers all six modules. Each individual module can be simpler than a specialist tool because the unified client record and unified revenue accounting are the differentiators.

**Must have (table stakes — P1 for MVP prototype):**
- POS product grid with large touch buttons (120x80px+), category tabs (Gym / F&B), cart with running total, one-tap quantity adjustment, and two-step checkout confirmation
- POS cash-only payment flow — no card terminal needed
- Daily sales summary accessible from POS
- Bungalow calendar (month view, 8 rows, occupancy rate, reservation detail on tap)
- Client list with search and individual profile cards
- Accounting daily dashboard: revenue by center (Gym, F&B, Bungalows) and expense entry
- Role-based UI toggle (staff sees POS only; admin sees everything) — simulated for prototype
- Navigation sidebar with icon-first design (French labels + universal icons)
- Responsive tablet-first layout (1024x768 minimum viewport)
- Dark theme for POS screens (outdoor/bar glare reduction)

**Should have (differentiators — P1/P2):**
- Admin dashboard aggregating today's key numbers across all modules
- Unified client history spanning POS transactions and bungalow stays
- Revenue center attribution on every transaction (feeds accounting automatically)
- "Resident check" badge in POS (flags bungalow guests with free gym pass)
- Expiring pass logic (10 uses within 90 days) — mock visualization in MVP, real logic in Phase 2
- Visual product icons on F&B buttons (universally understood by Thai staff who don't read French)

**Defer to v2+ (with Supabase backend):**
- Persistent data storage (all MVP state is in-memory + localStorage)
- Real authentication (simulated with role toggle for prototype)
- Receipt printing (thermal printer integration)
- Newsletter email sending (Resend integration)
- Instagram API integration (currently mock static data)
- Booking.com import / channel manager sync
- PDF/CSV report export
- Pass expiration tracking with real dates across sessions

**Anti-features — explicitly do not build:**
- Full inventory/stock management
- Multi-currency support
- Native mobile app (iOS/Android) — PWA via Next.js is sufficient
- Multi-language interface — French labels + icons is sufficient for Thai staff
- Granular RBAC — two roles only (staff/admin)

### Architecture Approach

The architecture has four layers: a Presentation Layer split into `(pos)` and `(admin)` Next.js route groups with separate layouts, a Shared UI Layer (shadcn/ui, Recharts wrappers, POS touch components), a State Layer (three focused React Contexts), and a Data Access Layer (typed mock JSON behind a `lib/data-access.ts` abstraction). The most important architectural decision is the route group split — it gives the two shells (dark full-screen POS vs. light sidebar dashboard) clean separation without conditional rendering spaghetti. The second most important decision is the data abstraction layer — all components call typed functions like `getGymPasses()`, never importing JSON directly, so Phase 2 migration only touches one file.

**Major components:**
1. **`app/(pos)/layout.tsx`** — Dark, full-screen, no sidebar, touch-optimized; wraps all POS routes
2. **`app/(admin)/layout.tsx`** — Light sidebar dashboard; wraps all admin/owner routes
3. **`lib/data-access.ts`** — Single source of truth for all data reads; returns `Promise<T>` to simulate async API; Phase 2 replaces internals only
4. **`lib/contexts/cart-context.tsx`** — POS cart via `useReducer`; scoped to POS routes only
5. **`lib/contexts/auth-context.tsx`** — Simulated role (admin/staff) via `useState`; global at root layout
6. **`lib/contexts/transaction-context.tsx`** — In-memory session sales log; global so accounting module reads live POS data
7. **`lib/types.ts`** — Single TypeScript interface file; becomes Supabase schema blueprint in Phase 2
8. **`lib/mock-data/*.json`** — Realistic mock data using real WildWood pricing, real menu items, realistic client names

### Critical Pitfalls

1. **POS touch targets fail in real conditions** — Buttons designed at 120x80px on a desktop feel fine; they fail with wet fingers, sunscreen residue, and stress. Prevention: minimum 12px gap between all POS tappable elements (not just button size), test on a real 10" tablet with wet fingers before the client demo. Mandatory tablet checkpoint before showing the prototype.

2. **Prototype creates false "it's done" impression** — Realistic mock data is indistinguishable from real data to a non-technical owner. Prevention: persistent "PROTOTYPE - Donnees fictives" banner on every screen, localStorage persistence so page refresh doesn't erase data, a "Reset" button to restore defaults, and a 1-page "what this is / isn't" document prepared for the demo meeting.

3. **State lost on page refresh (phantom persistence)** — In-memory React state creates a convincing illusion during a single demo session. The client gets the demo link, adds data at home, refreshes, and everything is gone. Prevention: wrap all React Contexts with localStorage persistence from the start — this is a 2-3 hour investment that prevents a significant trust-breaking incident.

4. **Accounting mental model mismatch** — Building accounting like an accountant (journal entries, chart of accounts) instead of how the owner thinks ("how much did I make today?", "is the bar profitable?"). Prevention: lead with "Chiffre du jour" as the largest number on the dashboard; structure views around three revenue centers (Gym, F&B, Bungalows); use owner language (recettes/depenses), not accounting language. Wireframe before building and describe each element in the owner's words.

5. **Scope creep across 8 modules** — Spending time on Instagram and Newsletter while the POS checkout flow is still broken. Prevention: hard tier system — Tier 1 (POS, Admin Dashboard) must be 90%+ complete before starting Tier 2 (Clients, Bungalows, Accounting); Tier 3 (Newsletter, Instagram) are placeholder-quality screens only. The POS sells the project; everything else is context.

6. **Sun glare and outdoor visibility** — Dark themes designed indoors become unreadable at 2pm on a beach. Prevention: POS must use pure white (#FFFFFF) on very dark backgrounds (#1A1A1A or darker), never subtle grays. All POS text must pass 7:1 contrast ratio (WCAG AAA), not just 4.5:1. WildWood orange (#C94E0A) fails as a text background (3.8:1 contrast). Validate the color palette at maximum screen brightness before building screens.

---

## Implications for Roadmap

Based on the dependency graph in FEATURES.md, the build order in ARCHITECTURE.md, and the phase-to-pitfall mapping in PITFALLS.md, the following phase structure is recommended.

### Phase 1: Foundation + Design System
**Rationale:** Everything depends on the TypeScript type definitions, mock data, and layout shells. Building these first means every subsequent module plugs into a working, correctly-themed skeleton. The design system (color variables, Tailwind config, touch sizing) must be validated for outdoor contrast before any screens are built — retrofitting responsive design and color systems after 6 modules are built costs 2-4 days.
**Delivers:** Project scaffold, WildWood Tailwind theme (color variables, `size="pos"` button variant), TypeScript interfaces in `lib/types.ts`, realistic mock JSON data using real WildWood pricing, `lib/data-access.ts` abstraction, Auth Context with role toggle, root layout with global providers, simulated login page, localStorage persistence wrapper, prototype banner component
**Addresses:** Navigation structure, role-based visibility skeleton
**Avoids:** Desktop-first design (layout shell must be tablet-first from day one), outdoor contrast failures (color palette validated at project init), state phantom persistence (localStorage wired from the start), mock data that doesn't feel like the business (real prices and names from the start)
**Research flag:** Standard Next.js patterns — skip `/gsd:research-phase`

### Phase 2: POS Cash Register (Core Value Proposition)
**Rationale:** The PRD states "if the POS cash register is not instant and intuitive, nothing else has value." POS is the primary data generator — all accounting revenue originates from POS transactions. Building POS second (after foundation) validates the core value proposition immediately and populates the TransactionContext that the accounting module will read. Cart state and checkout flow built here are the most complex client-side state in the entire app.
**Delivers:** `(pos)` route group with dark full-screen layout, Cart Context (useReducer), product grid with 120x80px+ touch buttons, Gym passes page (9 pass types with real pricing), F&B page (6 categories, product grid, cart panel), two-step checkout dialog, TransactionContext integration, client lookup popup (search clients.json)
**Addresses:** POS touch targets, category-based organization, cash-only flow, daily sales running total
**Avoids:** Scroll-based POS layout (fixed 100vh, CSS Grid for product grid), touch targets too small (12px+ gaps enforced in Tailwind config), checkout without confirmation step
**Research flag:** Standard React patterns — skip `/gsd:research-phase`. Mandate physical tablet test before Phase 2 is declared done.

### Phase 3: Admin Shell + Dashboard
**Rationale:** The admin shell (sidebar, header, role toggle) is required by every admin module. Building it before the admin modules means each module plugs into a finished layout. The admin dashboard is the simplest admin page (stat cards only, no complex data fetching) and proves the admin layout works. Dashboard KPIs read from TransactionContext (live from Phase 2 POS) and mock data.
**Delivers:** `(admin)` route group with sidebar layout, collapsible sidebar for tablet, admin header with role toggle display, dashboard page (today's revenue hero number, passes sold, new reservations, occupancy rate as stat cards)
**Addresses:** Role-based module visibility (admin-only modules hidden from staff), admin dashboard "today's key numbers at a glance"
**Avoids:** No "chiffre du jour" visible within 1 second, sidebar not collapsible on tablet
**Research flag:** Standard Next.js + shadcn patterns — skip `/gsd:research-phase`

### Phase 4: Core Admin Modules (Clients + Bungalows)
**Rationale:** Clients and Bungalows are the next highest-value modules after POS. Client database is the foundational entity referenced by every other module — building it here proves the dynamic routing pattern (`/clients/[id]`). Bungalows and Clients have no dependency on each other and can be built in parallel. Both are read-only in the prototype.
**Delivers:** Client list page (paginated table, search-as-you-type), individual client profile page with purchase history, bungalow calendar (month view, 8-row grid, max 3 colors: occupied/free/checkout-today, occupancy rate badge, tap-to-view reservation popover), read-only calendar (no drag-and-drop)
**Addresses:** Client list with search, client profile cards, bungalow calendar (month view), occupancy rate calculation, check-in/check-out status display
**Avoids:** Calendar over-engineering (read-only, no drag-and-drop, no horizontal scroll on tablet, 2-week default view option)
**Research flag:** Calendar grid layout may benefit from `/gsd:research-phase` if the 8-row x 31-day layout proves complex on tablet viewports. Otherwise standard patterns.

### Phase 5: Accounting + Reports
**Rationale:** Accounting depends on the TransactionContext being populated (from Phase 2) and benefits from realistic client and bungalow mock data (Phases 3-4). Recharts integration established here is reused by the Instagram module in Phase 6.
**Delivers:** Period selector (day/month/year toggle), daily revenue dashboard (revenue by center: Gym/F&B/Bungalows), monthly bar chart (income vs expenses per month), expense entry form (5-7 preset categories: staff salary, utilities, supplies, maintenance, food cost, marketing, other), P&L one-page summary
**Addresses:** Owner mental model for accounting (recettes/depenses, three revenue centers, "chiffre du jour" as hero number), revenue trend charts, expense categories tailored to resort operations
**Avoids:** Accounting language (journal, plan comptable), more than 5 KPIs on main view, expense dropdown with 20+ options
**Research flag:** Recharts configuration for multi-series charts may need brief research if specific chart types (stacked bar, dual-axis) hit unexpected API complexity.

### Phase 6: Secondary Modules (Newsletter + Instagram)
**Rationale:** Lowest-priority modules with no dependencies on other business modules. Can be built last, with Recharts patterns from Phase 5 reused for the Instagram trend chart. Time-box: Newsletter at 2-4 hours maximum, Instagram at 2-4 hours maximum. If time is short, these become placeholder screens with "Bientot disponible" labels.
**Delivers:** Newsletter contact list (from client DB emails), campaign creation form (draft only — no real sending), campaign history with status. Instagram mock dashboard: follower count, engagement rate cards, follower growth line chart, post performance table.
**Addresses:** Newsletter contact list, campaign history, Instagram metrics display
**Avoids:** Email sending integration (mock only), Instagram API integration (mock only), spending more than 4 hours on either module
**Research flag:** Skip `/gsd:research-phase` — both are static data displays with no complex logic.

### Phase 7: Polish + Deployment
**Rationale:** Cross-cutting concerns deferred until modules are functionally complete. Loading skeletons, error boundaries, and empty states are polish that would slow module development if done inline.
**Delivers:** Loading skeletons for each page, French-language error states ("Quelque chose n'a pas marche. Reessayez."), empty states with pre-seeded defaults (never show a blank screen), prototype banner visible on every screen, "Reinitialiser les donnees" reset button in admin, Vercel deployment with `noindex` meta tags, final tablet test checkpoint
**Addresses:** Uncanny valley prototype framing (banner + reset button throughout), icon comprehension test (French-icon disconnect check), final touch target verification
**Research flag:** Standard Next.js deployment — skip `/gsd:research-phase`

### Phase Ordering Rationale

- **Foundation before everything:** Types, mock data, and the data access layer are dependencies for all modules. Building them first means no component ever imports JSON directly — the Phase 2 migration path is clean from day one.
- **POS before accounting:** All accounting revenue data originates from POS transactions. TransactionContext must exist before the accounting dashboard has meaningful live data to display.
- **Admin shell before admin modules:** Every admin module plugs into the sidebar layout. Building the shell in isolation before the modules prevents layout rework.
- **Clients and Bungalows before Accounting:** Accounting charts that show revenue by source are more convincing with realistic bungalow and client mock data already defined.
- **Secondary modules last:** Newsletter and Instagram have zero dependencies on other modules and zero modules depending on them. They are the right candidates for time-boxing and potential placeholder treatment if sprint time runs short.
- **Polish and deploy last:** Loading states and error boundaries add complexity during active module development. Deferred polish is the correct tradeoff for a prototype sprint.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Bungalow Calendar):** The 8-row x 31-day calendar grid on a 1024px tablet viewport is a known UX challenge. If the initial layout approach produces cells too small to read, a 2-week default view with swipe navigation may need prototyping before building the full component. Flag for brief research if calendar implementation stalls.
- **Phase 5 (Recharts multi-series):** Stacked bar charts and dual-axis charts in Recharts have known API quirks. If the accounting dashboard requires these chart types, check Recharts 2.x docs before building.

Phases with standard patterns (skip `/gsd:research-phase`):
- **Phase 1** — Standard Next.js scaffold + Tailwind config; well-documented
- **Phase 2** — React Context + useReducer cart state; established pattern
- **Phase 3** — Next.js route groups + shadcn sidebar; documented in official Next.js examples
- **Phase 6** — Static data display with Recharts; patterns established in Phase 5
- **Phase 7** — Vercel deployment; zero-config for Next.js static export

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Core choices (Next.js, Tailwind, shadcn/ui) are HIGH confidence from PRD constraints. Specific version numbers (Next.js 15, Tailwind 4.x, React 19) are MEDIUM — could not verify against live npm registry. Run `npm view next version` before project init. |
| Features | MEDIUM | Table stakes and differentiators derived from first-principles analysis of the WildWood business model (HIGH confidence). Competitor feature comparisons (Cloudbeds, Square, Glofox) based on domain expertise from training data, not verified against 2026 product offerings (MEDIUM-LOW). |
| Architecture | HIGH | Next.js App Router structure verified from official docs. React Context + useReducer patterns are core React APIs. Route group dual-layout pattern is verified Next.js behavior. Data access abstraction is a standard software engineering pattern. |
| Pitfalls | MEDIUM | Touch target standards (Apple HIG 44x44pt) and contrast ratios (WCAG 7:1 AAA) are HIGH confidence standards. Domain-specific pitfalls (accounting mental model, outdoor visibility, demo framing) are MEDIUM confidence based on hospitality domain expertise and POS design patterns. |

**Overall confidence:** MEDIUM-HIGH. The architecture is the strongest part of this research (HIGH confidence). Stack choices are correct in direction even if exact versions need verification. Feature prioritization is well-grounded in the WildWood business model. Pitfalls are actionable and preventable.

### Gaps to Address

- **Version verification:** Before running `create-next-app`, verify Next.js 15, Tailwind 4, React 19, and shadcn/ui Tailwind v4 compatibility with `npm view [package] version`. If any are incompatible, fall back to Next.js 14.2.x + React 18.3.x + Tailwind 3.4.x (known-good combination).
- **Tablet testing:** No physical tablet test was possible during research. The POS module must be tested on a real 10" tablet before the client demo. This is a hard requirement, not a nice-to-have.
- **Owner mental model for accounting:** The accounting dashboard structure assumes the owner thinks in terms of "chiffre du jour" and three revenue centers. Validate this assumption in the first demo session and be prepared to restructure the hierarchy if the owner has a different primary question.
- **Real menu and pass pricing confirmation:** Mock data uses pricing from PROJECT.md. Confirm these are current WildWood prices before building, as prices may have changed.
- **Instagram API response shape (Phase 2):** The Instagram mock data structure should reflect the actual Instagram Graph API response fields. This needs a brief API documentation review before Phase 2 begins, not during Phase 1.

---

## Sources

### Primary (HIGH confidence)
- `PROJECT.md` (local) — Stack constraints, business rules, pricing, POS requirements, WildWood branding
- Next.js App Router official documentation — Route groups, nested layouts, static export, project structure
- React official documentation — Context API, useReducer pattern
- WCAG 2.1 standard — Contrast ratio requirements (4.5:1 AA, 7:1 AAA)
- Apple Human Interface Guidelines — Touch target minimum (44x44pt)

### Secondary (MEDIUM confidence)
- `STACK.md` — Technology recommendations based on PRD constraints + training data ecosystem knowledge (cutoff May 2025)
- `FEATURES.md` — Feature categorization based on first-principles WildWood business model analysis + hospitality domain expertise
- `ARCHITECTURE.md` — Component structure, data flow, build order analysis
- `PITFALLS.md` — Domain-specific risk analysis for resort POS + prototype demo scenarios

### Tertiary (LOW confidence — verify before use)
- Competitor product feature sets (Cloudbeds, Little Hotelier, Square, Loyverse, Glofox, Gymmaster) — Based on training data pre-2025; product features may have changed significantly by 2026
- npm package version numbers marked with `*` in STACK.md — Could not verify against live npm registry during research session

---
*Research completed: 2026-03-01*
*Ready for roadmap: yes*
