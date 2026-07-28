'use client'
import { ApiTable } from '@/lib/api'

const STATUS_CFG: Record<string, { border: string; bg: string; badgeBg: string; badgeCol: string; label: string }> = {
  AVAILABLE: { border: '#10B981', bg: 'var(--green-bg)',  badgeBg: 'var(--green-bg)',  badgeCol: 'var(--green)',  label: 'Free'     },
  OCCUPIED:  { border: '#F59E0B', bg: 'var(--amber-bg)',  badgeBg: 'var(--amber-bg)',  badgeCol: 'var(--amber)',  label: 'Occupied' },
  RESERVED:  { border: '#3B82F6', bg: 'var(--blue-bg)',   badgeBg: 'var(--blue-bg)',   badgeCol: 'var(--blue)',   label: 'Reserved' },
  CLEANING:  { border: '#8B5CF6', bg: 'var(--purple-bg)', badgeBg: 'var(--purple-bg)', badgeCol: 'var(--purple)', label: 'Cleaning' },
}

interface Props {
  table: ApiTable
  isSelected: boolean
  onClick: () => void
}

export default function TableCard({ table, isSelected, onClick }: Props) {
  const cfg = STATUS_CFG[table.status] ?? STATUS_CFG.AVAILABLE
  const activeSession = table.tableSessions?.find(s => s.status === 'OPEN')
  const orderCount = activeSession?.orders?.length ?? 0

  return (
    <div
      onClick={onClick}
      style={{
        width: 132, height: 104, borderRadius: 12, cursor: 'pointer',
        border: `2px solid ${isSelected ? 'var(--gold)' : cfg.border}`,
        background: isSelected ? 'var(--gold-bg)' : cfg.bg,
        boxShadow: isSelected ? '0 0 0 3px var(--gold-bg2)' : '0 2px 8px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        transition: 'all 0.15s', flexShrink: 0,
      }}
      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = '' }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px 4px' }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: isSelected ? 'var(--gold)' : 'var(--text1)' }}>
          T{table.number}
        </span>
        <span style={{ fontSize: 9, color: 'var(--text3)' }}>{table.capacity}p</span>
        <span style={{
          fontSize: 8.5, fontWeight: 700, padding: '2px 6px', borderRadius: 99, textTransform: 'uppercase',
          background: cfg.badgeBg, color: cfg.badgeCol, letterSpacing: '0.3px',
        }}>
          {cfg.label}
        </span>
      </div>

      {/* Section label */}
      {table.section && (
        <div style={{ fontSize: 9, color: 'var(--text3)', paddingLeft: 10, marginBottom: 2 }}>{table.section}</div>
      )}

      {/* Status detail */}
      <div style={{ padding: '4px 10px' }}>
        {table.status === 'AVAILABLE' && (
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
            Ready to seat
          </div>
        )}
        {table.status === 'OCCUPIED' && (
          <div>
            <div style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 600 }}>
              {orderCount} order{orderCount !== 1 ? 's' : ''}
            </div>
            {activeSession && (
              <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>
                Since {new Date(activeSession.openedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        )}
        {table.status === 'RESERVED' && (
          <div style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600 }}>Reserved</div>
        )}
        {table.status === 'CLEANING' && (
          <div style={{ fontSize: 11, color: 'var(--purple)', fontWeight: 600 }}>🧹 Cleaning</div>
        )}
      </div>
    </div>
  )
}
