import type {
  Client, GymPass, FnbProduct, Bungalow, Transaction, Expense,
  ActiveGymPass, StaffMember, Serviette, RoomCharge, MaintenanceTask,
  CheckinEntry, ChatMessage, TableOuverte, PlanningShift,
  TarifsConfig, MessageClientWA, MessageTemplateWA
} from './types'
import type {
  ReportRevenue, ReportExpenseDaily, ReportExpenseMonthly,
  CashClosing, DailyClosing, BusinessUnit, ClosingStatut,
  RevenueCategory, ExpenseDailyCategory, ExpenseMonthlyCategory, ExpenseSource,
} from './types-reporting'

import * as clientsQ from './supabase/queries/clients'
import * as bungalowsQ from './supabase/queries/bungalows'
import * as gymQ from './supabase/queries/gym'
import * as transactionsQ from './supabase/queries/transactions'
import * as depensesQ from './supabase/queries/depenses'
import * as staffQ from './supabase/queries/staff'
import * as planningQ from './supabase/queries/planning'
import * as reportingQ from './supabase/queries/reporting'
import * as maintenanceQ from './supabase/queries/maintenance'
import * as commsQ from './supabase/queries/communications'
import * as tablesQ from './supabase/queries/tables-bar'
import * as serviettesQ from './supabase/queries/serviettes'

// =============================================================================
// Data Access Layer — Supabase only
// =============================================================================

export async function getClients(): Promise<Client[]> {
  return clientsQ.getClients() as Promise<Client[]>
}

export async function getClientById(id: string): Promise<Client | undefined> {
  return clientsQ.getClientById(id) as Promise<Client | undefined>
}

export async function getGymPasses(): Promise<GymPass[]> {
  const rows = await transactionsQ.getGymPasses()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map((r: any) => ({ id: r.id, slug: r.sous_categorie ?? '', nom: r.nom, prix: r.prix_thb, dureeJours: r.duree_jours ?? 1, actif: r.actif ?? true }))
}

export async function getFnbProducts(): Promise<FnbProduct[]> {
  const d = await transactionsQ.getProduits()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return d.filter((p: any) => p.categorie === 'fnb').map((p: any) => ({
    id: p.id,
    nom: p.nom,
    categorie: p.sous_categorie ?? '',
    prix: p.prix_thb,
    emoji: p.emoji ?? '🍽️',
    actif: p.actif ?? true,
  }))
}

export async function getBungalows(): Promise<Bungalow[]> {
  const [bungs, allRes] = await Promise.all([
    bungalowsQ.getBungalows(),
    bungalowsQ.getAllReservations(),
  ])
  return bungs.map((b: { id: number; nom: string; statut: string }) => ({
    id: `bung-${b.id}`,
    numero: b.id,
    reservations: allRes
      .filter((r: { bungalow_id: number }) => r.bungalow_id === b.id)
      .map(mapReservation),
  }))
}

const BU_TO_CENTRE: Record<string, Transaction['centreRevenu']> = {
  gym: 'Gym', fnb: 'F&B', resort: 'Bungalows',
}

function mapTransaction(r: Record<string, unknown>): Transaction {
  return {
    id: r.id as string,
    date: r.date as string,
    type: r.categorie as Transaction['type'],
    centreRevenu: BU_TO_CENTRE[r.business_unit as string] ?? 'Gym',
    clientId: (r.client_id as string) ?? undefined,
    items: [],
    total: r.montant_thb as number,
    methode: (r.source_fonds === 'virement' ? 'virement' : 'especes') as Transaction['methode'],
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  const raw = await transactionsQ.getTransactions()
  return (raw ?? []).map((r: Record<string, unknown>) => mapTransaction(r))
}

export async function getExpenses(): Promise<Expense[]> {
  const rows = await depensesQ.getDepenses()
  return (rows ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    titre: (r.titre as string) ?? '',
    montant_thb: r.montant_thb as number,
    date: r.date as string,
    note: (r.note as string) ?? undefined,
    grande_categorie: r.grande_categorie as string,
    categorie: r.categorie as string,
    mode_paiement: r.mode_paiement as string,
    photo_base64: (r.photo_url as string) ?? null,
    staff_saisie: (r.staff_id as string) ?? undefined,
    created_at: r.created_at as string,
  }))
}

export async function getActivePasses(): Promise<ActiveGymPass[]> {
  return gymQ.getActivePassesMapped()
}

