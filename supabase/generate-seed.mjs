// Generate seed.sql from mock JSON data
// Run: node supabase/generate-seed.mjs > supabase/seed.sql

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MOCK = join(__dirname, '..', 'src', 'lib', 'mock-data')

function read(file) {
  return JSON.parse(readFileSync(join(MOCK, file), 'utf-8'))
}

// Deterministic UUID mapping: each mock ID gets a stable UUID
const uuidMap = new Map()
let uuidCounter = 0

function uuid(mockId) {
  if (!mockId) return 'NULL'
  if (uuidMap.has(mockId)) return `'${uuidMap.get(mockId)}'`
  uuidCounter++
  const hex = uuidCounter.toString(16).padStart(12, '0')
  const u = `00000000-0000-4000-a000-${hex}`
  uuidMap.set(mockId, u)
  return `'${u}'`
}

function esc(val) {
  if (val === null || val === undefined) return 'NULL'
  if (typeof val === 'boolean') return val ? 'true' : 'false'
  if (typeof val === 'number') return String(val)
  return `'${String(val).replace(/'/g, "''")}'`
}

function escOrNull(val) {
  if (val === null || val === undefined || val === '') return 'NULL'
  return esc(val)
}

const lines = []
function emit(sql) { lines.push(sql) }

// ============================================================
// Load all data
// ============================================================
const staffData = read('staff.json')
const tarifsData = read('tarifs.json')
const templatesData = read('message-templates.json')
const fnbProducts = read('fnb-products.json')
const gymPasses = read('gym-passes.json')
const clients = read('clients.json')
const bungalows = read('bungalows.json')
const activePasses = read('active-passes.json')
const checkins = read('checkins.json')
const serviettes = read('serviettes.json')
const tables = read('tables.json')
const roomCharges = read('room-charges.json')
const closingsData = read('closings.json')
const planningData = read('planning.json')
const maintenanceData = read('maintenance.json')
const messagesData = read('messages-clients.json')
const depensesData = read('depenses.json')

emit('-- ============================================================')
emit('-- WildWood ERP — Seed data (generated from mock JSON)')
emit('-- ============================================================')
emit('')

// ============================================================
// 1. Staff (pre-assign UUIDs)
// ============================================================
emit('-- Staff')
for (const s of staffData) {
  const email = s.poste === 'admin' ? 'admin@wildwood.com'
    : s.poste === 'reception' ? `${s.prenom.toLowerCase()}@wildwood.com`
    : `${s.prenom.toLowerCase()}@wildwood.com`
  emit(`INSERT INTO staff (id, prenom, email, poste, avatar_initiales, actif) VALUES (${uuid(s.id)}, ${esc(s.prenom)}, ${esc(email)}, ${esc(s.poste)}, ${esc(s.avatar_initiales)}, true);`)
}
emit('')

// ============================================================
// 2. Tarifs
// ============================================================
emit('-- Tarifs')
for (const t of tarifsData.tarifs) {
  emit(`INSERT INTO tarifs (id, nom, prix_nuit_thb, commission_booking, annulation, modifiable) VALUES (${esc(t.id)}, ${esc(t.nom)}, ${t.prix_nuit_thb}, 0.8142, ${escOrNull(t.annulation)}, ${t.modifiable});`)
}
emit('')

// ============================================================
// 3. Message templates
// ============================================================
emit('-- Message templates')
for (const t of templatesData) {
  emit(`INSERT INTO message_templates (id, nom, contenu) VALUES (${esc(t.type)}, ${esc(t.nom)}, ${esc(t.contenu)});`)
}
emit('')

// ============================================================
// 4. Produits (gym passes + F&B)
// ============================================================
emit('-- Produits (gym passes)')
for (const p of gymPasses) {
  const sousCategorie = p.id.replace('pass-', '')
  emit(`INSERT INTO produits (id, nom, categorie, sous_categorie, prix_thb, actif, ordre) VALUES (${uuid(p.id)}, ${esc(p.nom)}, 'gym_pass', ${esc(sousCategorie)}, ${p.prix}, true, 0);`)
}
emit('')
emit('-- Produits (F&B)')
let fnbOrdre = 0
for (const p of fnbProducts) {
  fnbOrdre++
  emit(`INSERT INTO produits (id, nom, categorie, sous_categorie, prix_thb, actif, ordre) VALUES (${uuid(p.id)}, ${esc(p.nom)}, 'fnb', ${esc(p.categorie)}, ${p.prix}, true, ${fnbOrdre});`)
}
emit('')

