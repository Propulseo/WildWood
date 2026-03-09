'use client'

import { useState } from 'react'
import { parseISO } from 'date-fns'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import type { Reservation, RoomCharge, MaintenanceTask } from '@/lib/types'
import { ReservationInfos } from './ReservationInfos'
import { CheckinChecklist } from './CheckinChecklist'
import { RoomChargesSection } from './RoomChargesSection'
import { ActiviteTimeline } from './ActiviteTimeline'
import { CheckoutModal } from './CheckoutModal'
import { ReservationMessages } from './ReservationMessages'

type TabId = 'infos' | 'activite' | 'note' | 'arrivee' | 'messages'

const TABS: { id: TabId; label: string }[] = [
  { id: 'infos', label: 'INFOS' },
  { id: 'activite', label: 'ACTIVITE' },
  { id: 'note', label: 'NOTE DE BUNGALOW' },
  { id: 'arrivee', label: 'ARRIVEE' },
  { id: 'messages', label: 'MESSAGES' },
]

export function ReservationModal({
  reservation, clientName, bungalowNumero, open, onClose,
  onMarkNoShow, onCancelNoShow, onChecklistToggle, roomCharges,
  onCheckoutComplete, onSettleCharges, maintenanceTasks, defaultTab,
}: {
  reservation: Reservation | null
  clientName: string
  bungalowNumero: number
  open: boolean
  onClose: () => void
  onMarkNoShow: (resId: string) => void
  onCancelNoShow: (resId: string) => void
  onChecklistToggle: (field: 'checkin_fait' | 'tm30_fait' | 'clef_remise') => void
  roomCharges?: RoomCharge[]
  onCheckoutComplete?: (resId: string, totalPaid: number) => void
  onSettleCharges?: (resId: string, total: number) => void
  maintenanceTasks?: MaintenanceTask[]
  defaultTab?: TabId
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab ?? 'infos')

  if (!open || !reservation) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const resStart = parseISO(reservation.dateDebut)
  const resFin = parseISO(reservation.dateFin)
  const canMarkNoShow =
    (reservation.statut === 'confirmee' || reservation.statut === 'en-cours') && resStart <= today && !reservation.checkin_fait
  const isNoShow = reservation.statut === 'no_show'

  const checklistComplete = reservation.checkin_fait && reservation.tm30_fait && reservation.clef_remise
  const canCheckout =
    (reservation.statut === 'confirmee' || reservation.statut === 'en-cours') && resFin <= today && checklistComplete

  const handleConfirmNoShow = () => {
    onMarkNoShow(reservation.id)
    setShowConfirm(false)
    toast.success(`No Show enregistre — Bungalow ${bungalowNumero} remis disponible`)
  }

  const handleCancelNoShow = () => {
    onCancelNoShow(reservation.id)
    toast.success('No Show annule — reservation confirmee')
  }

  const handleClose = () => { setShowConfirm(false); setActiveTab(defaultTab ?? 'infos'); onClose() }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
      <div className="relative bg-ww-surface border border-ww-border rounded-xl p-6 w-full max-w-md shadow-lg shadow-black/30 max-h-[90vh] overflow-y-auto">
        <button onClick={handleClose} className="absolute top-4 right-4 text-ww-muted hover:text-ww-text transition-colors">
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-2">
          <h3 className="font-display text-lg font-bold text-ww-text">
            BUNGALOW {bungalowNumero} &middot; {reservation.nuits} nuit{reservation.nuits > 1 ? 's' : ''}
          </h3>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-ww-border mb-4 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-3 py-2 text-xs font-display font-bold uppercase tracking-wide transition-colors ${
                activeTab === tab.id
                  ? 'text-ww-orange border-b-2 border-ww-orange'
                  : 'text-ww-muted hover:text-ww-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'infos' && (
          <ReservationInfos reservation={reservation} clientName={clientName} />
        )}

        {activeTab === 'activite' && (
          <ActiviteTimeline
            reservation={reservation}
            roomCharges={roomCharges ?? []}
            maintenanceTasks={maintenanceTasks ?? []}
          />
        )}

        {activeTab === 'note' && roomCharges && (
          <RoomChargesSection
            roomCharges={roomCharges}
            clientName={clientName}
            bungalowNumero={bungalowNumero}
            defaultOpen
            onSettleCharges={
              onSettleCharges && (reservation.statut === 'confirmee' || reservation.statut === 'en-cours')
                ? (total) => onSettleCharges(reservation.id, total)
                : undefined
            }
          />
        )}
        {activeTab === 'note' && (!roomCharges || roomCharges.length === 0) && (
          <p className="text-sm text-ww-muted font-sans text-center py-6">Aucune note de bungalow</p>
        )}

        {activeTab === 'messages' && (
          <ReservationMessages
            reservationId={reservation.id}
            telephone={reservation.telephone ?? null}
            clientName={clientName}
            bungalowNumero={bungalowNumero}
          />
        )}

        {activeTab === 'arrivee' && (
          <>
            <CheckinChecklist reservation={reservation} onToggle={onChecklistToggle} />

            {/* No Show actions */}
            {isNoShow && (
              <div className="mt-5 space-y-3">
                <span className="inline-block px-3 py-1 text-xs font-display font-bold rounded-full text-white" style={{ background: '#6D28D9' }}>NO SHOW</span>
                <button onClick={handleCancelNoShow} className="block text-xs text-ww-muted hover:text-ww-text transition-colors underline">
                  Annuler le no show
                </button>
              </div>
            )}

            {canMarkNoShow && !showConfirm && (
              <div className="mt-5">
                <button onClick={() => setShowConfirm(true)} className="w-full py-2.5 rounded-lg border text-sm font-display font-bold transition-colors" style={{ borderColor: '#7C3AED', color: '#7C3AED' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(109,40,217,0.15)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
                  {'\u26A0\uFE0F'} MARQUER NO SHOW
                </button>
              </div>
            )}

            {showConfirm && (
              <div className="mt-5 p-4 rounded-lg border border-ww-border bg-ww-surface-2">
                <p className="text-sm text-ww-text mb-1">Marquer <strong>{clientName}</strong> comme No Show ?</p>
                <p className="text-xs text-ww-muted mb-4">Le bungalow sera indique comme disponible pour Booking.com.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 rounded-lg border border-ww-border text-sm text-ww-muted hover:text-ww-text transition-colors">Annuler</button>
                  <button onClick={handleConfirmNoShow} className="flex-1 py-2 rounded-lg text-sm font-bold text-white transition-colors" style={{ background: '#6D28D9' }}>Confirmer No Show</button>
                </div>
              </div>
            )}

            {/* Checkout button */}
            {canCheckout && onCheckoutComplete && (
              <div className="mt-5">
                <button onClick={() => setCheckoutOpen(true)} className="w-full py-3 rounded-lg bg-ww-surface-2 border border-ww-border text-ww-text font-display font-bold text-sm uppercase tracking-wider transition-all hover:bg-ww-surface-2/80 active:scale-[0.97]">
                  → PROCEDURE DE CHECK-OUT
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {checkoutOpen && reservation && (
        <CheckoutModal
          open={checkoutOpen}
          reservation={reservation}
          clientName={clientName}
          bungalowNumero={bungalowNumero}
          roomCharges={roomCharges ?? []}
          onClose={() => setCheckoutOpen(false)}
          onCheckoutComplete={(resId, total) => { setCheckoutOpen(false); onCheckoutComplete!(resId, total) }}
        />
      )}
    </div>
  )
}
