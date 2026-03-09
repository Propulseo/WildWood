'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { SidebarTooltip } from './SidebarTooltip'

interface BadgeInfo {
  count: number
  color: string
}

interface SidebarItemProps {
  href: string
  label: string
  icon: LucideIcon
  sectionLabel: string
  isActive: boolean
  isCollapsed: boolean
  badge?: BadgeInfo
}

export function SidebarItem({
  href, label, icon: Icon, sectionLabel,
  isActive, isCollapsed, badge,
}: SidebarItemProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative flex items-center h-10 md:h-14 lg:h-10 ${
        isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
      } rounded-lg text-sm font-sans transition-all duration-150 ${
        isActive
          ? 'bg-[var(--ww-orange-glow)] border-l-[3px] border-ww-orange'
          : 'hover:bg-ww-surface-2 hover:pl-4'
      }`}
    >
      <span className="relative shrink-0">
        <Icon
          className={`h-[18px] w-[18px] ${
            isActive ? 'text-ww-orange' : 'text-ww-muted group-hover:text-ww-text'
          }`}
        />
        {badge && badge.count > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 text-white text-[9px] font-display font-bold rounded-full h-4 min-w-4 flex items-center justify-center px-0.5"
            style={{ backgroundColor: badge.color }}
          >
            {badge.count}
          </span>
        )}
      </span>

      {!isCollapsed && (
        <span className={`truncate ${
          isActive ? 'font-medium text-ww-text' : 'text-ww-muted group-hover:text-ww-text'
        }`}>
          {label}
        </span>
      )}

      {isCollapsed && (
        <SidebarTooltip label={label} sectionLabel={sectionLabel} visible={hovered} />
      )}
    </Link>
  )
}
