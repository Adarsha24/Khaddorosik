'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, Download, Plus, X } from 'lucide-react'
import { customers as customersApi, ApiCustomer } from '@/lib/api'
import type { ToastType } from '@/types'

interface Props { toast: (msg: string, type: ToastType) => void }

type TagFilter = 'All' | 'VIP' | 'Loyal' | 'New' | 'Inactive'
type SortKey  = 'totalSpent' | 'totalVisits' | 'loyaltyPoints' | 'createdAt'

function getTag(c: ApiCustomer): TagFilter {
  if (c.loyaltyPoints >= 500 || parseFloat(c.totalSpent) >= 10000) return 'VIP'
  if (c.totalVisits >= 5) return 'Loyal'
  const daysSince = (Date.now() - new Date(c.createdAt).getTime()) / 86400000
  if (daysSince <= 30) return 'New'
  return 'Inactive'
}

const TAG_STYLE: Record<TagFilter, { bg: string; col: string }> = {
  All:      { bg: 'var(--surface3)',  col: 'var(--text3)'  },
  VIP:      { bg: 'var(--purple-bg)', col: 'var(--purple)' },
  Loyal:    { bg: 'var(--blue-bg)',   col: 'var(--blue)'   },
  New:      { bg: 'var(--green-bg)',  col: 'var(--green)'  },
  Inactive: { bg: 'var(--surface3)', col: 'var(--text3)'  },
}

const fmt = (n: number) =>
  `₹${new Intl.NumberFormat('en-IN').format(Math.round(n))}`

export default function CRMScreen({ toast }: Props) {
  const [customers, setCustomers] = useState<ApiCustomer[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [tagFilter, setTagFilter] = useState<TagFilter>('All')
  const [sortKey, setSortKey]     = useState<SortKey>('totalSpent')
  const [showAdd, setShowAdd]     = useState(false)
  const [page, setPage]           = useState(1)
  const PER_PAGE = 50

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await customersApi.list({ limit: '200' })
      setCustomers(res.data)
    } catch {
      toast('Failed to load customers', 'info')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    let list = customers
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c => c.name.toLowerCase().includes(q) || (c.phone ?? '').includes(q) || (c.email ?? '').toLowerCase().includes(q))
    }
    if (tagFilter !== 'All') list = list.filter(c => getTag(c) === tagFilter)
    return [...list].sort((a, b) => {
      if (sortKey === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortKey === 'totalSpent') return parseFloat(b.totalSpent) - parseFloat(a.totalSpent)
      return (b[sortKey] as number) - (a[sortKey] as number)
    })
  }, [customers, search, tagFilter, sortKey])

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  const tagCounts = useMemo(() => {
    const counts: Record<TagFilter, number> = { All: customers.length, VIP: 0, Loyal: 0, New: 0, Inactive: 0 }
    customers.forEach(c => { counts[getTag(c)]++ })
    return counts
  }, [customers])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--surface3)' }}>
      {/* Header */}
      <div style={{ height: 52, background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text1)' }}>Customer Relationship Management</span>
        <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 4 }}>{customers.length} customers</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => toast('Export coming soon', 'info')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)' }}>
          <Download size={12} /> Export
        </button>
        <button onClick={() => setShowAdd(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: 'var(--primary)', color: '#fff', border: 'none' }}>
          <Plus size={13} /> Add Customer
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name, phone, email…"
            style={{ height: 32, border: '1px solid var(--border)', borderRadius: 8, paddingLeft: 28, paddingRight: 10, fontSize: 12, background: 'var(--surface2)', outline: 'none', width: 240, color: 'var(--text1)', fontFamily: 'inherit' }}
          />
        </div>
        {(['All', 'VIP', 'Loyal', 'New', 'Inactive'] as TagFilter[]).map(f => (
          <button key={f} onClick={() => { setTagFilter(f); setPage(1) }}
            style={{
              padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              background: tagFilter === f ? TAG_STYLE[f].col : 'var(--surface2)',
              color: tagFilter === f ? '#fff' : 'var(--text2)',
              border: `1px solid ${tagFilter === f ? TAG_STYLE[f].col : 'var(--border)'}`,
            }}>
            {f} {tagFilter === f ? `(${tagCounts[f]})` : ''}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}
          style={{ height: 30, border: '1px solid var(--border)', borderRadius: 8, padding: '0 8px', fontSize: 11, background: 'var(--surface2)', color: 'var(--text2)', outline: 'none', cursor: 'pointer' }}>
          <option value="totalSpent">Sort: Total Spent</option>
          <option value="totalVisits">Sort: Visits</option>
          <option value="loyaltyPoints">Sort: Loyalty Points</option>
          <option value="createdAt">Sort: Newest</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8 }} />
            ))}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
              <tr style={{ background: 'var(--surface2)' }}>
                {['Customer', 'Phone', 'Email', 'Visits', 'Total Spent', 'Loyalty Pts', 'Tag', 'Member Since'].map(h => (
                  <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(c => {
                const tag = getTag(c)
                const ts  = TAG_STYLE[tag]
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface)'}>
                    <td style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--text1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: ts.bg, color: ts.col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        {c.name}
                      </div>
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text2)', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{c.phone ?? '—'}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text3)', fontSize: 11 }}>{c.email ?? '—'}</td>
                    <td style={{ padding: '10px 16px', fontWeight: 700, textAlign: 'center', color: 'var(--text1)' }}>{c.totalVisits}</td>
                    <td style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--primary)' }}>{fmt(parseFloat(c.totalSpent))}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: 'var(--amber-bg)', color: 'var(--amber)' }}>
                        {c.loyaltyPoints} pts
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: ts.bg, color: ts.col, textTransform: 'capitalize' }}>{tag}</span>
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text3)', fontSize: 11 }}>
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>No customers found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: page === 1 ? 'not-allowed' : 'pointer', border: '1px solid var(--border)', background: 'var(--surface2)', color: page === 1 ? 'var(--text3)' : 'var(--text1)' }}>
              ← Prev
            </button>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: page === totalPages ? 'not-allowed' : 'pointer', border: '1px solid var(--border)', background: 'var(--surface2)', color: page === totalPages ? 'var(--text3)' : 'var(--text1)' }}>
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAdd && <AddCustomerModal onClose={() => setShowAdd(false)} onAdded={() => { setShowAdd(false); load(true); toast('Customer added!', 'success') }} toast={toast} />}
    </div>
  )
}

// ─── Add Customer Modal ───────────────────────────────────────────────────────

function AddCustomerModal({ onClose, onAdded, toast }: { onClose: () => void; onAdded: () => void; toast: (msg: string, type: ToastType) => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const submit = async () => {
    if (!form.name.trim()) { toast('Name is required', 'info'); return }
    setSaving(true)
    try {
      await customersApi.create({ name: form.name.trim(), phone: form.phone || undefined, email: form.email || undefined })
      onAdded()
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Failed to add customer', 'info')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, width: 400, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text1)' }}>Add Customer</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Name *', key: 'name' as const, placeholder: 'Full name', type: 'text' },
            { label: 'Phone',  key: 'phone' as const, placeholder: '9876543210', type: 'tel' },
            { label: 'Email',  key: 'email' as const, placeholder: 'customer@email.com', type: 'email' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={set(f.key)}
                style={{ width: '100%', height: 36, border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', fontSize: 13, background: 'var(--surface2)', color: 'var(--text1)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text2)' }}>Cancel</button>
          <button onClick={submit} disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', background: 'var(--primary)', color: '#fff', border: 'none', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Add Customer'}
          </button>
        </div>
      </div>
    </div>
  )
}
