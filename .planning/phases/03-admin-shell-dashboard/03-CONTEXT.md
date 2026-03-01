# Phase 3: Admin Shell + Dashboard - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin layout shell with collapsible sidebar navigation linking to all admin modules (Dashboard, Clients, Bungalows, Comptabilite, Newsletter, Instagram), plus a dashboard page showing today's key business numbers (revenue total, passes sold, new reservations) with revenue breakdown by 3 centers (Gym, F&B, Bungalows).

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
User granted full discretion on all implementation decisions. Claude should:

- **Sidebar**: Design a collapsible sidebar with icon-first navigation, sensible collapse behavior for tablet/mobile, clear active state indicators using WildWood palette
- **Dashboard stat cards**: Choose layout, visual hierarchy, and card styling that lets the owner see today's numbers at a glance without any interaction
- **Admin visual identity**: Use the light admin theme (already established in Phase 1 layout shell), contrast with POS dark theme, maintain WildWood branding
- **Revenue breakdown**: Choose between table, cards, or chart format for the 3 revenue centers — optimize for immediate readability
- **Responsive behavior**: Ensure admin works well on both desktop and tablet (10" iPad is the primary device)

Key constraints to respect:
- All data comes from existing mock data via data-access.ts + TransactionsContext
- French labels throughout (matching Phase 1-2 conventions)
- Admin layout is already a Client Component with usePathname (decision from 01-04)
- Prototype banner must remain visible

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Optimize for an owner who wants to see "how did we do today?" at a glance.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-admin-shell-dashboard*
*Context gathered: 2026-03-01*
