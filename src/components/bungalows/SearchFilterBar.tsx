'use client'

import { Search, RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function SearchFilterBar({
  searchQuery,
  setSearchQuery,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onReset,
}: {
  searchQuery: string
  setSearchQuery: (s: string) => void
  dateFrom: string
  setDateFrom: (s: string) => void
  dateTo: string
  setDateTo: (s: string) => void
  onReset: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ww-muted" />
        <Input
          placeholder="Rechercher un client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-ww-muted whitespace-nowrap">Du</label>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-[150px]"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-ww-muted whitespace-nowrap">Au</label>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-[150px]"
        />
      </div>

      <Button variant="outline" onClick={onReset} className="gap-2">
        <RotateCcw className="h-4 w-4" />
        Reinitialiser
      </Button>
    </div>
  )
}
