import { createClient } from '@/lib/supabase/client'

function supabase() { return createClient() }

export async function getGymPassByClient(clientId: string) {
  const { data, error } = await supabase()
    .from('gym_passes')
    .select('id, client_id, client_nom, type_pass, prix_paye, date_debut, date_expiration, actif, upgrade_from, created_at')
    .eq('client_id', clientId)
    .eq('actif', true)
    .order('date_expiration', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(`getGymPassByClient: ${error.message}`)
  return data
}

export async function insertGymPass(pass: {
  client_id: string
  client_nom: string
  type_pass: string
  prix_paye: number
  date_debut: string
  date_expiration: string
}) {
  const { data, error } = await supabase()
    .from('gym_passes')
    .insert(pass)
    .select()
    .single()

  if (error) throw new Error(`insertGymPass: ${error.message}`)
  return data
}

export async function updateGymPass(
  id: string,
  updates: Record<string, unknown>
) {
  const { data, error } = await supabase()
    .from('gym_passes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`updateGymPass: ${error.message}`)
  return data
}

export async function getCheckinsByDate(date: string) {
  const { data, error } = await supabase()
    .from('checkins')
    .select('id, date, client_id, client_nom, gym_pass_id, type_entree, heure_entree, reservation_id, upgrade_effectue, staff_id')
    .eq('date', date)
    .order('heure_entree')

  if (error) throw new Error(`getCheckinsByDate: ${error.message}`)
  return data
}

export async function insertCheckin(checkin: {
  date: string
  client_id: string
  client_nom: string
  gym_pass_id?: string
  type_entree: string
  heure_entree: string
  reservation_id?: string
}) {
  const { data, error } = await supabase()
    .from('checkins')
    .insert(checkin)
    .select()
    .single()

  if (error) throw new Error(`insertCheckin: ${error.message}`)
  return data
}

export async function deleteCheckin(passId: string, date: string, heure: string) {
  const { error } = await supabase()
    .from('checkins')
    .delete()
    .eq('gym_pass_id', passId)
    .eq('date', date)
    .eq('heure_entree', heure)

  if (error) throw new Error(`deleteCheckin: ${error.message}`)
}
