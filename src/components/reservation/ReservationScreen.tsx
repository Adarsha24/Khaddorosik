'use client'
import { useState, useEffect, useCallback } from 'react'
import { reservations as resApi, tables as tablesApi, ApiReservation, ApiTable } from '@/lib/api'

type Props = { toast: (msg: string, type: 'success' | 'info' | 'kitchen') => void }
type Tab = 'upcoming' | 'today' | 'all'
type Mode = 'list' | 'new'

const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  PENDING:   { color: 'var(--amber)',  bg: 'var(--amber-bg)',  label: 'Pending'   },
  CONFIRMED: { color: 'var(--green)',  bg: 'var(--green-bg)',  label: 'Confirmed' },
  CANCELLED: { color: 'var(--red)',    bg: 'var(--red-bg)',    label: 'Cancelled' },
  COMPLETED: { color: 'var(--blue)',   bg: 'var(--blue-bg)',   label: 'Completed' },
  NO_SHOW:   { color: 'var(--text3)',  bg: 'var(--surface2)',  label: 'No Show'   },
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  if (d.toDateString() === today.toDateString())    return 'Today'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function isToday(dateStr: string): boolean {
  return new Date(dateStr).toDateString() === new Date().toDateString()
}

function isUpcoming(dateStr: string): boolean {
  return new Date(dateStr) >= new Date(new Date().setHours(0, 0, 0, 0))
}

