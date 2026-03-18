'use client'

import { useAuth } from '@/lib/contexts/auth-context'
import { PosRegister } from '@/components/pos/pos-register'
import { PosBar } from '@/components/bar/PosBar'
import type { GymPass, FnbProduct, Client, Bungalow } from '@/lib/types'

type TabId = 'gym' | 'fnb' | 'serviettes'

interface PosRouterProps {
  gymPasses: GymPass[]
  fnbProducts: FnbProduct[]
  clients: Client[]
  bungalows: Bungalow[]
  defaultTab?: TabId
}

export function PosRouter({ gymPasses, fnbProducts, clients, bungalows, defaultTab }: PosRouterProps) {
  const { role } = useAuth()

  if (role === 'bar') {
    return <PosBar />
  }

  return (
    <PosRegister
      gymPasses={gymPasses}
      fnbProducts={fnbProducts}
      clients={clients}
      bungalows={bungalows}
      defaultTab={defaultTab}
    />
  )
}
