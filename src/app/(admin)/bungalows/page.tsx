'use client'

import { useState, useEffect, useMemo } from 'react'
import { startOfWeek } from 'date-fns'
import { getClients, getBungalows, getRoomCharges } from '@/lib/data-access'
import type { Client, Bungalow, Reservation, RoomCharge } from '@/lib/types'
import { useTransactions } from '@/contexts/transactions-context'
import { useMaintenance } from '@/contexts/maintenance-context'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { useDevice } from '@/lib/useDevice'
import { CalendrierHeader } from '@/components/bungalows/CalendrierHeader'
import { BungalowListMobile } from '@/components/bungalows/BungalowListMobile'
import { SearchFilterBar } from '@/components/bungalows/SearchFilterBar'
import { VueMensuelle } from '@/components/bungalows/VueMensuelle'
import { VueSemaine } from '@/components/bungalows/VueSemaine'
import { ReservationModal } from '@/components/bungalows/ReservationModal'
import { ReservationManuelleModal } from '@/components/bungalows/ReservationManuelleModal'
import { useBungalowActions } from '@/lib/hooks/useBungalowActions'
import { useAuth } from '@/lib/contexts/auth-context'
import { useTranslations } from 'next-intl'

type ViewMode = 'mensuelle' | 'semaine'

export default function BungalowsPage() {
  const t = useTranslations('bungalows')
  const tPages = useTranslations('pages')
  const { staffMember } = useAuth()
  const { addTransaction } = useTransactions()
  const { getTasksByBungalow } = useMaintenance()
  const [clients, setClients] = useState<Client[]>([])
  const [bungalows, setBungalows] = useState<Bungalow[]>([])
  const [roomCharges, setRoomCharges] = useState<RoomCharge[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('semaine')
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [currentWeekStart, setCurrentWeekStart] = useState(
    () => startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedRes, setSelectedRes] = useState<{
    reservation: Reservation
    bungalowNumero: number
  } | null>(null)
  const [showManuelModal, setShowManuelModal] = useState(false)

  useEffect(() => {
    Promise.all([getClients(), getBungalows(), getRoomCharges()]).then(([c, b, rc]) => {
      setClients(c); setBungalows(b); setRoomCharges(rc)
    }).catch(() => toast.error(t('loadError')))
  }, [])

  const clientMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of clients) map.set(c.id, c.nom)
    for (const b of bungalows) for (const r of b.reservations) if (r.clientNom && !map.has(r.clientId)) map.set(r.clientId, r.clientNom)
    return map
  }, [clients, bungalows])

  useEffect(() => {
    if (!dateFrom) return
    const d = new Date(dateFrom)
    if (isNaN(d.getTime())) return
    setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1))
    setCurrentWeekStart(startOfWeek(d, { weekStartsOn: 1 }))
  }, [dateFrom])

  const { handleMarkNoShow, handleCancelNoShow, handleCheckoutComplete, handleSettleCharges, handleChecklistToggle, handleManuelSave } =
    useBungalowActions({ bungalows, setBungalows, roomCharges, setRoomCharges, selectedRes, setSelectedRes, clientMap, addTransaction, setShowManuelModal, staffId: staffMember?.id })

  const handleReset = () => {
    const now = new Date()
    setSearchQuery(''); setDateFrom(''); setDateTo('')
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    setCurrentWeekStart(startOfWeek(now, { weekStartsOn: 1 }))
  }

  const chargedResIds = useMemo(() => new Set(roomCharges.map(rc => rc.reservationId)), [roomCharges])
  const { isMobile } = useDevice()
  const clientName = selectedRes ? (clientMap.get(selectedRes.reservation.clientId) ?? 'Inconnu') : ''

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-ww-text tracking-tight">{t('title')}</h1>
          <p className="text-ww-muted text-sm mt-1">{tPages('reservationCalendar')}</p>
        </div>
        <button onClick={() => setShowManuelModal(true)} className="flex items-center justify-center gap-2 bg-ww-orange text-white font-display font-bold text-sm px-4 py-2.5 rounded-lg transition-all duration-150 hover:bg-ww-orange/90 active:scale-[0.97]">
          <Plus className="h-4 w-4" /> {t('addReservation').toUpperCase()}
        </button>
      </div>

      {!isMobile && (
        <>
          <CalendrierHeader viewMode={viewMode} setViewMode={setViewMode}
            currentMonth={currentMonth} setCurrentMonth={setCurrentMonth}
            currentWeekStart={currentWeekStart} setCurrentWeekStart={setCurrentWeekStart} />
          <div className="flex flex-wrap items-center gap-5 text-xs font-body text-ww-muted">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-ww-orange" /> {t('confirmed')}</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: '#6D28D9' }} /> No Show</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-ww-lime" /> {t('arrivalToday')}</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-ww-danger" /> {t('free2days')}</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-ww-danger flex items-center justify-center text-[7px] text-white font-bold">฿</span> {t('fnbCharge')}</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-ww-wood" /> {t('manual')}</span>
          </div>
          <SearchFilterBar searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo}
            setDateTo={setDateTo} onReset={handleReset} />
        </>
      )}

      {isMobile ? (
        <BungalowListMobile bungalows={bungalows} clientMap={clientMap} currentMonth={currentMonth}
          chargedResIds={chargedResIds} onReservationClick={(res, num) => setSelectedRes({ reservation: res, bungalowNumero: num })} />
      ) : viewMode === 'mensuelle' ? (
        <VueMensuelle bungalows={bungalows} clientMap={clientMap} currentMonth={currentMonth} searchQuery={searchQuery}
          chargedResIds={chargedResIds} onReservationClick={(res, num) => setSelectedRes({ reservation: res, bungalowNumero: num })} />
      ) : (
        <VueSemaine bungalows={bungalows} clientMap={clientMap} weekStart={currentWeekStart} searchQuery={searchQuery}
          chargedResIds={chargedResIds} onReservationClick={(res, num) => setSelectedRes({ reservation: res, bungalowNumero: num })} />
      )}

      <ReservationManuelleModal open={showManuelModal} onClose={() => setShowManuelModal(false)}
        bungalows={bungalows} clientMap={clientMap} onSave={handleManuelSave} />

      <ReservationModal reservation={selectedRes?.reservation ?? null} clientName={clientName}
        bungalowNumero={selectedRes?.bungalowNumero ?? 0} open={selectedRes !== null} onClose={() => setSelectedRes(null)}
        onMarkNoShow={handleMarkNoShow} onCancelNoShow={handleCancelNoShow} onChecklistToggle={handleChecklistToggle}
        roomCharges={selectedRes ? roomCharges.filter((rc) => rc.reservationId === selectedRes.reservation.id) : []}
        onCheckoutComplete={handleCheckoutComplete} onSettleCharges={handleSettleCharges}
        maintenanceTasks={selectedRes ? getTasksByBungalow(bungalows.find((b) => b.numero === selectedRes.bungalowNumero)?.id ?? '') : []} />
    </div>
  )
}
