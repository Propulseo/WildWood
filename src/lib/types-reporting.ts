// Reporting module types — separate from types.ts to avoid bloating it

export type BusinessUnit = 'GYM' | 'RESORT'

export type RevenueCategoryGym =
  | 'passes_gym' | 'fnb_bar' | 'sauna' | 'cours_prives' | 'autre_gym'

export type RevenueCategoryResort =
  | 'bungalows' | 'services_extras' | 'laverie' | 'autre_resort'

export type RevenueCategory = RevenueCategoryGym | RevenueCategoryResort

export type ExpenseDailyCategoryGym =
  | 'product_sold' | 'ice_bar' | 'staff_meal' | 'gas_wood_sauna'
  | 'maintenance_gym' | 'water' | 'autre_dep_gym'

export type ExpenseDailyCategoryResort =
  | 'daily_expenses' | 'laundry' | 'cleaning_products' | 'swimming_pool' | 'autre_dep_resort'

export type ExpenseDailyCategory = ExpenseDailyCategoryGym | ExpenseDailyCategoryResort

export type ExpenseMonthlyCategory =
  | 'salary' | 'electricity' | 'internet' | 'marketing'
  | 'insurance' | 'equipment' | 'invest'

export type ExpenseSource = 'black_box' | 'change_box' | 'cb_scan'

export interface ReportRevenue {
  id: string
  date: string
  bu: BusinessUnit
  categorie: RevenueCategory
  montant: number
  note?: string
}

export interface ReportExpenseDaily {
  id: string
  date: string
  bu: BusinessUnit
  categorie: ExpenseDailyCategory
  montant: number
  source: ExpenseSource
  note?: string
}

export interface ReportExpenseMonthly {
  id: string
  mois: string // YYYY-MM
  bu: BusinessUnit
  categorie: ExpenseMonthlyCategory
  montant: number
  note?: string
}

export interface CashClosing {
  id: string
  date: string
  bu: BusinessUnit
  solde_calcule: number
  solde_compte: number
  ecart: number
  retrait: number
  staff: string
}

export type ClosingStatut = 'soumis' | 'valide_admin' | 'litige'

export interface DailyClosing {
  id: string
  date: string
  ca_jour: number
  cash_compte: number
  ecart: number
  note_ecart?: string
  soumis_par: string
  soumis_a: string
  statut: ClosingStatut
  valide_par?: string
  valide_at?: string
}
