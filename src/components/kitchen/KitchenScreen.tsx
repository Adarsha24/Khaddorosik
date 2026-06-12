'use client'
import { useState, useEffect, useCallback } from 'react'
import KOTCard from './KOTCard'
import { kot as kotApi, ApiKOT } from '@/lib/api'

type Filter = 'ALL' | 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED'
type Props = { toast: (msg: string, type: 'success' | 'info' | 'kitchen') => void }

export default function KitchenScreen({ toast }: Props) {
  const [kots, setKots]         = useState<ApiKOT[]>([])
  const [filter, setFilter]     = useState<Filter>('ALL')
  const [loading, setLoading]   = useState(true)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const data = await kotApi.list('PENDING,PREPARING,READY,COMPLETED')
      setKots(data)
      setLastSync(new Date())
    } catch {
      if (!silent) toast('Failed to load KOTs', 'info')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])
  // Auto-refresh every 15 s
  useEffect(() => {
    const id = setInterval(() => load(true), 15000)
    return () => clearInterval(id)
  }, [load])

  const handleStatusChange = useCallback(async (id: string, status: string) => {
    await kotApi.updateStatus(id, status)
    setKots(prev => prev.map(k => k.id === id ? { ...k, status } : k))
    const msgs: Record<string, string> = { PREPARING: '🔥 Cooking started', READY: '✅ KOT ready!', COMPLETED: '🍽️ Served!' }
    toast(msgs[status] ?? 'Status updated', 'success')
  }, [toast])

  const handleItemDone = useCallback(async (kotId: string, itemId: string, done: boolean) => {
    await kotApi.markItemDone(kotId, itemId, done)
    setKots(prev => prev.map(k =>
      k.id !== kotId ? k : {
        ...k,
        kotItems: k.kotItems.map(i => i.id === itemId ? { ...i, done } : i),
      }
    ))
  }, [])

  const counts = {
    ALL:       kots.length,
    PENDING:   kots.filter(k => k.status === 'PENDING').length,
    PREPARING: kots.filter(k => k.status === 'PREPARING').length,
    READY:     kots.filter(k => k.status === 'READY').length,
    COMPLETED: kots.filter(k => k.status === 'COMPLETED').length,
  }

  const displayed = filter === 'ALL' ? kots : kots.filter(k => k.status === filter)

  const TABS: { id: Filter; label: string; color: string }[] = [
    { id: 'ALL',       label: 'All',       color: 'var(--text2)' },
    { id: 'PENDING',   label: 'Pending',   color: 'var(--amber)' },
    { id: 'PREPARING', label: 'Cooking',   color: 'var(--blue)'  },
    { id: 'READY',     label: 'Ready',     color: 'var(--green)' },
    { id: 'COMPLETED', label: 'Served',    color: 'var(--text3)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        height: 52, background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0,
      }}>
        <div>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text1)' }}>Kitchen Display</span>
          <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 8 }}>
            {lastSync ? `Synced ${lastSync.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : 'Loading…'}
          </span>
        </div>

        {/* Live counters */}
        <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
          {[
            { label: 'Pending',   val: counts.PENDING,   color: 'var(--amber)' },
            { label: 'Cooking',   val: counts.PREPARING, color: 'var(--blue)'  },
            { label: 'Ready',     val: counts.READY,     color: 'var(--green)' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px',
              borderRadius: 99, border: '1px solid var(--border)', background: 'var(--surface2)',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} />
              <span style={{ fontSize: 11, color: 'var(--text2)' }}>{label}:</span>
              <span style={{ fontSize: 12, fontWeight: 700, color }}>{val}</span>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => load(true)}
          style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: 'var(--gold-bg)', border: '1px solid var(--border)',
            color: 'var(--gold)', cursor: 'pointer',
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex', background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        padding: '0 16px', flexShrink: 0,
      }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setFilter(tab.id)} style={{
            padding: '10px 16px', fontSize: 12, fontWeight: 600,
            color: filter === tab.id ? tab.color : 'var(--text3)',
            background: 'none', border: 'none', borderBottom: `2.5px solid ${filter === tab.id ? tab.color : 'transparent'}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: -1,
          }}>
            {tab.label}
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99,
              background: filter === tab.id ? tab.color : 'var(--surface2)',
              color: filter === tab.id ? '#fff' : 'var(--text3)',
            }}>
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {/* KOT Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexWrap: 'wrap', gap: 12, alignContent: 'flex-start' }}>
        {loading ? (
          // Skeleton cards
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ width: 230, height: 200, borderRadius: 12 }} />
          ))
        ) : displayed.length === 0 ? (
          <div style={{
            width: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12,
          }}>
            <span style={{ fontSize: 52, opacity: 0.25 }}>👨‍🍳</span>
            <span style={{ fontSize: 14, color: 'var(--text3)', fontWeight: 500 }}>
              {filter === 'ALL' ? 'No active orders' : `No ${filter.toLowerCase()} orders`}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Orders will appear here as they come in</span>
          </div>
        ) : (
          displayed.map(kot => (
            <KOTCard
              key={kot.id}
              kot={kot}
              onStatusChange={handleStatusChange}
              onItemDone={handleItemDone}
            />
          ))
        )}
      </div>
    </div>
  )
}
