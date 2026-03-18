import { createClient } from '@/lib/supabase/client'
import type { ActiveGymPass, CheckinEntry } from '@/lib/types'

function supabase() { return createClient() }

const PASS_NOMS: Record<string, string> = {
  'resident': 'Résident',
}

// --- Gym Passes ---

/** Fetch active passes mapped to ActiveGymPass[] with joined checkins */
export async function getActivePassesMapped(): Promise<ActiveGymPass[]> {
  const [passesRes, checkinsRes] = await Promise.all([
    supabase()
      .from('gym_passes')
      .select('id, client_id, client_nom, type_pass, prix_paye, date_debut, date_expiration, actif, created_at')
      .eq('actif', true)
      .order('created_at', { ascending: false }),
    supabase()
      .from('checkins')
      .select('gym_pass_id, date, heure_entree')
      .not('gym_pass_id', 'is', null),
  ])
  if (passesRes.error) throw new Error(`getActivePassesMapped: ${passesRes.error.message}`)
  if (checkinsRes.error) throw new Error(`getActivePassesMapped checkins: ${checkinsRes.error.message}`)

  const checkinsByPass = new Map<string, { date: string; heure: string }[]>()
  for (const c of (checkinsRes.data ?? []) as { gym_pass_id: string; date: string; heure_entree: string | null }[]) {
    const list = checkinsByPass.get(c.gym_pass_id) ?? []
    list.push({ date: c.date, heure: c.heure_entree ?? '' })
    checkinsByPass.set(c.gym_pass_id, list)
  }

  return (passesRes.data ?? []).map((p: Record<string, unknown>) => {
    const id = p.id as string
    const typePass = p.type_pass as string
    return {
      id,
      qrToken: `WW-PASS-${id.slice(-4).toUpperCase()}`,
      clientId: (p.client_id as string) ?? '',
      clientNom: p.client_nom as string,
      passId: typePass,
      passNom: PASS_NOMS[typePass] ?? typePass,
      dateAchat: p.date_debut as string,
      dateExpiration: p.date_expiration as string,
      actif: (p.actif as boolean) ?? true,
      checkins: checkinsByPass.get(id) ?? [],
    }
  })
}

/** Fetch checkin entries for a given date, mapped to CheckinEntry[] */
export async function getCheckinEntriesDuJour(date: string): Promise<CheckinEntry[]> {
  const { data, error } = await supabase()
    .from('checkins')
    .select('id, date, client_id, client_nom, gym_pass_id, type_entree, heure_entree, upgrade_effectue, gym_passes(type_pass, prix_paye)')
    .eq('date', date)
    .order('heure_entree')

  if (error) throw new Error(`getCheckinEntriesDuJour: ${error.message}`)

  return (data ?? []).map((c: Record<string, unknown>) => {
    const gp = c.gym_passes as { type_pass: string; prix_paye: number } | null
    return {
      id: c.id as string,
      client_nom: c.client_nom as string,
      client_id: (c.client_id as string) ?? '',
      type_entree: (c.type_entree as CheckinEntry['type_entree']) ?? 'gym_pass',
      type_pass: (gp?.type_pass ?? 'resident') as CheckinEntry['type_pass'],
      prix_paye: gp?.prix_paye ?? 0,
      heure_entree: (c.heure_entree as string) ?? '',
      date_entree: c.date as string,
      upgrade_effectue: (c.upgrade_effectue as CheckinEntry['upgrade_effectue']) ?? false,
    }
  })
}

