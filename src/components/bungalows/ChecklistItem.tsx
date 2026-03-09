'use client'

import { useState } from 'react'

export function ChecklistItem({
  label,
  checked,
  locked,
  onToggle,
}: {
  label: string
  checked: boolean
  locked: boolean
  onToggle: () => void
}) {
  const [animating, setAnimating] = useState(false)

  const handleClick = () => {
    if (locked) return
    setAnimating(true)
    onToggle()
    setTimeout(() => setAnimating(false), 200)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={locked}
      className={`flex items-center gap-3 w-full text-left py-1.5 group ${
        locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      }`}
      title={locked ? "Completez l'etape precedente" : undefined}
    >
      <span
        className={`shrink-0 w-6 h-6 rounded flex items-center justify-center border-2 transition-all duration-200 ${
          checked
            ? 'bg-ww-lime border-ww-lime'
            : locked
              ? 'bg-ww-surface border-ww-border border-dashed'
              : 'bg-ww-surface-2 border-ww-border group-hover:border-ww-orange'
        } ${animating ? 'scale-125' : 'scale-100'}`}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className={`text-sm font-body ${checked ? 'text-ww-lime' : 'text-ww-text'}`}>
        {label}
      </span>
      {locked && <span className="text-xs ml-auto">&#128274;</span>}
    </button>
  )
}
