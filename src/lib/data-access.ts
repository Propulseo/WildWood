import type { Client, GymPass, FnbProduct, Bungalow, Transaction, Expense, ActiveGymPass, StaffMember, Serviette, RoomCharge, MaintenanceTask, CheckinEntry, ChatMessage, TableOuverte, PlanningShift, TarifsConfig, MessageClientWA, MessageTemplateWA } from './types'
import type { ReportRevenue, ReportExpenseDaily, ReportExpenseMonthly, CashClosing, DailyClosing } from './types-reporting'
import clientsData from './mock-data/clients.json'
import gymPassesData from './mock-data/gym-passes.json'
import fnbProductsData from './mock-data/fnb-products.json'
import bungalowsData from './mock-data/bungalows.json'
import transactionsData from './mock-data/transactions.json'
import depensesData from './mock-data/depenses.json'
import activePassesData from './mock-data/active-passes.json'
import staffData from './mock-data/staff.json'
import serviettesData from './mock-data/serviettes.json'
import roomChargesData from './mock-data/room-charges.json'
import maintenanceData from './mock-data/maintenance.json'
import chatMessagesData from './mock-data/chat-messages.json'
import checkinsData from './mock-data/checkins.json'
import tablesData from './mock-data/tables.json'
import planningData from './mock-data/planning.json'
import tarifsData from './mock-data/tarifs.json'
import reportsData from './mock-data/reports.json'
import closingsData from './mock-data/closings.json'
import messagesClientsData from './mock-data/messages-clients.json'
import messageTemplatesData from './mock-data/message-templates.json'

// =============================================================================
// Data Access Layer — Single point of entry for all data
// =============================================================================
//
// IMPORTANT: This file is the ONLY place that imports from mock-data/.
// All components MUST use these functions instead of importing JSON directly.
//
// Phase 2 migration: Replace function internals with Supabase queries.
// The function signatures stay identical — no component changes needed.
// =============================================================================

// --- Clients ---

export async function getClients(): Promise<Client[]> {
  return clientsData as Client[]
}

export async function getClientById(id: string): Promise<Client | undefined> {
  return (clientsData as Client[]).find(c => c.id === id)
}

// --- Gym Passes ---

export async function getGymPasses(): Promise<GymPass[]> {
  return gymPassesData as GymPass[]
}

// --- F&B Products ---

export async function getFnbProducts(): Promise<FnbProduct[]> {
  return fnbProductsData as FnbProduct[]
}

// --- Bungalows ---

export async function getBungalows(): Promise<Bungalow[]> {
  return bungalowsData as Bungalow[]
}

// --- Transactions ---

export async function getTransactions(): Promise<Transaction[]> {
  return transactionsData as Transaction[]
}

// --- Expenses ---

export async function getExpenses(): Promise<Expense[]> {
  return depensesData as Expense[]
}

// --- Active Gym Passes ---

export async function getActivePasses(): Promise<ActiveGymPass[]> {
  return activePassesData as ActiveGymPass[]
}

// --- Staff ---

export async function getStaff(): Promise<StaffMember[]> {
  return staffData as StaffMember[]
}

// --- Serviettes ---

export async function getServiettes(): Promise<Serviette[]> {
  return serviettesData as Serviette[]
}

// --- Room Charges ---

export async function getRoomCharges(): Promise<RoomCharge[]> {
  return roomChargesData as RoomCharge[]
}

// --- Maintenance ---

export async function getMaintenanceTasks(): Promise<MaintenanceTask[]> {
  return maintenanceData as MaintenanceTask[]
}

// --- Chat Messages ---

export async function getChatMessages(): Promise<ChatMessage[]> {
  return chatMessagesData as ChatMessage[]
}

// --- Checkins ---

export async function getCheckins(): Promise<CheckinEntry[]> {
  return checkinsData as CheckinEntry[]
}

// --- Tables ouvertes ---

export async function getTables(): Promise<TableOuverte[]> {
  return tablesData as TableOuverte[]
}

// --- Planning ---

export async function getPlanning(): Promise<PlanningShift[]> {
  return planningData as PlanningShift[]
}

// --- Tarifs ---

export async function getTarifs(): Promise<TarifsConfig> {
  return tarifsData as TarifsConfig
}

// --- Reports ---

export interface ReportData {
  revenues: ReportRevenue[]
  expensesDaily: ReportExpenseDaily[]
  expensesMonthly: ReportExpenseMonthly[]
  cashClosings: CashClosing[]
}

export async function getReportData(): Promise<ReportData> {
  return {
    revenues: reportsData.revenues as ReportRevenue[],
    expensesDaily: reportsData.expenses_daily as ReportExpenseDaily[],
    expensesMonthly: reportsData.expenses_monthly as ReportExpenseMonthly[],
    cashClosings: reportsData.cash_closing as CashClosing[],
  }
}

// --- Closings ---

export async function getClosings(): Promise<DailyClosing[]> {
  return closingsData as DailyClosing[]
}

// --- WhatsApp Messages ---

export async function getMessagesClientsWA(): Promise<MessageClientWA[]> {
  return messagesClientsData as MessageClientWA[]
}

export async function getMessageTemplatesWA(): Promise<MessageTemplateWA[]> {
  return messageTemplatesData as MessageTemplateWA[]
}