/** Sell a pass: insert gym_pass + checkin + income transaction */
export async function vendrePass(args: {
  clientNom: string
  clientId?: string
  typePass: string
  passNom?: string
  prixPaye: number
  dureeJours?: number
  staffId?: string
}) {
  const today = new Date().toISOString().split('T')[0]
  const duree = args.dureeJours ?? 1
  const exp = new Date()
  exp.setDate(exp.getDate() + duree)
  const dateExp = exp.toISOString().split('T')[0]
  const heure = new Date().toTimeString().slice(0, 5)

  const { data: pass, error: passErr } = await supabase()
    .from('gym_passes')
    .insert({
      client_nom: args.clientNom,
      client_id: args.clientId ?? null,
      type_pass: args.typePass,
      prix_paye: args.prixPaye,
      date_debut: today,
      date_expiration: dateExp,
    })
    .select('id')
    .single()
  if (passErr) throw new Error(`vendrePass pass: ${passErr.message}`)

  const { error: checkinErr } = await supabase()
    .from('checkins')
    .insert({
      date: today,
      client_nom: args.clientNom,
      client_id: args.clientId ?? null,
      gym_pass_id: pass.id,
      type_entree: 'gym_pass',
      heure_entree: heure,
      staff_id: args.staffId ?? null,
    })
  if (checkinErr) throw new Error(`vendrePass checkin: ${checkinErr.message}`)

  const { error: txnErr } = await supabase()
    .from('transactions')
    .insert({
      date: today,
      heure,
      type: 'income',
      business_unit: 'gym',
      categorie: 'gym_pass',
      montant_thb: args.prixPaye,
      client_id: args.clientId ?? null,
      staff_id: args.staffId ?? null,
      source_fonds: 'black_box',
      note: `Pass ${args.passNom ?? PASS_NOMS[args.typePass] ?? args.typePass} — ${args.clientNom}`,
    })
  if (txnErr) throw new Error(`vendrePass transaction: ${txnErr.message}`)

  return pass.id as string
}

/** Upgrade a 1-day pass: deactivate old, create new pass, update checkin, insert transaction */
export async function upgradePass(args: {
  oldPassId: string
  checkinId: string
  clientNom: string
  clientId?: string
  versType: string
  prixUpgrade: number
  staffId?: string
}) {
  const today = new Date().toISOString().split('T')[0]
  const heure = new Date().toTimeString().slice(0, 5)

  const DUREES: Record<string, number> = { '3_jours': 3, '1_semaine': 7, '1_mois': 30 }
  const duree = DUREES[args.versType] ?? 7
  const exp = new Date()
  exp.setDate(exp.getDate() + duree)
  const dateExp = exp.toISOString().split('T')[0]

  // 1. Deactivate old pass
  await supabase().from('gym_passes').update({ actif: false }).eq('id', args.oldPassId)

  // 2. Create new pass
  const { data: newPass, error: passErr } = await supabase()
    .from('gym_passes')
    .insert({
      client_nom: args.clientNom,
      client_id: args.clientId || null,
      type_pass: args.versType,
      prix_paye: args.prixUpgrade,
      date_debut: today,
      date_expiration: dateExp,
      upgrade_from: args.oldPassId,
    })
    .select('id')
    .single()
  if (passErr) throw new Error(`upgradePass: ${passErr.message}`)

  // 3. Update checkin with upgrade info
  await supabase()
    .from('checkins')
    .update({
      upgrade_effectue: { vers: args.versType, prix_upgrade: args.prixUpgrade, heure },
      gym_pass_id: newPass.id,
    })
    .eq('id', args.checkinId)

  // 4. Insert upgrade transaction
  const LABELS: Record<string, string> = { '3_jours': '3 Jours', '1_semaine': '1 Semaine', '1_mois': '1 Mois' }
  const { error: txnErr } = await supabase()
    .from('transactions')
    .insert({
      date: today, heure, type: 'income', business_unit: 'gym',
      categorie: 'upgrade_pass', montant_thb: args.prixUpgrade,
      client_id: args.clientId || null, staff_id: args.staffId || null,
      source_fonds: 'black_box',
      note: `Upgrade → ${LABELS[args.versType] ?? args.versType} — ${args.clientNom}`,
    })
  if (txnErr) throw new Error(`upgradePass txn: ${txnErr.message}`)

  return newPass.id as string
}

// Re-export CRUD helpers from gym-crud.ts
export {
  getGymPassByClient, insertGymPass, updateGymPass,
  getCheckinsByDate, insertCheckin, deleteCheckin,
} from './gym-crud'

