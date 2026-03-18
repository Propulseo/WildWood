import { createClient } from '@/lib/supabase/client'

function supabase() { return createClient() }

export async function getClients() {
  const { data, error } = await supabase()
    .from('clients')
    .select('id, nom, email, telephone, nationalite, created_at')
    .order('nom')

  if (error) throw new Error(`getClients: ${error.message}`)
  return data
}

export async function getClientById(id: string) {
  const { data, error } = await supabase()
    .from('clients')
    .select('id, nom, email, telephone, nationalite, created_at')
    .eq('id', id)
    .single()

  if (error) throw new Error(`getClientById: ${error.message}`)
  return data
}

export async function insertClient(client: {
  nom: string
  email?: string
  telephone?: string
  nationalite?: string
}) {
  const { data, error } = await supabase()
    .from('clients')
    .insert(client)
    .select()
    .single()

  if (error) throw new Error(`insertClient: ${error.message}`)
  return data
}

export async function updateClient(
  id: string,
  updates: Record<string, unknown>
) {
  const { data, error } = await supabase()
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`updateClient: ${error.message}`)
  return data
}
