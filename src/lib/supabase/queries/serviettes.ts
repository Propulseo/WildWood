import { createClient } from '@/lib/supabase/client'

function supabase() { return createClient() }

export async function getServiettes() {
  const { data, error } = await supabase()
    .from('serviettes')
    .select('id, numero, statut, etat, client_nom, client_id, depot_thb, emprunt_at, retour_at, staff_emprunt, staff_retour')
    .order('emprunt_at', { ascending: false })

  if (error) throw new Error(`getServiettes: ${error.message}`)
  return data
}

export async function insertServiette(serviette: {
  client_nom: string
  client_id?: string
  depot_thb: number
  statut: string
  etat?: string
  staff_emprunt?: string
}) {
  const { data, error } = await supabase()
    .from('serviettes')
    .insert({
      client_nom: serviette.client_nom,
      client_id: serviette.client_id || null,
      depot_thb: serviette.depot_thb,
      statut: serviette.statut,
      etat: serviette.etat ?? 'propre',
      staff_emprunt: serviette.staff_emprunt || null,
      emprunt_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw new Error(`insertServiette: ${error.message}`)
  return data
}

export async function updateServiette(
  id: string,
  updates: Record<string, unknown>
) {
  const clean = { ...updates }
  for (const key of ['staff_retour', 'staff_emprunt', 'client_id']) {
    if (key in clean && !clean[key]) clean[key] = null
  }
  const { data, error } = await supabase()
    .from('serviettes')
    .update(clean)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`updateServiette: ${error.message}`)
  return data
}

export async function getServiettesSales() {
  const { data, error } = await supabase()
    .from('serviettes')
    .select('id, numero, statut, etat, client_nom, client_id, depot_thb, emprunt_at, retour_at, staff_emprunt, staff_retour')
    .eq('statut', 'rendue')
    .eq('etat', 'sale')
    .order('retour_at', { ascending: true })

  if (error) throw new Error(`getServiettesSales: ${error.message}`)
  return data
}

export async function retournerServiette(id: string, staffRetour: string) {
  const { data, error } = await supabase()
    .from('serviettes')
    .update({
      statut: 'rendue',
      etat: 'sale',
      retour_at: new Date().toISOString(),
      staff_retour: staffRetour,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`retournerServiette: ${error.message}`)
  return data
}

export async function receptionnerLavage(nbComptees: number, staffId: string) {
  // 1. Fetch dirty towels FIFO
  const sales = await getServiettesSales()
  const nbSales = sales?.length ?? 0

  // 2. How many to restore vs create
  const nbRemises = Math.min(nbComptees, nbSales)
  const nbCreees = Math.max(0, nbComptees - nbSales)

  // 3. Restore the oldest dirty towels
  if (nbRemises > 0) {
    const ids = sales!.slice(0, nbRemises).map((s: { id: string }) => s.id)
    const { error } = await supabase()
      .from('serviettes')
      .update({ statut: 'disponible', etat: 'propre', client_nom: null, client_id: null })
      .in('id', ids)

    if (error) throw new Error(`receptionnerLavage update: ${error.message}`)
  }

  // 4. Create new towels if count exceeds dirty
  if (nbCreees > 0) {
    const { data: maxRow } = await supabase()
      .from('serviettes')
      .select('numero')
      .order('numero', { ascending: false })
      .limit(1)
      .single()

    let nextNum = parseInt(maxRow?.numero ?? '0', 10) + 1
    const newTowels = Array.from({ length: nbCreees }, () => ({
      numero: String(nextNum++),
      statut: 'disponible',
      etat: 'propre',
      depot_thb: 100,
    }))

    const { error } = await supabase()
      .from('serviettes')
      .insert(newTowels)

    if (error) throw new Error(`receptionnerLavage insert: ${error.message}`)
  }

  // 5. Log reception
  await insertReceptionLog(nbComptees, nbRemises, nbCreees, staffId)

  return { nbRemises, nbCreees }
}

export async function insertReceptionLog(
  nbComptees: number,
  nbRemisesStock: number,
  nbCreees: number,
  staffId: string,
) {
  const { error } = await supabase()
    .from('reception_lavage')
    .insert({
      nb_comptees: nbComptees,
      nb_remises_stock: nbRemisesStock,
      nb_creees: nbCreees,
      staff_id: staffId,
    })

  if (error) throw new Error(`insertReceptionLog: ${error.message}`)
}
