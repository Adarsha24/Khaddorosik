'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw, X } from 'lucide-react'
import { tables as tablesApi, ApiTable } from '@/lib/api'
import TableCard from './TableCard'
import TableDetailSidebar from './TableDetailSidebar'

interface Props {
  toast: (msg: string, type: 'success' | 'info' | 'kitchen') => void
  onNavigate: (id: string) => void
}

type StatusFilter = 'ALL' | 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING'
type SectionFilter = 'ALL' | string

export default function TablesScreen({ toast, onNavigate }: Props) {
  const [tableList, setTableList]     = useState<ApiTable[]>([])
  const [selected, setSelected]       = useState<ApiTable | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>('ALL')
  const [loading, setLoading]         = useState(true)
  const [showAddTable, setShowAddTable] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const data = await tablesApi.list()
      setTableList(data)
      // Keep selected in sync with fresh data
      setSelected(prev => prev ? (data.find(t => t.id === prev.id) ?? null) : null)
    } catch {
      if (!silent) toast('Failed to load tables', 'info')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const handleStatusChange = useCallback(async (id: string, status: string) => {
    await tablesApi.updateStatus(id, status)
    await load(true)
    toast(`Table marked ${status.toLowerCase()}`, 'success')
  }, [load, toast])

  // Unique sections from API data
  const sections = Array.from(new Set(tableList.map(t => t.section).filter(Boolean))) as string[]

  const counts: Record<StatusFilter, number> = {
    ALL:       tableList.length,
    AVAILABLE: tableList.filter(t => t.status === 'AVAILABLE').length,
    OCCUPIED:  tableList.filter(t => t.status === 'OCCUPIED').length,
    RESERVED:  tableList.filter(t => t.status === 'RESERVED').length,
    CLEANING:  tableList.filter(t => t.status === 'CLEANING').length,
  }

  const filtered = tableList.filter(t =>
    (statusFilter === 'ALL' || t.status === statusFilter) &&
    (sectionFilter === 'ALL' || t.section === sectionFilter)
  )

  const STATUS_OPTS: { key: StatusFilter; label: string; dot: string }[] = [
    { key: 'ALL',       label: `All (${counts.ALL})`,             dot: 'var(--text3)'   },
    { key: 'AVAILABLE', label: `Available (${counts.AVAILABLE})`, dot: 'var(--green)'   },
    { key: 'OCCUPIED',  label: `Occupied (${counts.OCCUPIED})`,   dot: 'var(--amber)'   },
    { key: 'RESERVED',  label: `Reserved (${counts.RESERVED})`,   dot: 'var(--blue)'    },
    { key: 'CLEANING',  label: `Cleaning (${counts.CLEANING})`,   dot: 'var(--purple)'  },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        height: 52, background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0,
      }}>
        <div>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text1)' }}>Table Management</span>
          <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 8 }}>
            {counts.OCCUPIED} occupied · {counts.AVAILABLE} free
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => load(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
          borderRadius: 8, fontSize: 12, fontWeight: 600,
          background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer',
        }}>
          <RefreshCw size={12} /> Refresh
        </button>
        <button onClick={() => setShowAddTable(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
          borderRadius: 8, fontSize: 12, fontWeight: 700,
          background: 'var(--gold)', color: '#0B1120', border: 'none', cursor: 'pointer',
        }}>
          <Plus size={12} /> Add Table
        </button>
      </div>

      {/* Status filter bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
        background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0, flexWrap: 'wrap',
      }}>
        {STATUS_OPTS.map(({ key, label, dot }) => (
          <button key={key} onClick={() => setStatusFilter(key)} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s',
            background: statusFilter === key ? 'var(--surface3)' : 'var(--surface2)',
            border: `1px solid ${statusFilter === key ? 'var(--border2)' : 'var(--border)'}`,
            color: statusFilter === key ? 'var(--text1)' : 'var(--text3)',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, display: 'inline-block' }} />
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Section tabs */}
          {sections.length > 0 && (
            <div style={{
              display: 'flex', background: 'var(--bg)', borderBottom: '1px solid var(--border)',
              padding: '0 16px', flexShrink: 0,
            }}>
              {['ALL', ...sections].map(sec => (
                <button key={sec} onClick={() => setSectionFilter(sec)} style={{
                  padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: 'none', border: 'none',
                  borderBottom: `2.5px solid ${sectionFilter === sec ? 'var(--gold)' : 'transparent'}`,
                  color: sectionFilter === sec ? 'var(--gold)' : 'var(--text3)',
                  marginBottom: -1,
                }}>
                  {sec === 'ALL' ? 'All Floors' : sec}
                </button>
              ))}
            </div>
          )}

          {/* Table grid */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: 16,
            display: 'flex', flexWrap: 'wrap', gap: 10, alignContent: 'flex-start',
          }}>
            {loading ? (
              Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ width: 132, height: 104, borderRadius: 12 }} />
              ))
            ) : filtered.length === 0 ? (
              <div style={{ width: '100%', textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
                No tables match this filter
              </div>
            ) : (
              <>
                {filtered.map(t => (
                  <TableCard
                    key={t.id}
                    table={t}
                    isSelected={selected?.id === t.id}
                    onClick={() => setSelected(t)}
                  />
                ))}
                {/* Add table placeholder */}
                <button
                  onClick={() => setShowAddTable(true)}
                  style={{
                    width: 132, height: 104, borderRadius: 12, flexShrink: 0,
                    border: '2px dashed var(--border)', background: 'var(--surface)',
                    color: 'var(--text3)', fontSize: 11, display: 'flex',
                    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 4, cursor: 'pointer',
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--gold)'; el.style.color = 'var(--gold)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--text3)' }}
                >
                  <Plus size={22} />
                  <span>Add Table</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Detail sidebar */}
        <TableDetailSidebar
          table={selected}
          onStatusChange={handleStatusChange}
          onNavigateBilling={() => onNavigate('billing')}
        />
      </div>

      {showAddTable && (
        <AddTableModal
          onClose={() => setShowAddTable(false)}
          onAdded={() => { setShowAddTable(false); load(true); toast('Table added!', 'success') }}
          toast={toast}
        />
      )}
    </div>
  )
}

