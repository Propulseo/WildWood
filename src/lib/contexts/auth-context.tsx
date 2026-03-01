'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'

import type { Role } from '@/lib/types'

interface AuthContextType {
  role: Role | null
  login: (role: Role) => void
  logout: () => void
  toggleRole: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'wildwood-role'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Read role from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'admin' || stored === 'staff') {
      setRole(stored)
    }
    setIsHydrated(true)
  }, [])

  // Sync role to localStorage on change (only after hydration to avoid clearing on mount)
  useEffect(() => {
    if (!isHydrated) return
    if (role) {
      localStorage.setItem(STORAGE_KEY, role)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [role, isHydrated])

  const login = (newRole: Role) => setRole(newRole)
  const logout = () => setRole(null)
  const toggleRole = () =>
    setRole((prev) => (prev === 'admin' ? 'staff' : 'admin'))

  // Prevent hydration mismatch: render nothing until client-side state is loaded
  if (!isHydrated) {
    return null
  }

  return (
    <AuthContext.Provider
      value={{ role, login, logout, toggleRole, isAuthenticated: role !== null }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
