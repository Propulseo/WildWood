'use client'

import { useState } from 'react'
import { Wrench, Check } from 'lucide-react'
import { useMaintenance } from '@/contexts/maintenance-context'
import { MaintenanceModal } from '@/components/maintenance/MaintenanceModal'

export function MaintenanceBadge({
  bungalowId,
  bungalowNumero,
}: {
  bungalowId: string
  bungalowNumero: number
}) {
  const { countAFaireByBungalow } = useMaintenance()
  const [showModal, setShowModal] = useState(false)
  const count = countAFaireByBungalow(bungalowId)

  return (
    <>
      {count > 0 ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowModal(true) }}
          className="text-[11px] font-sans text-ww-danger hover:underline cursor-pointer inline-flex items-center gap-0.5"
        >
          <Wrench className="h-2.5 w-2.5" /> {count} probleme{count > 1 ? 's' : ''}
        </button>
      ) : (
        <span className="text-[11px] font-sans text-ww-lime inline-flex items-center gap-0.5">
          <Check className="h-2.5 w-2.5" /> RAS
        </span>
      )}

      <MaintenanceModal
        bungalowId={bungalowId}
        bungalowNumero={bungalowNumero}
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}
