# Pitfalls Research

**Domain:** Resort ERP/POS frontend prototype (beach fitness resort, Koh Tao)
**Researched:** 2026-03-01
**Confidence:** MEDIUM (domain knowledge from training data; no live source verification available)

## Critical Pitfalls

### Pitfall 1: POS Touch Targets Too Small for Real Conditions

**What goes wrong:**
Buttons designed at 120x80px on a desktop screen feel perfect in Figma and on a clean desk. In real usage at a beach bar -- wet fingers, sunscreen residue, sweat, stress during a rush of 5 customers queuing -- touch targets fail. Staff tap the wrong item, add the wrong pass, fumble to correct errors. The prototype "works" in the demo but would fail on day one. The client sees the demo on his laptop and approves, then the receptionist hates it on the actual tablet.

**Why it happens:**
Developers test with a mouse cursor, which has pixel-perfect precision. They never test with actual fingers on a real tablet. The 120x80px minimum from the PRD is a good floor, but spacing between targets matters as much as size -- adjacent buttons with 4px gap produce misclicks under stress.

**How to avoid:**
- Minimum 12px gap between all tappable elements on POS screens (not just button size, but **inter-button spacing**)
- POS category buttons should be 140x90px minimum, with 16px gutters
- Test on a real 10" tablet early in Phase 1 -- ideally with wet fingers (run your hands under water, then try to operate it)
- Confirmation step for any action over 500 THB (prevents costly misclicks)
- No delete/cancel icons smaller than 44x44px (Apple HIG touch target minimum)

**Warning signs:**
- All POS testing happens with mouse clicks in Chrome DevTools
- Nobody on the team has tested the prototype on a physical tablet
- Buttons look good but are packed tightly in a grid with minimal gutters
- Error correction flow (remove wrong item from cart) requires precise taps

**Phase to address:**
Phase 1 (POS UI build). Mandate a tablet test checkpoint before showing the client.

---

### Pitfall 2: The "Uncanny Valley" Prototype -- Too Polished or Too Rough

**What goes wrong:**
The prototype lands in one of two failure zones:

1. **Too polished:** The owner sees a beautiful, functional-looking ERP and concludes "c'est fini, on peut lancer" (it's done, let's launch). When you explain Phase 2 costs for backend, auth, and integrations, he feels cheated -- "I already paid for this, why isn't it working?" The mock data creates an illusion of completeness.

