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
  /** Slug court pour identifier le type: "1j", "3j", "1s", "1m", "spa", etc. */
  slug: string
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
  /** Pass visible dans la caisse POS (default true) */
  actif?: boolean
}

/** Produit du bar/cafe F&B avec emoji pour reconnaissance visuelle par le staff */
export interface FnbProduct {
  id: string
  nom: string
  /** Categorie pour le regroupement dans l'interface POS */
  categorie: string
  /** Prix en baht thailandais */
  prix: number
  /** Emoji pour identification rapide par le staff thai */
  emoji: string
  /** Produit visible dans la caisse POS (default true) */
  actif?: boolean
}

/** Bungalow du resort avec ses reservations */
export interface Bungalow {
  id: string
  /** Numero du bungalow (1-6) */
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
  statut: 'confirmee' | 'en-cours' | 'terminee' | 'annulee' | 'no_show' | 'checked_out'
  /** Nombre d'adultes */
  nb_adultes: number
  /** Nombre d'enfants */
  nb_enfants: number
  /** Note optionnelle */
  note?: string
  /** Email de contact Booking.com */
  email?: string | null
  /** Telephone de contact Booking.com -- format international */
  telephone?: string | null
  /** Check-in effectue */
  checkin_fait: boolean
  /** TM30 effectue (scan passeport) */
  tm30_fait: boolean
  /** Clef remise au client */
  clef_remise: boolean
  /** Source de la reservation */
  source?: 'booking' | 'manuel'
  /** Nom du client pour reservations manuelles (sans client en base) */
  clientNom?: string
  /** Type de tarif Booking.com */
  tarif_type?: 'flex' | 'non_remb'
  /** Prix par nuit brut (affiche Booking.com) */
  prix_nuit_brut?: number
  /** Prix par nuit net (apres commission Booking) */
  prix_nuit_net?: number
  /** Prix total brut */
  prix_total_brut?: number
  /** Prix total net */
  prix_total_net?: number
  /** Reservation directe (pas de commission Booking) */
  reservation_directe?: boolean
}

/** Configuration des tarifs bungalow */
export interface Tarif {
  id: string
  nom: string
  prix_nuit_thb: number
  prix_net_thb: number
  annulation: string
  modifiable: boolean
  couleur: string
}

export interface TarifsConfig {
  commission_booking: number
  tarifs: Tarif[]
}

