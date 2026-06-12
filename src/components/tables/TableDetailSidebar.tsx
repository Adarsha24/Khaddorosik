'use client'
import { ApiTable } from '@/lib/api'
import { tables as tablesApi } from '@/lib/api'

interface Props {
  table: ApiTable | null
  onStatusChange: (id: string, status: string) => Promise<void>
  onNavigateBilling: () => void
}

const STATUS_ACTIONS: { status: string; label: string; color: string; bg: string }[] = [
  { status: 'AVAILABLE', label: 'Mark Available', color: 'var(--green)', bg: 'var(--green-bg)'  },
  { status: 'OCCUPIED',  label: 'Mark Occupied',  color: 'var(--amber)', bg: 'var(--amber-bg)'  },
  { status: 'RESERVED',  label: 'Mark Reserved',  color: 'var(--blue)',  bg: 'var(--blue-bg)'   },
  { status: 'CLEANING',  label: 'Mark Cleaning',  color: 'var(--purple)',bg: 'var(--purple-bg)' },
]

export default function TableDetailSidebar({ table, onStatusChange, onNavigateBilling }: Props) {
  if (!table) return (
    <div style={{
      width: 260, background: 'var(--surface)', borderLeft: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--text3)', fontSize: 12,
    }}>
      Select a table
    </div>
  )

  const activeSession = table.tableSessions?.find(s => s.status === 'OPEN')
  const orders = activeSession?.orders ?? []
  const totalRevenue = orders.reduce((s, o: { total?: string }) => s + parseFloat(o.total ?? '0'), 0)

  return (
    <div style={{
      width: 260, background: 'var(--surface)', borderLeft: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 12px',
        background: 'var(--surface2)', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text1)' }}>Table {table.number}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
          {table.capacity} seats · {table.section ?? 'Main Hall'} · <span style={{
            color: table.status === 'AVAILABLE' ? 'var(--green)' :
                   table.status === 'OCCUPIED'  ? 'var(--amber)' :
                   table.status === 'RESERVED'  ? 'var(--blue)'  : 'var(--purple)',
            fontWeight: 600,
          }}>{table.status}</span>
        </div>
      </div>

      {/* Session info */}
      {activeSession && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--amber-bg)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', marginBottom: 6 }}>ACTIVE SESSION</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>Orders</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text1)' }}>{orders.length}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>Total</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--gold)' }}>
              ₹{new Intl.NumberFormat('en-IN').format(Math.round(totalRevenue))}
            </span>
          </div>
        </div>
      )}

      {/* Orders list */}
      {orders.length > 0 && (
        <div style={{ borderBottom: '1px solid var(--border)' }}>
          <div style={{ padding: '8px 16px 4px', fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Orders
          </div>
          <div style={{ maxHeight: 160, overflowY: 'auto' }}>
            {orders.map((o: { id: string; billNo?: number; status?: string; total?: string; createdAt?: string }) => (
              <div key={o.id} style={{
                padding: '6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid var(--border)',
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text1)' }}>
                    {o.billNo ? `#${String(o.billNo).padStart(4, '0')}` : 'Draft'}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>{o.status}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>
                  ₹{parseFloat(o.total ?? '0').toFixed(0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status change actions */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
          Change Status
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {STATUS_ACTIONS.filter(a => a.status !== table.status).map(action => (
            <button key={action.status} onClick={() => onStatusChange(table.id, action.status)} style={{
              padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: `1px solid ${action.color}`, background: action.bg,
              color: action.color, cursor: 'pointer', textAlign: 'left',
            }}>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {table.status === 'OCCUPIED' && (
          <button onClick={onNavigateBilling} style={{
            padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 700,
            background: 'var(--gold)', color: '#0B1120', border: 'none', cursor: 'pointer',
          }}>
            💰 Open Billing
          </button>
        )}
        <button onClick={onNavigateBilling} style={{
          padding: '9px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
          background: 'var(--surface2)', border: '1px solid var(--border)',
          color: 'var(--text2)', cursor: 'pointer',
        }}>
          🧾 New Order
        </button>
      </div>
    </div>
  )
}
