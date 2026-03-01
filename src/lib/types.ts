// src/lib/types.ts -- Single source of truth for all data shapes
// These types become the Supabase schema contract in Phase 2

/** Client du resort -- visiteur (pass gym) ou resident (bungalow) */
export interface Client {
  id: string
  prenom: string
  nom: string
  email?: string
  telephone?: string
  /** visiteur = achete des passes gym, resident = loge dans un bungalow */
  type: 'visiteur' | 'resident'
  /** Reference au bungalow si resident, undefined si visiteur */
  bungalowId?: string
  /** Date d'inscription -- format ISO YYYY-MM-DD */
  dateCreation: string
  /** Derniere visite au resort -- format ISO YYYY-MM-DD */
  derniereVisite?: string
  /** Nombre total de visites enregistrees */
  nombreVisites: number
  /** Opt-in newsletter */
  newsletter: boolean
}

/** Type de pass gym avec tarification reelle WildWood */
export interface GymPass {
  id: string
  /** Nom affiche: "1 jour", "3 jours", "1 semaine", etc. */
  nom: string
  /** Prix en baht thailandais (entier, pas de decimales) */
  prix: number
  /** Duree de validite en jours: 1, 3, 7, 10, 30, 180, 365 */
  dureeJours: number
  /** Jours avant expiration pour les passes multi-jours non consecutifs (ex: 10 jours expire en 90j) */
  expireJours?: number
  /** Description optionnelle du pass */
  description?: string
}

/** Produit du bar/cafe F&B avec emoji pour reconnaissance visuelle par le staff */
export interface FnbProduct {
  id: string
  nom: string
  /** Categorie pour le regroupement dans l'interface POS */
  categorie: 'bowls' | 'cocktails-proteines' | 'cafes' | 'smoothies' | 'boissons' | 'snacks'
  /** Prix en baht thailandais */
  prix: number
  /** Emoji pour identification rapide par le staff thai */
  emoji: string
}

/** Bungalow du resort avec ses reservations */
export interface Bungalow {
  id: string
  /** Numero du bungalow (1-8) */
  numero: number
  /** Liste des reservations pour ce bungalow */
  reservations: Reservation[]
}

/** Reservation d'un bungalow par un client */
export interface Reservation {
  id: string
  bungalowId: string
  clientId: string
  /** Date de debut du sejour -- format ISO YYYY-MM-DD */
  dateDebut: string
  /** Date de fin du sejour -- format ISO YYYY-MM-DD */
  dateFin: string
  /** Nombre de nuits */
  nuits: number
  /** Montant total en baht */
  montant: number
  /** Statut de la reservation */
  statut: 'confirmee' | 'en-cours' | 'terminee' | 'annulee'
}

/** Transaction enregistree dans la caisse */
export interface Transaction {
  id: string
  /** Date et heure de la transaction -- format ISO YYYY-MM-DDTHH:mm:ss */
  date: string
  /** Type de produit vendu */
  type: 'gym-pass' | 'fnb' | 'bungalow'
  /** Centre de revenu pour la comptabilite */
  centreRevenu: 'Gym' | 'F&B' | 'Bungalows'
  /** Client associe (optionnel pour les ventes anonymes au bar) */
  clientId?: string
  /** Lignes de la transaction */
  items: TransactionItem[]
  /** Montant total en baht */
  total: number
  /** Mode de paiement */
  methode: 'especes' | 'virement'
}

/** Ligne individuelle d'une transaction */
export interface TransactionItem {
  /** Reference au produit (pass, fnb, ou reservation) */
  produitId: string
  /** Nom du produit pour affichage */
  nom: string
  /** Quantite achetee */
  quantite: number
  /** Prix unitaire en baht */
  prixUnitaire: number
  /** Sous-total = quantite x prixUnitaire */
  sousTotal: number
}

/** Depense manuelle saisie par l'owner */
export interface Expense {
  id: string
  /** Categorie de depense */
  categorie: 'Fournitures' | 'Salaires' | 'Maintenance' | 'Marketing' | 'Divers'
  /** Montant en baht thailandais */
  montant: number
  /** Date de la depense -- format ISO YYYY-MM-DD */
  date: string
  /** Note explicative optionnelle */
  note?: string
}

/** Roles utilisateur pour l'authentification simulee */
export type Role = 'admin' | 'staff'
