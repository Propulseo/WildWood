'use client'

import { useState, useMemo } from 'react'
import { X } from 'lucide-react'
import { differenceInCalendarDays } from 'date-fns'
import type { Bungalow, Reservation } from '@/lib/types'
import { BungalowSelector } from './BungalowSelector'
import { ConflitDatesAlert, findConflits } from './ConflitDatesAlert'
import { TarifSelector } from './TarifSelector'

type Source = 'Direct' | 'Telephone' | 'Walk-in' | 'Autre'
const SOURCES: Source[] = ['Direct', 'Telephone', 'Walk-in', 'Autre']

const COMMISSION = 0.8142
const TARIF_PRIX: Record<'flex' | 'non_remb', number> = { flex: 4000, non_remb: 3600 }
const TARIF_NET: Record<'flex' | 'non_remb', number> = { flex: 3257, non_remb: 2931 }

interface Props {
  open: boolean
  onClose: () => void
  bungalows: Bungalow[]
  clientMap: Map<string, string>
  onSave: (res: Reservation) => void
}

export function ReservationManuelleModal({ open, onClose, bungalows, clientMap, onSave }: Props) {
  const [bungalowNum, setBungalowNum] = useState<number | null>(null)
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [nomComplet, setNomComplet] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [nbAdultes, setNbAdultes] = useState(1)
  const [nbEnfants, setNbEnfants] = useState(0)
  const [prixTotal, setPrixTotal] = useState('')
  const [source, setSource] = useState<Source>('Direct')
  const [note, setNote] = useState('')
  const [tarifType, setTarifType] = useState<'flex' | 'non_remb'>('flex')
  const [isDirect, setIsDirect] = useState(false)

  const nuits = useMemo(() => {
    if (!dateDebut || !dateFin) return 0
    const diff = differenceInCalendarDays(new Date(dateFin), new Date(dateDebut))
    return diff > 0 ? diff : 0
  }, [dateDebut, dateFin])

  // Auto-calculate prix when tarif or nuits change
  useMemo(() => {
    if (nuits <= 0) return
    const prixNuit = isDirect ? TARIF_PRIX[tarifType] : TARIF_NET[tarifType]
    const total = prixNuit * nuits
    setPrixTotal(total.toString())
  }, [tarifType, nuits, isDirect])

  const prixParNuit = useMemo(() => {
    const p = parseFloat(prixTotal)
    if (!p || nuits <= 0) return 0
    return Math.round(p / nuits)
  }, [prixTotal, nuits])

  const hasConflits = findConflits(bungalows, bungalowNum, dateDebut, dateFin).length > 0
  const prix = parseFloat(prixTotal)
  const isValid = bungalowNum && dateDebut && dateFin && nuits > 0 && nomComplet.trim() && prix > 0 && !hasConflits

  const resetAndClose = () => {
    setBungalowNum(null); setDateDebut(''); setDateFin(''); setNomComplet('')
    setEmail(''); setTelephone(''); setNbAdultes(1); setNbEnfants(0)
    setPrixTotal(''); setSource('Direct'); setNote('')
    setTarifType('flex'); setIsDirect(false)
    onClose()
  }

  const handleSave = () => {
    if (!isValid || !bungalowNum) return
    const prixNuitBrut = TARIF_PRIX[tarifType]
    const prixNuitNet = isDirect ? prixNuitBrut : TARIF_NET[tarifType]
    const totalBrut = prixNuitBrut * nuits
    const totalNet = isDirect ? totalBrut : prixNuitNet * nuits
    onSave({
      id: `res-manual-${Date.now()}`,
      bungalowId: `bung-${bungalowNum}`,
      clientId: `cli-manual-${Date.now()}`,
      clientNom: nomComplet.trim(),
      dateDebut, dateFin, nuits,
      montant: prix,
      statut: 'confirmee',
      nb_adultes: nbAdultes,
      nb_enfants: nbEnfants,
      note: note.trim() || undefined,
      email: email.trim() || null,
      telephone: telephone.trim() || null,
      checkin_fait: false, tm30_fait: false, clef_remise: false,
      source: 'manuel',
      tarif_type: tarifType,
      prix_nuit_brut: prixNuitBrut,
      prix_nuit_net: prixNuitNet,
      prix_total_brut: totalBrut,
      prix_total_net: totalNet,
      reservation_directe: isDirect || undefined,
    })
    resetAndClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={resetAndClose}>
      <div className="bg-ww-surface border border-ww-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-ww-border">
          <h2 className="font-display text-xl font-bold text-ww-text">Reservation manuelle</h2>
          <button onClick={resetAndClose} className="text-ww-muted hover:text-ww-text transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Colonne gauche : bungalow, dates, tarif, prix */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-body text-ww-muted mb-2">Bungalow</label>
              <BungalowSelector selected={bungalowNum} onSelect={setBungalowNum} />
            </div>
            <ConflitDatesAlert bungalows={bungalows} selectedBungalow={bungalowNum}
              dateDebut={dateDebut} dateFin={dateFin} clientMap={clientMap} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-body text-ww-muted mb-1">Arrivee</label>
                <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)}
                  className="w-full bg-ww-surface-2 border border-ww-border rounded-lg px-3 py-2 text-sm text-ww-text font-mono" />
              </div>
              <div>
                <label className="block text-sm font-body text-ww-muted mb-1">Depart</label>
                <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)}
                  className="w-full bg-ww-surface-2 border border-ww-border rounded-lg px-3 py-2 text-sm text-ww-text font-mono" />
              </div>
            </div>
            {nuits > 0 && <p className="text-sm text-ww-muted font-body">{nuits} nuit{nuits > 1 ? 's' : ''}</p>}

            <TarifSelector tarifType={tarifType} onTarifChange={setTarifType}
              isDirect={isDirect} onDirectChange={setIsDirect} />

            <div className="bg-ww-surface-2 border border-ww-border rounded-lg p-4">
              <label className="block text-sm font-body text-ww-muted mb-1">Prix total</label>
              <div className="flex items-center gap-2">
                <span className="text-ww-orange font-display font-bold text-lg">{'\u0E3F'}</span>
                <input type="number" value={prixTotal} onChange={e => setPrixTotal(e.target.value)}
                  placeholder="0" className="w-full bg-transparent text-lg font-display font-bold text-ww-text outline-none" />
              </div>
              {prixParNuit > 0 && (
                <p className="text-xs text-ww-muted font-body mt-1">soit {'\u0E3F'} {prixParNuit.toLocaleString()} / nuit</p>
              )}
            </div>
          </div>

          {/* Colonne droite : client, source, note */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-body text-ww-muted mb-1">Nom complet *</label>
              <input type="text" value={nomComplet} onChange={e => setNomComplet(e.target.value)}
                placeholder="Prenom Nom" className="w-full bg-ww-surface-2 border border-ww-border rounded-lg px-3 py-2 text-sm text-ww-text" />
            </div>
            <div>
              <label className="block text-sm font-body text-ww-muted mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="client@email.com" className="w-full bg-ww-surface-2 border border-ww-border rounded-lg px-3 py-2 text-sm text-ww-text" />
            </div>
            <div>
              <label className="block text-sm font-body text-ww-muted mb-1">Telephone</label>
              <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)}
                placeholder="+66..." className="w-full bg-ww-surface-2 border border-ww-border rounded-lg px-3 py-2 text-sm text-ww-text" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-body text-ww-muted mb-1">Adultes</label>
                <input type="number" min={1} value={nbAdultes}
                  onChange={e => setNbAdultes(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-ww-surface-2 border border-ww-border rounded-lg px-3 py-2 text-sm text-ww-text" />
              </div>
              <div>
                <label className="block text-sm font-body text-ww-muted mb-1">Enfants</label>
                <input type="number" min={0} value={nbEnfants}
                  onChange={e => setNbEnfants(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-ww-surface-2 border border-ww-border rounded-lg px-3 py-2 text-sm text-ww-text" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-body text-ww-muted mb-2">Source</label>
              <div className="flex flex-wrap gap-2">
                {SOURCES.map(s => (
                  <button key={s} type="button" onClick={() => setSource(s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-display font-bold transition-all duration-150 ${
                      source === s ? 'bg-ww-wood text-white' : 'bg-ww-surface-2 text-ww-muted border border-ww-border hover:text-ww-text'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-body text-ww-muted mb-1">Note</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                placeholder="Note optionnelle..."
                className="w-full bg-ww-surface-2 border border-ww-border rounded-lg px-3 py-2 text-sm text-ww-text resize-none" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-ww-border">
          <button onClick={resetAndClose} className="px-4 py-2 text-sm font-display font-bold text-ww-muted hover:text-ww-text transition-colors">
            Annuler
          </button>
          <button onClick={handleSave} disabled={!isValid}
            className={`px-6 py-2 rounded-lg text-sm font-display font-bold transition-all duration-150 active:scale-[0.97] ${
              isValid ? 'bg-ww-orange text-white hover:bg-ww-orange/90' : 'bg-ww-surface-2 text-ww-muted cursor-not-allowed'
            }`}>
            ENREGISTRER LA RESERVATION
          </button>
        </div>
      </div>
    </div>
  )
}
