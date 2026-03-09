'use client'

interface SidebarTooltipProps {
  label: string
  sectionLabel: string
  visible: boolean
}

export function SidebarTooltip({ label, sectionLabel, visible }: SidebarTooltipProps) {
  return (
    <div
      className={`absolute left-[72px] top-1/2 -translate-y-1/2 z-50
        bg-ww-surface-2 border border-ww-border rounded-md px-3 py-1.5
        pointer-events-none transition-opacity duration-150
        ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <p className="text-[13px] font-sans text-ww-text whitespace-nowrap">{label}</p>
      <p className="text-[11px] font-sans text-ww-muted whitespace-nowrap">{sectionLabel}</p>
    </div>
  )
}