2. **Too rough:** Placeholder text everywhere, broken layouts, lorem ipsum. The owner can't envision the real product. He doesn't get excited. He says "reviens quand c'est fini" (come back when it's done) and the project dies.

**Why it happens:**
Frontend developers optimize for what they can see. A polished UI with realistic mock data is indistinguishable from a working product to a non-technical client. The line between "impressive demo" and "misleading demo" is razor thin.

**How to avoid:**
- Use a persistent "PROTOTYPE - Donnees fictives" (Prototype - Mock Data) banner on every screen, subtle but always visible (e.g., fixed top bar with a muted orange background)
- When the client clicks "Encaisser" (Cash Out), show a success animation BUT also a small toast: "En production, ceci sera enregistre en base de donnees" (In production, this will be saved to the database)
- Create a "Phase 2 Preview" section in the sidebar: greyed-out items for Booking.com sync, real auth, PDF export -- visible but clearly not yet built
- Prepare a 1-page "What This Prototype Is / Is Not" document for the demo meeting
- Mock data should be realistic but include a few obviously fake entries ("John Test", a booking for "31 fevrier") that signal this is still mock

**Warning signs:**
- Client starts asking "can I use this tomorrow?" during the demo
- Client asks about data backup or multi-user access during prototype review
- No visible indicator anywhere that this is a prototype
- Mock data is so perfect it could pass for real records

**Phase to address:**
Phase 1 (throughout). The prototype banner and "what this is" framing must be built in from day one, not added as an afterthought.

---

### Pitfall 3: Mock Data That Doesn't Feel Like the Business

**What goes wrong:**
Generic mock data (Client 1, Client 2, Product A, Product B) makes the prototype feel like a template, not a custom tool. The owner can't recognize his business in the screens. Conversely, perfectly structured mock data masks real-world messiness -- the prototype can't reveal UX problems that emerge when data is inconsistent, incomplete, or surprising.

For WildWood specifically: if mock gym passes don't use the real 9-tier pricing, if F&B items don't match the actual menu, if bungalow names are "Suite A" instead of "Bungalow 1-8", the prototype fails to validate the real workflow.

**Why it happens:**
Mock data is treated as an afterthought -- a chore to fill in at the end, rather than a design tool. Developers generate it programmatically or copy from tutorials, producing data that is technically valid but contextually meaningless.

**How to avoid:**
- Use the exact real pricing from PROJECT.md (350/800/1200/1400/2000/9000/15000 THB gym passes, exact F&B prices)
- Create 20-30 mock customers with plausible names: mix of Western tourist names (Tom, Sarah, Max) and Thai names -- reflecting the actual clientele at Koh Tao
- Bungalow mock reservations should show realistic patterns: some bungalows booked via "Booking.com" (noted as source), variable stay lengths (3-14 nights), realistic check-in patterns (not all starting on Monday)
- Include edge cases in mock data: a pass that expires tomorrow, a bungalow booking with a note, a customer with no email, a day with zero gym sales
- F&B mock orders should show realistic combos: post-workout shakes at 10am, coffee orders morning-heavy, beer orders afternoon-heavy

**Warning signs:**
- All mock customers are named "Client 1" through "Client 10"
- No edge cases in data (every field filled, every booking is exactly 7 nights)
- Prices in the mock don't match the real price list
- Calendar shows unrealistically perfect occupancy (all 8 bungalows full, no gaps)

**Phase to address:**
Phase 1 (data layer setup, before UI build). Mock data schema and content should be defined first, then screens built around it.

---

### Pitfall 4: Accounting Module That Doesn't Match Owner Mental Model

**What goes wrong:**
The developer builds accounting views like an accountant would -- journal entries, debits/credits, chart of accounts. The owner (a French resort operator managing from Excel) thinks in different terms: "combien j'ai fait aujourd'hui?" (how much did I make today), "est-ce que le bar est rentable?" (is the bar profitable), "quel mois est le meilleur?" (which month is best). The accounting dashboard shows technically correct data but answers none of the owner's actual questions.

**Why it happens:**
ERP accounting modules copy patterns from enterprise software (SAP, Odoo) that serve trained accountants. A small resort owner doesn't have a chart of accounts -- he has a "recettes" (income) vs "depenses" (expenses) mental model with three revenue buckets (Gym, F&B, Bungalows).

**How to avoid:**
- Structure the dashboard around the three revenue centers: Gym, F&B, Bungalows -- not around accounting concepts
- Lead with the owner's daily question: "Chiffre du jour" (today's revenue) as the biggest number on the dashboard
- Monthly view should be a simple bar chart: income vs expenses per month, not a balance sheet
- Expense entry should be by category (electricity, staff salary, supplies, repairs) -- not by accounting code
- The "bilan" (balance sheet) should be a one-page summary: total income, total expenses, net profit, broken down by revenue center -- not a double-entry accounting view
- Ask yourself: "Would the owner understand this screen if he saw it at 7am with coffee?" If not, simplify.

**Warning signs:**
- Accounting module uses terms like "journal," "grand livre," "plan comptable" (general ledger, chart of accounts)
- Dashboard shows more than 5 KPIs on the main view
- No "chiffre du jour" (today's number) visible within 1 second of loading
- Expense categories require selecting from a dropdown with 20+ options

**Phase to address:**
Phase 1 (accounting dashboard design). Wireframe the dashboard before building it and describe each element's purpose in the owner's language, not accounting language.

---

### Pitfall 5: Calendar/Booking View That Confuses More Than It Helps

**What goes wrong:**
The bungalow calendar becomes an overengineered Gantt chart that is technically impressive but operationally useless. Common failures: horizontal scrolling required to see a full month, color coding with 8+ colors that nobody can decode without a legend, no way to see at a glance which bungalows are free tonight, drag-and-drop interactions that don't work on touch screens.

**Why it happens:**
Calendar UIs are one of the hardest interaction patterns in web development. Developers either build from scratch (buggy, months of work) or use a library that imposes its own interaction model (designed for desktop, not touch-first). The 8-bungalows x 30-days matrix is deceptively simple-looking but hard to render responsively.

**How to avoid:**
- Keep the calendar read-only in the prototype -- display reservations, don't allow drag-and-drop editing (that's Phase 2 complexity)
- Use a simple grid: 8 rows (bungalows) x days-of-month columns, colored cells for "occupied" vs "free"
- Maximum 3 colors: occupied (filled), free (empty), checkout-today (highlight)
- On tablet, show 2-week view as default with swipe to next 2 weeks -- a full 31-day month on a 10" tablet makes cells too small to tap
- Show an occupancy percentage number prominently ("62% ce mois" / 62% this month) -- the owner cares about the summary number more than the grid details
- Tapping a reservation cell shows a popover with guest name and dates -- don't try to fit all info into the cell itself

