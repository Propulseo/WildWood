# WildWood ERP — Koh Tao Beach Fitness & Resort

## What This Is

Un ERP sur-mesure pour WildWood, un resort de fitness sur la plage à Koh Tao (Thaïlande) combinant 8 bungalows, une salle de sport en bois naturel, un ice bath, un sauna, une piscine et un café/snack bar. La plateforme remplace la gestion Excel actuelle en centralisant les passes gym, les ventes F&B et le suivi des bungalows dans une interface web ultra-simple pour le staff terrain et complète pour le propriétaire.

**Ce milestone = MVP Prototype** : frontend pur avec données mockées, déployé sur Vercel pour validation client avant investissement backend.

## Core Value

Le staff terrain (réceptionniste, barman) doit pouvoir enregistrer un encaissement en moins de 3 clics sur tablette, sans formation — si la caisse POS n'est pas instantanée et intuitive, rien d'autre n'a de valeur.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Login simulé avec 2 rôles (admin/staff) et toggle de rôle pour la démo
- [ ] Interface POS Passes Gym : 9 types de passes avec vrais tarifs, popup saisie client
- [ ] Interface POS F&B : grille de boutons par catégorie (bowls, cocktails protéinés, cafés, smoothies, boissons, snacks), panier simple, encaissement
- [ ] Gestion résidents bungalow : pass gym gratuit si client résident
- [ ] Module Clients : liste paginée, recherche, fiche individuelle avec historique
- [ ] Module Bungalows : calendrier mois avec 8 bungalows en lignes, réservations fictives, taux d'occupation
- [ ] Module Comptabilité : dashboard journalier, bilan mensuel avec graphiques, vision par centre de revenu (Gym, F&B, Bungalows)
- [ ] Module Comptabilité : saisie manuelle des dépenses par catégorie
- [ ] Module Newsletter : liste contacts, formulaire campagne (sans envoi réel)
- [ ] Module Instagram : dashboard stats mockées avec graphique d'évolution
- [ ] Dashboard admin : chiffres clés du jour (revenus totaux, passes vendus, nouvelles réservations)
- [ ] Design WildWood : palette orange brûlé / bois / vert lime, typo bold, interface POS fond sombre boutons larges
- [ ] Déploiement Vercel avec lien de démo partageable

### Out of Scope

- Backend réel (Supabase, Postgres) — Phase 2 après validation client
- Intégrations API (Booking.com, Instagram Graph, Resend) — Phase 2
- Authentification sécurisée — Phase 2 (login simulé en MVP)
- Persistance des données saisies (pas de sauvegarde entre sessions)
- Paiement en ligne (Stripe, QR code) — pas prévu
- Application mobile native iOS/Android — pas prévu
- Gestion des stocks F&B — pas prévu
- Export PDF/CSV — Phase 2
- Multi-site (Koh Phangan, Koh Samui) — pas prévu
- Labels multilingues (EN/TH) sur l'interface — français uniquement avec icônes

## Context

**Lieu :** Koh Tao, Thaïlande. Resort fitness avec ambiance bois naturel sur la plage.

**Clientèle duale :**
- Résidents : séjournent dans les 8 bungalows (réservés via Booking.com). Accès gym inclus.
- Visiteurs extérieurs : achètent des passes gym à la journée/semaine/mois et consomment au bar.

**Gestion actuelle :** 100% Excel. Pas de visibilité comptable propre, pas de base clients.

**Staff terrain :** Réceptionniste et barman thaïlandais. Interface en français mais avec icônes visuelles pour compenser la barrière de la langue. Utilisation sur tablette 10 pouces.

**Propriétaire :** Français, gère remote ou sur place. A besoin de dashboards, bilans comptables, et d'une vue marketing (clients + Instagram).

**Tarification Passes Gym (tarifs réels) :**

| Pass | Prix |
|------|------|
| 1 jour | 350 ฿ |
| 3 jours | 800 ฿ |
| 1 semaine | 1 200 ฿ |
| 10 jours (expire 90j) | 1 400 ฿ |
| 1 mois | 2 000 ฿ |
| 6 mois | 9 000 ฿ |
| 1 an | 15 000 ฿ |
| Spa pass (1 jour) | 250 ฿ |
| Pool pass only | 200 ฿ |

**Produits F&B (tarifs réels + estimations cohérentes) :**

| Catégorie | Produit | Prix |
|-----------|---------|------|
| Bowls | Açaí Bowl / Protein Bowl / Smoothie Bowl | 220 ฿ |
| Cocktails protéinés | Whey Shake / Post-Workout / Mass Gainer | 220 ฿ |
| Cafés | Espresso / Americano / Latte / Cappuccino | 70 ฿ |
| Smoothies | Mango / Banana-Peanut / Green Detox | 120 ฿ |
| Boissons | Eau / Coca / Jus de fruits / Bière | 40–100 ฿ |
| Snacks | Banana Pancake / Granola Bar / Toast Avocat | 100–150 ฿ |

**Bungalows :** 8 unités numérotées (Bungalow 1 à 8), pas de noms spécifiques.

**Design :** Pas de logo ni assets fournis. Improviser avec la palette WildWood (orange #C94E0A, bois #8B6B3D, vert lime #7AB648) et une typographie bold condensée.

## Constraints

- **Stack**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui — imposé par le PRD
- **Données**: Mock data JSON statiques dans /lib/mock-data/ — aucune BDD
- **State**: React useState/useContext uniquement — pas de state management externe
- **Langue**: Interface 100% en français
- **UX POS**: Zéro scroll sur l'écran principal, boutons minimum 120x80px, utilisable aux doigts sur tablette 10"
- **Graphiques**: Recharts ou Chart.js avec données mockées
- **Hébergement**: Vercel (gratuit)
- **Budget**: MVP prototype = investissement minimal, validation client avant Phase 2

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Frontend pur sans backend pour le MVP | Valider l'UX avec le client avant d'investir dans Supabase + intégrations | — Pending |
| 9 types de passes gym (vs 4 dans le PRD initial) | Tarification réelle du client plus granulaire | — Pending |
| Français uniquement (pas de bilingue) | Icônes suffisent pour le staff thai, simplifier le MVP | — Pending |
| Pas de logo/assets fournis | Design improvisé sur la palette couleurs WildWood | — Pending |
| Prix F&B partiels complétés avec estimations | Valeurs ajustables après validation client | — Pending |

---
*Last updated: 2026-03-01 after initialization*
