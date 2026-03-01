'use client'

import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { LogOut } from 'lucide-react'

export function RoleToggle() {
  const { role, toggleRole, logout } = useAuth()
  const router = useRouter()

  const handleToggle = () => {
    toggleRole()
    // Navigate to the other layout after toggle
    router.push(role === 'admin' ? '/pos' : '/dashboard')
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="flex items-center gap-3">
      <Badge
        onClick={handleToggle}
        className="cursor-pointer select-none px-3 py-1 text-sm font-medium transition-colors hover:opacity-80"
        variant={role === 'admin' ? 'default' : 'secondary'}
      >
        {role === 'admin' ? 'Admin' : 'Staff'}
      </Badge>
      <button
        onClick={handleLogout}
        className="text-muted-foreground hover:text-foreground transition-colors"
        title="Deconnexion"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  )
}
