import { createClient } from '@/lib/supabase/client'

function supabase() { return createClient() }

export async function getReservationsActives() {
  const { data, error } = await supabase()
    .from('reservations')
    .select(`
      id, client_nom, client_email, client_telephone,
      date_arrivee, date_depart, nb_nuits,
      nb_adultes, nb_enfants,
      statut, tarif_type, source, note,
      prix_nuit_brut, prix_nuit_net,
      prix_total_brut, prix_total_net,
      checkin_fait, tm30_fait, clef_remise,
      clef_recuperee, bungalow_inspecte,
      bungalow_id, client_id
    `)
    .neq('statut', 'checked_out')
    .order('date_arrivee')

  if (error) throw new Error(`getReservationsActives: ${error.message}`)
  return data
}

export async function getReservationsByBungalow(bungalowId: number) {
  const { data, error } = await supabase()
    .from('reservations')
    .select(`
      id, bungalow_id, client_id, client_nom, client_email, client_telephone,
      date_arrivee, date_depart, nb_nuits, nb_adultes, nb_enfants,
      tarif_type, prix_nuit_brut, prix_nuit_net, prix_total_brut, prix_total_net,
      source, statut, checkin_fait, tm30_fait, clef_remise,
      clef_recuperee, bungalow_inspecte, note, created_at
    `)
    .eq('bungalow_id', bungalowId)
    .order('date_arrivee')

  if (error) throw new Error(`getReservationsByBungalow: ${error.message}`)
  return data
}

export async function getAllReservations() {
  const { data, error } = await supabase()
    .from('reservations')
    .select(`
      id, bungalow_id, client_id, client_nom, client_email, client_telephone,
      date_arrivee, date_depart, nb_nuits, nb_adultes, nb_enfants,
      tarif_type, prix_nuit_brut, prix_nuit_net, prix_total_brut, prix_total_net,
      source, statut, checkin_fait, tm30_fait, clef_remise,
      clef_recuperee, bungalow_inspecte, note, created_at
    `)
    .order('date_arrivee')

  if (error) throw new Error(`getAllReservations: ${error.message}`)
  return data
}

export async function getBungalows() {
  const { data, error } = await supabase()
    .from('bungalows')
    .select('id, nom, statut')
    .order('id')

  if (error) throw new Error(`getBungalows: ${error.message}`)
  return data
}

export async function updateReservation(
  id: string,
  updates: Record<string, unknown>
) {
  const { data, error } = await supabase()
    .from('reservations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`updateReservation: ${error.message}`)
  return data
}

export async function insertReservation(
  reservation: Record<string, unknown>
) {
  const { data, error } = await supabase()
    .from('reservations')
    .insert(reservation)
    .select()
    .single()

  if (error) throw new Error(`insertReservation: ${error.message}`)
  return data
}

export async function getTarifs() {
  const { data, error } = await supabase()
    .from('tarifs')
    .select('id, nom, prix_nuit_thb, commission_booking, prix_nuit_net, annulation, modifiable')

  if (error) throw new Error(`getTarifs: ${error.message}`)
  return data
}

export async function createRoomChargeFromBar({
  reservationId,
  bungalowId,
  items,
  signatureBase64,
  staffId,
}: {
  reservationId: string
  bungalowId: number
  items: { nom: string; prix_unitaire: number; quantite: number }[]
  signatureBase64: string
  staffId: string
}) {
  const totalThb = items.reduce((sum, i) => sum + i.prix_unitaire * i.quantite, 0)

  const { data: charge, error: chargeError } = await supabase()
    .from('room_charges')
    .insert({
      reservation_id: reservationId,
      bungalow_id: bungalowId,
      total_thb: totalThb,
      statut: 'en_attente',
      signature_base64: signatureBase64,
      signed_at: new Date().toISOString(),
      staff_id: staffId,
    })
    .select('id')
    .single()

  if (chargeError) throw new Error(`createRoomChargeFromBar charge: ${chargeError.message}`)

  const itemsToInsert = items.map((item) => ({
    room_charge_id: charge.id,
    nom: item.nom,
    prix_unitaire: item.prix_unitaire,
    quantite: item.quantite,
  }))

  const { error: itemsError } = await supabase()
    .from('table_items')
    .insert(itemsToInsert)

  if (itemsError) throw new Error(`createRoomChargeFromBar items: ${itemsError.message}`)

  return { chargeId: charge.id, totalThb }
}

export async function payerRoomCharges(reservationId: string, staffId: string) {
  const today = new Date().toISOString().split('T')[0]

  // 1. Fetch pending charges
  const { data: charges, error: fetchError } = await supabase()
    .from('room_charges')
    .select('id, total_thb, bungalow_id, reservation_id')
    .eq('reservation_id', reservationId)
    .eq('statut', 'en_attente')

  if (fetchError) throw new Error(`payerRoomCharges fetch: ${fetchError.message}`)
  if (!charges || charges.length === 0) return { total: 0 }

  const totalThb = charges.reduce((sum: number, c: { total_thb: number }) => sum + c.total_thb, 0)

  // 2. Mark all as paid
  const { error: updateError } = await supabase()
    .from('room_charges')
    .update({ statut: 'paye', date_paiement: new Date().toISOString() })
    .eq('reservation_id', reservationId)
    .eq('statut', 'en_attente')

  if (updateError) throw new Error(`payerRoomCharges update: ${updateError.message}`)

  // 3. Get reservation info for transaction note
  const { data: resa } = await supabase()
    .from('reservations')
    .select('client_nom, bungalow_id')
    .eq('id', reservationId)
    .single()

  // 4. Create F&B income transaction
  const { error: txnError } = await supabase()
    .from('transactions')
    .insert({
      date: today,
      type: 'income',
      business_unit: 'fnb',
      categorie: 'fnb',
      montant_thb: totalThb,
      source_fonds: 'black_box',
      reservation_id: reservationId,
      staff_id: staffId,
      note: `Room charges · Bungalow ${resa?.bungalow_id} · ${resa?.client_nom}`,
    })

  if (txnError) throw new Error(`payerRoomCharges transaction: ${txnError.message}`)

  return { total: totalThb }
}

export async function getRoomChargesAttente() {
  const { data, error } = await supabase()
    .from('v_room_charges_attente')
    .select('bungalow_id, client_nom, nb_charges, total_en_attente')

  if (error) throw new Error(`getRoomChargesAttente: ${error.message}`)
  return data
}
