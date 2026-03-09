import type { Transaction } from './types'

/** Commission Booking.com : le resort recoit 81.42% du prix affiche */
export const COMMISSION_BOOKING = 0.8142

/** Retourne le montant NET reel d'une transaction (apres commission Booking pour les bungalows) */
export function txnNet(t: Transaction): number {
  return t.centreRevenu === 'Bungalows' ? Math.round(t.total * COMMISSION_BOOKING) : t.total
}
