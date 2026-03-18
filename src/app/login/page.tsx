'use client'

import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Shield, Hotel, Wine, Loader2 } from 'lucide-react'
import type { Role } from '@/lib/types'

const HOME_ROUTES: Record<Role, string> = {
  admin: '/dashboard',
  reception: '/pos?tab=gym',
  bar: '/pos?tab=fnb',
}

const QUICK_LOGINS: { role: Role; email: string; icon: typeof Shield; color: string; borderColor: string; glowColor: string }[] = [
  { role: 'admin', email: 'admin@wildwood.com', icon: Shield, color: 'text-ww-orange', borderColor: 'border-ww-orange/40 hover:border-ww-orange', glowColor: 'hover:shadow-[0_0_20px_var(--ww-orange-glow)]' },
  { role: 'reception', email: 'reception@wildwood.com', icon: Hotel, color: 'text-ww-wood', borderColor: 'border-ww-wood/40 hover:border-ww-wood', glowColor: 'hover:shadow-[0_0_20px_rgba(139,107,61,0.15)]' },
  { role: 'bar', email: 'bar@wildwood.com', icon: Wine, color: 'text-ww-lime', borderColor: 'border-ww-lime/40 hover:border-ww-lime', glowColor: 'hover:shadow-[0_0_20px_var(--ww-lime-glow)]' },
]

export default function LoginPage() {
  const { role, isAuthenticated, login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated && role) {
      router.replace(HOME_ROUTES[role])
    }
  }, [isAuthenticated, role, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleQuickLogin(qEmail: string) {
    setError(null)
    setSubmitting(true)
    try {
      await login(qEmail, 'password')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setSubmitting(false)
    }
  }

  if (isAuthenticated) return null

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ww-bg">
      <div className="flex flex-col items-center gap-8 px-6 w-full max-w-xs">
        <div className="text-center">
          <h1 className="font-display text-6xl font-extrabold uppercase tracking-wider text-ww-orange">
            WILD WOOD
          </h1>
          <p className="mt-2 text-sm tracking-widest uppercase text-ww-muted font-sans">
            Beach Fitness & Resort — Koh Tao
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-12 px-4 rounded-lg bg-ww-surface border border-ww-border text-ww-text font-sans text-sm placeholder:text-ww-muted focus:outline-none focus:border-ww-orange transition-colors"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-12 px-4 rounded-lg bg-ww-surface border border-ww-border text-ww-text font-sans text-sm placeholder:text-ww-muted focus:outline-none focus:border-ww-orange transition-colors"
          />
          {error && (
            <p className="text-xs font-sans text-ww-danger text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-lg bg-ww-orange text-white font-display font-bold text-sm uppercase tracking-wider transition-all duration-150 hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Connexion'}
          </button>
        </form>

        <div className="w-full">
          <p className="text-[10px] font-sans text-ww-muted text-center uppercase tracking-widest mb-3">
            Connexion rapide
          </p>
          <div className="flex flex-col gap-2">
            {QUICK_LOGINS.map((q) => {
              const Icon = q.icon
              return (
                <button
                  key={q.role}
                  onClick={() => handleQuickLogin(q.email)}
                  disabled={submitting}
                  className={`w-full flex items-center justify-center gap-3 bg-ww-surface border-2 ${q.borderColor} text-ww-text h-11 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-all duration-200 ${q.glowColor} active:scale-[0.97] cursor-pointer disabled:opacity-50`}
                >
                  <Icon className={`h-4 w-4 ${q.color}`} />
                  {q.role === 'admin' ? 'Admin (Proprietaire)' : q.role === 'reception' ? 'Reception' : 'Bar'}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
