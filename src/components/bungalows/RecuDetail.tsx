'use client'

import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { X } from 'lucide-react'
import type { RoomCharge } from '@/lib/types'

interface RecuDetailProps {
  charge: RoomCharge | null
  clientName: string
  bungalowNumero: number
  open: boolean
  onClose: () => void
}

export function RecuDetail({ charge, clientName, bungalowNumero, open, onClose }: RecuDetailProps) {
  if (!open || !charge) return null

  const dateFormatted = format(parseISO(charge.date), "dd/MM/yyyy 'a' HH'h'mm", { locale: fr })
  const signedAtFormatted = format(parseISO(charge.signed_at), "dd/MM/yyyy HH'h'mm", { locale: fr })

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center mb-4">
          <h4 className="font-display text-base font-bold text-gray-900 uppercase">
            WildWood Beach Fitness
          </h4>
          <p className="text-[11px] text-gray-500 font-body">Koh Tao, Thailand</p>
          <div className="h-px bg-gray-200 mt-3" />
        </div>

        <div className="mb-3">
          <p className="text-xs text-gray-500 font-body">Bungalow {bungalowNumero} — {clientName}</p>
          <p className="text-xs text-gray-400 font-body">{dateFormatted}</p>
          <p className="text-xs text-gray-400 font-body">Staff: {charge.staff}</p>
        </div>

        <div className="space-y-1.5 mb-3">
          {charge.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm font-body text-gray-800">
              <span>
                {item.nom} {item.quantite > 1 && <span className="text-gray-400">x{item.quantite}</span>}
              </span>
              <span>฿ {item.sousTotal.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-2 mb-4 flex justify-between">
          <span className="font-display font-bold text-sm text-gray-900">TOTAL</span>
          <span className="font-display font-extrabold text-gray-900">฿ {charge.total.toLocaleString()}</span>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <p className="text-[10px] text-gray-400 font-body mb-1.5">
            Signe par {charge.signed_by} le {signedAtFormatted}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={charge.signature_base64}
            alt="Signature"
            className="w-full h-16 object-contain border border-gray-100 rounded bg-gray-50"
          />
        </div>
      </div>
    </div>
  )
}
