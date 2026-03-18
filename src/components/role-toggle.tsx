'use client'

import { useAuth } from '@/lib/contexts/auth-context'
import type { Role } from '@/lib/types'

const ROLE_STYLES: Record<Role, string> = {
  admin: 'bg-ww-orange/15 text-ww-orange border border-ww-orange/30',
  reception: 'bg-[rgba(139,107,61,0.15)] text-ww-wood border border-ww-wood/30',
  bar: 'bg-ww-lime/15 text-ww-lime border border-ww-lime/30',
}

export function RoleToggle() {
  const { role, staffMember } = useAuth()

  if (!role) return null

  return (
    <div className="flex items-center gap-3">
      {staffMember && (
        <span className="text-xs font-sans text-ww-muted">{staffMember.prenom}</span>
      )}
      <span
        className={`px-3 py-1 rounded-full text-xs font-display font-bold uppercase tracking-wider select-none ${ROLE_STYLES[role]}`}
      >
        {role.toUpperCase()}
      </span>
    </div>
  )
}
