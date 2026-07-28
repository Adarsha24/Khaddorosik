'use client'
import { useState, useEffect } from 'react'
import { kot as kotApi, ApiKOT } from '@/lib/api'

function useElapsed(createdAt: string) {
  const [label, setLabel] = useState('')
  useEffect(() => {
    const calc = () => {
      const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
      if (mins < 1) setLabel('< 1 min')
      else if (mins < 60) setLabel(`${mins} min`)
      else setLabel(`${Math.floor(mins / 60)}h ${mins % 60}m`)
    }
    calc()
    const id = setInterval(calc, 30000)
    return () => clearInterval(id)
  }, [createdAt])
  return label
}

function urgencyColor(createdAt: string, status: string): string {
  if (status === 'READY' || status === 'COMPLETED') return 'rgba(16,185,129,0.7)'
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
  if (mins >= 20) return 'rgba(239,68,68,0.85)'
  if (mins >= 10) return 'rgba(245,158,11,0.85)'
  return 'rgba(255,255,255,0.15)'
}

function headerBg(status: string): string {
  if (status === 'READY')     return '#1a7a50'
  if (status === 'COMPLETED') return '#4a5568'
  if (status === 'PREPARING') return '#1e3a5f'
  return '#1a2a1e'
}

function leftBar(status: string, createdAt: string): string {
  if (status === 'READY')     return '#10B981'
  if (status === 'COMPLETED') return '#64748B'
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
  if (mins >= 20) return '#EF4444'
  if (mins >= 10) return '#F59E0B'
  return '#10B981'
}

interface Props {
  kot: ApiKOT
  onStatusChange: (id: string, status: string) => Promise<void>
  onItemDone: (kotId: string, itemId: string, done: boolean) => Promise<void>
}

export default function KOTCard({ kot, onStatusChange, onItemDone }: Props) {
  const elapsed = useElapsed(kot.createdAt)
  const [items, setItems] = useState(kot.kotItems.map(i => ({ ...i })))
  const [busy, setBusy] = useState(false)

  const allDone = items.every(i => i.done)

  const toggleItem = async (item: typeof items[number]) => {
    if (kot.status === 'COMPLETED') return
    const newDone = !item.done
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, done: newDone } : i))
    await onItemDone(kot.id, item.id, newDone)
  }

  const advance = async () => {
    if (busy) return
    setBusy(true)
    const next = kot.status === 'PENDING' ? 'PREPARING'
      : kot.status === 'PREPARING' ? 'READY'
      : 'COMPLETED'
    await onStatusChange(kot.id, next)
    setBusy(false)
  }

  const tableLabel = kot.order?.orderType === 'TAKEAWAY' ? 'Takeaway'
    : kot.order?.orderType === 'DELIVERY' ? 'Delivery'
    : `Table ${kot.order?.tableId ? '#' + (kot.order.billNo ?? '?') : '?'}`

  const billLabel = kot.order?.billNo ? `#${String(kot.order.billNo).padStart(4, '0')}` : ''

  return (
    <div style={{
      width: 230, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      border: `1.5px solid`,
      borderColor: kot.status === 'READY' ? '#10B981'
        : kot.status === 'PREPARING' ? '#3B82F6'
        : leftBar(kot.status, kot.createdAt),
      boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
      background: 'var(--surface)',
    }}>
      {/* Left urgency bar */}
      <div style={{ height: 4, background: leftBar(kot.status, kot.createdAt) }} />

      {/* Header */}
      <div style={{
        padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: headerBg(kot.status),
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{tableLabel}</div>
          {billLabel && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>Bill {billLabel}</div>}
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, color: '#fff',
          background: urgencyColor(kot.createdAt, kot.status),
        }}>
          {elapsed}
        </span>
      </div>

      {/* Status pill */}
      <div style={{
        padding: '4px 12px', fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
        background: kot.status === 'PENDING'   ? 'var(--amber-bg)'  :
                    kot.status === 'PREPARING' ? 'var(--blue-bg)'   :
                    kot.status === 'READY'     ? 'var(--green-bg)'  : 'var(--surface2)',
        color:      kot.status === 'PENDING'   ? 'var(--amber)'  :
                    kot.status === 'PREPARING' ? 'var(--blue)'   :
                    kot.status === 'READY'     ? 'var(--green)'  : 'var(--text3)',
      }}>
        {kot.status === 'PENDING' ? '⏳ Waiting' : kot.status === 'PREPARING' ? '🔥 Cooking' : kot.status === 'READY' ? '✅ Ready' : '🏁 Done'}
      </div>

      {/* Items */}
      <div style={{ padding: '6px 0', flex: 1 }}>
        {items.map((item) => (
          <div key={item.id} style={{
            padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--gold)', minWidth: 22 }}>
              {item.quantity}×
            </span>
            <span style={{
              flex: 1, fontSize: 12, fontWeight: 500,
              color: item.done ? 'var(--text3)' : 'var(--text1)',
              textDecoration: item.done ? 'line-through' : 'none',
            }}>
              {item.orderItem?.menuItem?.name ?? 'Item'}
              {item.orderItem?.notes && (
                <span style={{ display: 'block', fontSize: 10, color: 'var(--blue)', marginTop: 1 }}>
                  ✎ {item.orderItem.notes}
                </span>
              )}
            </span>
            {/* Veg/non-veg dot */}
            <span style={{ fontSize: 9 }}>
              {item.orderItem?.menuItem?.veg ? '🟢' : '🔴'}
            </span>
            {kot.status !== 'COMPLETED' && (
              <button
                onClick={() => toggleItem(item)}
                style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                  border: `1.5px solid ${item.done ? 'var(--green)' : 'var(--border2)'}`,
                  background: item.done ? 'var(--green)' : 'transparent',
                  color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {item.done && '✓'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border)', display: 'flex', gap: 6 }}>
        {kot.status === 'PENDING' && (
          <button onClick={advance} disabled={busy} style={{
            flex: 1, padding: '7px 0', borderRadius: 7, fontSize: 11, fontWeight: 700,
            cursor: 'pointer', border: 'none',
            background: allDone ? 'var(--blue)' : 'var(--surface2)',
            color: allDone ? '#fff' : 'var(--text2)',
          }}>
            🔥 Start Cooking
          </button>
        )}
        {kot.status === 'PREPARING' && (
          <button onClick={advance} disabled={busy} style={{
            flex: 1, padding: '7px 0', borderRadius: 7, fontSize: 11, fontWeight: 700,
            cursor: 'pointer', border: 'none',
            background: allDone ? 'var(--green)' : 'var(--surface2)',
            color: allDone ? '#fff' : 'var(--text2)',
          }}>
            ✅ Mark Ready
          </button>
        )}
        {kot.status === 'READY' && (
          <button onClick={advance} disabled={busy} style={{
            flex: 1, padding: '7px 0', borderRadius: 7, fontSize: 11, fontWeight: 700,
            cursor: 'pointer', border: 'none',
            background: 'var(--green)', color: '#fff',
          }}>
            🍽️ Mark Served
          </button>
        )}
        {kot.status === 'COMPLETED' && (
          <div style={{
            flex: 1, padding: '7px 0', borderRadius: 7, fontSize: 11, fontWeight: 700,
            textAlign: 'center', color: 'var(--text3)', background: 'var(--surface2)',
          }}>
            ✓ Served
          </div>
        )}
      </div>
    </div>
  )
}
