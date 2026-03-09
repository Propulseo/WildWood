'use client'

interface SidebarLogoProps {
  isCollapsed: boolean
}

export function SidebarLogo({ isCollapsed }: SidebarLogoProps) {
  return (
    <div className="p-4 border-b border-ww-border">
      {isCollapsed ? (
        <h1 className="font-display text-xl font-extrabold uppercase text-ww-orange text-center">
          WW
        </h1>
      ) : (
        <>
          <h1 className="font-display text-xl font-extrabold uppercase tracking-wider text-ww-orange flex items-center gap-2">
            <span>🌴</span> WILD WOOD
          </h1>
          <p className="text-[10px] text-ww-muted font-sans mt-0.5 tracking-widest uppercase">
            ERP · KOH TAO
          </p>
        </>
      )}
    </div>
  )
}
