'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { GymPass } from '@/lib/types'

interface PassModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pass?: GymPass | null
  onSave: (pass: GymPass) => void
}

const DUREE_OPTIONS = [
  { label: '1 jour', value: 1 },
  { label: '3 jours', value: 3 },
  { label: '7 jours', value: 7 },
  { label: '30 jours', value: 30 },
]

export function PassModal({ open, onOpenChange, pass, onSave }: PassModalProps) {
  const [nom, setNom] = useState('')
  const [prix, setPrix] = useState('')
  const [dureeJours, setDureeJours] = useState('')
  const [actif, setActif] = useState(true)
  const isEditing = !!pass

  useEffect(() => {
    if (pass) {
      setNom(pass.nom)
      setPrix(String(pass.prix))
      setDureeJours(String(pass.dureeJours))
      setActif(pass.actif !== false)
    } else {
      setNom('')
      setPrix('')
      setDureeJours('')
      setActif(true)
    }
  }, [pass, open])

  const isValid =
    nom.trim() &&
    prix &&
    Number(prix) > 0 &&
    dureeJours &&
    Number(dureeJours) > 0

  function handleSubmit() {
    if (!isValid) return
    onSave({
      id: pass?.id || `pass-${Date.now()}`,
      nom: nom.trim(),
      prix: Number(prix),
      dureeJours: Number(dureeJours),
      actif,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier le pass' : 'Ajouter un pass'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="ww-label mb-1.5 block">Nom du pass</label>
            <Input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Pass 1 Jour"
            />
          </div>
          <div>
            <label className="ww-label mb-1.5 block">Prix (THB)</label>
            <Input
              type="number"
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
              placeholder="300"
              min="0"
            />
          </div>
          <div>
            <label className="ww-label mb-1.5 block">Duree (jours)</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {DUREE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDureeJours(String(opt.value))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-sans transition-all duration-150 cursor-pointer ${
                    dureeJours === String(opt.value)
                      ? 'bg-ww-orange text-white'
                      : 'bg-ww-surface-2 text-ww-muted border border-ww-border hover:text-ww-text'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <Input
              type="number"
              value={dureeJours}
              onChange={(e) => setDureeJours(e.target.value)}
              placeholder="Duree custom"
              min="1"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActif(!actif)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                actif ? 'bg-ww-success' : 'bg-ww-border'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                  actif ? 'translate-x-5' : ''
                }`}
              />
            </button>
            <span className="text-sm font-sans text-ww-text">
              {actif ? 'Actif' : 'Inactif (masque dans la caisse)'}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className="bg-ww-orange hover:bg-ww-orange/90"
          >
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
