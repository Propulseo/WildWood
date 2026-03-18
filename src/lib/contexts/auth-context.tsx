'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { Role } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface StaffRecord {
  id: string
  prenom: string
  email: string
  poste: string
  avatar_initiales: string | null
}

interface AuthContextType {
  user: User | null
  staffMember: StaffRecord | null
  role: Role | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [staffMember, setStaffMember] = useState<StaffRecord | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStaff = useCallback(async (authUser: User) => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('staff')
        .select('id, prenom, email, poste, avatar_initiales')
        .eq('email', authUser.email!)
        .single()
      if (data) {
        setStaffMember(data as StaffRecord)
        setRole(data.poste as Role)
      }
    } catch {
      // Staff lookup failed
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user: u } }: { data: { user: User | null } }) => {
      setUser(u)
      if (u) {
        loadStaff(u).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: { user: User | null } | null) => {
        const u = session?.user ?? null
        setUser(u)
        if (u) {
          loadStaff(u)
        } else {
          setStaffMember(null)
          setRole(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [loadStaff])

  async function login(email: string, password: string) {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setStaffMember(null)
    setRole(null)
  }

  if (loading) return null

  return (
    <AuthContext.Provider
      value={{ user, staffMember, role, loading, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
