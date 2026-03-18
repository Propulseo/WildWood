import { createClient } from '@/lib/supabase/client'

function supabase() { return createClient() }

export async function getStaff() {
  const { data, error } = await supabase()
    .from('staff')
    .select('id, prenom, email, poste, avatar_initiales, actif')
    .eq('actif', true)
    .order('prenom')

  if (error) throw new Error(`getStaff: ${error.message}`)
  return data
}

export async function getStaffById(id: string) {
  const { data, error } = await supabase()
    .from('staff')
    .select('id, prenom, email, poste, avatar_initiales, actif, created_at')
    .eq('id', id)
    .single()

  if (error) throw new Error(`getStaffById: ${error.message}`)
  return data
}

export async function getPointages(staffId?: string, date?: string) {
  let query = supabase()
    .from('pointages')
    .select('id, staff_id, date, heure_arrivee, heure_depart, duree_minutes, note, created_at')
    .order('date', { ascending: false })

  if (staffId) query = query.eq('staff_id', staffId)
  if (date) query = query.eq('date', date)

  const { data, error } = await query

  if (error) throw new Error(`getPointages: ${error.message}`)
  return data
}

export async function insertPointage(pointage: {
  staff_id: string
  date: string
  heure_arrivee: string
  heure_depart?: string
  duree_minutes?: number
  note?: string
}) {
  const { data, error } = await supabase()
    .from('pointages')
    .insert(pointage)
    .select()
    .single()

  if (error) throw new Error(`insertPointage: ${error.message}`)
  return data
}

export async function updatePointage(
  id: string,
  updates: Record<string, unknown>
) {
  const { data, error } = await supabase()
    .from('pointages')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`updatePointage: ${error.message}`)
  return data
}

export async function getPointagesByPeriode(startDate: string, endDate: string) {
  const { data, error } = await supabase()
    .from('pointages')
    .select('id, staff_id, date, heure_arrivee, heure_depart, duree_minutes, note, created_at')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  if (error) throw new Error(`getPointagesByPeriode: ${error.message}`)
  return data
}

export async function getShiftsActifs() {
  const { data, error } = await supabase()
    .from('shifts_actifs')
    .select(`
      id, poste, debut_at, note_transmission,
      staff:staff_id (id, prenom, avatar_initiales),
      remplace:remplace_staff_id (id, prenom)
    `)

  if (error) throw new Error(`getShiftsActifs: ${error.message}`)
  return data
}

export async function insertShiftActif(shift: {
  staff_id: string
  poste: string
  note_transmission?: string
  remplace_staff_id?: string
}) {
  const { data, error } = await supabase()
    .from('shifts_actifs')
    .insert(shift)
    .select()
    .single()

  if (error) throw new Error(`insertShiftActif: ${error.message}`)
  return data
}

export async function deleteShiftActif(id: string) {
  const { error } = await supabase()
    .from('shifts_actifs')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`deleteShiftActif: ${error.message}`)
}

export async function insertStaff(member: {
  prenom: string
  email?: string
  poste: string
  avatar_initiales: string
}) {
  const { data, error } = await supabase()
    .from('staff')
    .insert(member)
    .select()
    .single()

  if (error) throw new Error(`insertStaff: ${error.message}`)
  return data
}

export async function updateStaff(
  id: string,
  updates: Record<string, unknown>
) {
  const { data, error } = await supabase()
    .from('staff')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`updateStaff: ${error.message}`)
  return data
}
