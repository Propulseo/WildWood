'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { RoomCharge } from '@/lib/types'
import { RecuDetail } from './RecuDetail'
import { SettleChargesModal } from './SettleChargesModal'

interface RoomChargesSectionProps {
  roomCharges: RoomCharge[]
  clientName: string
  bungalowNumero: number
  onSettleCharges?: (total: number) => void
  defaultOpen?: boolean
}

export function RoomChargesSection({ roomCharges, clientName, bungalowNumero, onSettleCharges, defaultOpen = false }: RoomChargesSectionProps) {
  const [chargesOpen, setChargesOpen] = useState(defaultOpen)
  const [selectedCharge, setSelectedCharge] = useState<RoomCharge | null>(null)
  const [settleOpen, setSettleOpen] = useState(false)

  if (roomCharges.length === 0) return null

  return (
    <>
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setChargesOpen(!chargesOpen)}
          className="flex items-center gap-2 text-sm font-display font-bold text-ww-orange hover:text-ww-orange/80 transition-colors"
        >
          <span>NOTE DE BUNGALOW ({roomCharges.length})</span>
          <span className="text-xs">{chargesOpen ? '▲' : '▼'}</span>
        </button>
        {chargesOpen && (
          <div className="mt-2 space-y-2">
            {roomCharges.map((rc) => (
              <div key={rc.id} className="flex items-center justify-between bg-ww-surface-2 rounded-lg px-3 py-2">
                <div>
                  <p className="text-xs text-ww-muted font-body">
                    {format(parseISO(rc.date), "dd/MM HH'h'mm", { locale: fr })} — {rc.staff}
                  </p>
                  <p className="text-sm font-display font-bold text-ww-text">฿ {rc.total.toLocaleString()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCharge(rc)}
                  className="text-xs text-ww-orange font-display font-bold hover:underline"
                >
                  voir
                </button>
              </div>
            ))}
            <p className="text-xs text-ww-muted font-body text-right">
              Total notes: ฿ {roomCharges.reduce((s, rc) => s + rc.total, 0).toLocaleString()}
            </p>
            {onSettleCharges && (
              <button
                type="button"
                onClick={() => setSettleOpen(true)}
                className="w-full py-2.5 rounded-lg bg-ww-orange text-white text-sm font-display font-bold uppercase tracking-wider transition-all hover:bg-ww-orange/90 active:scale-[0.97] mt-2"
              >
                REGLER NOTE F&B
              </button>
            )}
          </div>
        )}
      </div>

      {selectedCharge && (
        <RecuDetail
          charge={selectedCharge}
          clientName={clientName}
          bungalowNumero={bungalowNumero}
          open={!!selectedCharge}
          onClose={() => setSelectedCharge(null)}
        />
      )}

      {settleOpen && onSettleCharges && (
        <SettleChargesModal
          open={settleOpen}
          roomCharges={roomCharges}
          clientName={clientName}
          bungalowNumero={bungalowNumero}
          onClose={() => setSettleOpen(false)}
          onSettle={(total) => { setSettleOpen(false); onSettleCharges(total) }}
        />
      )}
    </>
  )
}
