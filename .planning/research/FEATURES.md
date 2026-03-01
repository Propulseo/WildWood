# Feature Research

**Domain:** Resort ERP/POS for small beach fitness resort (8 bungalows, gym, F&B, spa amenities)
**Researched:** 2026-03-01
**Confidence:** MEDIUM (based on domain expertise and project context; WebSearch unavailable for competitor verification)

## Feature Landscape

This research covers the 6 planned modules: POS Cash Register (gym passes + F&B), Bungalow/Room Management, Accounting, Client Database, Newsletter, and Instagram Stats. For each, we identify what's table stakes in the hospitality ERP/POS space, what differentiates, and what to deliberately avoid.

---

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or staff can't do their job.

#### Module 1: POS Cash Register

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Product grid with large touch-friendly buttons | Staff must select items in under 2 seconds on a tablet; every POS has this | LOW | 120x80px minimum per PROJECT.md. Category tabs (Gym, F&B) at top level |
| Cart/order summary with running total | Staff must confirm what was selected before taking payment | LOW | Show line items, quantities, subtotals |
| One-tap quantity adjustment (+/-) | Customers order multiple of the same item constantly | LOW | Inline increment/decrement in cart |
| Clear cart / void item | Mistakes happen; no undo = frustrated staff | LOW | Per-item delete + full cart clear |
| Payment confirmation with receipt view | Must close the transaction loop; owner needs the data | LOW | On-screen receipt confirmation. Physical printing is Phase 2 |
| Daily sales summary accessible from POS | Staff and owner check "how much today?" constantly | MEDIUM | Running total by category, transaction count |
| Category-based product organization | 6 F&B categories + 9 gym pass types = too many items for one flat grid | LOW | Tab-based or accordion. F&B: bowls, protein cocktails, coffee, smoothies, drinks, snacks. Gym: passes by duration |
| Cash-only payment flow | WildWood is 100% cash per project context | LOW | No card terminal integration needed. Simplifies the POS |

#### Module 2: Bungalow/Room Management

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Calendar view (month) with bungalows as rows | Standard hotel PMS visualization. Owner expects to see occupancy at a glance | MEDIUM | 8 rows x 28-31 columns. Color-coded occupancy |
| Reservation display (guest name, dates, status) | Must see who is in which bungalow and when | MEDIUM | Click-to-view detail. Statuses: confirmed, checked-in, checked-out |
| Occupancy rate calculation | Owner's primary KPI for bungalow revenue | LOW | (Occupied nights / total nights) x 100, shown as badge or percentage |
| Check-in / check-out status tracking | Receptionist needs to mark arrivals and departures | LOW | Toggle or button on reservation card |
| Link bungalow guest to free gym pass | Residents get free gym access per business rules; core to the value proposition | MEDIUM | Auto-create gym pass on check-in, expire on check-out. Dependency: Client DB + POS passes |

#### Module 3: Accounting

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Daily revenue dashboard | Owner checks this every day. "How much did we make today?" | MEDIUM | Total revenue, broken down by revenue center (Gym, F&B, Bungalows) |
| Revenue by center (Gym, F&B, Bungalows) | Three distinct businesses under one roof; must track separately | MEDIUM | Pie chart or stacked bar showing contribution of each center |
| Monthly P&L summary | Owner needs to know if the resort is profitable | MEDIUM | Revenue - Expenses = Net result. Table or chart format |
| Expense entry by category | No expenses = no P&L. Manual input essential since there's no bank feed | MEDIUM | Categories: staff salary, utilities, supplies, maintenance, food cost, marketing, other |
| Revenue trend charts (daily/weekly/monthly) | Visual trend is expected in any dashboard; raw numbers are insufficient | MEDIUM | Line chart with Recharts or Chart.js. Mock data for MVP |

#### Module 4: Client Database

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Client list with search | "Who is this person?" must be answerable in seconds | LOW | Paginated list, search by name or email |
| Client profile card | Every CRM/client system has individual profiles | LOW | Name, email, nationality, photo placeholder, notes |
| Purchase/visit history per client | "What did this person buy before?" is the core value of having a client DB | MEDIUM | Chronological list of transactions from POS + bungalow stays |
| Client creation from POS flow | Staff must add new clients during checkout, not in a separate module | MEDIUM | Popup/modal from POS. Dependency: POS module |

