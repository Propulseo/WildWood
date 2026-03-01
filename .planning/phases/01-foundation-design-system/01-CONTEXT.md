# Phase 1: Foundation + Design System - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Project scaffold (Next.js App Router + Tailwind + shadcn/ui), WildWood design system (color palette, typography, POS touch components), TypeScript type definitions, realistic mock data with real pricing, data access abstraction layer, simulated login with role toggle, prototype banner on every screen. No business logic beyond auth simulation — that starts in Phase 2.

</domain>

<decisions>
## Implementation Decisions

### Login & Role Toggle
- Login page minimal : ecran simple avec selection de role (Admin / Staff) et bouton "Entrer" — pas de champs email/mot de passe
- Mode Staff = POS uniquement (caisse gym + F&B), aucun acces aux modules admin
- Toggle de role via badge cliquable dans le header — switch instantane entre Admin et Staff sans revenir au login
- Role persiste en localStorage — on reste connecte apres refresh, bouton "Deconnexion" pour revenir au login

### Theme POS vs Admin
- POS : fond gris fonce (#1F1F1F), accents bois (#8B6B3D) et orange (#C94E0A), ambiance chaleureuse resort — pas terminal/tech
- Admin : tons creme/sable (#FAF7F2), sidebar bois fonce, ambiance organique coherente avec l'identite resort
- Typographie : police bold condensee (style Bebas Neue / Oswald) pour les titres, Inter pour le corps de texte
- Icones : Lucide pour la navigation + emojis produits sur les boutons F&B (acai bowl, espresso, etc.) pour le staff thai

### Mock Data & Realisme
- 30-40 clients fictifs — melange residents bungalow et visiteurs gym
- Noms mix international (europeens, australiens, russes, americains) refletant la clientele reelle de Koh Tao
- Reservations bungalow sur 3 mois glissants (fevrier-mars-avril 2026) pour montrer historique + futur
- Chiffre d'affaires mensuel realiste estime par Claude selon tarifs WildWood et capacite 8 bungalows

### Prototype Banner
- Barre fixe fine en haut de chaque page, toujours visible, non fermable
- Texte : "PROTOTYPE — Donnees fictives"
- Ne doit jamais etre confondu avec un produit fini

### Claude's Discretion
- Couleurs exactes du bandeau prototype (doit etre visible mais pas agressif)
- Volume exact de transactions mockees et repartition temporelle
- Choix des polices condensees specifiques (Bebas Neue vs Oswald vs autre)
- Espacement et tailles des composants shadcn/ui customises
- Structure exacte des fichiers mock JSON

</decisions>

<specifics>
## Specific Ideas

- L'ambiance POS doit evoquer le bois naturel de la salle de sport WildWood — pas un terminal de caisse generique
- Les emojis sur les boutons F&B sont essentiels : le staff thai ne lit pas le francais, les emojis rendent les produits reconnaissables instantanement
- Le toggle admin/staff doit etre une feature visible et fluide pour la demo client — c'est un moment "wow" quand on montre les deux interfaces

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-design-system*
*Context gathered: 2026-03-01*
