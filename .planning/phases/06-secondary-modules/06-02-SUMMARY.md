# Phase 6 Plan 2: Newsletter Page with Contacts Table, Campaign Dialog, and Campaign History

**One-liner:** Newsletter admin page at /newsletter with shadcn Tabs (Contacts/Campagnes), contacts table with source badges and date formatting, campaign history table with status badges, and campaign creation dialog following depense-dialog pattern with toast confirmation.

## Completed Tasks

| # | Task | Files |
|---|------|-------|
| 1 | Create contacts table and campaign history components | `src/components/newsletter/contacts-table.tsx`, `src/components/newsletter/campagnes-historique.tsx` |
| 2 | Create campaign dialog and newsletter page | `src/components/newsletter/campagne-dialog.tsx`, `src/app/(admin)/newsletter/page.tsx` |

## What Was Built

### ContactsTable (src/components/newsletter/contacts-table.tsx)
- Receives `ContactNewsletter[]` prop, sorts by dateAjout descending via useMemo
- shadcn Table with columns: Nom (prenom + nom), Email, Date d'ajout (dd/MM/yyyy via date-fns), Source
- Source displayed as Badge with variant mapping: profil-client=default, inscription-web=secondary, ajout-manuel=outline
- Shows count above table: "{N} contacts inscrits"

### CampagnesHistorique (src/components/newsletter/campagnes-historique.tsx)
- Receives `CampagneNewsletter[]` prop, sorts by dateEnvoi descending via useMemo
- shadcn Table with columns: Date (dd/MM/yyyy), Objet, Destinataires, Statut
- Status displayed as Badge: envoyee=default, brouillon=secondary
- Section title: "Historique des campagnes"

### CampagneDialog (src/components/newsletter/campagne-dialog.tsx)
- Follows depense-dialog.tsx pattern exactly: controlled open state, DialogTrigger, DialogFooter with Cancel/Submit
- Trigger button: "Nouvelle campagne" (outline variant)
- Fields: Titre (Input), Objet (Input), Corps du message (textarea with shadcn Input styling, rows=8)
- DialogTitle: "Nouvelle campagne", DialogDescription: "Creez un brouillon de campagne newsletter"
- On submit: toast.success("Brouillon enregistre"), resets form, closes dialog
- Validation: titre and objet must be non-empty

### Newsletter Page (src/app/(admin)/newsletter/page.tsx)
- Client component with useEffect loading getNewsletterContacts + getNewsletterCampaigns
- Header: h1 "Newsletter" (font-display text-3xl font-bold), subtitle "Gestion des contacts et campagnes"
- CampagneDialog button top-right (flex items-start justify-between pattern from comptabilite)
- shadcn Tabs with "Contacts" (default) and "Campagnes" tabs
- Contacts tab renders ContactsTable, Campagnes tab renders CampagnesHistorique

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Used textarea with shadcn Input className instead of WYSIWYG editor | Plan explicitly specified styled textarea for prototype simplicity |
| Source badge variant mapping via typed Record | Type-safe mapping ensures all source values have a variant |
| useMemo for sorting in both table components | Consistent with project pattern (dashboard, client stats) for derived data |

## Deviations from Plan

None -- plan executed exactly as written.

## Verification

- `npm run build`: Compiled successfully in 2.1s, zero TypeScript errors
- /newsletter route appears in build output among 11 static routes
- All 3 subcomponents imported and rendered by the page
- Campaign dialog follows depense-dialog controlled state pattern

## Duration

~2 minutes

## Next Phase Readiness

Newsletter module complete. Instagram page (06-03) and remaining secondary modules (06-04) can proceed.
