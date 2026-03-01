'use client'

import { useReducer, useState } from 'react'
import type { Client, GymPass, FnbProduct, Bungalow } from '@/lib/types'
import { ProductGrid } from './product-grid'

// =============================================================================
// Cart State Types
// =============================================================================

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

// =============================================================================
// Cart Reducer
// =============================================================================

const initialCartState: CartState = {
  items: [],
  client: null,
  isBungalowResident: false,
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(
        (item) => item.produitId === action.payload.produitId
      )
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.produitId === action.payload.produitId
              ? { ...item, quantite: item.quantite + 1 }
              : item
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantite: 1 }],
      }
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(
          (item) => item.produitId !== action.payload.produitId
        ),
      }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantite <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (item) => item.produitId !== action.payload.produitId
          ),
        }
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.produitId === action.payload.produitId
            ? { ...item, quantite: action.payload.quantite }
            : item
        ),
      }
    }

    case 'SET_CLIENT':
      return {
        ...state,
        client: action.payload.client,
        isBungalowResident: action.payload.isBungalowResident,
      }

    case 'CLEAR_CART':
      return initialCartState

    default:
      return state
  }
}

// =============================================================================
// PosRegister Component
// =============================================================================

interface PosRegisterProps {
  gymPasses: GymPass[]
  fnbProducts: FnbProduct[]
  clients: Client[]
  bungalows: Bungalow[]
}

export function PosRegister({
  gymPasses,
  fnbProducts,
  clients,
  bungalows,
}: PosRegisterProps) {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState)
  const [selectedPass, setSelectedPass] = useState<GymPass | null>(null)
  const [clientDialogOpen, setClientDialogOpen] = useState(false)

  const handleSelectGymPass = (pass: GymPass) => {
    setSelectedPass(pass)
    setClientDialogOpen(true)
  }

  const handleAddFnbItem = (product: FnbProduct) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        produitId: product.id,
        nom: product.nom,
        prixUnitaire: product.prix,
        type: 'fnb',
      },
    })
  }

  return (
    <div className="grid grid-cols-[1fr_320px] h-full">
      {/* Left panel: Product area */}
      <div className="flex flex-col overflow-hidden border-r border-border">
        <ProductGrid
          gymPasses={gymPasses}
          fnbProducts={fnbProducts}
          onSelectGymPass={handleSelectGymPass}
          onAddFnbItem={handleAddFnbItem}
        />
      </div>
      {/* Right panel: Cart sidebar */}
      <div className="flex flex-col bg-card">
        <p className="text-muted-foreground p-4">
          Cart sidebar coming in Plan 03
        </p>
      </div>
    </div>
  )
}
