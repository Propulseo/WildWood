'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Client, GymPass, Bungalow } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

// =============================================================================
// Client Popup — Dialog for client entry with existing client detection
// =============================================================================

interface ClientPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedPass: GymPass | null
  clients: Client[]
  bungalows: Bungalow[]
  onConfirm: (
    client: Client | null,
    isBungalowResident: boolean,
    pass: GymPass,
    pax: number
  ) => void
}

export function ClientPopup({
  open,
  onOpenChange,
  selectedPass,
  clients,
  bungalows,
  onConfirm,
}: ClientPopupProps) {
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [detectedClient, setDetectedClient] = useState<Client | null>(null)
  const [isBungalowResident, setIsBungalowResident] = useState(false)
  const [pax, setPax] = useState(1)

  useEffect(() => {
    if (open) {
      setPrenom('')
      setNom('')
      setEmail('')
      setTelephone('')
      setDetectedClient(null)
      setIsBungalowResident(false)
      setPax(1)
    }
  }, [open])

  const detectClient = useCallback(
    (emailValue: string, phoneValue: string) => {
      const normalizedEmail = emailValue.toLowerCase().trim()
      const normalizedPhone = phoneValue
        .replace(/\s+/g, '')
        .replace(/-/g, '')

      if (!normalizedEmail && !normalizedPhone) {
        setDetectedClient(null)
        setIsBungalowResident(false)
        return
      }

      const match = clients.find((c) => {
        if (normalizedEmail && c.email) {
          if (c.email.toLowerCase().trim() === normalizedEmail) return true
        }
        if (normalizedPhone && c.telephone) {
          const clientPhone = c.telephone
            .replace(/\s+/g, '')
            .replace(/-/g, '')
          if (clientPhone === normalizedPhone) return true
        }
        return false
      })

      if (match) {
        setDetectedClient(match)
        setPrenom(match.prenom)
        setNom(match.nom)
        setEmail(match.email ?? '')
        setTelephone(match.telephone ?? '')

        if (match.bungalowId) {
          const bungalow = bungalows.find((b) => b.id === match.bungalowId)
          if (bungalow) {
            const hasActiveReservation = bungalow.reservations.some(
              (r) => r.clientId === match.id && r.statut === 'en-cours'
            )
            setIsBungalowResident(hasActiveReservation)
          } else {
            setIsBungalowResident(false)
          }
        } else {
          setIsBungalowResident(false)
        }
      } else {
        setDetectedClient(null)
        setIsBungalowResident(false)
      }
    },
    [clients, bungalows]
  )

  const handleEmailChange = (value: string) => {
    setEmail(value)
    detectClient(value, telephone)
  }

  const handlePhoneChange = (value: string) => {
    setTelephone(value)
    detectClient(email, value)
  }

  const handleConfirm = () => {
    if (!selectedPass) return

    const client: Client = detectedClient ?? {
      id: `cli-new-${Date.now()}`,
      prenom,
      nom,
      email: email || undefined,
      telephone: telephone || undefined,
      type: isBungalowResident ? 'resident' : 'visiteur',
      dateCreation: new Date().toISOString().slice(0, 10),
      nombreVisites: 1,
      newsletter: false,
    }

    onConfirm(client, isBungalowResident, selectedPass, pax)
    onOpenChange(false)
  }

  const handleSkip = () => {
    if (!selectedPass) return
    onConfirm(null, false, selectedPass, pax)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Client pour {selectedPass?.nom}</DialogTitle>
          <DialogDescription>
            Renseignez les informations du client ou continuez sans client.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="prenom" className="text-ww-muted text-xs uppercase tracking-wider font-display font-semibold">Prenom *</Label>
            <Input
              id="prenom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Prenom du client"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="nom" className="text-ww-muted text-xs uppercase tracking-wider font-display font-semibold">Nom *</Label>
            <Input
              id="nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Nom du client"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email" className="text-ww-muted text-xs uppercase tracking-wider font-display font-semibold">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="email@exemple.com"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="telephone" className="text-ww-muted text-xs uppercase tracking-wider font-display font-semibold">Telephone</Label>
            <Input
              id="telephone"
              type="tel"
              value={telephone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+66 XX XXX XXXX"
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-ww-muted text-xs uppercase tracking-wider font-display font-semibold">Nombre de personnes (pax)</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPax((p) => Math.max(1, p - 1))}
                className="w-10 h-10 rounded-lg bg-ww-surface-2 text-ww-text font-display font-bold text-lg hover:bg-ww-border transition-colors"
              >
                -
              </button>
              <span className="font-display font-extrabold text-2xl text-ww-orange w-10 text-center">{pax}</span>
              <button
                type="button"
                onClick={() => setPax((p) => Math.min(20, p + 1))}
                className="w-10 h-10 rounded-lg bg-ww-surface-2 text-ww-text font-display font-bold text-lg hover:bg-ww-border transition-colors"
              >
                +
              </button>
              {selectedPass && pax > 1 && (
                <span className="text-sm text-ww-muted font-sans ml-2">
                  = {(selectedPass.prix * pax).toLocaleString()} THB
                </span>
              )}
            </div>
          </div>

          {detectedClient && (
            <div className="rounded-xl border border-ww-lime/30 bg-ww-lime/10 p-4 space-y-2">
              <p className="text-sm font-medium text-ww-text">
                Client existant: {detectedClient.prenom} {detectedClient.nom}
              </p>
              {isBungalowResident && (
                <span className="inline-flex items-center bg-ww-lime/15 border border-ww-lime/30 rounded-full px-3 py-1 text-xs text-ww-lime font-display font-bold uppercase tracking-wider">
                  Resident Bungalow - Pass Gratuit
                </span>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleSkip}>
            Sans client
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!prenom.trim() || !nom.trim()}
          >
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