**Warning signs:**
- Calendar requires horizontal scrolling on a 10" tablet
- More than 3 colors used in the calendar grid
- Cell text is smaller than 12px
- Drag-and-drop booking editing planned for the prototype phase
- No "occupancy rate" summary number visible

**Phase to address:**
Phase 1 (bungalow module). Prototype the calendar as a read-only visualization. Interactive booking management is Phase 2.

---

### Pitfall 6: Desktop-First Design Pretending to Be Tablet-Friendly

**What goes wrong:**
The developer builds on a 27" monitor using Chrome DevTools "responsive" mode and considers it tested. The actual 10" tablet at 1280x800 resolution has completely different constraints: the sidebar eats 250px leaving only 1030px for content, modal dialogs extend off-screen, data tables require horizontal scroll, the on-screen keyboard covers half the screen when entering customer names.

**Why it happens:**
Chrome DevTools responsive mode doesn't replicate real tablet behavior: no on-screen keyboard, no browser chrome eating vertical space, no touch events, no SafarI/Chrome mobile quirks. The developer never physically holds the device while testing.

**How to avoid:**
- Design for 1024x768 as the minimum viewport (10" tablet in landscape with browser chrome)
- POS screens: NO sidebar. Full-screen layout with bottom tab navigation or a hamburger menu that overlays
- When a text input is focused, expect 40-50% of vertical space to be lost to the on-screen keyboard -- place inputs in the top half of the screen, or use a modal that scrolls
- Data tables (client list, accounting entries): maximum 4-5 columns on tablet. Use expandable rows for detail, not more columns
- Test every screen in Chrome DevTools at 1024x768 AND on a physical tablet if available
- Consider the POS specifically: in a bar/reception scenario, the tablet might be in portrait mode on a stand -- test both orientations

**Warning signs:**
- Sidebar is always visible (not collapsible) and wider than 200px
- Data tables have 8+ columns
- Forms have inputs in the bottom half of the screen
- Modal dialogs are taller than 500px
- No testing at 1024x768 has been done

**Phase to address:**
Phase 1 (layout/shell setup). The responsive layout must be established first, before building individual modules.

---

### Pitfall 7: Scope Creep Through "Just One More Module"

**What goes wrong:**
The prototype scope has 8+ modules (POS Gym, POS F&B, Clients, Bungalows, Comptabilite, Newsletter, Instagram, Dashboard). Each "simple" module takes 2-3x longer than estimated because of edge cases, responsive layout adjustments, and mock data creation. The developer gets stuck perfecting the accounting charts while the POS (the core value proposition) ships incomplete. The client demo shows 8 half-built modules instead of 3 polished ones.

**Why it happens:**
Equal weight is given to all modules in the PRD. The developer sees the list and starts building top-to-bottom instead of prioritizing by client impact. Newsletter and Instagram modules are "nice to have" but spending time on them before the POS is rock-solid is a critical misallocation.

**How to avoid:**
- Hard priority tiers:
  - **Tier 1 (must be polished for demo):** POS Gym, POS F&B, Dashboard admin -- these sell the project
  - **Tier 2 (should look good):** Clients module, Bungalows calendar, Comptabilite daily view
  - **Tier 3 (can be placeholder screens):** Newsletter, Instagram, Comptabilite monthly/yearly detail
- Time-box the entire prototype to the planned sprint duration. If running behind, cut Tier 3 modules to static screenshots or wireframe-quality pages
- Build POS modules first and present them to the client for early feedback before building anything else
- Instagram and Newsletter modules are one-screen dashboards with static data -- limit them to 2-4 hours each maximum

**Warning signs:**
- Developer has been working on the Instagram dashboard for 2 days while the POS cart doesn't work yet
- All modules are at 40% completion instead of some at 90% and others at 10%
- The demo date is approaching and the POS encaissement (checkout) flow has never been tested end-to-end
- Estimate for "simple modules" keeps growing

**Phase to address:**
Phase 1 (sprint planning). Define module priority tiers at sprint kickoff and enforce them through daily progress checks.

---

### Pitfall 8: French-Only Interface That Blocks Thai Staff Understanding

**What goes wrong:**
The interface is built in French per the spec, but the icons chosen are culturally ambiguous or too abstract. The Thai receptionist encounters "Encaisser" (Cash Out), "Bilan comptable" (Accounting Report), "Fiche client" (Customer Record) -- words she may not recognize. If the icons don't clearly communicate the action, the interface is effectively unusable for the primary daily operator.

**Why it happens:**
The developer picks icons from a library (Lucide, Heroicons) that are logical to a Western developer but may not carry meaning cross-culturally. A "receipt" icon might mean nothing to someone unfamiliar with Western retail UX conventions. The spec says "French with icons" but doesn't specify which icons, leading to arbitrary choices.

**How to avoid:**
- For POS actions, use literal icons over abstract ones: a shopping bag for "cart," a banknote for "pay," a checkmark for "done" -- avoid metaphorical icons like a floppy disk for "save"
- Color-code actions consistently: green = confirm/pay, red = cancel/delete, blue = info/view
- POS buttons should include both the French label AND a universally understood icon at minimum 24x24px
- The POS confirmation screen (after encaissement) should use a large green checkmark animation -- universally understood
- Test icon comprehension: can you identify each button's purpose without reading the text? If not, change the icon
- Consider adding emoji or food/drink pictures directly on F&B buttons (a coffee cup icon on the coffee button, not just the word "Cafe")

**Warning signs:**
- POS buttons are text-only with no icons
- Icons chosen are abstract (e.g., a generic "document" icon for customer records)
- No color differentiation between action types (confirm, cancel, navigate)
- F&B buttons use text labels only -- no food category imagery

**Phase to address:**
Phase 1 (POS UI build). Icon selection should happen during component design, not as decoration added later.

---

### Pitfall 9: Sun Glare and Outdoor Visibility Not Considered

**What goes wrong:**
The UI uses a carefully designed dark theme (fond sombre per the PRD spec for POS) that looks stunning on a developer's indoor monitor but becomes unreadable on a beach reception desk at 2pm. Alternatively, a light theme with subtle gray text washes out completely. The Thai receptionist tilts the tablet, squints, cups her hand over the screen, or gives up and takes orders on paper.

**Why it happens:**
Screen brightness and contrast behave completely differently in tropical outdoor conditions (10,000+ lux in Thailand midday vs 500 lux in an office). Standard WCAG contrast ratios (4.5:1 for normal text) are calibrated for indoor use. Outdoor use requires much higher contrast, bolder text, and larger type.

**How to avoid:**
- POS dark theme must use pure high-contrast: pure white (#FFFFFF) text on dark backgrounds (#1A1A1A or darker), not subtle grays (#666666 on #333333)
- Price text on POS buttons: minimum 18px bold, ideally 22px+ for the THB amount
- Avoid gradients, subtle shadows, or translucent overlays on POS screens -- they disappear in bright light
- Consider a "high contrast" toggle that boosts all text to white-on-black with larger sizing
- The WildWood orange (#C94E0A) works as an accent but not as a background for white text -- contrast ratio is only ~3.8:1 (fails WCAG AA)
- Test the color palette at maximum screen brightness -- does every label remain readable?

**Warning signs:**
- Body text is lighter than #E0E0E0 on dark backgrounds
- Orange (#C94E0A) is used as a background color behind text
- Text smaller than 16px appears on POS screens
- Contrast ratio of any text element falls below 7:1 (the WCAG AAA threshold, appropriate for outdoor use)
- Nobody has tested the interface outside or at maximum brightness

**Phase to address:**
Phase 1 (design system/theming). Color palette and typography scale must be validated for high-brightness conditions before building screens.

---

### Pitfall 10: State Management Creates Phantom Persistence Illusion

**What goes wrong:**
The prototype uses React useState/useContext for state. During the demo, the developer navigates between modules and data persists within the session. The client sees: add a gym pass sale, switch to accounting, see the revenue update. He concludes the system "works." But a page refresh wipes everything. The client tries the demo link at home later, adds some data, refreshes, and everything is gone. He feels betrayed: "it was working during the demo!"

**Why it happens:**
In-memory React state creates a convincing illusion of persistence during a single session. The developer knows data resets on refresh because they built it. The client has no such context. Even if told verbally, the experience of "it works, then it doesn't" is jarring and undermines trust.

**How to avoid:**
- Use localStorage to persist state across page refreshes during the prototype -- this is trivial and prevents the "refresh surprise"
- Add a visible "Reinitialiser les donnees" (Reset Data) button in the admin panel that clears localStorage and restores defaults -- this makes the mock nature explicit AND gives a recovery path
- When the client loads the prototype, show an initial state with pre-populated mock data (not an empty state) -- empty states make prototypes look broken
- Consider a small "Derniere sauvegarde locale: il y a 2 min" (Last local save: 2 min ago) indicator to make the persistence mechanism visible
- NEVER show a fully empty state (0 clients, 0 sales, empty calendar) -- always seed with realistic defaults

**Warning signs:**
- Page refresh during the demo causes visible data loss
- Prototype starts with empty/blank screens
- No "reset" mechanism exists to restore default mock data
- Client receives the demo link without instructions about prototype limitations

**Phase to address:**
Phase 1 (state architecture). localStorage integration should be set up alongside the state layer, not as a post-build addition.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoding mock data inline in components | Fast to implement, no file structure needed | Impossible to extract into API calls later; data and UI tightly coupled | Never -- even in a prototype, centralize mock data in `/lib/mock-data/` files |
| Using `any` types in TypeScript for mock data | Avoids defining types for "throwaway" data | Types ARE the API contract for Phase 2; without them, backend integration requires guessing the shape | Never -- define types in `/types/` from day one; they become the Supabase schema |
| Putting all POS logic in one component | One file to manage, simple mental model | POS Gym and POS F&B share patterns (cart, checkout) but diverge in product grids; monolith makes reuse impossible | Never -- extract shared POS patterns (CartContext, CheckoutFlow) from the start |
| Skipping responsive breakpoints | Faster layout, fewer CSS rules | Every screen needs rework when tested on tablet | Never -- set up Tailwind breakpoints (`md:` for tablet) from the first component |
| Using `Math.random()` for mock IDs | Quick, unique-enough IDs for demo | Non-deterministic IDs break navigation and deep-linking; "share this URL" fails | Only if URLs never include IDs (they will -- client profile pages need them) |
| Inline styles for WildWood brand colors | Fast prototyping, no design system overhead | Color values duplicated across 50+ files; changing the orange requires find-and-replace | Never -- define CSS variables or Tailwind theme extension from the start |

## Integration Gotchas

Common mistakes when connecting to external services. For this prototype, there are no real integrations, but the mock patterns set up here will shape Phase 2 integration difficulty.

| Integration (Phase 2) | Prototype Mistake | Correct Approach |
|------------------------|-------------------|------------------|
| Booking.com (bungalow sync) | Modeling bungalow reservations without a "source" field | Add a `source: "booking.com" | "direct" | "walk-in"` field to mock reservation data -- Phase 2 needs this distinction |
| Instagram Graph API | Mocking stats without understanding what the API actually returns (followers count, engagement rate, reach) | Research actual Instagram Graph API response shape and mock that structure -- don't invent metrics |
| Supabase Auth | Simulated login with simple boolean `isAdmin` flag | Mock the full role structure: `{ user: { role: 'admin' | 'staff', name: string } }` so Phase 2 auth wraps around the same context shape |
| Supabase Database | Mock data with client-side filtering/sorting | Structure mock data as arrays of typed objects with the same field names you'd use in Supabase tables -- the `/lib/mock-data/` files should read like a database seed |
| Resend (Newsletter) | Mocking email with a simple form submit | Include realistic email states in mock: `{ status: 'sent' | 'draft' | 'scheduled', recipients: number }` |
| Payment (if ever) | Not tracking payment method in POS | Include `paymentMethod: 'cash' | 'transfer' | 'card'` in mock transactions -- Thai resorts use cash and bank transfer heavily |

## Performance Traps

Patterns that work at small scale but fail as usage grows. Less relevant for a frontend prototype, but the patterns established here carry into Phase 2.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Rendering all 30 days x 8 bungalows in one DOM update | Calendar janks on low-end tablets | Use CSS Grid, avoid dynamic DOM manipulation for calendar cells | On budget Android tablets (the most likely device at a Thai resort) |
| Recharts re-rendering full chart on every state update | Accounting dashboard stutters when switching date ranges | Memoize chart data with `useMemo`; isolate chart components with `React.memo` | When dashboard has 3+ charts on one page |
| Loading all mock data upfront on app start | Slow initial load, especially on 4G (Koh Tao has limited internet) | Lazy-load module data only when that module is visited | When total mock data exceeds 200KB (unlikely for prototype, but matters with images) |
| Large unoptimized images for F&B product photos | Page load exceeds 3 seconds on mobile data | Use Next.js `<Image>` with optimization; or skip product photos entirely (icon + text is sufficient for a POS) | On Koh Tao's typical 10-20 Mbps connection |

## Security Mistakes

Domain-specific security issues. Less critical for a mock prototype, but important patterns to establish.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Hardcoding the "admin" password in client-side code | Anyone with DevTools can see the mock password and assume it's the real one | Use a simple toggle switch for role switching instead of a fake login form -- makes it obviously mock |
| Including real customer data in mock files | Privacy violation if the demo link is shared publicly | ALL customer names and data must be fictional. Never use real guest data from the owner's Excel sheets |
| Deploying the prototype on a guessable Vercel URL without noting it's a demo | Someone finds it via Google and thinks it's a real booking system | Use a custom subdomain like `demo-wildwood.vercel.app` and add noindex meta tags |
| Mock financial data matching real revenue figures | Competitive intelligence leak | Use plausible but fictional revenue numbers (round numbers, not real totals) |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| POS cart requires scrolling to see total | Staff loses track of order total during busy service; may undercharge | Cart total pinned at bottom of screen, always visible. Cart items scroll above the fixed total bar |
| No confirmation before "Encaisser" | Staff accidentally completes a sale while still adding items | Two-step checkout: tap "Encaisser" -> confirmation screen showing full order + total -> tap "Confirmer" |
| Gym pass selection shows all 9 options in a flat list | Choice paralysis; the most-sold passes (1 day, 1 week, 1 month) compete visually with rare ones (6 months, 1 year) | Group by frequency: "Populaires" (1 day, 1 week, 1 month) prominently, "Autres" (3 day, 10 day, 6 month, 1 year, spa, pool) collapsed or secondary |
| Customer search requires typing full name | Slow on tablet keyboard; Thai staff may misspell Western tourist names | Search-as-you-type with 2-character minimum; show recent customers at top; allow search by room number for bungalow residents |
| Date picker uses a native HTML date input | Tiny touch targets for date selection on mobile; inconsistent across browsers | Use a custom date picker with large day cells (48x48px minimum), or month-view calendar for bungalow dates |
| Dashboard shows too many numbers without hierarchy | Owner can't find the one number he cares about (today's revenue) | "Chiffre du jour" (today's revenue) as a hero number at 48px+ font. Everything else is secondary and smaller |
| Navigation uses text-only sidebar links | Thai staff can't quickly find the right module | Icon-first navigation: large icons (32x32+) with French label below. Color-coded per module (orange for POS, green for money, blue for clients) |
| Error states use technical language | "Error: undefined is not an object" means nothing to anyone | All error states in simple French: "Quelque chose n'a pas marche. Reessayez." (Something didn't work. Try again.) with a retry button |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **POS Checkout:** Looks complete with a "Encaisser" button, but missing: confirmation step, payment method selection (cash/transfer), receipt summary screen after sale
- [ ] **Client List:** Shows a paginated table, but missing: search that actually filters, clickable rows that open the client profile, client creation flow
- [ ] **Bungalow Calendar:** Shows colored cells, but missing: tap-to-view reservation detail, occupancy rate calculation, today-marker highlighting
- [ ] **Accounting Dashboard:** Shows a chart, but missing: date range selector that actually changes the data, breakdown by revenue center, expense entry form
- [ ] **Admin Dashboard:** Shows KPI cards, but missing: realistic delta indicators ("+12% vs yesterday"), time-of-day awareness (today's numbers should look partial at 2pm, not a full day's total)
- [ ] **Role Toggle:** Switch between admin/staff exists, but missing: actually hiding admin-only modules (Comptabilite, Newsletter, Instagram) from staff view
- [ ] **Navigation:** Sidebar links work, but missing: active state indicator, module icon consistency, responsive collapse on tablet
- [ ] **F&B POS:** Product grid works, but missing: quantity adjustment (2x Americano), order modification (remove item), category tab persistence when switching back

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Touch targets too small | LOW | Increase button sizes and gaps globally via Tailwind config (spacing, sizing utilities). 1-2 hours if design system is centralized |
| Prototype too polished (client thinks it's done) | MEDIUM | Add prototype banners retroactively; prepare a clear "Phase 2 scope" document; have a frank conversation resetting expectations |
| Mock data unrealistic | LOW | Replace mock data files in `/lib/mock-data/` without touching components (if data layer is properly separated). 2-4 hours |
| Accounting module wrong mental model | HIGH | Requires redesign of the dashboard layout and KPI hierarchy. If built as a monolithic component, this means a rewrite. 1-2 days |
| Calendar too complex | MEDIUM | Strip drag-and-drop, simplify to read-only grid. Easier if calendar is a custom component; harder if built on a library with opinions |
| Desktop-only layout | HIGH | Retrofitting responsive design is painful. Must rework layout shell, navigation, and every module's grid. 2-4 days |
| Scope creep (8 half-built modules) | MEDIUM | Triage: polish Tier 1 modules, convert Tier 3 to placeholder screens with "Bientot disponible" (Coming soon) labels. 1 day |
| Icons not understood by Thai staff | LOW | Swap icon set; add color coding. 2-4 hours if icons are centralized in a component library |
| Sun glare unreadable | LOW-MEDIUM | Adjust color variables in Tailwind theme. 2-4 hours for colors; longer if layout relies on subtle visual distinctions (shadows, gradients) |
| State lost on refresh | LOW | Add localStorage persistence wrapper around context. 2-3 hours if state is already in React Context (not scattered across components) |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Touch targets too small | Phase 1: Design system setup | Test on physical 10" tablet; every POS button > 120x80px with > 12px gap |
| Uncanny valley prototype | Phase 1: Throughout (banner + framing) | Non-technical person reviews demo and correctly identifies it as a prototype |
| Unrealistic mock data | Phase 1: Data layer (first task) | Owner recognizes his business in the mock data (real prices, real menu, realistic names) |
| Accounting mental model mismatch | Phase 1: Dashboard wireframe review | Owner can answer "how much did I make today?" within 2 seconds of viewing the dashboard |
| Calendar over-engineering | Phase 1: Bungalow module | Calendar is read-only; no drag-and-drop; occupancy % visible; renders on 1024px wide screen |
| Desktop-first design | Phase 1: Layout shell (first task) | Every screen tested at 1024x768; no horizontal scroll; no content hidden by on-screen keyboard |
| Scope creep | Phase 1: Sprint planning | Tier 1 modules (POS, Dashboard) at 90%+ before starting Tier 2; Tier 3 are placeholder only |
| French-icon disconnect | Phase 1: POS component design | Icon-only test: can you identify each button's function without reading French labels? |
| Sun glare / outdoor visibility | Phase 1: Design system (color palette) | All text passes 7:1 contrast ratio on dark backgrounds; tested at max brightness |
| State phantom persistence | Phase 1: State architecture | Page refresh retains all data entered during session; "Reset" button restores defaults |

## Sources

- Domain knowledge from POS system design patterns (MEDIUM confidence -- from training data, not verified with 2026 sources)
- Apple Human Interface Guidelines touch target recommendations (HIGH confidence -- well-established standard: 44x44pt minimum)
- WCAG 2.1 contrast ratio guidelines (HIGH confidence -- W3C standard: 4.5:1 AA, 7:1 AAA)
- Common ERP prototype patterns from enterprise software design (MEDIUM confidence -- training data)
- React/Next.js state management patterns (HIGH confidence -- well-documented)
- Koh Tao environmental conditions (MEDIUM confidence -- general knowledge of tropical island conditions)
- Thai resort operations patterns (MEDIUM confidence -- informed by hospitality domain knowledge)

---
*Pitfalls research for: Resort ERP/POS frontend prototype (WildWood, Koh Tao)*
*Researched: 2026-03-01*
