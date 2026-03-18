import { createClient } from '@/lib/supabase/client'

function supabase() { return createClient() }

export async function getMaintenanceTaches(bungalowId?: number) {
  let query = supabase()
    .from('maintenance_taches')
    .select('id, bungalow_id, titre, description, priorite, statut, created_by, resolved_by, date_creation, date_resolution')
    .order('date_creation', { ascending: false })

  if (bungalowId) {
    query = query.eq('bungalow_id', bungalowId)
  }

  const { data, error } = await query

  if (error) throw new Error(`getMaintenanceTaches: ${error.message}`)
  return data
}

export async function insertMaintenanceTache(tache: {
  bungalow_id: number
  titre: string
  description?: string
  priorite?: string
  created_by?: string
}) {
  const { data, error } = await supabase()
    .from('maintenance_taches')
    .insert(tache)
    .select()
    .single()

  if (error) throw new Error(`insertMaintenanceTache: ${error.message}`)
  return data
}

export async function deleteMaintenanceTache(id: string) {
  const { error } = await supabase()
    .from('maintenance_taches')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`deleteMaintenanceTache: ${error.message}`)
}

export async function updateMaintenanceTache(
  id: string,
  updates: Record<string, unknown>
) {
  const { data, error } = await supabase()
    .from('maintenance_taches')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`updateMaintenanceTache: ${error.message}`)
  return data
}
