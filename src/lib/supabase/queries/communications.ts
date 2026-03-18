import { createClient } from '@/lib/supabase/client'

function supabase() { return createClient() }

// --- Messages Clients (WhatsApp) ---

export async function getMessagesClients(reservationId?: string) {
  let query = supabase()
    .from('messages_clients')
    .select('id, reservation_id, client_nom, telephone, type, statut, message_contenu, reponse_client, envoye_par, planifie_le, envoye_le, created_at')
    .order('created_at', { ascending: false })

  if (reservationId) {
    query = query.eq('reservation_id', reservationId)
  }

  const { data, error } = await query

  if (error) throw new Error(`getMessagesClients: ${error.message}`)
  return data
}

export async function getMessagesPlanifies() {
  const { data, error } = await supabase()
    .from('messages_clients')
    .select('id, reservation_id, client_nom, telephone, type, statut, message_contenu, reponse_client, envoye_par, planifie_le, envoye_le, created_at')
    .eq('statut', 'planifie')
    .order('planifie_le')

  if (error) throw new Error(`getMessagesPlanifies: ${error.message}`)
  return data
}

export async function insertMessageClient(message: {
  reservation_id: string
  client_nom: string
  telephone?: string
  type: string
  statut?: string
  message_contenu: string
  planifie_le?: string
}) {
  const { data, error } = await supabase()
    .from('messages_clients')
    .insert(message)
    .select()
    .single()

  if (error) throw new Error(`insertMessageClient: ${error.message}`)
  return data
}

export async function updateMessageClient(
  id: string,
  updates: Record<string, unknown>
) {
  const { data, error } = await supabase()
    .from('messages_clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`updateMessageClient: ${error.message}`)
  return data
}

// --- Message Templates ---

export async function getMessageTemplates() {
  const { data, error } = await supabase()
    .from('message_templates')
    .select('id, nom, contenu, updated_at')

  if (error) throw new Error(`getMessageTemplates: ${error.message}`)
  return data
}

export async function updateMessageTemplate(
  id: string,
  updates: { nom?: string; contenu?: string }
) {
  const { data, error } = await supabase()
    .from('message_templates')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`updateMessageTemplate: ${error.message}`)
  return data
}