#### Module 5: Newsletter

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Contact list with email addresses | Cannot send newsletters without a list | LOW | From Client DB or manual entry. Display with pagination |
| Campaign creation form | Must be able to draft a message with subject + body | LOW | Simple form. No actual send in MVP (mock only) |
| Campaign history / status | "What did we send and when?" | LOW | List of past campaigns with date and recipient count |

#### Module 6: Instagram Stats

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Follower count display | Most basic social metric | LOW | Single number with trend indicator |
| Engagement metrics (likes, comments, reach) | Owner wants to track marketing ROI | LOW | Summary cards with mock data |
| Trend chart over time | Static numbers are insufficient; need trajectory | MEDIUM | Line chart showing follower/engagement growth over weeks/months |

#### Cross-Module

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Role-based UI (staff vs admin/owner) | Staff sees POS only; owner sees everything. Mixing roles creates confusion | LOW | Simulated login with role toggle for MVP demo |
| Navigation sidebar/menu | Multiple modules require navigation structure | LOW | Sidebar with module icons. Collapse on tablet for more screen space |
| Responsive tablet-first layout | Staff uses 10" tablet; owner may use laptop. Must work on both | MEDIUM | Tablet-first, then desktop. Mobile is not a priority |
| Dark theme for POS screens | Reduces glare in outdoor/bar settings, standard in hospitality POS | LOW | Dark background with high-contrast buttons. Per PROJECT.md: "fond sombre boutons larges" |
| French language interface with visual icons | Per project constraints. Icons compensate for Thai staff not reading French | LOW | All labels in French, paired with intuitive icons |

---

### Differentiators (Competitive Advantage)

Features that set WildWood ERP apart from generic resort PMS or generic POS. Not required for launch, but create outsized value for this specific use case.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Unified gym-pass + F&B POS in one screen** | Most resorts use separate systems for gym and restaurant. One cashier handles both at WildWood. Combining them eliminates switching between apps | LOW | Tabs within one POS interface. This is the core UX win |
| **Auto-link bungalow check-in to free gym pass** | Eliminates manual tracking of "is this person a resident?". Staff just checks bungalow status | MEDIUM | Automatic pass creation on check-in, revocation on check-out. Reduces errors and disputes |
| **Revenue center attribution on every transaction** | Owner sees instantly whether gym, F&B, or bungalows drive the business. Generic POS systems don't split revenue this way for a mixed-use resort | LOW | Tag every POS transaction with its revenue center. Feeds accounting module directly |
| **Client history spanning all services** | See that a client bought a 1-month gym pass, ordered 14 protein shakes, AND stayed in Bungalow 3. No generic system connects all three | MEDIUM | Requires unified client ID across POS, bungalow, and all transactions |
| **Admin dashboard: today's key numbers at a glance** | Owner opens app and immediately sees: total revenue, passes sold, new reservations, occupancy rate. No clicking through modules | MEDIUM | Aggregation dashboard pulling from all modules. Very high perceived value, moderate build effort |
| **Expiring pass logic (e.g., 10-day pass expires at 90 days)** | Unique business rule specific to WildWood. Generic POS can't handle "10 uses within 90 days" without custom logic | MEDIUM | Pass tracking with usage count and expiration date. Prevents revenue leakage from indefinitely-used passes |
| **Quick-access "resident check" from POS** | Before selling a gym pass, staff should see "this person is already a bungalow resident with free access." Prevents accidentally charging residents | LOW | Banner or badge in POS client lookup. Dependency: bungalow + client DB |
| **Expense categories tailored to resort operations** | Generic accounting tools have wrong categories. Preset categories for staff salary, food cost, utilities, maintenance, marketing match the actual cost structure | LOW | Just a well-designed category list. Small effort, big UX win for the owner |
| **Visual product buttons with icons/images** | Instead of text-only buttons, show a coffee cup for espresso, a bowl for acai. Staff who don't read French can still operate the POS by visual recognition | MEDIUM | Requires icon set or simple illustrations. Major accessibility win for Thai staff |

