import { createClient } from '@/lib/supabase/client'

function supabase() { return createClient() }

export async function getDepenses() {
  const { data, error } = await supabase()
    .from('depenses')
    .select('id, date, titre, grande_categorie, categorie, montant_thb, mode_paiement, photo_url, admin_only, auto_generated, staff_id, note, created_at')
    .order('date', { ascending: false })

  if (error) throw new Error(`getDepenses: ${error.message}`)
  return data
}

export async function getDepensesByDateRange(
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase()
    .from('depenses')
    .select('id, date, titre, grande_categorie, categorie, montant_thb, mode_paiement, photo_url, admin_only, auto_generated, staff_id, note, created_at')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')

  if (error) throw new Error(`getDepensesByDateRange: ${error.message}`)
  return data
}

export async function insertDepense(depense: {
  date: string
  titre?: string
  grande_categorie: string
  categorie: string
  montant_thb: number
  mode_paiement: string
  photo_url?: string
  admin_only?: boolean
  staff_id?: string
  note?: string
}) {
  const { data, error } = await supabase()
    .from('depenses')
    .insert(depense)
    .select()
    .single()

  if (error) throw new Error(`insertDepense: ${error.message}`)
  return data
}

export async function updateDepense(
  id: string,
  updates: Record<string, unknown>
) {
  const { data, error } = await supabase()
    .from('depenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`updateDepense: ${error.message}`)
  return data
}

export async function deleteDepense(id: string) {
  const { error } = await supabase()
    .from('depenses')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`deleteDepense: ${error.message}`)
}

export async function getDepensesMensuelles(mois: string) {
  const { data, error } = await supabase()
    .from('depenses_mensuelles')
    .select('id, mois, business_unit, categorie, montant_thb, source_fonds, note, created_by, created_at')
    .eq('mois', mois)

  if (error) throw new Error(`getDepensesMensuelles: ${error.message}`)
  return data
}

export async function insertDepenseMensuelle(depense: {
  mois: string
  business_unit: string
  categorie: string
  montant_thb: number
  source_fonds?: string
  note?: string
}) {
  const { data, error } = await supabase()
    .from('depenses_mensuelles')
    .insert(depense)
    .select()
    .single()

  if (error) throw new Error(`insertDepenseMensuelle: ${error.message}`)
  return data
}