// ── New Reservation Form ──────────────────────────────────────────────────────
function NewReservationForm({ tableList, onSave, onCancel, toast }:
  { tableList: ApiTable[]; onSave: () => void; onCancel: () => void; toast: Props['toast'] }
) {
  const [form, setForm] = useState({
    guestName: '', guestPhone: '', date: '', time: '',
    partySize: 2, tableId: '', notes: '',
  })
  const [saving, setSaving] = useState(false)

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.guestName || !form.date || !form.time) {
      toast('Name, date and time are required', 'info'); return
    }
    setSaving(true)
    try {
      await resApi.create({
        guestName: form.guestName,
        guestPhone: form.guestPhone || undefined,
        date: form.date,
        time: form.time,
        partySize: form.partySize,
        tableId: form.tableId || undefined,
        notes: form.notes || undefined,
      })
      toast('Reservation created!', 'success')
      onSave()
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Failed to create reservation', 'info')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    background: 'var(--surface2)', border: '1px solid var(--border)',
    color: 'var(--text1)', fontSize: 13, outline: 'none', fontFamily: 'inherit',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase',
    letterSpacing: '0.5px', display: 'block', marginBottom: 4,
  }

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%' }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text1)', marginBottom: 20 }}>New Reservation</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Guest Name *</label>
          <input style={inputStyle} value={form.guestName} placeholder="e.g. Rahul Sharma"
            onChange={e => set('guestName', e.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>Phone</label>
          <input style={inputStyle} value={form.guestPhone} placeholder="+91 98765 43210"
            onChange={e => set('guestPhone', e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={labelStyle}>Date *</label>
            <input type="date" style={inputStyle} value={form.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => set('date', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Time *</label>
            <input type="time" style={inputStyle} value={form.time}
              onChange={e => set('time', e.target.value)} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Party Size</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {[1,2,3,4,5,6,8,10,12].map(n => (
              <button key={n} onClick={() => set('partySize', n)} style={{
                width: 34, height: 34, borderRadius: 8, fontSize: 12, fontWeight: 700,
                border: `1.5px solid ${form.partySize === n ? 'var(--gold)' : 'var(--border)'}`,
                background: form.partySize === n ? 'var(--gold-bg)' : 'var(--surface2)',
                color: form.partySize === n ? 'var(--gold)' : 'var(--text2)',
                cursor: 'pointer',
              }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Table (optional)</label>
          <select style={inputStyle} value={form.tableId} onChange={e => set('tableId', e.target.value)}>
            <option value="">Any available table</option>
            {tableList.filter(t => t.status === 'AVAILABLE').map(t => (
              <option key={t.id} value={t.id}>
                Table {t.number} — {t.capacity} seats {t.section ? `(${t.section})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Notes</label>
          <textarea style={{ ...inputStyle, height: 68, resize: 'none' }} value={form.notes}
            placeholder="Anniversary, allergies, special requests…"
            onChange={e => set('notes', e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button onClick={submit} disabled={saving} style={{
            flex: 2, padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 700,
            background: 'var(--gold)', border: 'none', color: '#0B1120', cursor: 'pointer',
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Saving…' : '📅 Confirm Reservation'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Reservation Detail Panel ──────────────────────────────────────────────────
function ReservationDetail({ res, onStatusChange }:
  { res: ApiReservation | null; onStatusChange: (id: string, status: string) => Promise<void> }
) {
  if (!res) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text3)' }}>
      Select a reservation
    </div>
  )

  const cfg = STATUS_CFG[res.status] ?? STATUS_CFG.PENDING
  const actions = ['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'].filter(s => s !== res.status)

  return (
    <div style={{ padding: 24, height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text1)' }}>{res.guestName}</div>
          {res.guestPhone && (
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>📞 {res.guestPhone}</div>
          )}
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 99,
          background: cfg.bg, color: cfg.color,
        }}>
          {cfg.label}
        </span>
      </div>

      {/* Details grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Date',       value: fmtDate(res.date)             },
          { label: 'Time',       value: res.time                       },
          { label: 'Party Size', value: `${res.partySize} guests`      },
          { label: 'Table',      value: res.table ? `T${res.table.number}` : '—' },
        ].map(({ label, value }) => (
          <div key={label} style={{
            padding: '10px 14px', borderRadius: 10,
            background: 'var(--surface2)', border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text1)', marginTop: 3 }}>{value}</div>
          </div>
        ))}
      </div>

      {res.notes && (
        <div style={{
          padding: '10px 14px', borderRadius: 10, background: 'var(--blue-bg)',
          border: '1px solid var(--blue)', marginBottom: 20,
        }}>
          <div style={{ fontSize: 10, color: 'var(--blue)', fontWeight: 700, marginBottom: 4 }}>NOTES</div>
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>{res.notes}</div>
        </div>
      )}

      {/* Status actions */}
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
        Update Status
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {actions.map(status => {
          const c = STATUS_CFG[status]
          return (
            <button key={status} onClick={() => onStatusChange(res.id, status)} style={{
              padding: '9px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: `1px solid ${c.color}`, background: c.bg, color: c.color,
              cursor: 'pointer', textAlign: 'left',
            }}>
              → Mark {c.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ReservationScreen({ toast }: Props) {
  const [resList, setResList]   = useState<ApiReservation[]>([])
  const [tableList, setTableList] = useState<ApiTable[]>([])
  const [selected, setSelected] = useState<ApiReservation | null>(null)
  const [tab, setTab]           = useState<Tab>('upcoming')
  const [mode, setMode]         = useState<Mode>('list')
  const [loading, setLoading]   = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [res, tbls] = await Promise.all([
        resApi.list(),
        tablesApi.list(),
      ])
      const items = (res as { data?: ApiReservation[] }).data ?? (res as unknown as ApiReservation[])
      setResList(items)
      setTableList(tbls)
    } catch {
      toast('Failed to load reservations', 'info')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const handleStatusChange = useCallback(async (id: string, status: string) => {
    await resApi.updateStatus(id, status)
    setResList(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev)
    toast(`Marked ${STATUS_CFG[status]?.label ?? status}`, 'success')
  }, [toast])

  const handleSaved = () => { setMode('list'); load() }

  const filtered = resList.filter(r => {
    if (tab === 'today')    return isToday(r.date)
    if (tab === 'upcoming') return isUpcoming(r.date)
    return true
  })

  const counts = {
    upcoming: resList.filter(r => isUpcoming(r.date)).length,
    today:    resList.filter(r => isToday(r.date)).length,
    all:      resList.length,
  }

  const TABS: { id: Tab; label: string; count: number }[] = [
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { id: 'today',    label: 'Today',    count: counts.today    },
    { id: 'all',      label: 'All',      count: counts.all      },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        height: 52, background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0,
      }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text1)' }}>Reservations</span>
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>
          {counts.today} today · {counts.upcoming} upcoming
        </span>
        <div style={{ flex: 1 }} />
        <button onClick={() => load()} style={{
          padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
          background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer',
        }}>
          ↻ Refresh
        </button>
        <button onClick={() => { setMode('new'); setSelected(null) }} style={{
          padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
          background: 'var(--gold)', border: 'none', color: '#0B1120', cursor: 'pointer',
        }}>
          + New Reservation
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        padding: '0 16px', flexShrink: 0,
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setMode('list') }} style={{
            padding: '10px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: 'none', border: 'none',
            borderBottom: `2.5px solid ${tab === t.id ? 'var(--gold)' : 'transparent'}`,
            color: tab === t.id ? 'var(--gold)' : 'var(--text3)',
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: -1,
          }}>
            {t.label}
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99,
              background: tab === t.id ? 'var(--gold-bg)' : 'var(--surface2)',
              color: tab === t.id ? 'var(--gold)' : 'var(--text3)',
            }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left: list */}
        <div style={{
          width: 320, borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0,
          background: 'var(--surface)',
        }}>
          {loading ? (
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 70, borderRadius: 10 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8, color: 'var(--text3)' }}>
              <span style={{ fontSize: 36, opacity: 0.3 }}>📅</span>
              <span style={{ fontSize: 13 }}>No reservations</span>
              <button onClick={() => setMode('new')} style={{
                marginTop: 8, padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: 'var(--gold)', color: '#0B1120', border: 'none', cursor: 'pointer',
              }}>
                + Add one
              </button>
            </div>
          ) : (
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filtered.map(r => {
                const cfg = STATUS_CFG[r.status] ?? STATUS_CFG.PENDING
                const isSel = selected?.id === r.id
                return (
                  <div key={r.id} onClick={() => { setSelected(r); setMode('list') }} style={{
                    padding: '12px 16px', cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    background: isSel ? 'var(--gold-bg)' : 'transparent',
                    borderLeft: `3px solid ${isSel ? 'var(--gold)' : 'transparent'}`,
                    transition: 'all 0.12s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>{r.guestName}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text3)' }}>
                      <span>📅 {fmtDate(r.date)}</span>
                      <span>🕐 {r.time}</span>
                      <span>👥 {r.partySize}</span>
                      {r.table && <span>🪑 T{r.table.number}</span>}
                    </div>
                    {r.notes && (
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.notes}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: detail or form */}
        <div style={{ flex: 1, background: 'var(--bg)', overflow: 'hidden' }}>
          {mode === 'new' ? (
            <NewReservationForm
              tableList={tableList}
              onSave={handleSaved}
              onCancel={() => setMode('list')}
              toast={toast}
            />
          ) : (
            <ReservationDetail res={selected} onStatusChange={handleStatusChange} />
          )}
        </div>
      </div>
    </div>
  )
}
