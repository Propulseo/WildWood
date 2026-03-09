'use client'

import { useState, useEffect } from 'react'
import { useServiettes } from '@/contexts/serviettes-context'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface StockEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StockEditor({ open, onOpenChange }: StockEditorProps) {
  const { stockTotal, setStockTotal } = useServiettes()
  const [value, setValue] = useState(stockTotal)

  useEffect(() => {
    if (open) setValue(stockTotal)
  }, [open, stockTotal])

  function handleSave() {
    if (value >= 0) {
      setStockTotal(value)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Stock total de serviettes</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-center gap-4 py-4">
          <button
            onClick={() => setValue((v) => Math.max(0, v - 1))}
            className="w-12 h-12 rounded-lg bg-ww-surface border border-ww-border text-ww-text font-display font-bold text-2xl transition-all hover:border-ww-orange active:scale-[0.97]"
          >
            -
          </button>

          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-20 h-12 text-center bg-ww-surface border border-ww-border rounded-lg font-display font-extrabold text-2xl text-ww-text focus:outline-none focus:border-ww-orange"
          />

          <button
            onClick={() => setValue((v) => v + 1)}
            className="w-12 h-12 rounded-lg bg-ww-surface border border-ww-border text-ww-text font-display font-bold text-2xl transition-all hover:border-ww-orange active:scale-[0.97]"
          >
            +
          </button>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-ww-orange text-white rounded-lg py-3 font-display font-bold text-lg uppercase tracking-wider transition-all hover:brightness-110 active:scale-[0.97]"
        >
          Enregistrer
        </button>
      </DialogContent>
    </Dialog>
  )
}
