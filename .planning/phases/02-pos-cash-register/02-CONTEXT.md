# Phase 2: POS Cash Register - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Touch-first cash register interface for WildWood gym. Staff can ring up gym passes (9 types, 350-15000 baht) and F&B products (20 items across 6 categories) in under 3 taps on a 10" tablet. Includes cart with running total, client entry popup with existing client detection, bungalow resident badge (gym pass free), and "Encaisser" checkout with visual confirmation. Transaction is stored in-memory context (not persisted).

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion

User granted full implementation discretion on all areas. Claude should make choices that:

1. **Optimize for the core value:** 3-tap checkout on tablet, no training needed
2. **Respect Phase 1 foundations:** dark POS theme, 120x80px minimum touch targets, h-dvh no scroll, Oswald/Inter fonts, pos button variants
3. **Follow existing data contracts:** use data-access.ts async functions, French field names, existing type interfaces

Specific areas where Claude decides:

- **Product grid layout:** Tab switching between Passes Gym and F&B, button organization, category navigation for F&B sub-categories
- **Cart UX:** Sidebar vs bottom bar vs overlay, running total display, item quantity management
- **Checkout flow:** What happens on "Encaisser" — confirmation modal, animation, success feedback, cart reset
- **Client popup for gym passes:** Modal design, form fields (prenom, nom, email, telephone), existing client detection by email/phone match, auto-fill behavior
- **Bungalow resident handling:** Badge display, free pass logic, visual differentiation
- **Transaction recording:** In-memory state management approach, transaction creation from cart items
- **Empty states and edge cases:** No items in cart, client not found, etc.

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Follow the WildWood resort aesthetic (warm, earthy, Koh Tao beach fitness vibe) established in Phase 1.

Key constraints from ROADMAP.md success criteria:
- 9 gym pass types with exact WildWood prices displayed
- 6 F&B categories: bowls, cocktails proteines, cafes, smoothies, boissons, snacks
- Existing client detection by email OR phone match
- Bungalow resident = gym pass free (no transaction amount charged)
- "Encaisser" button with visual confirmation feedback

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-pos-cash-register*
*Context gathered: 2026-03-01*