// ============================================================
// 5. Clients
// ============================================================
emit('-- Clients')
for (const c of clients) {
  const nom = `${c.prenom} ${c.nom}`
  emit(`INSERT INTO clients (id, nom, email, telephone, nationalite) VALUES (${uuid(c.id)}, ${esc(nom)}, ${escOrNull(c.email)}, ${escOrNull(c.telephone)}, NULL);`)
}
// Manual clients from reservations
const manualClients = [
  { id: 'cli-manual-901', nom: 'Carlos Rodriguez', telephone: '+34 612 345 678' },
  { id: 'cli-manual-902', nom: 'Yuki Tanaka', email: 'yuki.tanaka@gmail.com', telephone: '+81 90 1234 5678' },
  { id: 'cli-manual-903', nom: 'Marco Bellini', telephone: '+39 320 987 6543' },
]
for (const c of manualClients) {
  emit(`INSERT INTO clients (id, nom, email, telephone) VALUES (${uuid(c.id)}, ${esc(c.nom)}, ${escOrNull(c.email)}, ${escOrNull(c.telephone)});`)
}
emit('')

// ============================================================
// 6. Reservations (flattened from bungalows)
// ============================================================
emit('-- Reservations')
for (const b of bungalows) {
  const bungId = b.numero
  for (const r of b.reservations) {
    // Find client name
    const client = clients.find(c => c.id === r.clientId)
    const clientNom = client ? `${client.prenom} ${client.nom}` : (r.clientNom || 'Inconnu')
    const clientEmail = r.email || (client ? client.email : null)
    const clientTel = r.telephone || (client ? client.telephone : null)
    const source = r.source || 'booking'
    // Map statut
    let statut = r.statut
    if (statut === 'en-cours' || statut === 'confirmee') statut = 'confirme'

    const tarifType = r.tarif_type ? esc(r.tarif_type) : 'NULL'

    emit(`INSERT INTO reservations (id, bungalow_id, client_id, client_nom, client_email, client_telephone, date_arrivee, date_depart, nb_adultes, nb_enfants, tarif_type, prix_nuit_brut, prix_nuit_net, source, statut, checkin_fait, tm30_fait, clef_remise, note) VALUES (${uuid(r.id)}, ${bungId}, ${uuid(r.clientId)}, ${esc(clientNom)}, ${escOrNull(clientEmail)}, ${escOrNull(clientTel)}, '${r.dateDebut}', '${r.dateFin}', ${r.nb_adultes || 1}, ${r.nb_enfants || 0}, ${tarifType}, ${r.prix_nuit_brut || 'NULL'}, ${r.prix_nuit_net || 'NULL'}, ${esc(source)}, ${esc(statut)}, ${r.checkin_fait || false}, ${r.tm30_fait || false}, ${r.clef_remise || false}, ${escOrNull(r.note)});`)
  }
}
emit('')

// ============================================================
// 7. Gym passes (from active-passes)
// ============================================================
emit('-- Gym passes')
const passTypeMap = {
  'pass-1j': '1_jour', 'pass-3j': '3_jours', 'pass-1s': '1_semaine',
  'pass-10j': '1_semaine', 'pass-1m': '1_mois', 'pass-6m': '1_mois',
  'pass-guest-hotel': 'resident'
}
for (const ap of activePasses) {
  let typePass = passTypeMap[ap.passId] || '1_jour'
  // More precise mapping
  if (ap.passId === 'pass-1m') typePass = '1_mois'
  if (ap.passId === 'pass-1s') typePass = '1_semaine'
  if (ap.passId === 'pass-3j') typePass = '3_jours'
  if (ap.passId === 'pass-10j') typePass = '1_semaine' // closest match
  if (ap.passId === 'pass-6m') typePass = '1_mois' // closest match

  const gymPassDef = gymPasses.find(g => g.id === ap.passId)
  const prix = gymPassDef ? gymPassDef.prix : 0

  emit(`INSERT INTO gym_passes (id, client_id, client_nom, type_pass, prix_paye, date_debut, date_expiration, actif) VALUES (${uuid(ap.id)}, ${uuid(ap.clientId)}, ${esc(ap.clientNom)}, ${esc(typePass)}, ${prix}, '${ap.dateAchat}', '${ap.dateExpiration}', ${ap.actif});`)
}
emit('')

