import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard, TrendingUp, Receipt, Calculator,
  BedDouble, DoorOpen, Wrench, UserCheck, MessageCircle,
  Settings, Users, Ticket, Waves, UtensilsCrossed, Coffee,
  BarChart3, CalendarDays, FileBarChart,
} from 'lucide-react'
import type { Role } from '@/lib/types'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  badgeKey?: 'tables'
}

export interface NavSection {
  label: string
  items: NavItem[]
}

const ADMIN_SECTIONS: NavSection[] = [
  {
    label: 'APERCU',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/statistiques', label: 'Statistiques', icon: BarChart3 },
    ],
  },
  {
    label: 'FINANCES',
    items: [
      { href: '/reporting', label: 'Reporting', icon: FileBarChart },
      { href: '/revenus', label: 'Revenus', icon: TrendingUp },
      { href: '/depenses', label: 'Depenses', icon: Receipt },
      { href: '/comptabilite', label: 'Comptabilite', icon: Calculator },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { href: '/bungalows', label: 'Bungalows', icon: BedDouble },
      { href: '/checkin', label: 'Entrees du jour', icon: DoorOpen },
      { href: '/maintenance', label: 'Maintenance', icon: Wrench },
      { href: '/communications', label: 'Communications', icon: MessageCircle },
    ],
  },
  {
    label: 'EQUIPE',
    items: [
      { href: '/presence', label: 'Presence', icon: UserCheck },
      { href: '/planning', label: 'Planning', icon: CalendarDays },
    ],
  },
  {
    label: 'PARAMETRES',
    items: [
      { href: '/parametres/produits', label: 'Produits', icon: Settings },
      { href: '/pointage', label: 'Staff', icon: Users },
      { href: '/parametres/messages', label: 'Templates WA', icon: MessageCircle },
    ],
  },
]

const RECEPTION_SECTIONS: NavSection[] = [
  {
    label: 'ACCUEIL',
    items: [
      { href: '/pos?tab=gym', label: 'Passes Gym', icon: Ticket },
      { href: '/pos?tab=serviettes', label: 'Serviettes', icon: Waves },
      { href: '/checkin', label: 'Entrees du jour', icon: DoorOpen },
    ],
  },
  {
    label: 'HEBERGEMENT',
    items: [
      { href: '/bungalows', label: 'Bungalows', icon: BedDouble },
    ],
  },
  {
    label: 'FINANCES',
    items: [
      { href: '/reporting', label: 'Reporting', icon: FileBarChart },
    ],
  },
  {
    label: 'EQUIPE',
    items: [
      { href: '/planning', label: 'Planning', icon: CalendarDays },
    ],
  },
]

const BAR_SECTIONS: NavSection[] = [
  {
    label: 'SERVICE',
    items: [
      { href: '/pos?tab=fnb', label: 'F&B', icon: UtensilsCrossed },
      { href: '/tables', label: 'Tables ouvertes', icon: Coffee, badgeKey: 'tables' },
    ],
  },
  {
    label: 'FINANCES',
    items: [
      { href: '/reporting', label: 'Reporting', icon: FileBarChart },
    ],
  },
  {
    label: 'EQUIPE',
    items: [
      { href: '/planning', label: 'Planning', icon: CalendarDays },
    ],
  },
]

export function getNavSections(role: Role): NavSection[] {
  if (role === 'reception') return RECEPTION_SECTIONS
  if (role === 'bar') return BAR_SECTIONS
  return ADMIN_SECTIONS
}