export async function getStaff(): Promise<StaffMember[]> {
  const [staff, pointages] = await Promise.all([
    staffQ.getStaff(), staffQ.getPointages(),
  ])
  return staff.map((s: { id: string; prenom: string }) => ({
    ...s, nom: s.prenom, couleur_avatar: '#C94E0A',
    pointages: pointages
      .filter((p: { staff_id: string }) => p.staff_id === s.id)
      .map((p: { id: string; date: string; heure_arrivee: string; heure_depart: string | null }) => ({
        id: p.id, date: p.date, heure_arrivee: p.heure_arrivee, heure_depart: p.heure_depart,
      })),
  })) as StaffMember[]
}

export async function getServiettes(): Promise<Serviette[]> {
  const raw = await serviettesQ.getServiettes()
  return (raw ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    client_nom: r.client_nom as string,
    client_id: r.client_id as string,
    date_emprunt: r.emprunt_at as string ?? '',
    heure_emprunt: '',
    deposit_montant: r.depot_thb as number ?? 0,
    statut: r.statut as Serviette['statut'],
    etat: r.etat as Serviette['etat'],
    date_retour: (r.retour_at as string) ?? null,
    staff_emprunt: r.staff_emprunt as string ?? '',
    staff_retour: (r.staff_retour as string) ?? null,
  })) as Serviette[]
}

export async function getRoomCharges(): Promise<RoomCharge[]> {
  const raw = await tablesQ.getRoomCharges()
  return (raw ?? []).map((r: Record<string, unknown>) => {
    const rcItems = (r.rc_items as { nom: string; prix_unitaire: number; quantite: number; sous_total: number }[] | null) ?? []
    return {
      id: r.id as string,
      bungalowId: (r.bungalow_id as string) ?? '',
      reservationId: (r.reservation_id as string) ?? '',
      clientId: (r.signed_by as string) ?? '',
      items: rcItems.map((item) => ({
        produitId: `fnb-${item.nom.toLowerCase().replace(/\s+/g, '-')}`,
        nom: item.nom,
        quantite: item.quantite,
        prixUnitaire: item.prix_unitaire,
        sousTotal: item.sous_total,
      })),
      total: (r.total_thb as number) ?? 0,
      date: ((r.created_at as string) ?? '').split('T')[0],
      staff: (r.staff_id as string) ?? '',
      statut: (r.statut as string) ?? 'en_attente',
      signature: (r.signature_base64 as string) ?? null,
    }
  }) as RoomCharge[]
}

export async function getMaintenanceTasks(): Promise<MaintenanceTask[]> {
  return maintenanceQ.getMaintenanceTaches() as Promise<MaintenanceTask[]>
}

export async function getChatMessages(): Promise<ChatMessage[]> {
  return [] // No chat table in schema
}

export async function getCheckins(): Promise<CheckinEntry[]> {
  const today = new Date().toISOString().split('T')[0]
  return gymQ.getCheckinEntriesDuJour(today)
}

export async function getTables(): Promise<TableOuverte[]> {
  const raw = await tablesQ.getAllTables()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (raw ?? []).map((r: any) => ({
    id: r.id, nom_table: r.nom_table, client_nom: r.client_nom ?? '',
    type_client: r.type_client ?? 'externe', bungalow_id: r.reservation_id ?? null,
    items: (r.items ?? []).map((i: any) => ({ nom: i.nom, prix: i.prix_unitaire ?? 0, quantite: i.quantite ?? 1 })),
    total_thb: r.total_thb ?? 0, heure_ouverture: r.opened_at ?? '',
    statut: r.statut ?? 'ouverte', staff_ouverture: r.staff?.prenom ?? '',
  }))
}

export async function getPlanning(): Promise<PlanningShift[]> {
  const raw = await planningQ.getPlanningShifts()
  return (raw ?? []).map((r: Record<string, unknown>) => {
    const staff = r.staff as { id?: string; prenom?: string; poste?: string; avatar_initiales?: string } | null
    return {
      ...r,
      staff_id: staff?.id ?? (r.staff_id as string) ?? '',
      staff_nom: staff?.prenom ?? '',
      staff_poste: staff?.poste ?? '',
    } as PlanningShift
  })
}

