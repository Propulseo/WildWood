import type { Client } from '@/lib/types'

export interface CartItem {
  produitId: string
  nom: string
  prixUnitaire: number
  quantite: number
  type: 'gym-pass' | 'fnb'
}

export interface CartState {
  items: CartItem[]
  client: Client | null
  isBungalowResident: boolean
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantite'> }
  | { type: 'REMOVE_ITEM'; payload: { produitId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { produitId: string; quantite: number } }
  | { type: 'SET_CLIENT'; payload: { client: Client; isBungalowResident: boolean } }
  | { type: 'CLEAR_CART' }

export const initialCartState: CartState = {
  items: [],
  client: null,
  isBungalowResident: false,
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((item) => item.produitId === action.payload.produitId)
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.produitId === action.payload.produitId ? { ...item, quantite: item.quantite + 1 } : item
          ),
        }
      }
      return { ...state, items: [...state.items, { ...action.payload, quantite: 1 }] }
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((item) => item.produitId !== action.payload.produitId) }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantite <= 0) {
        return { ...state, items: state.items.filter((item) => item.produitId !== action.payload.produitId) }
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.produitId === action.payload.produitId ? { ...item, quantite: action.payload.quantite } : item
        ),
      }
    }

    case 'SET_CLIENT':
      return { ...state, client: action.payload.client, isBungalowResident: action.payload.isBungalowResident }

    case 'CLEAR_CART':
      return initialCartState

    default:
      return state
  }
}
