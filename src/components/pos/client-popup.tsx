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
import { Badge } from '@/components/ui/badge'

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
    pass: GymPass
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

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setPrenom('')
      setNom('')
      setEmail('')
      setTelephone('')
      setDetectedClient(null)
      setIsBungalowResident(false)
    }
  }, [open])

  // ---------------------------------------------------------------------------
  // Client detection by email or phone
  // ---------------------------------------------------------------------------

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

        // Check bungalow resident status
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

  // ---------------------------------------------------------------------------
  // Confirm / Skip
  // ---------------------------------------------------------------------------

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

    onConfirm(client, isBungalowResident, selectedPass)
    onOpenChange(false)
  }

  const handleSkip = () => {
    if (!selectedPass) return
    onConfirm(null, false, selectedPass)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pos-theme">
        <DialogHeader>
          <DialogTitle>Client pour {selectedPass?.nom}</DialogTitle>
          <DialogDescription>
            Renseignez les informations du client ou continuez sans client.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Prenom */}
          <div className="grid gap-2">
            <Label htmlFor="prenom">Prenom *</Label>
            <Input
              id="prenom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Prenom du client"
            />
          </div>

          {/* Nom */}
          <div className="grid gap-2">
            <Label htmlFor="nom">Nom *</Label>
            <Input
              id="nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Nom du client"
            />
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="email@exemple.com"
            />
          </div>

          {/* Telephone */}
          <div className="grid gap-2">
            <Label htmlFor="telephone">Telephone</Label>
            <Input
              id="telephone"
              type="tel"
              value={telephone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+66 XX XXX XXXX"
            />
          </div>

          {/* Existing client detection feedback */}
          {detectedClient && (
            <div className="rounded-md border border-wildwood-lime/30 bg-wildwood-lime/10 p-3 space-y-2">
              <p className="text-sm font-medium">
                Client existant: {detectedClient.prenom} {detectedClient.nom}
              </p>
              {isBungalowResident && (
                <Badge className="bg-wildwood-lime text-white">
                  Resident Bungalow - Pass Gratuit
                </Badge>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleSkip}>
            Sans client
          </Button>
          <Button
            variant="pos-accent"
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
