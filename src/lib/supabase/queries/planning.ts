import { createClient } from '@/lib/supabase/client'

function supabase() { return createClient() }

export async function getPlanningShifts(
  startDate?: string,
  endDate?: string
) {
  let query = supabase()
    .from('planning_shifts')
    .select(`
      id, date, heure_debut, heure_fin, poste_shift,
      repas_inclus, note, publie,
      staff:staff_id (id, prenom, avatar_initiales, poste)
    `)
    .order('date')
    .order('heure_debut')

  if (startDate) query = query.gte('date', startDate)
  if (endDate) query = query.lte('date', endDate)

  const { data, error } = await query

  if (error) throw new Error(`getPlanningShifts: ${error.message}`)
  return data
}

export async function insertPlanningShift(shift: {
  staff_id: string
  date: string
  heure_debut: string
  heure_fin: string
  poste_shift: string
  repas_inclus?: boolean
  note?: string
  publie?: boolean
  created_by?: string
}) {
  const { data, error } = await supabase()
    .from('planning_shifts')
    .insert(shift)
    .select()
    .single()

  if (error) throw new Error(`insertPlanningShift: ${error.message}`)
  return data
}

export async function updatePlanningShift(
  id: string,
  updates: Record<string, unknown>
) {
  const { data, error } = await supabase()
    .from('planning_shifts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`updatePlanningShift: ${error.message}`)
  return data
}

export async function deletePlanningShift(id: string) {
  const { error } = await supabase()
    .from('planning_shifts')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`deletePlanningShift: ${error.message}`)
}

export async function publishShifts(
  startDate: string,
  endDate: string
) {
  const { error } = await supabase()
    .from('planning_shifts')
    .update({ publie: true })
    .gte('date', startDate)
    .lte('date', endDate)

  if (error) throw new Error(`publishShifts: ${error.message}`)
}
