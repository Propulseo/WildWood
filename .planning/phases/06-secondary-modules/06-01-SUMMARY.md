# Phase 6 Plan 1: Newsletter & Instagram Types, Mock Data, and Data Access

**One-liner:** Added 4 TypeScript interfaces (ContactNewsletter, CampagneNewsletter, InstagramPost, InstagramStats), 3 mock data JSON files (18 contacts, 6 campaigns, full IG stats), and 3 data-access functions following the existing sole-importer pattern.

## Completed Tasks

| # | Task | Files |
|---|------|-------|
| 1 | Add Newsletter and Instagram types + create mock data files | `src/lib/types.ts`, `src/lib/mock-data/newsletter-contacts.json`, `src/lib/mock-data/newsletter-campaigns.json`, `src/lib/mock-data/instagram-stats.json` |
| 2 | Add data-access functions | `src/lib/data-access.ts` |

## What Was Built

### Types (src/lib/types.ts)
- **ContactNewsletter**: id (news-XXX), prenom, nom, email, dateAjout, source (inscription-web | ajout-manuel | profil-client)
- **CampagneNewsletter**: id (camp-XXX), titre, objet, dateEnvoi, nbDestinataires, statut (envoyee | brouillon)
- **InstagramPost**: id (ig-post-XXX), legende, datePublication, likes, commentaires, portee, couleurVignette
- **InstagramStats**: abonnes, evolutionAbonnes30j, tauxEngagement, porteeMoyenne, topPosts[], historiqueAbonnes[]

### Mock Data
- **newsletter-contacts.json**: 18 contacts with French names, mixed sources (7 inscription-web, 6 profil-client, 5 ajout-manuel), dates spanning Sep 2025 to Feb 2026
- **newsletter-campaigns.json**: 6 campaigns (5 envoyee, 1 brouillon), French subjects about WildWood activities, nbDestinataires 12-18
- **instagram-stats.json**: 2847 abonnes, +127 over 30 days, 4.2% engagement, 5 top posts with nature/fitness/food themes and WildWood-adjacent colors, 12-month follower history (Apr 2025 1800 to Mar 2026 2847)

### Data Access (src/lib/data-access.ts)
- `getNewsletterContacts()`: Returns ContactNewsletter[]
- `getNewsletterCampaigns()`: Returns CampagneNewsletter[]
- `getInstagramStats()`: Returns InstagramStats
- All follow existing async pattern with type assertions
- Section comments: `// --- Newsletter ---` and `// --- Instagram ---`

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Newsletter contact IDs use news-XXX convention | Consistent with existing ID patterns (cli-XXX, exp-XXX) |
| Campaign IDs use camp-XXX convention | Distinct prefix for easy identification |
| Instagram post IDs use ig-post-XXX convention | Clear domain prefix |
| couleurVignette uses nature/wellness hex colors | WildWood brand alignment (greens, earth tones, warm oranges) |
| 18 contacts matches the max nbDestinataires in campaigns | Logical consistency -- latest campaign targets all contacts |

## Deviations from Plan

None -- plan executed exactly as written.

## Verification

- `npm run build`: Compiled successfully, zero TypeScript errors, all 10 routes generated

## Duration

~2 minutes

## Next Phase Readiness

Types, mock data, and data-access layer are ready for the Newsletter and Instagram UI pages in subsequent plans (06-02, 06-03, 06-04).
