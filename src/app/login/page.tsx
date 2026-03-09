'use client'

import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Shield, Hotel, Wine } from 'lucide-react'
import type { Role } from '@/lib/types'

const HOME_ROUTES: Record<Role, string> = {
  admin: '/dashboard',
  reception: '/pos?tab=gym',
  bar: '/pos?tab=fnb',
}

export default function LoginPage() {
  const { role, isAuthenticated, login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && role) {
      router.replace(HOME_ROUTES[role])
    }
  }, [isAuthenticated, role, router])

  const handleLogin = (selectedRole: Role) => {
    login(selectedRole)
    router.push(HOME_ROUTES[selectedRole])
  }

  if (isAuthenticated) return null

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ww-bg">
      <div className="flex flex-col items-center gap-10 px-6">
        <div className="text-center">
          <h1 className="font-display text-6xl font-extrabold uppercase tracking-wider text-ww-orange">
            WILD WOOD
          </h1>
          <p className="mt-2 text-sm tracking-widest uppercase text-ww-muted font-sans">
            Beach Fitness & Resort — Koh Tao
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-4">
          <button
            onClick={() => handleLogin('admin')}
            className="w-full flex items-center justify-center gap-3 bg-ww-surface border-2 border-ww-orange/40 text-ww-text h-14 rounded-xl font-display font-bold text-base uppercase tracking-wider transition-all duration-200 hover:border-ww-orange hover:shadow-[0_0_20px_var(--ww-orange-glow)] active:scale-[0.97] cursor-pointer"
          >
            <Shield className="h-5 w-5 text-ww-orange" />
            Admin (Proprietaire)
          </button>
          <button
            onClick={() => handleLogin('reception')}
            className="w-full flex items-center justify-center gap-3 bg-ww-surface border-2 border-ww-wood/40 text-ww-text h-14 rounded-xl font-display font-bold text-base uppercase tracking-wider transition-all duration-200 hover:border-ww-wood hover:shadow-[0_0_20px_rgba(139,107,61,0.15)] active:scale-[0.97] cursor-pointer"
          >
            <Hotel className="h-5 w-5 text-ww-wood" />
            Reception
          </button>
          <button
            onClick={() => handleLogin('bar')}
            className="w-full flex items-center justify-center gap-3 bg-ww-surface border-2 border-ww-lime/40 text-ww-text h-14 rounded-xl font-display font-bold text-base uppercase tracking-wider transition-all duration-200 hover:border-ww-lime hover:shadow-[0_0_20px_var(--ww-lime-glow)] active:scale-[0.97] cursor-pointer"
          >
            <Wine className="h-5 w-5 text-ww-lime" />
            Bar
          </button>
        </div>
      </div>
    </div>
  )
}
