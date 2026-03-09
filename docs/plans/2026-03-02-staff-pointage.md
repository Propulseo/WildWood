# Staff Pointage Module — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add staff time-tracking (pointage) with POS clock-in/out button and admin presence dashboard.

**Architecture:** Mock data layer with 8 staff + 14-day history. StaffContext manages pointage state (same pattern as ExpensesContext). Three presentation components under /components/presence/. Admin page at /presence. POS header gets a compact pointage section with staff selector dropdown.

**Tech Stack:** Next.js 16, React 19, Tailwind v4 CSS-first, Barlow Condensed + DM Sans, lucide-react icons

---

### Task 1: Mock Data — staff.json

**Files:**
- Create: `src/lib/mock-data/staff.json`

**Step 1: Create the mock data file**

8 staff members with 14-day pointage history. IDs follow `staff-XXX` convention.
Roles: 3x "Reception", 3x "Bar", 2x "Entretien".
Each has `pointages[]` with entries for last 14 days (some days off = missing entries).
Today's entry for 5 of them has `heure_depart: null` (currently working).

```json
[
  {
    "id": "staff-001",
    "nom": "Dupont",
    "prenom": "Jean-Luc",
    "role": "Réception",
    "avatar_initiales": "JL",
    "couleur_avatar": "#C94E0A",
    "pointages": [
      { "date": "2026-02-16", "heure_arrivee": "08:30", "heure_depart": "17:00" },
      ...14 days of entries
    ]
  },
  ...7 more staff
]
```

**Step 2: Commit**

```bash
git add src/lib/mock-data/staff.json
git commit -m "feat(presence): add staff mock data with 14-day history"
```

---

### Task 2: Types — StaffMember + Pointage

**Files:**
- Modify: `src/lib/types.ts` (append after line 209, before Role type)

**Step 1: Add interfaces**

```typescript
// --- Staff Pointage ---

/** Enregistrement d'un pointage journalier */
export interface Pointage {
  /** Date du pointage -- format ISO YYYY-MM-DD */
  date: string
  /** Heure d'arrivee -- format HH:mm */
  heure_arrivee: string
  /** Heure de depart -- format HH:mm, null si encore present */
  heure_depart: string | null
}

/** Membre du staff avec historique de pointage */
export interface StaffMember {
  id: string
  nom: string
  prenom: string
  /** Role au sein du resort */
  role: 'Réception' | 'Bar' | 'Entretien'
  /** Initiales pour l'avatar (ex: "JL") */
  avatar_initiales: string
  /** Couleur hexadecimale de l'avatar */
  couleur_avatar: string
  /** Historique des pointages */
  pointages: Pointage[]
}
```

**Step 2: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat(presence): add StaffMember and Pointage types"
```

---

### Task 3: Data Access — getStaff()

**Files:**
- Modify: `src/lib/data-access.ts` (add import + function)

**Step 1: Add import at line 1 area**

Add to the import of types:
```typescript
import type { ..., StaffMember } from './types'
```

Add JSON import:
```typescript
import staffData from './mock-data/staff.json'
```

**Step 2: Add function at end of file**

```typescript
// --- Staff ---

export async function getStaff(): Promise<StaffMember[]> {
  return staffData as StaffMember[]
}
```

**Step 3: Commit**

```bash
git add src/lib/data-access.ts
git commit -m "feat(presence): add getStaff data access function"
```

---

### Task 4: Context — StaffContext

**Files:**
- Create: `src/contexts/staff-context.tsx`

**Step 1: Create context**

Follow the exact pattern from `expenses-context.tsx`:
- Load staff from `getStaff()` on mount
- `pointerArrivee(staffId)`: add today's entry with current time, heure_depart null
- `pointerDepart(staffId)`: set heure_depart to current time on today's entry
- `selectedStaffId` + `setSelectedStaffId`: for POS staff selector
- `getPointageAujourdhui(staffId)`: helper returning today's Pointage or undefined

```typescript
'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { StaffMember, Pointage } from '@/lib/types'
import { getStaff } from '@/lib/data-access'

interface StaffContextType {
  staff: StaffMember[]
  selectedStaffId: string | null
  setSelectedStaffId: (id: string) => void
  pointerArrivee: (staffId: string) => string // returns heure
  pointerDepart: (staffId: string) => string  // returns heure
  getPointageAujourdhui: (staffId: string) => Pointage | undefined
}
```

Max ~80 lines. Well under 250.

**Step 2: Commit**

```bash
git add src/contexts/staff-context.tsx
git commit -m "feat(presence): add StaffContext with pointage state"
```

---

### Task 5: Component — PointageButton.tsx

**Files:**
- Create: `src/components/presence/PointageButton.tsx`

**Step 1: Create the component**

Compact block for the POS header area:
- Staff selector dropdown (DM Sans, small)
- If not pointed: "POINTER ARRIVEE" button (bg-ww-lime, Barlow Condensed 700, Play icon)
- If already pointed: "Arrive a 08h34" text (green) + "POINTER DEPART" button (bg-ww-danger, Square icon)
- Animation: scale(1.05) + box-shadow glow 300ms on click
- Toast via sonner: "Arrivee enregistree — 08h34" or "Depart enregistre — 17h12"

```tsx
'use client'