/** Transaction enregistree dans la caisse */
export interface Transaction {
  id: string
  /** Date et heure de la transaction -- format ISO YYYY-MM-DDTHH:mm:ss */
  date: string
  /** Type de produit vendu */
  type: 'gym-pass' | 'fnb' | 'bungalow' | 'upgrade_pass'
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

/** Grande categorie de depense */
export type GrandeCategorie = 'gym' | 'resort' | 'fnb'

export type CategorieGym =
  | 'product_sold' | 'ice_bar' | 'staff_meal' | 'gas_wood_sauna'
  | 'maintenance_gym' | 'gym_equipment_others' | 'electricity_gym'
  | 'water_tank' | 'water' | 'salary' | 'marketing'

export type CategorieResort =
  | 'daily_expenses' | 'laundry' | 'cleaning_products' | 'salary'
  | 'swimming_pool_products' | 'internet_electricity' | 'maintenance'
  | 'equipment' | 'tm30' | 'invest'

export type CategorieFnb =
  | 'fnb_restocking' | 'fnb_ingredients' | 'fnb_ice'
  | 'fnb_packaging' | 'fnb_equipment' | 'fnb_staff_meal'
  | 'fnb_maintenance'

export type CategorieDepense = CategorieGym | CategorieResort | CategorieFnb
export type ModePaiement = 'black_box' | 'change_box' | 'cb_scan'

/** Depense manuelle saisie par l'owner */
export interface Expense {
  id: string
  titre: string
  montant_thb: number
  date: string
  note?: string
  grande_categorie: GrandeCategorie
  categorie: CategorieDepense
  mode_paiement: ModePaiement
  photo_base64?: string | null
  staff_saisie?: string
  created_at: string
}

/** Enregistrement d'un check-in journalier */
export interface Checkin {
  /** Date du check-in -- format ISO YYYY-MM-DD */
  date: string
  /** Heure du check-in -- format HH:mm */
  heure: string
  /** Note optionnelle */
  note?: string
}

/** Entree du jour enrichie pour la page checkin */
export interface CheckinEntry {
  id: string
  client_nom: string
  client_id: string
  type_entree: 'gym_pass' | 'hotel_resident'
  type_pass: string
  prix_paye: number
  heure_entree: string
  date_entree: string
  bungalow_numero?: number
  upgrade_effectue: false | { vers: string; prix_upgrade: number; heure: string }
}

/** Pass gym actif achete par un client, avec QR code pour le controle d'acces */
export interface ActiveGymPass {
  id: string
  /** Token unique pour le QR code -- format WW-PASS-XXXX */
  qrToken: string
  /** Reference au client */
  clientId: string
  /** Nom complet du client (denormalise pour affichage scanner) */
  clientNom: string
  /** Reference au type de pass */
  passId: string
  /** Nom du pass (denormalise) */
  passNom: string
  /** Date d'achat -- format ISO YYYY-MM-DD */
  dateAchat: string
  /** Date d'expiration -- format ISO YYYY-MM-DD */
  dateExpiration: string
  /** Pass encore actif */
  actif: boolean
  /** Historique des check-ins */
  checkins: Checkin[]
}

// --- Staff Pointage ---

/** Enregistrement d'un pointage journalier */
export interface Pointage {
  /** Date du pointage -- format ISO YYYY-MM-DD */
  date: string
  /** Heure d'arrivee -- format HH:mm */
  heure_arrivee: string
  /** Heure de depart -- format HH:mm, null si encore present */
  heure_depart: string | null
  /** Actuellement en pause */
  en_pause?: boolean
  /** Heure debut de pause -- format HH:mm */
  heure_pause?: string | null
}

/** Membre du staff avec historique de pointage */
export interface StaffMember {
  id: string
  nom: string
  prenom: string
  /** Poste au sein du resort */
  poste: 'reception' | 'bar' | 'admin'
  /** Initiales pour l'avatar (ex: "JL") */
  avatar_initiales: string
  /** Couleur hexadecimale de l'avatar */
  couleur_avatar: string
  /** Historique des pointages */
  pointages: Pointage[]
}

// --- Serviettes ---

/** Emprunt de serviette avec depot de garantie */
export interface Serviette {
  id: string
  client_nom: string
  client_id: string
  date_emprunt: string
  heure_emprunt: string
  deposit_montant: number
  statut: 'disponible' | 'en_cours' | 'rendue' | 'perdue'
  etat: 'propre' | 'sale' | 'en_lavage'
  date_retour: string | null
  staff_emprunt: string
  staff_retour: string | null
  note?: string
}

/** Log de reception de lavage */
export interface ReceptionLavage {
  id: string
  date: string
  nb_comptees: number
  nb_remises_stock: number
  nb_creees: number
  staff_id: string
}

// --- Room Charges ---

/** Note de chambre signee par un resident bungalow */
export interface RoomCharge {
  id: string
  bungalowId: string
  reservationId: string
  clientId: string
  /** Lignes de la commande F&B */
  items: TransactionItem[]
  /** Montant total en baht */
  total: number
  /** Date et heure -- format ISO YYYY-MM-DDTHH:mm:ss */
  date: string
  /** Nom du staff ayant pris la commande */
  staff: string
  /** Statut du paiement */
  statut: 'en_attente' | 'paye'
  /** Signature manuscrite en base64 PNG */
  signature_base64: string
  /** Horodatage de la signature -- format ISO */
  signed_at: string
  /** Nom du signataire (client) */
  signed_by: string
}

// --- Maintenance ---

/** Tache de maintenance pour un bungalow */
export interface MaintenanceTask {
  id: string
  bungalow_id: string
  titre: string
  description: string
  priorite: 'haute' | 'normale' | 'basse'
  statut: 'a_faire' | 'en_cours' | 'fait'
  date_creation: string
  date_resolution: string | null
  created_by: string
  resolved_by: string | null
}

// --- Messages ---

export interface Destinataire {
  nom: string
  email: string
  bungalow_id: string
}

export interface MessageEnvoye {
  id: string
  type: 'manuel' | 'automatique'
  template_id: string | null
  sujet: string
  contenu: string
  destinataires: Destinataire[]
  nb_destinataires: number
  date_envoi: string
  statut: 'envoye' | 'simule'
}

export interface TemplateAutomatique {
  id: string
  nom: string
  actif: boolean
  declencheur: 'j-2_arrivee' | 'j+1_arrivee' | 'j0_depart' | 'j+2_depart' | 'j+7_depart' | 'j+30_depart' | 'j0_arrivee'
  delai_jours: number
  sujet: string
  contenu: string
}

// --- Tables ouvertes (Bar) ---

/** Article sur une table ouverte */
export interface TableItem {
  nom: string
  prix: number
  quantite: number
}

/** Table/ardoise ouverte au bar */
export interface TableOuverte {
  id: string
  nom_table: string
  client_nom: string
  type_client: 'externe' | 'gym' | 'hotel'
  bungalow_id: string | null
  items: TableItem[]
  total_thb: number
  heure_ouverture: string
  statut: 'ouverte' | 'en_attente_signature' | 'payee'
  staff_ouverture: string
}

/** Roles utilisateur pour l'authentification simulee */
export type Role = 'admin' | 'reception' | 'bar'

// --- Chat interne ---

export interface ChatMessage {
  id: string
  canal: string
  auteur_id: string
  auteur_nom: string
  auteur_poste: 'reception' | 'bar' | 'admin'
  contenu: string
  date: string
  type: 'message' | 'prise_de_shift'
  shift_detail?: {
    nouveau_staff: string
    ancien_staff: string
    poste: string
    note?: string
  }
}

export interface ShiftState {
  reception: { staffId: string; depuis: string } | null
  bar: { staffId: string; depuis: string } | null
}

// --- WhatsApp Messages ---

export type MessageWAType = 'j_moins_2' | 'j_plus_3' | 'manuel'
export type MessageWAStatut = 'planifie' | 'envoye' | 'lu' | 'repondu'

export interface MessageClientWA {
  id: string
  reservation_id: string
  bungalow_id: string
  client_nom: string
  telephone: string | null
  type: MessageWAType
  statut: MessageWAStatut
  message_contenu: string
  planifie_le: string
  envoye_le: string | null
  reponse_client: string | null
}

export interface MessageTemplateWA {
  id: string
  type: string
  nom: string
  contenu: string
  variables: string[]
}

// --- Planning ---

export interface PlanningShift {
  id: string
  staff_id: string
  staff_nom: string
  staff_poste: string
  date: string
  heure_debut: string
  heure_fin: string
  poste_shift: 'reception' | 'bar'
  note: string | null
  publie: boolean
  repas_inclus: boolean
}
