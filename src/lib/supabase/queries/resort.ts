import { createClient } from '@/lib/supabase/client'

function supabase() { return createClient() }

const PRIX_NUIT_BRUT = 4000
const COEFF_BOOKING = 0.8142
const PRIX_NUIT_NET = Math.round(PRIX_NUIT_BRUT * COEFF_BOOKING) // 3257฿

/**
 * Calcule et insère le revenu resort du jour
 * Basé sur les réservations actives (confirme + date_arrivee <= today < date_depart)
 */
export async function calculerEtInsererRevenuResort(
  date: string,
  staffId: string,
  override?: number
) {
  // Compter les bungalows occupés ce jour
  const { data: reservations, error } = await supabase()
    .from('reservations')
    .select('id, bungalow_id, source')
    .eq('statut', 'confirme')
    .lte('date_arrivee', date)
    .gt('date_depart', date)

  if (error) throw error

  const nbOccupes = reservations?.length ?? 0
  const totalNet = override ?? (nbOccupes * PRIX_NUIT_NET)

  if (totalNet === 0) return null

  // Vérifier si une transaction resort existe déjà pour ce jour
  const { data: existing } = await supabase()
    .from('transactions')
    .select('id')
    .eq('date', date)
    .eq('business_unit', 'resort')
    .eq('saisie_type', 'auto_resort')
    .maybeSingle()

  if (existing) {
    if (override !== undefined) {
      await supabase()
        .from('transactions')
        .update({ montant_thb: totalNet })
        .eq('id', existing.id)
    }
    return existing
  }

  // Insérer la transaction resort
  const { data: transaction, error: insertError } = await supabase()
    .from('transactions')
    .insert({
      date,
      type: 'income',
      business_unit: 'resort',
      categorie: 'bungalow_net',
      montant_thb: totalNet,
      source_fonds: 'black_box',
      saisie_type: 'auto_resort',
      staff_id: staffId,
      note: override
        ? `Resort override · ฿${totalNet.toLocaleString()}`
        : `${nbOccupes} bungalow${nbOccupes > 1 ? 's' : ''} × ฿${PRIX_NUIT_NET} net`,
    })
    .select('id')
    .single()

  if (insertError) throw insertError
  return transaction
}