---

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create disproportionate complexity, maintenance burden, or solve problems WildWood doesn't actually have.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Full inventory/stock management** | "We need to track how much protein powder is left" | Requires purchase orders, stock counts, supplier management, waste tracking. Massive complexity for a 1-location snack bar with simple items. Owner manages stock by eyeballing shelves | Track cost of goods sold (COGS) as an expense category in accounting. Reorder based on experience, not software |
| **Online booking integration (Booking.com sync)** | "We want reservations to appear automatically" | API integration with Booking.com requires backend, webhooks, conflict resolution, and ongoing maintenance. Out of scope for MVP and even risky for Phase 2 | Manual entry of bookings from Booking.com into the calendar. Staff already does this in Excel. Upgrade to API only if volume justifies it |
| **Multi-currency support** | "Some guests pay in USD or EUR" | Currency conversion rates fluctuate, create accounting complexity, and require daily rate updates. WildWood prices in THB | Keep all prices in THB. Staff converts mentally or uses a phone calculator. This is standard practice in Thai tourism |
| **Online payment (Stripe, QR code)** | "Tourists want to pay by card" | Requires payment gateway, PCI compliance considerations, transaction fees, refund flows. WildWood is cash-only | Stay cash-only for MVP. If card demand grows, integrate PromptPay QR (Thai standard) in Phase 2 as a standalone add-on, not a POS rewrite |
| **Mobile native app (iOS/Android)** | "Staff wants a phone app" | Two additional platforms to maintain. App store approval process. Push notifications complexity | Responsive PWA via Next.js. Install as home screen shortcut. Gets 90% of the native benefit at 10% of the cost |
| **Multi-language interface (EN/TH/FR)** | "Thai staff needs Thai language" | i18n infrastructure, translation maintenance, layout issues with Thai script. Tripling the text content | French labels + universal icons. This is validated in the PROJECT.md as sufficient |
| **Detailed staff permissions (RBAC)** | "Different staff should see different things" | Full role-based access control is complex: role definitions, permission matrices, UI conditionals everywhere | Two roles only: staff (POS access) and admin (everything). Binary toggle. No need for granular permissions with 2-3 staff members |
| **Automated email sending for newsletters** | "Let's send emails from the app" | Requires email service integration (Resend, SendGrid), deliverability management, unsubscribe handling, GDPR-like compliance | MVP: compose and preview campaigns. Phase 2: integrate Resend for actual sending. Staff can copy/paste to their email client in the interim |
| **Real-time data sync across devices** | "Two tablets should see the same data live" | WebSocket infrastructure, conflict resolution, offline-first complexity. Overkill for 1-2 simultaneous users | MVP has no backend, so this is moot. Phase 2: simple polling every 30 seconds is sufficient for 1-2 users. Real-time adds cost without benefit at this scale |
| **PDF/CSV export of reports** | "I want to download my P&L" | PDF generation libraries, formatting, file handling | Phase 2 feature. For MVP, the on-screen dashboard IS the report. Owner can screenshot or use browser print-to-PDF |
| **Multi-site support** | "What if we open a second location?" | Multi-tenancy architecture, data isolation, cross-site reporting. Massive complexity for a hypothetical future | Build for one site. If a second site materializes, fork the codebase or rebuild with multi-tenancy. Do not pre-architect for it |
| **Loyalty/rewards program** | "Repeat customers should earn points" | Points calculation, tier logic, redemption rules, UI for both staff and customers. Significant feature surface area | Track client purchase history. The "loyalty program" is the owner remembering regulars and giving manual discounts. Formalize only if business demand proves it |

---

## Feature Dependencies

```
[Client Database]
    |
    |---feeds-into---> [POS Cash Register] (client lookup during sale)
    |---feeds-into---> [Newsletter] (contact list from client DB)
    |---feeds-into---> [Bungalow Management] (guest = client record)
    |
[POS Cash Register]
    |---feeds-into---> [Accounting] (transactions = revenue data)
    |---feeds-into---> [Client Database] (purchase history)
    |
[Bungalow Management]
    |---feeds-into---> [POS Cash Register] (resident = free gym pass)
    |---feeds-into---> [Accounting] (bungalow revenue)
    |---feeds-into---> [Client Database] (stay history)
    |
[Accounting]
    |---consumes-from---> [POS Cash Register] (auto revenue)
    |---consumes-from---> [Bungalow Management] (occupancy revenue)
    |---standalone-------> Expense entry (manual input, no dependency)
    |
[Newsletter]
    |---consumes-from---> [Client Database] (email list)
    |---standalone-------> Campaign form (no dependency)
    |
[Instagram Stats]
    |---standalone-------> No dependencies on other modules
    |                       (mock data in MVP, Instagram API in Phase 2)
    |
[Admin Dashboard]
    |---consumes-from---> [POS Cash Register] (today's sales)
    |---consumes-from---> [Bungalow Management] (occupancy)
    |---consumes-from---> [Accounting] (revenue summary)
```

