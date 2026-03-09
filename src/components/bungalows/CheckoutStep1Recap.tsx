'use client'

import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { RoomCharge } from '@/lib/types'

interface CheckoutStep1RecapProps {
  clientName: string
  bungalowNumero: number
  nuits: number
  dateDebut: string
  dateFin: string
  roomCharges: RoomCharge[]
  onProceedPayment: () => void
  onClotureDirecte: () => void
}

export function CheckoutStep1Recap({
  clientName, bungalowNumero, nuits, dateDebut, dateFin,
  roomCharges, onProceedPayment, onClotureDirecte,
}: CheckoutStep1RecapProps) {
  const debut = format(parseISO(dateDebut), 'dd/MM', { locale: fr })
  const fin = format(parseISO(dateFin), 'dd/MM', { locale: fr })
  const totalFnb = roomCharges.reduce((s, rc) => s + rc.total, 0)

  const grouped = roomCharges.map((rc) => ({
    date: format(parseISO(rc.date), "dd/MM · HH'h'mm", { locale: fr }),
    items: rc.items,
    total: rc.total,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-ww-text">
          CHECK-OUT · BUNGALOW {bungalowNumero}
        </h2>
        <p className="text-sm text-ww-muted font-body mt-1">
          {clientName} · {nuits} nuit{nuits > 1 ? 's' : ''} · {debut} → {fin}
        </p>
      </div>

      {roomCharges.length === 0 ? (
        <div className="rounded-xl border border-ww-lime/30 bg-ww-lime/10 p-6 text-center">
          <p className="text-ww-lime font-display font-bold text-lg">
            Aucune consommation en attente ✓
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-ww-border bg-ww-surface-2 p-5 space-y-4">
          <p className="font-display font-bold text-sm text-ww-muted uppercase tracking-wider">
            CONSOMMATIONS F&B
          </p>
          {grouped.map((g, gi) => (
            <div key={gi} className="space-y-1">
              <p className="text-xs text-ww-muted font-body">{g.date}</p>
              {g.items.map((item, ii) => (
                <div key={ii} className="flex justify-between text-sm font-body text-ww-text">
                  <span>{item.nom} {item.quantite > 1 && <span className="text-ww-muted">x{item.quantite}</span>}</span>
                  <span>฿ {item.sousTotal.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ))}
          <div className="border-t border-ww-border pt-3 flex justify-between">
            <span className="font-display font-bold text-ww-text">TOTAL F&B</span>
            <span className="font-display font-extrabold text-xl text-ww-danger">
              ฿ {totalFnb.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {totalFnb > 0 ? (
        <button
          onClick={onProceedPayment}
          className="w-full py-4 rounded-xl bg-ww-orange text-white font-display font-bold text-base uppercase tracking-wider transition-all hover:bg-ww-orange/90 active:scale-[0.97]"
        >
          PROCEDER AU PAIEMENT →
        </button>
      ) : (
        <button
          onClick={onClotureDirecte}
          className="w-full py-4 rounded-xl bg-ww-lime text-white font-display font-bold text-base uppercase tracking-wider transition-all hover:bg-ww-lime/90 active:scale-[0.97]"
        >
          CLOTURER LE BUNGALOW ✓
        </button>
      )}
    </div>
  )
}
