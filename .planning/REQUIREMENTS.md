# WildWood ERP — Requirements

**Project:** WildWood ERP — Beach Fitness Resort POS & Management System
**Milestone:** v1 — MVP Prototype (frontend-only, mock data)
**Approved:** 2026-03-01
**Total:** 41 requirements | 9 categories

---

## v1 Requirements

### Foundation (FOUND) — 7 requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FOUND-01 | Login simule avec 2 roles (admin/staff) et toggle de role pour la demo | P1 |
| FOUND-02 | Design system WildWood : palette orange #C94E0A / bois #8B6B3D / lime #7AB648, typo bold condensee | P1 |
| FOUND-03 | Layout POS : fond sombre, boutons min 120x80px, zero scroll, optimise tablette 10" | P1 |
| FOUND-04 | Layout Admin : sidebar navigation, design responsive desktop/tablette/mobile | P1 |
| FOUND-05 | Mock data JSON realistes avec vrais tarifs, noms coherents, dates plausibles | P1 |
| FOUND-06 | Data access layer abstrait (lib/data-access.ts) pour migration Phase 2 | P1 |
| FOUND-07 | Banners "PROTOTYPE — donnees fictives" sur chaque ecran | P1 |

### POS Caisse (POS) — 8 requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| POS-01 | Grille de boutons Passes Gym (9 types) avec tarifs affiches | P1 |
| POS-02 | Popup saisie client (prenom, nom, email optionnel, telephone optionnel) | P1 |
| POS-03 | Detection client existant par email/telephone | P1 |
| POS-04 | Gestion resident bungalow : badge + pass gym gratuit (pas de transaction) | P1 |
| POS-05 | Onglet F&B : grille boutons par categorie (bowls, cocktails proteines, cafes, smoothies, boissons, snacks) | P1 |
| POS-06 | Panier simple avec selection multiple et total | P1 |
| POS-07 | Bouton "Encaisser" avec feedback visuel de confirmation | P1 |
| POS-08 | Transaction enregistree dans le contexte (pas persistee) | P1 |

### Bungalows (BUNG) — 4 requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| BUNG-01 | Calendrier mensuel avec 8 bungalows en lignes | P1 |
| BUNG-02 | Reservations fictives affichees avec nom client, dates, nuits, montant, statut | P1 |
| BUNG-03 | Vue taux d'occupation par semaine/mois | P1 |
| BUNG-04 | Indicateur resident = acces gym inclus | P1 |

### Comptabilite (COMPT) — 6 requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| COMPT-01 | Vue journaliere : total du jour par centre de revenu + depenses | P1 |
| COMPT-02 | Vue mensuelle : graphique barres revenus vs depenses, tableau recap, solde net | P1 |
| COMPT-03 | Bilan annuel : tableau 12 mois avec totaux | P1 |
| COMPT-04 | 3 centres de revenu : Bungalows, Passes Gym, F&B | P1 |
| COMPT-05 | Saisie manuelle depenses : categorie, montant, date, note | P1 |
| COMPT-06 | Graphiques Recharts pour les vues comptables | P1 |

### Clients (CLI) — 6 requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| CLI-01 | Liste paginee : nom, prenom, email, telephone, type pass, derniere visite, nb visites | P1 |
| CLI-02 | Recherche par nom / email / telephone | P1 |
| CLI-03 | Filtre par type de pass ou periode | P1 |
| CLI-04 | Fiche client : historique passes, montant total depense, dates de visite | P1 |
| CLI-05 | Badge "Resident bungalow" si reservation active | P1 |
| CLI-06 | Bouton "Ajouter a la newsletter" sur chaque fiche | P1 |

### Newsletter (NEWS) — 3 requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NEWS-01 | Liste contacts (nom, email, date ajout, source) | P1 |
| NEWS-02 | Formulaire campagne : titre, objet, corps texte riche | P1 |
| NEWS-03 | Historique envois mockes (date, objet, nb destinataires) | P1 |

### Instagram (INSTA) — 4 requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| INSTA-01 | Nombre d'abonnes + evolution 30 jours | P1 |
| INSTA-02 | Reach moyen et taux d'engagement mockes | P1 |
| INSTA-03 | Top 5 posts par engagement (vignette + stats) | P1 |
| INSTA-04 | Graphique evolution abonnes sur 3/6/12 mois | P1 |

