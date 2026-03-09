# CLAUDE.md — WildWood ERP

## Projet
ERP de gestion pour WildWood Beach Fitness, Koh Tao (Thaïlande).
Resort avec 8 bungalows, salle de sport sur la plage, café/bar.
MVP prototype frontend uniquement — mock data JSON, pas de backend réel.

---

## Stack
- Next.js 14 App Router
- Tailwind CSS + shadcn/ui
- Mock data JSON dans /lib/mock-data/
- State : React useState / useContext uniquement
- Graphiques : Recharts
- QR Code : qrcode.react + html5-qrcode
- Fonts : Barlow Condensed + DM Sans + DM Mono (Google Fonts)
- Langue interface : Français
- Déploiement : Vercel

---

## Règles absolues

### Longueur des fichiers
**Aucun fichier ne dépasse 250 lignes.**
Si un composant dépasse cette limite → découper immédiatement en sous-composants
dans /components/[module]/NomComposant.tsx avant d'écrire la moindre ligne de code.

### Architecture composants
- 1 fichier = 1 responsabilité visuelle claire
- Pages dans /app/[route]/page.tsx — orchestration uniquement, pas de JSX lourd
- Composants dans /components/[nom-module]/
- Hooks custom dans /hooks/
- Helpers et utils dans /lib/utils/

### Mock data
- Toutes les données dans /lib/mock-data/*.json
- Jamais de données hardcodées dans les composants
- Toujours importer depuis /lib/mock-data/

### Modifications ciblées
Quand on te demande d'ajouter un module ou de corriger un bug :
**Ne touche à rien d'autre que ce qui est demandé.**
Pas de refactoring spontané, pas de renommage, pas de "j'en ai profité pour...".

---

## Design System

### Palette CSS (définie dans globals.css)
```css
--ww-bg:           #0F0A06
--ww-surface:      #1A1108
--ww-surface-2:    #241810
--ww-border:       #3D2A18
--ww-orange:       #C94E0A
--ww-orange-glow:  rgba(201,78,10,0.15)
--ww-wood:         #8B6B3D
--ww-lime:         #7AB648
--ww-lime-glow:    rgba(122,182,72,0.12)
--ww-text:         #F5EDD8
--ww-muted:        #8A7A66
--ww-danger:       #EF4444
--ww-success:      #22C55E
```

### Typographie
- Titres / KPIs / Boutons POS : `font-family: 'Barlow Condensed', font-weight: 700-800`
- Body / Labels / UI : `font-family: 'DM Sans', font-weight: 400-500`
- Codes / données : `font-family: 'DM Mono'`

### Règles visuelles
- Fond toujours sombre (--ww-bg ou --ww-surface), jamais blanc/gris clair
- Shadows : uniquement des glow colorés, jamais de shadow grise
- Border-radius cards : max 12px
- Animations : scale(0.97) au clic, translateY(-2px) au hover, transitions 150-200ms
- Aucun Inter, Roboto ou Arial
- Aucun dégradé violet/bleu — ce n'est pas un SaaS générique

---

## Modules implémentés

| Module | Route | Rôle |
|---|---|---|
| Dashboard | /app/dashboard | ADMIN |
| Caisse POS | /app/pos | STAFF + ADMIN |
| Scanner QR | /app/scanner | STAFF + ADMIN |
| Bungalows | /app/bungalows | ADMIN |
| Comptabilité | /app/comptabilite | ADMIN |
| Dépenses & Reçus | /app/depenses | ADMIN |
| Clients | /app/clients | ADMIN |
| Présence Staff | /app/presence | ADMIN |
| Newsletter | /app/newsletter | ADMIN |
| Instagram Stats | /app/instagram | ADMIN |

---

## Rôles (simulés, pas de vrai auth)

**ADMIN** → admin@wildwood.com / password
Accès total à tous les modules.

**STAFF** → staff@wildwood.com / password
Accès uniquement : Caisse POS + Scanner QR + Pointage (sidebar).

Toggle de rôle visible dans la sidebar pour faciliter la démo client.

---

## Structure /lib/mock-data/
```
bungalows.json
bookings.json
gym-clients.json
gym-passes.json
transactions.json
products.json
depenses.json
staff.json
newsletter-contacts.json
instagram-stats.json
```

---

## Monnaie & formats
- Monnaie : Baht thaïlandais (฿)
- Format montant : ฿ XX,XXX (ex : ฿ 12,400)
- Format date : JJ/MM/AAAA
- Format heure : HHhMM (ex : 08h30)

---

## Ce projet n'a PAS (encore)
- Supabase ou base de données réelle
- APIs externes (Booking.com, Instagram, Resend)
- Authentification sécurisée
- Persistance des données entre sessions
- Paiement en ligne
- Export PDF/CSV