### Dependency Notes

- **Client Database is the foundational entity:** Nearly every module references clients. Build the data model first, even if the UI comes later.
- **POS is the primary data generator:** All accounting revenue data originates from POS transactions. POS must exist before accounting dashboards are meaningful.
- **Bungalow-to-POS link is bidirectional:** Bungalow check-in creates a free gym pass (bungalow -> POS). POS needs to check bungalow status before selling a pass (POS -> bungalow). This is the tightest coupling in the system.
- **Newsletter depends on Client DB but is otherwise isolated:** Can be built late with minimal integration effort.
- **Instagram is fully standalone:** No dependency on any other module. Can be built first or last without affecting anything.
- **Admin Dashboard is a pure consumer:** It reads from everything but writes to nothing. Build it after the data-generating modules exist.

---

## MVP Definition

### Launch With (v1 -- Frontend Prototype)

Minimum viable prototype to validate UX with the WildWood owner. Mock data, no backend.

- [x] **POS Cash Register (Gym Passes)** -- Core value proposition. Must demonstrate 3-click checkout flow with all 9 pass types and real pricing
- [x] **POS Cash Register (F&B)** -- Second pillar of daily operations. Category-based grid, cart, payment confirmation
- [x] **Bungalow Calendar** -- Owner's primary planning tool. Month view, 8 rows, mock reservations, occupancy rate
- [x] **Client Database (list + profile)** -- Proves the "know your customer" value. Search, paginated list, individual cards
- [x] **Accounting Dashboard (daily + monthly)** -- Owner's #1 ask after POS. Revenue by center, expense entry, mock P&L
- [x] **Role Toggle (admin/staff)** -- Demo mechanism to show both user experiences in one prototype
- [x] **Navigation + Design System** -- WildWood branding, dark POS theme, sidebar navigation

### Add After Validation (v1.x -- Post-Client-Approval)

Features to add once the owner validates the prototype and commits to Phase 2 investment.

- [ ] **Newsletter module** -- Low complexity, but low urgency. Add once client confirms they want email marketing
- [ ] **Instagram dashboard** -- Completely standalone, easy to add anytime. Wait for client to confirm interest in social tracking
- [ ] **Bungalow-to-gym-pass auto-link** -- Important business rule, but requires backend state. Demonstrate the concept in MVP with a visual indicator, implement the logic in Phase 2
- [ ] **Expense categorization refinement** -- Start with 5-7 preset categories, refine after owner uses it for a month

### Future Consideration (v2+ -- With Backend)

Features to defer until Phase 2 (Supabase backend) or beyond.

