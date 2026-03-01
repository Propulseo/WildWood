'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function DepenseDialog() {
  return (
    <Button variant="outline">
      <Plus className="mr-2 h-4 w-4" />
      Ajouter une depense
    </Button>
  )
}
