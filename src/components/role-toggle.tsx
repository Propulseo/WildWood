'use client'

import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import type { Role } from '@/lib/types'

const ROLE_STYLES: Record<Role, string> = {
  admin: 'bg-ww-orange/15 text-ww-orange border border-ww-orange/30',
  reception: 'bg-[rgba(139,107,61,0.15)] text-ww-wood border border-ww-wood/30',
  bar: 'bg-ww-lime/15 text-ww-lime border border-ww-lime/30',
}

const HOME_ROUTES: Record<Role, string> = {
  admin: '/dashboard',
  reception: '/pos?tab=gym',
  bar: '/pos?tab=fnb',
}

export function RoleToggle() {
  const { role, toggleRole, logout } = useAuth()
  const router = useRouter()

  const handleToggle = () => {
    const nextRole: Role = role === 'admin' ? 'reception' : role === 'reception' ? 'bar' : 'admin'
    toggleRole()
    router.push(HOME_ROUTES[nextRole])
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!role) return null

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleToggle}
        className={`px-3 py-1 rounded-full text-xs font-display font-bold uppercase tracking-wider cursor-pointer select-none transition-all duration-150 ${ROLE_STYLES[role]}`}
      >
        {role.toUpperCase()}
      </button>
      <button
        onClick={handleLogout}
        className="text-ww-muted hover:text-ww-orange transition-colors duration-150"
        title="Deconnexion"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  )
}