export async function getTarifs(): Promise<TarifsConfig> {
  const tarifs = await bungalowsQ.getTarifs()
  return {
    commission_booking: 0.8142,
    tarifs: tarifs.map((t: {
      id: string; nom: string; prix_nuit_thb: number
      prix_nuit_net: number; annulation: string; modifiable: boolean
    }) => ({ ...t, prix_net_thb: t.prix_nuit_net, couleur: t.id === 'flex' ? 'lime' : 'orange' })),
  }
}

export interface ReportData {
  revenues: ReportRevenue[]
  expensesDaily: ReportExpenseDaily[]
  expensesMonthly: ReportExpenseMonthly[]
  cashClosings: CashClosing[]
}

function mapBuUp(bu: string | null | undefined): BusinessUnit {
  return bu === 'resort' ? 'RESORT' : 'GYM'
}

export async function getReportData(): Promise<ReportData> {
  const currentMois = new Date().toISOString().slice(0, 7)
  const [allTx, allDep, mensuel] = await Promise.all([
    transactionsQ.getTransactions(),
    depensesQ.getDepenses(),
    depensesQ.getDepensesMensuelles(currentMois),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const revenues: ReportRevenue[] = (allTx ?? [])
    .filter((r: any) => r.type === 'income')
    .map((r: any) => ({
      id: r.id,
      date: r.date,
      bu: mapBuUp(r.business_unit),
      categorie: r.categorie as RevenueCategory,
      montant: r.montant_thb,
      note: r.note || undefined,
    }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expensesDaily: ReportExpenseDaily[] = (allDep ?? [])
    .map((d: any) => ({
      id: d.id,
      date: d.date,
      bu: mapBuUp(d.grande_categorie),
      categorie: (d.categorie || 'autre_dep_gym') as ExpenseDailyCategory,
      montant: d.montant_thb,
      source: (d.mode_paiement || 'black_box') as ExpenseSource,
      note: d.note || undefined,
    }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expensesMonthly: ReportExpenseMonthly[] = (mensuel ?? [])
    .map((m: any) => ({
      id: m.id,
      mois: m.mois,
      bu: mapBuUp(m.business_unit),
      categorie: (m.categorie || 'salary') as ExpenseMonthlyCategory,
      montant: m.montant_thb,
      note: m.note || undefined,
    }))

  return { revenues, expensesDaily, expensesMonthly, cashClosings: [] }
}

export async function getClosings(): Promise<DailyClosing[]> {
  const raw = await reportingQ.getClosings()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (raw ?? []).map((c: any) => ({
    id: c.id,
    date: c.date,
    ca_jour: c.ca_jour ?? 0,
    cash_compte: c.cash_compte ?? 0,
    ecart: c.ecart ?? 0,
    note_ecart: c.note_ecart || undefined,
    soumis_par: c.soumis_par ?? 'Staff',
    soumis_a: c.soumis_at
      ? new Date(c.soumis_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : '',
    statut: (c.statut ?? 'soumis') as ClosingStatut,
    valide_par: c.valide_par || undefined,
    valide_at: c.valide_at || undefined,
  }))
}

export async function getMessagesClientsWA(): Promise<MessageClientWA[]> {
  return commsQ.getMessagesClients() as Promise<MessageClientWA[]>
}

export async function getMessageTemplatesWA(): Promise<MessageTemplateWA[]> {
  return commsQ.getMessageTemplates() as Promise<MessageTemplateWA[]>
}

// --- Helpers ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapReservation(r: any) {
  return {
    id: r.id, bungalowId: `bung-${r.bungalow_id}`, clientId: r.client_id,
    clientNom: r.client_nom, dateDebut: r.date_arrivee, dateFin: r.date_depart,
    nuits: r.nb_nuits, montant: r.prix_total_net || r.prix_total_brut || 0,
    statut: r.statut === 'confirme' ? 'confirmee' : r.statut,
    nb_adultes: r.nb_adultes || 1, nb_enfants: r.nb_enfants || 0, note: r.note,
    email: r.client_email, telephone: r.client_telephone,
    checkin_fait: r.checkin_fait || false, tm30_fait: r.tm30_fait || false,
    clef_remise: r.clef_remise || false, source: r.source || 'booking',
    tarif_type: r.tarif_type, prix_nuit_brut: r.prix_nuit_brut,
    prix_nuit_net: r.prix_nuit_net, prix_total_brut: r.prix_total_brut,
    prix_total_net: r.prix_total_net,
  }
}
