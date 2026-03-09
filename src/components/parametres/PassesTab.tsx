'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProducts } from '@/contexts/products-context'
import { PassCard } from './PassCard'
import { PassModal } from './PassModal'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import type { GymPass } from '@/lib/types'

export function PassesTab() {
  const { gymPasses, addGymPass, updateGymPass, deleteGymPass } = useProducts()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPass, setEditingPass] = useState<GymPass | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<GymPass | null>(null)

  function handleEdit(pass: GymPass) {
    setEditingPass(pass)
    setModalOpen(true)
  }

  function handleAdd() {
    setEditingPass(null)
    setModalOpen(true)
  }

  function handleSave(pass: GymPass) {
    if (editingPass) {
      updateGymPass(editingPass.id, pass)
    } else {
      addGymPass(pass)
    }
  }

  function handleDeleteConfirm() {
    if (deleteTarget) deleteGymPass(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-lg text-ww-text uppercase tracking-wider">
          Passes Gym
        </h2>
        <Button
          onClick={handleAdd}
          className="bg-ww-orange hover:bg-ww-orange/90 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Ajouter un pass
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {gymPasses.map((pass) => (
          <PassCard
            key={pass.id}
            pass={pass}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
          />
        ))}
      </div>

      <PassModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        pass={editingPass}
        onSave={handleSave}
      />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        nom={deleteTarget?.nom || ''}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