import { useStaff } from '@/contexts/staff-context'
import { Play, Square, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
```

Target: ~120 lines.

**Step 2: Commit**

```bash
git add src/components/presence/PointageButton.tsx
git commit -m "feat(presence): add PointageButton component for POS"
```

---

### Task 6: Component — StaffStatusCard.tsx

**Files:**
- Create: `src/components/presence/StaffStatusCard.tsx`

**Step 1: Create the card component**

Per the spec:
- Avatar circle with initiales + couleur_avatar background
- Status indicator: green dot (present), red dot (absent), yellow dot (parti)
- Name (Barlow Condensed 700) + role (DM Sans muted)
- Arrivee / Depart times
- Progress bar: from heure_arrivee to now (or heure_depart)
- Duration auto-calculated, ticked every 60s via useEffect interval
- Format durations as "8h30"

```tsx
'use client'

import { useState, useEffect } from 'react'
import type { StaffMember } from '@/lib/types'
```

Target: ~130 lines.

**Step 2: Commit**

```bash
git add src/components/presence/StaffStatusCard.tsx
git commit -m "feat(presence): add StaffStatusCard with live duration"
```

---

### Task 7: Component — WeeklyTable.tsx

**Files:**
- Create: `src/components/presence/WeeklyTable.tsx`

**Step 1: Create the weekly history table**

- Period selector: "Cette semaine" / "7 derniers jours" / "14 derniers jours"
- Table: Nom | Lun | Mar | Mer | Jeu | Ven | Sam | Dim | Total
- Each day cell: green pill "8h30" / orange animated pill (en cours) / tiret muted
- Total column: Barlow Condensed 700 in --ww-orange
- Uses `@/components/ui/table` for table structure

```tsx
'use client'

import { useState } from 'react'
import type { StaffMember } from '@/lib/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
```

Target: ~180 lines. If it goes over, extract period selector or day cell into helpers.

**Step 2: Commit**

```bash
git add src/components/presence/WeeklyTable.tsx
git commit -m "feat(presence): add WeeklyTable with period selector"
```

---

### Task 8: Admin Page — /presence/page.tsx

**Files:**
- Create: `src/app/(admin)/presence/page.tsx`

**Step 1: Create the admin page**

- Server component that fetches staff data, passes to client child
- Title: "PRESENCE DU JOUR" (Barlow Condensed 800) + date in --ww-muted
- Grid of StaffStatusCards (3-4 columns)
- Separator
- WeeklyTable section below

```tsx
import { getStaff } from '@/lib/data-access'
import { PresenceContent } from './presence-content'

export default async function PresencePage() {
  const staff = await getStaff()
  return <PresenceContent staff={staff} />
}
```

Client wrapper at `src/app/(admin)/presence/presence-content.tsx`:
- Wraps StaffStatusCard grid + WeeklyTable
- Passes today's date formatted in French

Target: page ~15 lines, content ~80 lines.

**Step 2: Commit**

```bash
git add src/app/(admin)/presence/
git commit -m "feat(presence): add admin presence page with day + history views"
```

---

### Task 9: Sidebar Integration — Admin + POS

**Files:**
- Modify: `src/app/(admin)/layout.tsx` (navItems array + pageTitles + import + provider)
- Modify: `src/app/(pos)/layout.tsx` (add PointageButton + StaffProvider)

**Step 1: Admin sidebar — add nav entry**

In `navItems` array (line 28), add after Scanner QR:
```typescript
{ href: '/presence', label: 'Presence', icon: UserCheck },
```

In `pageTitles` (line 40), add:
```typescript
'/presence': 'Presence',
```

Add `UserCheck` to lucide-react imports.

**Step 2: Admin layout — wrap with StaffProvider**

Add `StaffProvider` as outermost wrapper (same pattern as other providers).

**Step 3: POS layout — add PointageButton**

Convert POS layout to 'use client'. Add StaffProvider + PointageButton in the header, left of RoleToggle.

```tsx
<header className="flex items-center justify-between px-5 py-2.5 border-b border-ww-border bg-ww-surface">
  <h1>...</h1>
  <div className="flex items-center gap-4">
    <PointageButton />
    <RoleToggle />
  </div>
</header>
```

**Step 4: Commit**

```bash
git add src/app/(admin)/layout.tsx src/app/(pos)/layout.tsx
git commit -m "feat(presence): integrate pointage in admin sidebar and POS header"
```

---

### Task 10: CSS Animations — pointage glow

**Files:**
- Modify: `src/app/globals.css` (add animation in @layer utilities)

**Step 1: Add pointage click animation**

```css
/* Pointage button click animation */
@keyframes pointage-glow {
  0% { transform: scale(1); box-shadow: none; }
  50% { transform: scale(1.05); box-shadow: 0 0 20px var(--ww-lime-glow); }
  100% { transform: scale(1); box-shadow: none; }
}
.ww-pointage-glow {
  animation: pointage-glow 300ms ease-out;
}
@keyframes pointage-glow-danger {
  0% { transform: scale(1); box-shadow: none; }
  50% { transform: scale(1.05); box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }
  100% { transform: scale(1); box-shadow: none; }
}
.ww-pointage-glow-danger {
  animation: pointage-glow-danger 300ms ease-out;
}

/* Presence pill pulse for "en cours" */
@keyframes presence-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
.ww-presence-pulse {
  animation: presence-pulse 2s ease-in-out infinite;
}
```

**Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(presence): add pointage glow and presence pulse animations"
```

---

### Task 11: Verify — Build + Visual Check

**Step 1: Run build**

```bash
npm run build
```

Expected: No errors, all pages compile.

**Step 2: Visual check**

```bash
npm run dev
```

Check:
- POS header shows staff dropdown + pointage button
- Click arrivee → toast + button switches to depart
- /presence page shows day grid + weekly table
- Admin sidebar has "Presence" entry

**Step 3: Final commit if any fixes needed**
