import type { Client, GymPass, FnbProduct, Bungalow, Transaction, Expense } from './types'
import clientsData from './mock-data/clients.json'
import gymPassesData from './mock-data/gym-passes.json'
import fnbProductsData from './mock-data/fnb-products.json'
import bungalowsData from './mock-data/bungalows.json'
import transactionsData from './mock-data/transactions.json'
import expensesData from './mock-data/expenses.json'

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
  return expensesData as Expense[]
}
