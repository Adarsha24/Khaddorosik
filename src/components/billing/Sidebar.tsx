'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export type ScreenId =
  | 'dashboard' | 'billing' | 'tables' | 'kitchen'
  | 'reservation' | 'reports' | 'inventory' | 'employees' | 'crm'

const ROUTES: Record<ScreenId, string> = {
  dashboard: '/dashboard',
  billing: '/billing',
  tables: '/tables',
  kitchen: '/kitchen',
  reservation: '/reservations',
  reports: '/reports',
  inventory: '/inventory',
  employees: '/employees',
  crm: '/crm',
}

const NAV: { id: ScreenId; icon: string; label: string; href: string; roles?: string[] }[] = [
  { id: 'dashboard', icon: 'DB', label: 'Dashboard', href: ROUTES.dashboard },
  { id: 'billing', icon: 'BI', label: 'Billing', href: ROUTES.billing },
  { id: 'tables', icon: 'TB', label: 'Tables', href: ROUTES.tables },
  { id: 'kitchen', icon: 'KT', label: 'Kitchen', href: ROUTES.kitchen },
  { id: 'reservation', icon: 'RS', label: 'Reserve', href: ROUTES.reservation },
  { id: 'reports', icon: 'RP', label: 'Reports', href: ROUTES.reports, roles: ['SUPER_ADMIN', 'MANAGER', 'CASHIER'] },
  { id: 'inventory', icon: 'ST', label: 'Stock', href: ROUTES.inventory, roles: ['SUPER_ADMIN', 'MANAGER'] },
  { id: 'employees', icon: 'SF', label: 'Staff', href: ROUTES.employees, roles: ['SUPER_ADMIN', 'MANAGER'] },
  { id: 'crm', icon: 'CR', label: 'CRM', href: ROUTES.crm },
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

  const filtered = NAV.filter(n => !n.roles || n.roles.includes(user?.role ?? ''))
  const activeRoute = active ?? filtered.find(n => pathname === n.href || pathname.startsWith(`${n.href}/`))?.id ?? 'dashboard'

  const navigate = (id: ScreenId) => {
    if (onNavigate) {
      onNavigate(id)
      return
    }
    router.push(ROUTES[id])
  }

  return (
    <aside style={{
      width: 64, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '10px 0', gap: 2, flexShrink: 0, overflow: 'hidden',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 800, marginBottom: 8, flexShrink: 0,
        boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
      }}>
        KH
      </div>

      <div style={{ width: 32, height: 1, background: 'var(--border)', marginBottom: 6 }} />

      {filtered.map((n) => {
        const isActive = activeRoute === n.id
        return (
          <button
            key={n.id}
            onClick={() => navigate(n.id)}
            title={n.label}
            style={{
              width: 48, height: 48, borderRadius: 10,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 2, cursor: 'pointer', border: 'none', fontFamily: 'inherit',
              fontSize: 8.5, fontWeight: 600, letterSpacing: '0.3px',
              transition: 'all 0.15s',
              background: isActive ? 'var(--gold-bg2)' : 'transparent',
              color: isActive ? 'var(--gold)' : 'var(--text3)',
              boxShadow: isActive ? '0 0 0 1px var(--gold-bg2)' : 'none',
            }}
            onMouseOver={e => !isActive && (e.currentTarget.style.color = 'var(--text2)')}
            onMouseOut={e => !isActive && (e.currentTarget.style.color = 'var(--text3)')}
          >
            <span style={{ fontSize: 11, lineHeight: 1, fontWeight: 800 }}>{n.icon}</span>
            <span style={{ textTransform: 'uppercase' }}>{n.label}</span>
          </button>
        )
      })}

      <div style={{ flex: 1 }} />

      <div style={{ width: 32, height: 1, background: 'var(--border)', marginBottom: 4 }} />

      <button
        onClick={() => logout()}
        title={`Sign out (${user?.email})`}
        style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#0B1120', fontWeight: 800, fontSize: 13,
          cursor: 'pointer', border: '2px solid var(--border)',
          marginBottom: 4, flexShrink: 0,
        }}
      >
        {initials}
      </button>
    </aside>
  )
}
