import { createClient } from '@/lib/supabase/client'

function supabase() { return createClient() }

export async function getTablesOuvertes() {
  const { data, error } = await supabase()
    .from('tables_bar')
    .select(`
      id, nom_table, client_nom, type_client,
      reservation_id, statut, total_thb, opened_at, paid_at, staff_id,
      items:table_items (id, nom, prix_unitaire, quantite, sous_total),
      staff:staff!tables_bar_staff_id_fkey (prenom)
    `)
    .eq('statut', 'ouverte')
    .order('opened_at', { ascending: false })

  if (error) throw new Error(`getTablesOuvertes: ${error.message}`)
  return data
}

export async function getAllTables() {
  const { data, error } = await supabase()
    .from('tables_bar')
    .select(`
      id, nom_table, client_nom, type_client,
      reservation_id, statut, total_thb, opened_at, paid_at, staff_id,
      items:table_items (id, nom, prix_unitaire, quantite, sous_total),
      staff:staff!tables_bar_staff_id_fkey (prenom)
    `)
    .order('opened_at', { ascending: false })

  if (error) throw new Error(`getAllTables: ${error.message}`)
  return data
}

export async function insertTable(table: {
  nom_table: string
  client_nom?: string
  type_client: string
  reservation_id?: string
  staff_id?: string
  items?: { nom: string; prix_unitaire: number; quantite: number }[]
}) {
  const { items, ...tableData } = table
  const { data, error } = await supabase()
    .from('tables_bar')
    .insert(tableData)
    .select()
    .single()

  if (error) throw new Error(`insertTable: ${error.message}`)

  if (items && items.length > 0) {
    const { error: itemsError } = await supabase()
      .from('table_items')
      .insert(items.map((i) => ({
        table_id: data.id,
        nom: i.nom,
        prix_unitaire: i.prix_unitaire,
        quantite: i.quantite,
      })))
    if (itemsError) throw new Error(`insertTableItems: ${itemsError.message}`)
    await recalculerTotalTable(data.id)
  }

  return data
}

export async function addTableItem(item: {
  table_id: string
  produit_id?: string
  nom: string
  prix_unitaire: number
  quantite: number
}) {
  const { data, error } = await supabase()
    .from('table_items')
    .insert(item)
    .select()
    .single()

  if (error) throw new Error(`addTableItem: ${error.message}`)

  // Update table total
  await recalculerTotalTable(item.table_id)

  return data
}

export async function removeTableItem(itemId: string, tableId: string) {
  const { error } = await supabase()
    .from('table_items')
    .delete()
    .eq('id', itemId)

  if (error) throw new Error(`removeTableItem: ${error.message}`)

  await recalculerTotalTable(tableId)
}

async function recalculerTotalTable(tableId: string) {
  const { data: items } = await supabase()
    .from('table_items')
    .select('sous_total')
    .eq('table_id', tableId)

  const total = (items || []).reduce(
    (sum: number, i: { sous_total: number | null }) => sum + (i.sous_total || 0), 0
  )

  await supabase()
    .from('tables_bar')
    .update({ total_thb: total })
    .eq('id', tableId)
}

export async function payerTable(id: string, staffId?: string) {
  // 1. Fetch table with total
  const { data: table, error: fetchError } = await supabase()
    .from('tables_bar')
    .select('id, nom_table, client_nom, total_thb, type_client')
    .eq('id', id)
    .eq('statut', 'ouverte')
    .single()

  if (fetchError) throw new Error(`payerTable fetch: ${fetchError.message}`)
  if (!table) throw new Error('Table introuvable ou déjà payée')

  // 2. Mark as paid
  const { error: updateError } = await supabase()
    .from('tables_bar')
    .update({ statut: 'payee', paid_at: new Date().toISOString() })
    .eq('id', id)

  if (updateError) throw new Error(`payerTable update: ${updateError.message}`)

  // 3. Insert transaction for revenue tracking
  const today = new Date().toISOString().split('T')[0]
  const { error: txnError } = await supabase()
    .from('transactions')
    .insert({
      date: today,
      type: 'income',
      business_unit: 'fnb',
      categorie: 'fnb_comptoir',
      montant_thb: table.total_thb,
      source_fonds: 'black_box',
      staff_id: staffId ?? null,
      note: `Table ${table.nom_table}${table.client_nom ? ' · ' + table.client_nom : ''}`,
    })

  if (txnError) throw new Error(`payerTable transaction: ${txnError.message}`)

  return { total: table.total_thb, nomTable: table.nom_table }
}

// --- Room Charges ---

export async function getRoomCharges(reservationId?: string) {
  let query = supabase()
    .from('room_charges')
    .select(`id, reservation_id, bungalow_id, table_id, statut, total_thb, signature_base64, signed_at, signed_by, staff_id, date_paiement, created_at,
      rc_items:table_items!room_charge_id (nom, prix_unitaire, quantite, sous_total)`)
    .order('created_at', { ascending: false })

  if (reservationId) {
    query = query.eq('reservation_id', reservationId)
  }

  const { data, error } = await query

  if (error) throw new Error(`getRoomCharges: ${error.message}`)
  return data
}

export async function insertRoomCharge(charge: {
  reservation_id: string
  bungalow_id: number
  table_id?: string
  total_thb: number
  signature_base64?: string
  signed_by?: string
  staff_id?: string
}) {
  const { data, error } = await supabase()
    .from('room_charges')
    .insert({
      ...charge,
      signed_at: charge.signature_base64 ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) throw new Error(`insertRoomCharge: ${error.message}`)
  return data
}

export async function createTableBar({
  nomTable,
  clientNom,
  typeClient,
  items,
  staffId,
}: {
  nomTable: string
  clientNom?: string
  typeClient: string
  items: { nom: string; prix_unitaire: number; quantite: number }[]
  staffId: string
}) {
  return insertTable({
    nom_table: nomTable,
    client_nom: clientNom,
    type_client: typeClient,
    staff_id: staffId,
    items,
  })
}

export async function encaisserDirect({
  items,
  staffId,
}: {
  items: { nom: string; prix_unitaire: number; quantite: number }[]
  staffId: string
}) {
  const today = new Date().toISOString().split('T')[0]
  const totalThb = items.reduce((s, i) => s + i.prix_unitaire * i.quantite, 0)

  const { error } = await supabase()
    .from('transactions')
    .insert({
      date: today,
      type: 'income',
      business_unit: 'fnb',
      categorie: 'fnb_comptoir',
      montant_thb: totalThb,
      source_fonds: 'black_box',
      staff_id: staffId,
      note: items.map((i) => `${i.nom} x${i.quantite}`).join(', '),
    })

  if (error) throw error
  return { total: totalThb }
}

export async function payerRoomCharge(id: string) {
  const { data, error } = await supabase()
    .from('room_charges')
    .update({
      statut: 'paye',
      date_paiement: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`payerRoomCharge: ${error.message}`)
  return data
}
