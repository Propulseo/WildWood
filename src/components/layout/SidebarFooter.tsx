'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, PanelLeftClose, PanelLeftOpen, Play, Lock, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'
import { useShift } from '@/contexts/shift-context'
import { useClosings } from '@/contexts/closings-context'
import { useReporting } from '@/contexts/reporting-context'
import { PriseDeShiftModal } from '@/components/shift/PriseDeShiftModal'
import ClosingModal from '@/components/reception/ClosingModal'
import type { Role } from '@/lib/types'

interface SidebarFooterProps {
  isCollapsed: boolean
  onToggle: () => void
}

function AvatarRow({ isCollapsed, role }: { isCollapsed: boolean; role: Role }) {
  const { getStaffActif } = useShift()

  const isStaff = role === 'reception' || role === 'bar'
  const staffActif = isStaff ? getStaffActif(role) : null

  const initiales = isStaff && staffActif ? staffActif.avatar_initiales : 'AD'
  const bgColor = isStaff && staffActif ? staffActif.couleur_avatar : 'var(--ww-orange)'
  const prenom = isStaff && staffActif ? staffActif.prenom : 'Admin'
  const roleLabel = role === 'reception' ? 'Reception' : role === 'bar' ? 'Bar' : 'Admin'
  const roleColor = role === 'reception' ? 'text-ww-wood' : role === 'bar' ? 'text-ww-lime' : 'text-ww-orange'

  return (
    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5 px-3'} py-2`}>
      <span
        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
        style={{ backgroundColor: bgColor }}
      >
        {initiales}
      </span>
      {!isCollapsed && (
        <div className="min-w-0">
          <p className="text-sm font-sans font-medium text-ww-text truncate">{prenom}</p>
          <p className={`text-[11px] font-sans ${roleColor}`}>{roleLabel}</p>
        </div>
      )}
    </div>
  )
}

function ShiftRow({ isCollapsed, role }: { isCollapsed: boolean; role: 'reception' | 'bar' }) {
  const { getShiftInfo } = useShift()
  const [modalOpen, setModalOpen] = useState(false)
  const shiftInfo = getShiftInfo(role)
  const depuis = shiftInfo?.depuis?.replace(':', 'h') ?? '--'

  return (
    <div className={`${isCollapsed ? 'px-1' : 'px-3'} pb-2`}>
      {!isCollapsed && (
        <p className="text-[11px] font-sans text-ww-muted mb-1.5">depuis {depuis}</p>
      )}
      <button
        onClick={() => setModalOpen(true)}
        title="Prendre le shift"
        className={`flex items-center justify-center w-full h-9 ${
          isCollapsed ? 'px-2' : 'px-3 gap-2'
        } rounded-lg text-xs font-display font-bold uppercase tracking-wider bg-ww-lime/15 text-ww-lime border border-ww-lime/30 transition-all duration-150 hover:bg-ww-lime/25 active:scale-[0.97]`}
      >
        {isCollapsed ? <Play className="h-3.5 w-3.5" /> : 'PRENDRE LE SHIFT'}
      </button>
      <PriseDeShiftModal open={modalOpen} onOpenChange={setModalOpen} poste={role} />
    </div>
  )
}

function ClosingRow({ isCollapsed }: { isCollapsed: boolean }) {
  const { closings } = useClosings()
  const { mockToday } = useReporting()
  const [modalOpen, setModalOpen] = useState(false)

  const todayClosing = closings.find((c) => c.date === mockToday)
  const isDone = !!todayClosing

  return (
    <div className={`${isCollapsed ? 'px-1' : 'px-3'} pb-2`}>
      <button
        onClick={() => !isDone && setModalOpen(true)}
        disabled={isDone}
        title={isDone ? 'Closing deja soumis' : 'Faire le closing'}
        className={`flex items-center justify-center w-full h-9 ${
          isCollapsed ? 'px-2' : 'px-3 gap-2'
        } rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-all duration-150 active:scale-[0.97] ${
          isDone
            ? 'bg-ww-lime/15 text-ww-lime border border-ww-lime/30 cursor-default'
            : 'bg-ww-orange/15 text-ww-orange border border-ww-orange/30 hover:bg-ww-orange/25'
        }`}
      >
        {isCollapsed ? (
          isDone ? <CheckCircle className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />
        ) : (
          isDone ? 'CLOSING SOUMIS' : 'CLOSING CAISSE'
        )}
      </button>
      <ClosingModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}

export function SidebarFooter({ isCollapsed, onToggle }: SidebarFooterProps) {
  const { role, logout } = useAuth()
  const router = useRouter()
  if (!role) return null

  const isStaff = role === 'reception' || role === 'bar'

  return (
    <div className="mt-auto border-t border-ww-border">
      <AvatarRow isCollapsed={isCollapsed} role={role} />
      {isStaff && <ShiftRow isCollapsed={isCollapsed} role={role} />}
      {role === 'reception' && <ClosingRow isCollapsed={isCollapsed} />}

      <button
        onClick={() => { logout(); router.push('/login') }}
        title="Deconnexion"
        className={`flex items-center w-full ${
          isCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-4 py-2'
        } text-sm transition-all duration-150 hover:bg-ww-danger/10 text-ww-muted hover:text-ww-danger`}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {!isCollapsed && <span className="font-sans">Deconnexion</span>}
      </button>

      <button
        onClick={onToggle}
        title={isCollapsed ? 'Ouvrir le menu' : 'Reduire le menu'}
        className={`hidden lg:flex items-center w-full h-12 ${
          isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'
        } bg-ww-surface-2 border-t border-ww-border text-sm transition-all duration-150 hover:bg-ww-surface text-ww-muted`}
      >
        {isCollapsed ? (
          <PanelLeftOpen className="h-4 w-4 shrink-0" />
        ) : (
          <>
            <PanelLeftClose className="h-4 w-4 shrink-0" />
            <span className="font-sans">Reduire</span>
          </>
        )}
      </button>
    </div>
  )
}
