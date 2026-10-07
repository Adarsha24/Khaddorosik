'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export type ScreenId =
  | 'dashboard' | 'billing' | 'tables' | 'kitchen'
  | 'reservation' | 'reports' | 'inventory' | 'menu' | 'employees' | 'crm' | 'payroll' | 'shift' | 'auditlog'

const ROUTES: Record<ScreenId, string> = {
  dashboard: '/dashboard',
  billing: '/billing',
  tables: '/tables',
  kitchen: '/kitchen',
  reservation: '/reservations',
  reports: '/reports',
  inventory: '/inventory',
  menu: '/menu',
  employees: '/employees',
  crm: '/crm',
  payroll: '/payroll',
  shift: '/shift',
  auditlog: '/audit-log',
}

/* Inline SVG paths (24×24, stroke icons) — no icon package needed */
const ICONS: Record<ScreenId, React.ReactNode> = {
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  billing: <><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 17.5v-11" /></>,
  tables: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
  kitchen: <><path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z" /><path d="M6 17h12" /></>,
  reservation: <><path d="M8 2v4M16 2v4" /><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></>,
  reports: <><path d="M3 3v18h18" /><path d="M18 17V9M13 17V5M8 17v-3" /></>,
  inventory: <><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5M12 22V12" /></>,
  menu: <><path d="M3 2v7c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V2" /><path d="M6 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></>,
  employees: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  crm: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
  payroll: <><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></>,
  shift: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  auditlog: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
}

function Icon({ id, size = 21 }: { id: ScreenId; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[id]}
    </svg>
  )
}

type NavItem = { id: ScreenId; label: string; href: string; roles?: string[] }

/* Grouped by how people actually work: serve → manage */
const SERVICE: NavItem[] = [
  { id: 'dashboard', label: 'Home', href: ROUTES.dashboard },
  { id: 'billing', label: 'Billing', href: ROUTES.billing },
  { id: 'tables', label: 'Tables', href: ROUTES.tables },
  { id: 'kitchen', label: 'Kitchen', href: ROUTES.kitchen },
  { id: 'reservation', label: 'Bookings', href: ROUTES.reservation },
]
const MANAGE: NavItem[] = [
  { id: 'reports', label: 'Reports', href: ROUTES.reports, roles: ['SUPER_ADMIN', 'MANAGER', 'CASHIER'] },
  { id: 'inventory', label: 'Stock', href: ROUTES.inventory, roles: ['SUPER_ADMIN', 'MANAGER'] },
  { id: 'menu', label: 'Menu', href: ROUTES.menu, roles: ['SUPER_ADMIN', 'MANAGER'] },
  { id: 'employees', label: 'Staff', href: ROUTES.employees, roles: ['SUPER_ADMIN', 'MANAGER'] },
  { id: 'crm', label: 'Guests', href: ROUTES.crm },
  { id: 'payroll', label: 'Payroll', href: ROUTES.payroll, roles: ['SUPER_ADMIN', 'MANAGER'] },
  { id: 'shift', label: 'Shift', href: ROUTES.shift, roles: ['SUPER_ADMIN', 'MANAGER', 'CASHIER'] },
  { id: 'auditlog', label: 'Activity', href: ROUTES.auditlog, roles: ['SUPER_ADMIN', 'MANAGER'] },
]

type Props = {
  active?: ScreenId
  onNavigate?: (s: ScreenId) => void
}

export default function Sidebar({ active, onNavigate }: Props) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const allowed = (n: NavItem) => !n.roles || n.roles.includes(user?.role ?? '')
  const service = SERVICE.filter(allowed)
  const manage = MANAGE.filter(allowed)
  const all = [...service, ...manage]
  const activeRoute =
    active ?? all.find(n => pathname === n.href || pathname.startsWith(`${n.href}/`))?.id ?? 'dashboard'

  // Phones: only the first 4 tabs sit in the bottom bar, the rest live in a "More" sheet
  const [moreOpen, setMoreOpen] = useState(false)
  const PRIMARY_COUNT = 4
  const extraIds = new Set(all.slice(PRIMARY_COUNT).map(n => n.id))
  const extras = all.slice(PRIMARY_COUNT)
  const moreActive = extraIds.has(activeRoute as ScreenId)

  const navigate = (id: ScreenId) => {
    setMoreOpen(false)
    if (onNavigate) { onNavigate(id); return }
    router.push(ROUTES[id])
  }

  const renderItem = (n: NavItem) => {
    const isActive = activeRoute === n.id
    return (
      <button
        key={n.id}
        onClick={() => navigate(n.id)}
        title={n.label}
        aria-label={n.label}
        aria-current={isActive ? 'page' : undefined}
        className={`nav-item${isActive ? ' active' : ''}${extraIds.has(n.id) ? ' nav-extra' : ''}`}
      >
        <Icon id={n.id} />
        <span>{n.label}</span>
      </button>
    )
  }

  return (
    <>
    <aside
      className="pos-sidebar"
      style={{
        width: 80, borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '12px 0', gap: 3, flexShrink: 0, overflowX: 'hidden', overflowY: 'auto',
      }}
    >
      <div className="brand-mark" style={{ marginBottom: 6 }} title="Khaddorosik POS">খ</div>

      <div className="nav-sep" />

      {service.map(renderItem)}

      {manage.length > 0 && <div className="nav-sep" />}

      {manage.map(renderItem)}

      {/* Phones only (hidden on desktop by CSS) */}
      <button
        onClick={() => setMoreOpen(v => !v)}
        aria-label="More"
        aria-expanded={moreOpen}
        className={`nav-item nav-more-btn${moreActive || moreOpen ? ' active' : ''}`}
      >
        <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="5" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="19" cy="12" r="1.2" />
        </svg>
        <span>More</span>
      </button>

      <div style={{ flex: 1 }} />

      <div className="nav-sep" />

      <button
        onClick={() => logout()}
        title={`Sign out (${user?.email ?? ''})`}
        aria-label="Sign out"
        style={{
          width: 42, height: 42, borderRadius: '50%',
          background: 'linear-gradient(145deg, var(--gold-light), var(--gold-dark))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#1a1204', fontWeight: 800, fontSize: 13,
          cursor: 'pointer', border: '2px solid var(--border)',
          marginBottom: 4, flexShrink: 0, fontFamily: 'inherit',
        }}
      >
        {initials}
      </button>
    </aside>

    {moreOpen && (
      <>
        <div className="nav-sheet-backdrop" onClick={() => setMoreOpen(false)} />
        <div className="nav-sheet" role="dialog" aria-label="More">
          <div className="nav-sheet-grid">
            {extras.map(n => (
              <button
                key={n.id}
                onClick={() => navigate(n.id)}
                className={`nav-sheet-item${activeRoute === n.id ? ' active' : ''}`}
              >
                <Icon id={n.id} size={22} />
                <span>{n.label}</span>
              </button>
            ))}
          </div>
          <button className="nav-sheet-signout" onClick={() => logout()}>
            Sign out{user?.name ? ` (${user.name})` : ''}
          </button>
        </div>
      </>
    )}
    </>
  )
}