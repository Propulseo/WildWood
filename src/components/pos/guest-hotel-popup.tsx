'use client'

import { useMemo } from 'react'
import type { Client, Bungalow, GymPass } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface GuestInfo {
  client: Client
  bungalowNumero: number
}

interface GuestHotelPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedPass: GymPass | null
  clients: Client[]
  bungalows: Bungalow[]
  onConfirm: (client: Client, pass: GymPass) => void
}

export function GuestHotelPopup({
  open,
  onOpenChange,
  selectedPass,
  clients,
  bungalows,
  onConfirm,
}: GuestHotelPopupProps) {
  const activeGuests = useMemo(() => {
    const guests: GuestInfo[] = []
    for (const bungalow of bungalows) {
      for (const res of bungalow.reservations) {
        if (res.statut !== 'en-cours') continue
        const client = clients.find((c) => c.id === res.clientId)
        if (client) {
          guests.push({ client, bungalowNumero: bungalow.numero })
        }
      }
    }
    return guests.sort((a, b) => a.bungalowNumero - b.bungalowNumero)
  }, [clients, bungalows])

  function handleSelect(guest: GuestInfo) {
    if (!selectedPass) return
    onConfirm(guest.client, selectedPass)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Guest Hotel</DialogTitle>
          <DialogDescription>
            Selectionnez le client de l&apos;hotel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-80 overflow-auto py-2">
          {activeGuests.length === 0 ? (
            <p className="text-sm text-ww-muted text-center py-4">
              Aucun guest actif actuellement
            </p>
          ) : (
            activeGuests.map((g) => (
              <button
                key={g.client.id}
                onClick={() => handleSelect(g)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-ww-surface border border-ww-border transition-all hover:border-ww-lime hover:shadow-[0_0_12px_var(--ww-lime-glow)] active:scale-[0.97]"
              >
                <div className="h-10 w-10 rounded-full bg-ww-lime/15 border border-ww-lime/30 flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-sm text-ww-lime">
                    B{g.bungalowNumero}
                  </span>
                </div>
                <div className="text-left">
                  <p className="font-sans text-sm font-medium text-ww-text">
                    {g.client.prenom} {g.client.nom}
                  </p>
                  <p className="text-xs text-ww-muted">
                    Bungalow {g.bungalowNumero}
                  </p>
                </div>
                <span className="ml-auto font-display font-bold text-xs text-ww-lime uppercase">
                  Gratuit
                </span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
