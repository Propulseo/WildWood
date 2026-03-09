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
  setRole: (role: Role) => void
  toggleRole: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'wildwood-role'
const VALID_ROLES: Role[] = ['admin', 'reception', 'bar']

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && VALID_ROLES.includes(stored as Role)) {
      setRoleState(stored as Role)
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    if (role) {
      localStorage.setItem(STORAGE_KEY, role)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [role, isHydrated])

  const login = (newRole: Role) => setRoleState(newRole)
  const logout = () => setRoleState(null)
  const setRole = (newRole: Role) => setRoleState(newRole)
  const toggleRole = () =>
    setRoleState((prev) => {
      if (prev === 'admin') return 'reception'
      if (prev === 'reception') return 'bar'
      return 'admin'
    })

  if (!isHydrated) return null

  return (
    <AuthContext.Provider
      value={{ role, login, logout, setRole, toggleRole, isAuthenticated: role !== null }}
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