- [ ] **Persistent data storage (Supabase)** -- Cannot save data between sessions without a backend. Critical for real operations
- [ ] **Receipt printing** -- Requires thermal printer integration. Phase 2 hardware decision
- [ ] **Booking.com import** -- API integration, complex. Only if manual entry becomes a bottleneck
- [ ] **Newsletter email sending (Resend)** -- Requires email service. Phase 2 integration
- [ ] **Instagram API integration** -- Requires Instagram Graph API. Phase 2 integration
- [ ] **PDF/CSV report export** -- Phase 2 quality-of-life feature
- [ ] **Pass expiration tracking with real dates** -- Requires persistent state to track "10 uses within 90 days"
- [ ] **Real authentication (not simulated)** -- Phase 2 security requirement

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| POS Gym Passes (9 types, real prices) | HIGH | MEDIUM | P1 |
| POS F&B (6 categories, cart, checkout) | HIGH | MEDIUM | P1 |
| Bungalow Calendar (month view, 8 units) | HIGH | MEDIUM | P1 |
| Client List + Search + Profile | HIGH | LOW | P1 |
| Accounting Daily Dashboard | HIGH | MEDIUM | P1 |
| Accounting Monthly P&L | HIGH | MEDIUM | P1 |
| Expense Entry (manual) | MEDIUM | LOW | P1 |
| Role-based UI (staff/admin toggle) | MEDIUM | LOW | P1 |
| Admin Dashboard (today's key numbers) | HIGH | MEDIUM | P1 |
| Navigation + WildWood Design System | HIGH | LOW | P1 |
| Client Purchase History | MEDIUM | MEDIUM | P2 |
| Resident Badge in POS (free pass check) | MEDIUM | LOW | P2 |
| Newsletter Contact List | LOW | LOW | P2 |
| Newsletter Campaign Form | LOW | LOW | P2 |
| Instagram Follower/Engagement Dashboard | LOW | LOW | P2 |
| Instagram Trend Chart | LOW | MEDIUM | P2 |
| Visual Product Icons on POS Buttons | MEDIUM | MEDIUM | P2 |
| Bungalow-to-Gym Auto-Link | MEDIUM | MEDIUM | P2 |
| Pass Expiration Logic | MEDIUM | HIGH | P3 |
| PDF/CSV Export | LOW | MEDIUM | P3 |
| Email Sending Integration | LOW | HIGH | P3 |
| Instagram API Integration | LOW | HIGH | P3 |
| Booking.com Sync | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for MVP prototype launch
- P2: Should have, add during v1.x or early Phase 2
- P3: Nice to have, defer to Phase 2+ with backend

---

## Competitor Feature Analysis

Analysis based on domain expertise with hospitality POS/PMS systems commonly used by small resorts in Southeast Asia. Confidence: MEDIUM (no live competitor product demos conducted).

| Feature | Generic Hotel PMS (e.g., Cloudbeds, Little Hotelier) | Generic POS (e.g., Square, Loyverse) | Gym Management (e.g., Glofox, Gymmaster) | WildWood ERP Approach |
|---------|------------------------------------------------------|--------------------------------------|------------------------------------------|----------------------|
| Room/bungalow calendar | Yes, full-featured with channel manager | No | No | Simplified: 8-unit calendar, no channel manager. Manual entry |
| POS cash register | Limited (minibar charges) | Yes, full-featured | Limited (membership sales) | Full POS for both gym passes AND F&B in one screen |
| Gym pass management | No | No | Yes, full-featured with check-in tracking | 9 pass types with pricing. No check-in tracking in MVP |
| F&B ordering | No (restaurant module is separate add-on) | Yes | No | Category-based grid, simple cart. No kitchen display |
| Client database | Yes, guest profiles | Yes, basic | Yes, member profiles | Unified client across all services. Key differentiator |
| Accounting/P&L | Yes, but complex and hotel-centric | Basic sales reports | No | Custom P&L with 3 revenue centers (Gym, F&B, Bungalow). Tailored to this business |
| Newsletter | No | No | Basic email | Simple campaign form. Phase 2 for actual sending |
| Social media tracking | No | No | No | Instagram dashboard. Unique to WildWood |
| Multi-service integration | Siloed modules | Single POS only | Gym only | Everything in one app. The core differentiator |

**Key insight:** No single competitor product covers all 6 WildWood modules. A resort owner today would need 3+ separate tools (Hotel PMS + POS + Gym software) that don't talk to each other. WildWood's value is the unification, not the depth of any individual module. Each module can be simpler than the specialist tool because the integration IS the feature.

---

## Sources

- Domain expertise in hospitality POS and property management systems (MEDIUM confidence -- based on training data, not live 2026 product demos)
- PROJECT.md context for WildWood-specific business rules, pricing, and constraints
- General knowledge of Southeast Asian small resort operations (MEDIUM confidence)
- Competitor products referenced by category (Cloudbeds, Little Hotelier, Square, Loyverse, Glofox, Gymmaster) based on pre-training knowledge. Feature sets may have changed; verify if critical decisions depend on competitor capabilities

**Confidence caveat:** WebSearch was unavailable during this research session. Competitor analysis and "industry standard" claims are based on domain expertise from training data, not verified against current 2026 product offerings. Confidence level for competitor-specific claims is LOW-MEDIUM. Core feature categorization (table stakes vs differentiator vs anti-feature) is HIGH confidence as it's driven by first-principles analysis of the WildWood business model.

---
*Feature research for: Resort ERP/POS (beach fitness resort with bungalows, gym, F&B)*
*Researched: 2026-03-01*
