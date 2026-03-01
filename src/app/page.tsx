'use client'

import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { role, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    } else if (role === 'staff') {
      router.replace('/pos')
    } else {
      router.replace('/dashboard')
    }
  }, [role, isAuthenticated, router])

  return null // Brief flash before redirect
}
