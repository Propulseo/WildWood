import { createClient } from '@/lib/supabase/client'

function supabase() { return createClient() }

export async function getCashboxJournee(date: string) {
  const { data, error } = await supabase()
    .from('cashbox_journees')
    .select('id, date, cash_start_thb, cash_counted_thb, cash_withdrawn_thb, cash_remaining_thb, ecart_thb, note_ecart, closed, closed_by, closed_at')
    .eq('date', date)
    .maybeSingle()

  if (error) throw new Error(`getCashboxJournee: ${error.message}`)
  return data
}

export async function upsertCashboxJournee(journee: {
  date: string
  cash_start_thb?: number
  cash_counted_thb?: number
  cash_withdrawn_thb?: number
  cash_remaining_thb?: number
  ecart_thb?: number
  note_ecart?: string
  closed?: boolean
  closed_by?: string
}) {
  const { data, error } = await supabase()
    .from('cashbox_journees')
    .upsert(journee, { onConflict: 'date' })
    .select()
    .single()

  if (error) throw new Error(`upsertCashboxJournee: ${error.message}`)
  return data
}

export async function getChangeboxMouvements(date?: string) {
  let query = supabase()
    .from('changebox_mouvements')
    .select('id, date, type, montant_thb, raison, note, created_by, created_at')
    .order('created_at', { ascending: false })

  if (date) {
    query = query.eq('date', date)
  }

  const { data, error } = await query

  if (error) throw new Error(`getChangeboxMouvements: ${error.message}`)
  return data
}

export async function insertChangeboxMouvement(mouvement: {
  date: string
  type: string
  montant_thb: number
  raison?: string
  note?: string
  created_by?: string
}) {
  const { data, error } = await supabase()
    .from('changebox_mouvements')
    .insert(mouvement)
    .select()
    .single()

  if (error) throw new Error(`insertChangeboxMouvement: ${error.message}`)
  return data
}
