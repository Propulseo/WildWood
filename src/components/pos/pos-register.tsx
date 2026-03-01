'use client'

import { useReducer, useState } from 'react'
import type { Client, GymPass, FnbProduct, Bungalow, Transaction } from '@/lib/types'
import { ProductGrid } from './product-grid'
import { ClientPopup } from './client-popup'
import { CartSidebar } from './cart-sidebar'
import { useTransactions } from '@/contexts/transactions-context'
import { toast } from 'sonner'

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
  const { addTransaction } = useTransactions()

  // ---------------------------------------------------------------------------
  // Product selection handlers
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Client popup confirm
  // ---------------------------------------------------------------------------

  const handleClientConfirm = (
    client: Client | null,
    isBungalowResident: boolean,
    pass: GymPass
  ) => {
    if (client) {
      dispatch({
        type: 'SET_CLIENT',
        payload: { client, isBungalowResident },
      })
    }

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        produitId: pass.id,
        nom: pass.nom,
        prixUnitaire: pass.prix,
        type: 'gym-pass',
      },
    })
  }

  // ---------------------------------------------------------------------------
  // Checkout
  // ---------------------------------------------------------------------------

  const handleCheckout = (methode: 'especes' | 'virement') => {
    const total = cart.items.reduce((sum, item) => {
      if (cart.isBungalowResident && item.type === 'gym-pass') return sum
      return sum + item.prixUnitaire * item.quantite
    }, 0)

    const hasGymPass = cart.items.some((i) => i.type === 'gym-pass')

    const transaction: Transaction = {
      id: `txn-${String(Date.now()).slice(-3)}`,
      date: new Date().toISOString().slice(0, 19),
      type: hasGymPass ? 'gym-pass' : 'fnb',
      centreRevenu: hasGymPass ? 'Gym' : 'F&B',
      clientId: cart.client?.id,
      items: cart.items.map((item) => ({
        produitId: item.produitId,
        nom: item.nom,
        quantite: item.quantite,
        prixUnitaire:
          cart.isBungalowResident && item.type === 'gym-pass'
            ? 0
            : item.prixUnitaire,
        sousTotal:
          cart.isBungalowResident && item.type === 'gym-pass'
            ? 0
            : item.prixUnitaire * item.quantite,
      })),
      total,
      methode,
    }

    addTransaction(transaction)
    dispatch({ type: 'CLEAR_CART' })
    toast.success('Transaction enregistree', {
      description: `Total: ${total.toLocaleString()} THB`,
    })
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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
        <CartSidebar
          items={cart.items}
          client={cart.client}
          isBungalowResident={cart.isBungalowResident}
          onRemoveItem={(produitId) =>
            dispatch({ type: 'REMOVE_ITEM', payload: { produitId } })
          }
          onUpdateQuantity={(produitId, quantite) =>
            dispatch({
              type: 'UPDATE_QUANTITY',
              payload: { produitId, quantite },
            })
          }
          onCheckout={handleCheckout}
        />
      </div>

      {/* Client popup dialog */}
      <ClientPopup
        open={clientDialogOpen}
        onOpenChange={setClientDialogOpen}
        selectedPass={selectedPass}
        clients={clients}
        bungalows={bungalows}
        onConfirm={handleClientConfirm}
      />
    </div>
  )
}
