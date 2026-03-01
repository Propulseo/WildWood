---
phase: 01-foundation-design-system
plan: 01
subsystem: ui
tags: [next.js, tailwind-v4, shadcn-ui, oklch, oswald, inter, design-system]

# Dependency graph
requires:
  - phase: none
    provides: first phase, no dependencies
provides:
  - Next.js 16.1.6 project scaffold with TypeScript, Tailwind v4, App Router
  - shadcn/ui components (button, card, badge, separator, avatar)
  - WildWood dual-theme design system (admin light + POS dark) via CSS variables
  - Tailwind @theme inline mapping for all WildWood colors
  - Oswald (display) + Inter (body) font configuration
  - Button component with pos/pos-accent variants and 120x80px touch targets
affects: [01-02, 01-03, 01-04, 01-05, 02-pos-cash-register, all-subsequent-phases]

# Tech tracking
tech-stack:
  added: [next.js 16.1.6, react 19.2.3, tailwindcss 4.x, shadcn/ui, tw-animate-css, date-fns 4.x, lucide-react, recharts 3.x, prettier, class-variance-authority, radix-ui]
  patterns: [CSS-first Tailwind v4 via @theme inline, OKLCH color variables, next/font/google for fonts, h-dvh instead of h-screen]

key-files:
  created: [package.json, next.config.ts, components.json, tsconfig.json, eslint.config.mjs, postcss.config.mjs, src/app/globals.css, src/app/layout.tsx, src/app/page.tsx, src/components/ui/button.tsx, src/components/ui/card.tsx, src/components/ui/badge.tsx, src/components/ui/separator.tsx, src/components/ui/avatar.tsx, src/lib/utils.ts, .gitignore]
  modified: []

key-decisions:
  - "Used stone base color for shadcn/ui init, then replaced with full WildWood palette"
  - "Oswald variable font for display headings (weights 200-700), Inter for body text"
  - "POS button variants use Tailwind utility classes (bg-wildwood-bois, bg-wildwood-orange) mapped via @theme inline, not hardcoded OKLCH values"
  - "No React Compiler (skip for prototype speed)"
  - "No tailwind.config.js (CSS-first Tailwind v4)"

patterns-established:
  - "CSS-first theming: all design tokens as CSS variables in globals.css, mapped to Tailwind via @theme inline"
  - "Dual-theme via CSS class: .pos-theme overrides CSS variables for dark POS, :root is admin light"
  - "Font variables on html element: --font-inter and --font-oswald, used as font-sans and font-display"
  - "h-dvh over h-screen: dynamic viewport height for tablet/mobile compatibility"
  - "OKLCH color format: all colors wrapped in oklch() function (Tailwind v4 requirement)"

# Metrics
duration: 6min
completed: 2026-03-01
---

# Phase 1 Plan 1: Foundation + Design System Scaffold Summary

**Next.js 16.1.6 scaffold with Tailwind v4 CSS-first theming, WildWood dual-theme (admin light cream + POS dark) in OKLCH, Oswald + Inter fonts, and shadcn/ui Button with 120x80px POS touch variants**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-01T08:00:20Z
- **Completed:** 2026-03-01T08:06:17Z
- **Tasks:** 2
- **Files modified:** 27 (23 created in Task 1 + 4 modified in Task 2)

## Accomplishments
- Scaffolded Next.js 16.1.6 project with TypeScript, Tailwind CSS v4, shadcn/ui, and all Phase 1 dependencies
- Established complete WildWood design system with dual-theme (admin light + POS dark) using OKLCH CSS variables
- Configured Oswald (display) + Inter (body) fonts via next/font/google with CSS variable mapping
- Added POS button variants (pos, pos-accent) with 120x80px minimum touch targets for tablet use

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js 16 project with shadcn/ui and dependencies** - `b9921ad` (feat)
2. **Task 2: Configure WildWood design system (globals.css, fonts, button variants)** - `3475c9c` (feat)

## Files Created/Modified
- `package.json` - Next.js 16.1.6, React 19.2.3, Tailwind v4, shadcn/ui, date-fns, lucide-react, recharts
- `next.config.ts` - Minimal config (no output: export, no custom webpack)
- `components.json` - shadcn/ui configuration (new-york style, stone base, OKLCH)
- `tsconfig.json` - TypeScript configuration with @/* import alias
- `eslint.config.mjs` - ESLint 9 configuration
- `postcss.config.mjs` - PostCSS with Tailwind v4 plugin
- `src/app/globals.css` - Full WildWood design system: admin light + POS dark themes, @theme inline mapping, brand colors, sidebar, chart, and banner variables
- `src/app/layout.tsx` - Root layout with Oswald + Inter fonts, lang="fr", WildWood metadata
- `src/app/page.tsx` - Default page (h-screen replaced with h-dvh)
- `src/components/ui/button.tsx` - shadcn Button + pos/pos-accent variants and pos size (120x80px)
- `src/components/ui/card.tsx` - shadcn Card component
- `src/components/ui/badge.tsx` - shadcn Badge component
- `src/components/ui/separator.tsx` - shadcn Separator component
- `src/components/ui/avatar.tsx` - shadcn Avatar component
- `src/lib/utils.ts` - cn() utility (clsx + tailwind-merge)
- `.gitignore` - Node.js + Next.js gitignore

## Decisions Made
- **Stone base color for shadcn init:** Closest to WildWood earthy palette; immediately replaced with full WildWood OKLCH values
- **Oswald over Bebas Neue:** Variable font (200-700 weights) vs single-weight (400 only), per RESEARCH.md recommendation
- **Tailwind utility classes in button variants:** Used `bg-wildwood-bois` and `bg-wildwood-orange` mapped through @theme inline rather than hardcoded OKLCH values
- **No React Compiler:** Declined during project scaffold -- adds build time for minimal benefit in a prototype

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Replaced h-screen with h-dvh in default page.tsx**
- **Found during:** Task 2 (verification checks)
- **Issue:** Default Next.js page.tsx used `min-h-screen` which doesn't account for mobile browser chrome
- **Fix:** Replaced with `min-h-dvh` (dynamic viewport height) per anti-pattern guidance in RESEARCH.md
- **Files modified:** src/app/page.tsx
- **Verification:** grep -r "h-screen" src/ returns no matches
- **Committed in:** 3475c9c (part of Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Minor fix to follow established anti-pattern guidance. No scope creep.

## Issues Encountered
- `create-next-app` prompted for React Compiler selection even with explicit flags; resolved by piping "n" to stdin
- `.gitignore` was duplicated during file move from subdirectory; cleaned up by deduplication

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Project builds cleanly with `npm run build`
- All Tailwind utility classes (bg-wildwood-orange, font-display, etc.) are available for immediate use
- Button component ready for POS development with size="pos" variant
- Ready for Plan 01-02: TypeScript types, mock data, and data access layer

---
*Phase: 01-foundation-design-system*
*Completed: 2026-03-01*