// ============================================================
// 8. Checkins
// ============================================================
emit('-- Checkins')
for (const chk of checkins) {
  const typeEntree = chk.type_entree
  // Find matching gym pass for this client
  const ap = activePasses.find(a => a.clientId === chk.client_id)
  const gymPassId = ap ? uuid(ap.id) : 'NULL'
  // Find reservation for hotel_resident
  let resId = 'NULL'
  if (typeEntree === 'hotel_resident' && chk.bungalow_numero) {
    const bung = bungalows.find(b => b.numero === chk.bungalow_numero)
    if (bung) {
      const res = bung.reservations.find(r =>
        r.clientId === chk.client_id &&
        r.dateDebut <= chk.date_entree && r.dateFin >= chk.date_entree
      )
      if (res) resId = uuid(res.id)
    }
  }

  emit(`INSERT INTO checkins (id, date, client_id, client_nom, gym_pass_id, type_entree, heure_entree, reservation_id) VALUES (${uuid(chk.id)}, '${chk.date_entree}', ${uuid(chk.client_id)}, ${esc(chk.client_nom)}, ${gymPassId}, ${esc(typeEntree)}, '${chk.heure_entree}', ${resId});`)
}
emit('')

// ============================================================
// 9. Serviettes
// ============================================================
emit('-- Serviettes')
let srvNum = 0
for (const s of serviettes) {
  srvNum++
  const empruntAt = `'${s.date_emprunt}T${s.heure_emprunt}:00'`
  const retourAt = s.date_retour ? `'${s.date_retour}T18:00:00'` : 'NULL'

  emit(`INSERT INTO serviettes (id, numero, statut, client_nom, client_id, depot_thb, emprunt_at, retour_at) VALUES (${uuid(s.id)}, ${esc(String(srvNum).padStart(2, '0'))}, ${esc(s.statut)}, ${esc(s.client_nom)}, ${uuid(s.client_id)}, ${s.deposit_montant}, ${empruntAt}, ${retourAt});`)
}
emit('')

// ============================================================
// 10. Tables bar + table items
// ============================================================
emit('-- Tables bar')
for (const t of tables) {
  const resId = t.bungalow_id ? (() => {
    const bungNum = parseInt(t.bungalow_id.replace('bung-', ''))
    const bung = bungalows.find(b => b.numero === bungNum)
    if (bung && bung.reservations.length > 0) {
      const activeRes = bung.reservations.find(r =>
        r.statut === 'en-cours' || r.statut === 'confirmee'
      )
      if (activeRes) return uuid(activeRes.id)
    }
    return 'NULL'
  })() : 'NULL'

  emit(`INSERT INTO tables_bar (id, nom_table, client_nom, type_client, reservation_id, statut, total_thb, opened_at) VALUES (${uuid(t.id)}, ${esc(t.nom_table)}, ${esc(t.client_nom)}, ${esc(t.type_client)}, ${resId}, ${esc(t.statut === 'payee' ? 'payee' : 'ouverte')}, ${t.total_thb}, '${t.heure_ouverture}');`)
}
emit('')

emit('-- Table items')
for (const t of tables) {
  for (const item of t.items) {
    const itemId = uuid(`${t.id}-item-${item.nom}`)
    emit(`INSERT INTO table_items (id, table_id, nom, prix_unitaire, quantite) VALUES (${itemId}, ${uuid(t.id)}, ${esc(item.nom)}, ${item.prix}, ${item.quantite});`)
  }
}
emit('')

// ============================================================
// 11. Room charges
// ============================================================
emit('-- Room charges')
for (const rc of roomCharges) {
  const bungNum = parseInt(rc.bungalowId.replace('bung-', ''))
  emit(`INSERT INTO room_charges (id, reservation_id, bungalow_id, statut, total_thb, signature_base64, signed_at, signed_by) VALUES (${uuid(rc.id)}, ${uuid(rc.reservationId)}, ${bungNum}, 'en_attente', ${rc.total}, ${escOrNull(rc.signature_base64)}, ${rc.signed_at ? `'${rc.signed_at}'` : 'NULL'}, ${escOrNull(rc.signed_by)});`)
}
emit('')