### Dashboard Admin (DASH) — 2 requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| DASH-01 | Chiffres cles du jour : revenus totaux, nb passes vendus, nb nouvelles reservations | P1 |
| DASH-02 | Resume rapide par centre de revenu | P1 |

### Deploiement (DEPLOY) — 1 requirement

| ID | Requirement | Priority |
|----|-------------|----------|
| DEPLOY-01 | Deploiement Vercel avec lien de demo partageable | P1 |

---

## v2 Requirements

Aucun requirement v2 defini pour ce milestone. Le scope v2 (backend Supabase, integrations API, authentification reelle) sera defini apres validation client du MVP prototype.

---

## Out of Scope

- Backend reel (Supabase, Postgres) — Phase 2 apres validation client
- Integrations API (Booking.com, Instagram Graph, Resend) — Phase 2
- Authentification securisee — Phase 2 (login simule en MVP)
- Persistance des donnees saisies (pas de sauvegarde entre sessions)
- Paiement en ligne (Stripe, QR code) — pas prevu
- Application mobile native iOS/Android — pas prevu
- Gestion des stocks F&B — pas prevu
- Export PDF/CSV — Phase 2
- Multi-site (Koh Phangan, Koh Samui) — pas prevu
- Labels multilingues (EN/TH) sur l'interface — francais uniquement avec icones

---

## Traceability

<!-- Updated by roadmapper: maps each requirement to the phase that delivers it -->

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1: Foundation + Design System | Complete |
| FOUND-02 | Phase 1: Foundation + Design System | Complete |
| FOUND-03 | Phase 1: Foundation + Design System | Complete |
| FOUND-04 | Phase 1: Foundation + Design System | Complete |
| FOUND-05 | Phase 1: Foundation + Design System | Complete |
| FOUND-06 | Phase 1: Foundation + Design System | Complete |
| FOUND-07 | Phase 1: Foundation + Design System | Complete |
| POS-01 | Phase 2: POS Cash Register | Complete |
| POS-02 | Phase 2: POS Cash Register | Complete |
| POS-03 | Phase 2: POS Cash Register | Complete |
| POS-04 | Phase 2: POS Cash Register | Complete |
| POS-05 | Phase 2: POS Cash Register | Complete |
| POS-06 | Phase 2: POS Cash Register | Complete |
| POS-07 | Phase 2: POS Cash Register | Complete |
| POS-08 | Phase 2: POS Cash Register | Complete |
| DASH-01 | Phase 3: Admin Shell + Dashboard | Pending |
| DASH-02 | Phase 3: Admin Shell + Dashboard | Pending |
| CLI-01 | Phase 4: Core Admin Modules | Pending |
| CLI-02 | Phase 4: Core Admin Modules | Pending |
| CLI-03 | Phase 4: Core Admin Modules | Pending |
| CLI-04 | Phase 4: Core Admin Modules | Pending |
| CLI-05 | Phase 4: Core Admin Modules | Pending |
| CLI-06 | Phase 4: Core Admin Modules | Pending |
| BUNG-01 | Phase 4: Core Admin Modules | Pending |
| BUNG-02 | Phase 4: Core Admin Modules | Pending |
| BUNG-03 | Phase 4: Core Admin Modules | Pending |
| BUNG-04 | Phase 4: Core Admin Modules | Pending |
| COMPT-01 | Phase 5: Accounting + Reports | Pending |
| COMPT-02 | Phase 5: Accounting + Reports | Pending |
| COMPT-03 | Phase 5: Accounting + Reports | Pending |
| COMPT-04 | Phase 5: Accounting + Reports | Pending |
| COMPT-05 | Phase 5: Accounting + Reports | Pending |
| COMPT-06 | Phase 5: Accounting + Reports | Pending |
| NEWS-01 | Phase 6: Secondary Modules | Pending |
| NEWS-02 | Phase 6: Secondary Modules | Pending |
| NEWS-03 | Phase 6: Secondary Modules | Pending |
| INSTA-01 | Phase 6: Secondary Modules | Pending |
| INSTA-02 | Phase 6: Secondary Modules | Pending |
| INSTA-03 | Phase 6: Secondary Modules | Pending |
| INSTA-04 | Phase 6: Secondary Modules | Pending |
| DEPLOY-01 | Phase 7: Polish + Deployment | Pending |

---
*Generated: 2026-03-01*
