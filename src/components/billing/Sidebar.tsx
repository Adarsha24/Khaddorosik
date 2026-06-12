'use client'
import { useAuth } from '@/context/AuthContext'

export type ScreenId =
  | 'dashboard' | 'billing' | 'tables' | 'kitchen'
  | 'reservation' | 'reports' | 'inventory' | 'employees' | 'crm'

const NAV: { id: ScreenId; icon: string; label: string; roles?: string[] }[] = [
  { id: 'dashboard',   icon: '📊', label: 'Dashboard' },
  { id: 'billing',     icon: '🧾', label: 'Billing' },
  { id: 'tables',      icon: '🪑', label: 'Tables' },
  { id: 'kitchen',     icon: '👨‍🍳', label: 'Kitchen' },
  { id: 'reservation', icon: '📅', label: 'Reserve' },
  { id: 'reports',     icon: '📈', label: 'Reports', roles: ['SUPER_ADMIN', 'MANAGER', 'CASHIER'] },
  { id: 'inventory',   icon: '📦', label: 'Stock',   roles: ['SUPER_ADMIN', 'MANAGER'] },
  { id: 'employees',   icon: '👥', label: 'Staff',   roles: ['SUPER_ADMIN', 'MANAGER'] },
  { id: 'crm',         icon: '🤝', label: 'CRM' },
]

type Props = { active: ScreenId; onNavigate: (s: ScreenId) => void }

export default function Sidebar({ active, onNavigate }: Props) {
  const { user, logout } = useAuth()

  const initials = (user?.name ?? 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const filtered = NAV.filter(n => !n.roles || n.roles.includes(user?.role ?? ''))

  return (
    <aside style={{
      width: 64, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '10px 0', gap: 2, flexShrink: 0, overflow: 'hidden',
    }}>
      {/* Logo mark */}
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, marginBottom: 8, flexShrink: 0,
        boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
      }}>
        🍽️
      </div>

      <div style={{ width: 32, height: 1, background: 'var(--border)', marginBottom: 6 }} />

      {/* Nav items */}
      {filtered.map((n) => {
        const isActive = active === n.id
        return (
          <button
            key={n.id}
            onClick={() => onNavigate(n.id)}
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
            <span style={{ fontSize: 18, lineHeight: 1 }}>{n.icon}</span>
            <span style={{ textTransform: 'uppercase' }}>{n.label}</span>
          </button>
        )
      })}

      <div style={{ flex: 1 }} />

      <div style={{ width: 32, height: 1, background: 'var(--border)', marginBottom: 4 }} />

      {/* Avatar / logout */}
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