// ============================================================
// 12. Depenses
// ============================================================
emit('-- Depenses')
for (const d of depensesData) {
  emit(`INSERT INTO depenses (id, date, titre, grande_categorie, categorie, montant_thb, mode_paiement, admin_only, auto_generated, note) VALUES (${uuid(d.id)}, '${d.date}', ${escOrNull(d.titre)}, ${esc(d.grande_categorie)}, ${esc(d.categorie)}, ${d.montant_thb}, ${esc(d.mode_paiement)}, ${d.admin_only || false}, ${d.auto_generated || false}, ${escOrNull(d.note)});`)
}
emit('')

// ============================================================
// 13. Pointages (from staff embedded data)
// ============================================================
emit('-- Pointages')
let pointageCount = 0
for (const s of staffData) {
  for (const p of s.pointages) {
    pointageCount++
    const duree = (p.heure_depart && p.heure_arrivee)
      ? (() => {
          const [ah, am] = p.heure_arrivee.split(':').map(Number)
          const [dh, dm] = p.heure_depart.split(':').map(Number)
          return (dh * 60 + dm) - (ah * 60 + am)
        })()
      : null

    emit(`INSERT INTO pointages (id, staff_id, date, heure_arrivee, heure_depart, duree_minutes) VALUES (${uuid(`pointage-${pointageCount}`)}, ${uuid(s.id)}, '${p.date}', '${p.heure_arrivee}', ${p.heure_depart ? `'${p.heure_depart}'` : 'NULL'}, ${duree !== null ? duree : 'NULL'});`)
  }
}
emit('')

// ============================================================
// 14. Planning shifts
// ============================================================
emit('-- Planning shifts')
for (const sh of planningData) {
  emit(`INSERT INTO planning_shifts (id, staff_id, date, heure_debut, heure_fin, poste_shift, repas_inclus, note, publie) VALUES (${uuid(sh.id)}, ${uuid(sh.staff_id)}, '${sh.date}', '${sh.heure_debut}', '${sh.heure_fin}', ${esc(sh.poste_shift)}, ${sh.repas_inclus}, ${escOrNull(sh.note)}, ${sh.publie});`)
}
emit('')

// ============================================================
// 15. Maintenance taches
// ============================================================
emit('-- Maintenance taches')
for (const m of maintenanceData) {
  const bungNum = parseInt(m.bungalow_id.replace('bung-', ''))
  emit(`INSERT INTO maintenance_taches (id, bungalow_id, titre, description, priorite, statut, date_creation${m.date_resolution ? ', date_resolution' : ''}) VALUES (${uuid(m.id)}, ${bungNum}, ${esc(m.titre)}, ${escOrNull(m.description)}, ${esc(m.priorite)}, ${esc(m.statut)}, '${m.date_creation}'${m.date_resolution ? `, '${m.date_resolution}'` : ''});`)
}
emit('')

// ============================================================
// 16. Messages clients
// ============================================================
emit('-- Messages clients')
for (const msg of messagesData) {
  // Map statut to valid values (no accents in DB)
  let statut = msg.statut
  if (statut === 'lu') statut = 'envoye' // map 'lu' to 'envoye' (closest)

  emit(`INSERT INTO messages_clients (id, reservation_id, client_nom, telephone, type, statut, message_contenu, reponse_client, planifie_le, envoye_le) VALUES (${uuid(msg.id)}, ${uuid(msg.reservation_id)}, ${esc(msg.client_nom)}, ${escOrNull(msg.telephone)}, ${esc(msg.type)}, ${esc(statut)}, ${esc(msg.message_contenu)}, ${escOrNull(msg.reponse_client)}, ${msg.planifie_le ? `'${msg.planifie_le}'` : 'NULL'}, ${msg.envoye_le ? `'${msg.envoye_le}'` : 'NULL'});`)
}
emit('')

// ============================================================
// 17. Closings
// ============================================================
emit('-- Closings')
for (const cl of closingsData) {
  // Map statut
  let statut = cl.statut
  if (statut === 'valide_admin') statut = 'valide_admin'

  emit(`INSERT INTO closings (id, date, ca_jour, cash_compte, ecart, note_ecart, statut) VALUES (${uuid(cl.id)}, '${cl.date}', ${cl.ca_jour}, ${cl.cash_compte}, ${cl.ecart}, ${escOrNull(cl.note_ecart)}, ${esc(statut)});`)
}
emit('')

// Print all
console.log(lines.join('\n'))
