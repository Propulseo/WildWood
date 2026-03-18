'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/contexts/auth-context'
import { encaisserDirect } from '@/lib/supabase/queries/tables-bar'
import { ChoixModal } from './ChoixModal'
import { PaiementDirectModal } from './PaiementDirectModal'
import { NouvelleTableModal } from './NouvelleTableModal'
import { BungalowChargeFlow } from './BungalowChargeFlow'

type CartItem = { id: string; nom: string; prix: number; quantite: number }
type Produit = { id: string; nom: string; sous_categorie: string; prix_thb: number; ordre: number; emoji: string | null }
type ModalState = 'choix' | 'paiement' | 'table' | 'bungalow' | null

const SUB_LABELS: Record<string, string> = {
  all: 'Tout', boissons: 'Boissons', bowls: 'Bowls', cafes: 'Cafes',
  'cocktails-proteines': 'Cocktails', smoothies: 'Smoothies', snacks: 'Snacks',
}
const SUB_KEYS = Object.keys(SUB_LABELS)

export function PosBar() {
  const t = useTranslations('pos')
  const { staffMember } = useAuth()
  const staffId = staffMember?.id ?? ''

  const [products, setProducts] = useState<Produit[]>([])
  const [filter, setFilter] = useState('all')
  const [cart, setCart] = useState<CartItem[]>([])
  const [modal, setModal] = useState<ModalState>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('produits')
      .select('id, nom, sous_categorie, prix_thb, ordre, emoji')
      .eq('categorie', 'fnb')
      .eq('actif', true)
      .order('ordre')
      .then(({ data, error }: { data: Produit[] | null; error: { message: string } | null }) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (error) { toast.error(error.message); return }
        setProducts(data ?? [])
      })
  }, [])

  const filtered = filter === 'all' ? products : products.filter((p) => p.sous_categorie === filter)
  const total = cart.reduce((s, i) => s + i.prix * i.quantite, 0)

  const addToCart = useCallback((p: Produit) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === p.id)
      if (ex) return prev.map((i) => (i.id === p.id ? { ...i, quantite: i.quantite + 1 } : i))
      return [...prev, { id: p.id, nom: p.nom, prix: p.prix_thb, quantite: 1 }]
    })
  }, [])

  const updateQty = useCallback((id: string, delta: number) => {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantite: i.quantite + delta } : i)).filter((i) => i.quantite > 0))
  }, [])

  const removeItem = useCallback((id: string) => setCart((prev) => prev.filter((i) => i.id !== id)), [])
  const clearCart = useCallback(() => setCart([]), [])

  const handleEncaisser = async () => {
    setLoading(true)
    try {
      await encaisserDirect({
        items: cart.map((i) => ({ nom: i.nom, prix_unitaire: i.prix, quantite: i.quantite })),
        staffId,
      })
      clearCart(); setModal(null)
      toast.success(t('transactionRecorded'), { description: `฿ ${total.toLocaleString()}` })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur encaissement')
    } finally { setLoading(false) }
  }

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_340px]">
      {/* Left: Products */}
      <div className="flex flex-col overflow-hidden p-4">
        <FilterTabs active={filter} onChange={setFilter} />
        <div className="mt-3 flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
            {filtered.map((p) => (
              <button
                key={p.id} onClick={() => addToCart(p)}
                className="flex flex-col items-center gap-1.5 rounded-lg border border-ww-border bg-ww-surface-2 p-3 text-center transition-all hover:border-ww-orange active:scale-[0.97] cursor-pointer"
              >
                <span className="text-2xl">{p.emoji || '🍽️'}</span>
                <span className="text-sm font-body text-ww-text leading-tight">{p.nom}</span>
                <span className="text-xs font-display font-bold text-ww-orange">฿ {p.prix_thb.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Cart */}
      <div className="flex flex-col border-l border-ww-border bg-ww-surface p-4">
        <h2 className="font-display text-lg font-bold uppercase tracking-wider text-ww-text">{t('cart')}</h2>
        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-ww-muted">
            <ShoppingCart className="h-8 w-8 opacity-40" />
            <span className="text-sm font-body">Panier vide</span>
          </div>
        ) : (
          <>
            <ul className="mt-4 flex-1 space-y-2 overflow-y-auto">
              {cart.map((item) => (
                <CartRow key={item.id} item={item} onQty={updateQty} onRemove={removeItem} />
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-ww-border pt-3">
              <span className="font-display text-base font-bold uppercase text-ww-text">{t('total')}</span>
              <span className="font-display text-xl font-bold text-ww-orange">฿ {total.toLocaleString()}</span>
            </div>
            <button
              disabled={cart.length === 0} onClick={() => setModal('choix')}
              className="mt-3 w-full rounded-lg bg-ww-orange py-3 font-display font-bold uppercase text-white transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('collect')}
            </button>
          </>
        )}
      </div>

      {/* Modals */}
      {modal === 'choix' && (
        <ChoixModal
          total={total}
          onEncaisser={() => setModal('paiement')}
          onTable={() => setModal('table')}
          onBungalow={() => setModal('bungalow')}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'paiement' && (
        <PaiementDirectModal
          total={total} items={cart}
          onConfirm={handleEncaisser}
          onBack={() => setModal('choix')}
          loading={loading}
        />
      )}
      {modal === 'table' && (
        <NouvelleTableModal
          items={cart} staffId={staffId}
          onSuccess={() => { clearCart(); setModal(null); toast.success('Table ouverte') }}
          onBack={() => setModal('choix')}
        />
      )}
      {modal === 'bungalow' && (
        <BungalowChargeFlow
          items={cart} staffId={staffId}
          onSuccess={() => { clearCart(); setModal(null); toast.success('Note de bungalow enregistrée') }}
          onBack={() => setModal('choix')}
        />
      )}
    </div>
  )
}

/* --- Sub-components --- */

function FilterTabs({ active, onChange }: { active: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {SUB_KEYS.map((key) => (
        <button
          key={key} onClick={() => onChange(key)}
          className={`shrink-0 rounded-full px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider transition-all ${
            active === key
              ? 'bg-ww-orange text-white'
              : 'border border-ww-border bg-ww-surface-2 text-ww-muted hover:text-ww-text'
          }`}
        >
          {SUB_LABELS[key]}
        </button>
      ))}
    </div>
  )
}

function CartRow({ item, onQty, onRemove }: {
  item: CartItem
  onQty: (id: string, delta: number) => void
  onRemove: (id: string) => void
}) {
  return (
    <li className="flex items-center justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-body text-ww-text">{item.nom}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onQty(item.id, -1)}
          className="flex h-6 w-6 items-center justify-center rounded border border-ww-border bg-ww-surface-2 text-ww-muted hover:text-ww-text transition-colors">
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-6 text-center font-display text-sm font-bold text-ww-text">{item.quantite}</span>
        <button onClick={() => onQty(item.id, 1)}
          className="flex h-6 w-6 items-center justify-center rounded border border-ww-border bg-ww-surface-2 text-ww-muted hover:text-ww-text transition-colors">
          <Plus className="h-3 w-3" />
        </button>
      </div>
      <span className="w-16 text-right font-display text-sm font-bold text-ww-orange">
        ฿ {(item.prix * item.quantite).toLocaleString()}
      </span>
      <button onClick={() => onRemove(item.id)}
        className="ml-1 text-ww-muted hover:text-ww-danger transition-colors">
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  )
}
