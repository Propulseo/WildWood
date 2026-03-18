import { createClient } from '@/lib/supabase/client'

function supabase() { return createClient() }

export async function getTransactions() {
  const { data, error } = await supabase()
    .from('transactions')
    .select('id, date, heure, type, business_unit, categorie, montant_thb, source_fonds, reservation_id, client_id, room_charge_id, staff_id, note, created_at')
    .order('date', { ascending: false })
    .order('heure', { ascending: false })

  if (error) throw new Error(`getTransactions: ${error.message}`)
  return data
}

export async function getTransactionsByDate(date: string) {
  const { data, error } = await supabase()
    .from('transactions')
    .select('id, date, heure, type, business_unit, categorie, montant_thb, source_fonds, reservation_id, client_id, room_charge_id, staff_id, note, created_at')
    .eq('date', date)
    .order('heure')

  if (error) throw new Error(`getTransactionsByDate: ${error.message}`)
  return data
}

export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase()
    .from('transactions')
    .select('id, date, heure, type, business_unit, categorie, montant_thb, source_fonds, reservation_id, client_id, room_charge_id, staff_id, note, created_at')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')

  if (error) throw new Error(`getTransactionsByDateRange: ${error.message}`)
  return data
}

export async function insertTransaction(transaction: {
  date: string
  heure?: string
  type: 'income' | 'expense'
  business_unit: string
  categorie: string
  montant_thb: number
  source_fonds?: string
  reservation_id?: string
  client_id?: string
  staff_id?: string
  note?: string
}) {
  const clean = {
    ...transaction,
    client_id: transaction.client_id || null,
    staff_id: transaction.staff_id || null,
    reservation_id: transaction.reservation_id || null,
  }
  const { data, error } = await supabase()
    .from('transactions')
    .insert(clean)
    .select()
    .single()

  if (error) throw new Error(`insertTransaction: ${error.message}`)
  return data
}

export async function getGymPasses() {
  const { data, error } = await supabase()
    .from('produits')
    .select('id, nom, categorie, sous_categorie, prix_thb, duree_jours, actif, ordre, created_at')
    .eq('actif', true)
    .eq('categorie', 'gym_pass')
    .order('ordre')

  if (error) throw new Error(`getGymPasses: ${error.message}`)
  return data
}

export async function getProduits() {
  const { data, error } = await supabase()
    .from('produits')
    .select('id, nom, categorie, sous_categorie, prix_thb, duree_jours, actif, ordre, emoji, created_at')
    .order('ordre')

  if (error) throw new Error(`getProduits: ${error.message}`)
  return data
}

export async function insertProduit(produit: {
  nom: string
  categorie: string
  sous_categorie?: string
  prix_thb: number
  duree_jours?: number
  ordre?: number
  emoji?: string
}) {
  const { data, error } = await supabase()
    .from('produits')
    .insert(produit)
    .select()
    .single()

  if (error) throw new Error(`insertProduit: ${error.message}`)
  return data
}

export async function deleteProduit(id: string) {
  const { error } = await supabase()
    .from('produits')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`deleteProduit: ${error.message}`)
}

export async function updateProduit(
  id: string,
  updates: Record<string, unknown>
) {
  const { data, error } = await supabase()
    .from('produits')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`updateProduit: ${error.message}`)
  return data
}
