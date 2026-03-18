import { createClient } from '@/lib/supabase/client'

function supabase() { return createClient() }

export async function getRecapDuJour() {
  const today = new Date().toISOString().split('T')[0]

  const [revResult, depResult, closingResult] = await Promise.all([
    supabase()
      .from('transactions')
      .select('montant_thb, business_unit, categorie')
      .eq('type', 'income')
      .eq('date', today),
    supabase()
      .from('depenses')
      .select('montant_thb, mode_paiement')
      .eq('date', today),
    supabase()
      .from('cashbox_journees')
      .select('*')
      .eq('date', today)
      .maybeSingle(),
  ])

  const revRows = (revResult.data ?? []) as { montant_thb: number; business_unit: string; categorie: string }[]
  const depRows = (depResult.data ?? []) as { montant_thb: number; mode_paiement: string }[]

  return {
    revenus: {
      gym:    revRows.filter(r => r.business_unit === 'gym').reduce((s, r) => s + r.montant_thb, 0),
      fnb:    revRows.filter(r => r.business_unit === 'fnb').reduce((s, r) => s + r.montant_thb, 0),
      resort: revRows.filter(r => r.business_unit === 'resort').reduce((s, r) => s + r.montant_thb, 0),
      total:  revRows.reduce((s, r) => s + r.montant_thb, 0),
    },
    depenses: {
      black_box: depRows.filter(d => d.mode_paiement === 'black_box').reduce((s, d) => s + d.montant_thb, 0),
      total:     depRows.reduce((s, d) => s + d.montant_thb, 0),
    },
    closingExistant: closingResult.data ?? null,
    alreadyClosed: closingResult.data?.closed ?? false,
  }
}

export async function submitClosing({
  cashCounted,
  staffId,
  note,
}: {
  cashCounted: number
  staffId: string
  note?: string
}) {
  const today = new Date().toISOString().split('T')[0]

  // 1. Snapshot revenus du jour (depuis transactions)
  const { data: revRows } = await supabase()
    .from('transactions')
    .select('montant_thb, business_unit')
    .eq('type', 'income')
    .eq('date', today)

  const rev = (revRows ?? []).reduce((acc: Record<string, number>, r: { montant_thb: number; business_unit: string }) => {
    acc.total += r.montant_thb
    acc[r.business_unit] = (acc[r.business_unit] || 0) + r.montant_thb
    return acc
  }, { total: 0, gym: 0, fnb: 0, resort: 0 })

  // 2. Snapshot dépenses black box du jour
  const { data: depRows } = await supabase()
    .from('depenses')
    .select('montant_thb, mode_paiement')
    .eq('date', today)

  const depBlackBox = (depRows ?? [])
    .filter((d: { mode_paiement: string }) => d.mode_paiement === 'black_box')
    .reduce((s: number, d: { montant_thb: number }) => s + d.montant_thb, 0)

  const cashStart = 2000
  const cashWithdrawn = Math.max(0, cashCounted - cashStart)

  // 3. Upsert cashbox_journees avec snapshot complet
  const { error } = await supabase()
    .from('cashbox_journees')
    .upsert({
      date:                   today,
      cash_start_thb:         cashStart,
      cash_counted_thb:       cashCounted,
      cash_withdrawn_thb:     cashWithdrawn,
      cash_remaining_thb:     cashStart,
      ecart_thb:              cashCounted - rev.total,
      note_ecart:             note ?? null,
      revenus_total_thb:      rev.total,
      revenus_gym_thb:        rev.gym,
      revenus_fnb_thb:        rev.fnb,
      revenus_resort_thb:     rev.resort,
      depenses_black_box_thb: depBlackBox,
      closing_note:           note ?? null,
      closed:                 true,
      closed_at:              new Date().toISOString(),
      closed_by:              staffId,
    }, { onConflict: 'date' })

  if (error) throw error
  return { cashWithdrawn, rev, depBlackBox }
}
