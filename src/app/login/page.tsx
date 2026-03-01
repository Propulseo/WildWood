'use client'

import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Shield, ShoppingCart } from 'lucide-react'

export default function LoginPage() {
  const { role, isAuthenticated, login } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(role === 'staff' ? '/pos' : '/dashboard')
    }
  }, [isAuthenticated, role, router])

  const handleLogin = (selectedRole: 'admin' | 'staff') => {
    login(selectedRole)
    router.push(selectedRole === 'staff' ? '/pos' : '/dashboard')
  }

  // Don't render login form if already authenticated (will redirect)
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-wildwood-dark">
      <div className="flex flex-col items-center gap-8 px-6">
        {/* Branding */}
        <div className="text-center">
          <h1 className="font-display text-5xl font-bold uppercase tracking-wider text-white">
            WildWood
          </h1>
          <p className="mt-2 text-sm tracking-wide text-wildwood-cream/60">
            Beach Fitness & Resort — Koh Tao
          </p>
        </div>

        {/* Role selection */}
        <div className="flex w-full max-w-xs flex-col gap-4">
          <Button
            size="lg"
            className="w-full gap-3 bg-wildwood-bois text-white hover:bg-wildwood-bois/85 h-14 text-base font-semibold"
            onClick={() => handleLogin('admin')}
          >
            <Shield className="h-5 w-5" />
            Admin (Proprietaire)
          </Button>
          <Button
            size="lg"
            className="w-full gap-3 bg-wildwood-orange text-white hover:bg-wildwood-orange/85 h-14 text-base font-semibold"
            onClick={() => handleLogin('staff')}
          >
            <ShoppingCart className="h-5 w-5" />
            Staff (Caisse POS)
          </Button>
        </div>
      </div>
    </div>
  )
}
