# Staff Pointage Module — Design

## Overview
Staff time-tracking module: POS clock-in/out button + Admin presence dashboard.

## Data
- `staff.json`: 8 members (id, nom, prenom, role, avatar_initiales, couleur_avatar) + 14-day pointage history
- Types: `StaffMember`, `Pointage` in `types.ts`
- `data-access.ts`: `getStaff()` function
- `staff-context.tsx`: state for pointages (arrivée/départ), staff selector

## Components (< 250 lines each)
1. `PointageButton.tsx` — POS sidebar: staff dropdown + arrivée/départ toggle, scale+glow animation, toast
2. `StaffStatusCard.tsx` — Admin card: avatar circle, status dot, progress bar, live duration (60s tick)
3. `WeeklyTable.tsx` — Admin table: period selector, day pills (vert/orange/tiret), weekly totals

## Pages
- `/presence/page.tsx` — Admin: day grid (StaffStatusCards) + history (WeeklyTable)

## Sidebar Integration
- Admin navItems: add "Presence" entry (Users icon)
- POS layout: add PointageButton above role badge

## Staff Identity
- Staff selector dropdown in POS sidebar (no real auth)
