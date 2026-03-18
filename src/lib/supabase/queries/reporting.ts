import { createClient } from '@/lib/supabase/client'

function supabase() { return createClient() }

// --- Daily report view ---

export async function getDailyReport(params: {
  from: string  // YYYY-MM-DD
  to: string
}) {
  const { data, error } = await supabase()
    .from('v_daily_report')
    .select('*')
    .gte('date', params.from)
    .lte('date', params.to)
    .order('date', { ascending: true })

  if (error) throw new Error(`getDailyReport: ${error.message}`)
  return data ?? []
}

// --- Agrégés revenus ---

export async function getRevenusAgreges(from: string, to: string) {
  const { data, error } = await supabase()
    .from('transactions')
    .select('montant_thb, business_unit, categorie, date')
    .eq('type', 'income')
    .gte('date', from)
    .lte('date', to)

  if (error) throw new Error(`getRevenusAgreges: ${error.message}`)
  type TxRow = { montant_thb: number; business_unit: string; categorie: string; date: string }
  const rows = (data ?? []) as TxRow[]

  return {
    gym:    rows.filter(r => r.business_unit === 'gym').reduce((s, r) => s + r.montant_thb, 0),
    fnb:    rows.filter(r => r.business_unit === 'fnb').reduce((s, r) => s + r.montant_thb, 0),
    resort: rows.filter(r => r.business_unit === 'resort').reduce((s, r) => s + r.montant_thb, 0),
    total:  rows.reduce((s, r) => s + r.montant_thb, 0),
    nb:     rows.length,
    rows,
  }
}

// --- Agrégés dépenses ---

export async function getDepensesAgregees(from: string, to: string) {
  const { data, error } = await supabase()
    .from('depenses')
    .select('montant_thb, grande_categorie, categorie, mode_paiement, date')
    .gte('date', from)
    .lte('date', to)

  if (error) throw new Error(`getDepensesAgregees: ${error.message}`)
  type DepRow = { montant_thb: number; grande_categorie: string; categorie: string; mode_paiement: string; date: string }
  const rows = (data ?? []) as DepRow[]

  return {
    gym:    rows.filter(r => r.grande_categorie === 'gym').reduce((s, r) => s + r.montant_thb, 0),
    fnb:    rows.filter(r => r.grande_categorie === 'fnb').reduce((s, r) => s + r.montant_thb, 0),
    resort: rows.filter(r => r.grande_categorie === 'resort').reduce((s, r) => s + r.montant_thb, 0),
    total:  rows.reduce((s, r) => s + r.montant_thb, 0),
    rows,
  }
}

// --- Closings (table closings) ---

export async function getClosings() {
  const { data, error } = await supabase()
    .from('closings')
    .select('id, date, ca_jour, cash_compte, ecart, note_ecart, soumis_par, soumis_at, statut, valide_par, valide_at')
    .order('date', { ascending: false })

  if (error) throw new Error(`getClosings: ${error.message}`)
  return data
}

export async function insertClosing(closing: {
  date: string
  ca_jour: number
  cash_compte: number
  ecart?: number
  note_ecart?: string
  soumis_par?: string
}) {
  const { data, error } = await supabase()
    .from('closings')
    .insert(closing)
    .select()
    .single()

  if (error) throw new Error(`insertClosing: ${error.message}`)
  return data
}

export async function updateClosing(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase()
    .from('closings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`updateClosing: ${error.message}`)
  return data
}

// --- Helper dates ---

export function getPeriodeDates(periode: 'today' | 'week' | 'month' | 'year') {
  const today = new Date()
  const fmt = (d: Date) => d.toISOString().split('T')[0]

  if (periode === 'today') {
    return { from: fmt(today), to: fmt(today) }
  }
  if (periode === 'week') {
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return { from: fmt(monday), to: fmt(sunday) }
  }
  if (periode === 'month') {
    return { from: `${fmt(today).slice(0, 7)}-01`, to: fmt(today) }
  }
  // year
  return { from: `${today.getFullYear()}-01-01`, to: fmt(today) }
}