// ─── Add Table Modal ──────────────────────────────────────────────────────────

function AddTableModal({
  onClose, onAdded, toast,
}: {
  onClose: () => void
  onAdded: () => void
  toast: (msg: string, type: 'success' | 'info' | 'kitchen') => void
}) {
  const [number,   setNumber]   = useState('')
  const [capacity, setCapacity] = useState('')
  const [section,  setSection]  = useState('')
  const [saving,   setSaving]   = useState(false)

  const submit = async () => {
    const num = parseInt(number)
    const cap = parseInt(capacity)
    if (!num || num < 1) { toast('Enter a valid table number', 'info'); return }
    if (!cap || cap < 1) { toast('Enter a valid capacity', 'info'); return }
    setSaving(true)
    try {
      await tablesApi.create({ number: num, capacity: cap, section: section.trim() || undefined })
      onAdded()
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Failed to add table', 'info')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, width: 360, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text1)' }}>Add New Table</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Table Number *</label>
              <input type="number" min="1" placeholder="e.g. 12" value={number} onChange={e => setNumber(e.target.value)}
                style={{ width: '100%', height: 38, border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', fontSize: 14, fontWeight: 700, background: 'var(--surface2)', color: 'var(--text1)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Capacity *</label>
              <input type="number" min="1" placeholder="e.g. 4" value={capacity} onChange={e => setCapacity(e.target.value)}
                style={{ width: '100%', height: 38, border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', fontSize: 14, fontWeight: 700, background: 'var(--surface2)', color: 'var(--text1)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
          </div>
          {/* Quick capacity chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[2, 4, 6, 8, 10, 12].map(n => (
              <button key={n} onClick={() => setCapacity(String(n))} style={{
                padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: capacity === String(n) ? 'var(--gold)' : 'var(--surface2)',
                color: capacity === String(n) ? '#0B1120' : 'var(--text2)',
                border: `1px solid ${capacity === String(n) ? 'var(--gold)' : 'var(--border)'}`,
              }}>{n} seats</button>
            ))}
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Section / Floor</label>
            <input type="text" placeholder="e.g. Ground Floor, Terrace" value={section} onChange={e => setSection(e.target.value)}
              style={{ width: '100%', height: 36, border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', fontSize: 13, background: 'var(--surface2)', color: 'var(--text1)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text2)' }}>Cancel</button>
          <button onClick={submit} disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', background: 'var(--gold)', color: '#0B1120', border: 'none', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Adding…' : 'Add Table'}
          </button>
        </div>
      </div>
    </div>
  )
}
