import { Badge } from '@/components/ui/badge'
import type { GrandeCategorie, CategorieDepense, ModePaiement } from '@/lib/types'

export const GYM_CATEGORIES: CategorieDepense[] = [
  'product_sold', 'ice_bar', 'staff_meal', 'gas_wood_sauna',
  'maintenance_gym', 'gym_equipment_others', 'electricity_gym',
  'water_tank', 'water', 'salary', 'marketing',
]

export const RESORT_CATEGORIES: CategorieDepense[] = [
  'daily_expenses', 'laundry', 'cleaning_products', 'salary',
  'swimming_pool_products', 'internet_electricity', 'maintenance',
  'equipment', 'tm30', 'invest',
]

export const FNB_CATEGORIES: CategorieDepense[] = [
  'fnb_restocking', 'fnb_ingredients', 'fnb_ice',
  'fnb_packaging', 'fnb_equipment', 'fnb_staff_meal',
  'fnb_maintenance',
]

export const CATEGORY_LABELS: Record<string, string> = {
  product_sold: 'Produits vendus',
  ice_bar: 'Glace bar',
  staff_meal: 'Repas staff',
  gas_wood_sauna: 'Gaz / Bois sauna',
  maintenance_gym: 'Maintenance gym',
  gym_equipment_others: 'Equipement gym',
  electricity_gym: 'Electricite gym',
  water_tank: 'Tank eau',
  water: 'Eau',
  salary: 'Salaire',
  marketing: 'Marketing',
  daily_expenses: 'Courses quotidiennes',
  laundry: 'Laverie',
  cleaning_products: 'Produits menagers',
  swimming_pool_products: 'Piscine',
  internet_electricity: 'Internet / Electricite',
  maintenance: 'Maintenance',
  equipment: 'Equipement',
  tm30: 'TM30',
  invest: 'Investissement',
  fnb_restocking: 'Reappro boissons/cafe',
  fnb_ingredients: 'Ingredients frais',
  fnb_ice: 'Glace F&B',
  fnb_packaging: 'Emballages',
  fnb_equipment: 'Equipement cuisine',
  fnb_staff_meal: 'Repas staff F&B',
  fnb_maintenance: 'Entretien cuisine/bar',
}

/** Determine si une categorie appartient a gym */
export function isGymCategory(cat: string): boolean {
  return (GYM_CATEGORIES as string[]).includes(cat)
}

/** Determine si une categorie appartient a fnb */
export function isFnbCategory(cat: string): boolean {
  return (FNB_CATEGORIES as string[]).includes(cat)
}

export const MODE_LABELS: Record<ModePaiement, string> = {
  black_box: 'Black Box',
  change_box: 'Change Box',
  cb_scan: 'CB / Scan',
}

export const GRANDE_CATEGORIE_LABELS: Record<GrandeCategorie, string> = {
  gym: 'GYM',
  resort: 'RESORT',
  fnb: 'F&B',
}

export const MODE_BADGE_STYLES: Record<ModePaiement, string> = {
  black_box: 'bg-[#166534]/20 text-[#4ADE80] border border-[#166534]/40',
  change_box: 'bg-[#713F12]/20 text-[#FACC15] border border-[#713F12]/40',
  cb_scan: 'bg-[#1E3A5F]/20 text-[#7DD3FC] border border-[#1E3A5F]/40',
}

export const PERIODES = [
  { value: 'all', label: 'Toutes' },
  { value: 'today', label: "Aujourd'hui" },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
] as const

export type Periode = (typeof PERIODES)[number]['value']

/** Badge categorie : orange pour gym, wood pour fnb, lime pour resort */
export function CategorieBadge({ categorie }: { categorie: string }) {
  const isGym = isGymCategory(categorie)
  const isFnb = isFnbCategory(categorie)
  const color = isGym
    ? 'bg-ww-orange/12 text-ww-orange border border-ww-orange/25'
    : isFnb
      ? 'bg-ww-wood/12 text-ww-wood border border-ww-wood/25'
      : 'bg-ww-lime/12 text-ww-lime border border-ww-lime/25'
  return <Badge className={color}>{CATEGORY_LABELS[categorie] || categorie}</Badge>
}

export function ModePaiementBadge({ mode }: { mode: ModePaiement }) {
  return <Badge className={MODE_BADGE_STYLES[mode]}>{MODE_LABELS[mode]}</Badge>
}
