'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { useProducts } from '@/contexts/products-context'
import type { GymPass } from '@/lib/types'
import { VentePassModal } from './VentePassModal'

export function PassesGym() {
  const { staffMember } = useAuth()
  const { gymPasses } = useProducts()
  const [selected, setSelected] = useState<GymPass | null>(null)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto min-h-0 p-5">
        <div className="grid grid-cols-2 gap-3">
          {gymPasses.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className="rounded-xl py-4 px-3 flex flex-col items-center gap-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] cursor-pointer border-2 bg-ww-surface border-ww-border hover:border-ww-orange hover:shadow-[0_0_16px_var(--ww-orange-glow)]"
            >
              <span className="font-display font-extrabold text-base text-ww-text uppercase tracking-tight text-center leading-tight">
                {p.nom}
              </span>
              <span className="font-display font-bold text-sm text-ww-orange">
                {p.prix === 0 ? 'GRATUIT' : `฿ ${p.prix.toLocaleString('fr-FR')}`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <VentePassModal
          pass={selected}
          staffId={staffMember?.id}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
