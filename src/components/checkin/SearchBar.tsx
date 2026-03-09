'use client'

import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ww-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher un client par nom..."
        className="w-full h-[52px] pl-12 pr-4 rounded-xl bg-ww-surface border border-ww-border text-ww-text font-sans placeholder:text-ww-muted focus:outline-none focus:border-ww-orange transition-colors"
      />
    </div>
  )
}
