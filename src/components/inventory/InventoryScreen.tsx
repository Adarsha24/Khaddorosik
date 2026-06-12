'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, X, RefreshCw, AlertTriangle } from 'lucide-react'
import { inventory as inventoryApi, suppliers as suppliersApi, ApiInventoryItem, ApiSupplier } from '@/lib/api'
import type { ToastType } from '@/types'

interface Props {
  toast?: (msg: string, type: ToastType) => void
}

type Tab = 'raw' | 'suppliers'

export default function InventoryScreen({ toast }: Props) {
  const [items, setItems]         = useState<ApiInventoryItem[]>([])
  const [suppliers, setSuppliers] = useState<ApiSupplier[]>([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState<Tab>('raw')
  const [search, setSearch]       = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [lowStockOnly, setLowStockOnly]     = useState(false)
  const [adjustItem, setAdjustItem]         = useState<ApiInventoryItem | null>(null)
  const [showAddItem, setShowAddItem]       = useState(false)

  const showToast = (msg: string, type: ToastType = 'success') => toast?.(msg, type)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [invRes, supRes] = await Promise.all([
        inventoryApi.list({ limit: '100' }),
        suppliersApi.list(),
      ])
      setItems(invRes.data)
      setSuppliers(supRes)
    } catch {
      showToast('Failed to load inventory', 'info')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i.category).filter(Boolean)))], [items])
  const lowStockCount = items.filter(i => i.isLowStock).length

  const filtered = useMemo(() => {
    let list = items
    if (search.trim()) list = list.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    if (categoryFilter !== 'All') list = list.filter(i => i.category === categoryFilter)
    if (lowStockOnly) list = list.filter(i => i.isLowStock)
    return list
  }, [items, search, categoryFilter, lowStockOnly])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ height: 52, background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text1)' }}>Inventory Management</span>
        <div style={{ flex: 1 }} />
        {lowStockCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--red-bg, #fdecea)', color: 'var(--red, #e53e3e)', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
            <AlertTriangle size={13} /> {lowStockCount} Low Stock
          </div>
        )}
        <button onClick={() => load(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text2)' }}>
          <RefreshCw size={12} />
        </button>
        <button onClick={() => setShowAddItem(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: 'var(--primary)', color: '#fff', border: 'none' }}>
          <Plus size={13} /> Add Item
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 16px', flexShrink: 0 }}>
        {([{ id: 'raw', label: 'Stock Items' }, { id: 'suppliers', label: `Suppliers (${suppliers.length})` }] as { id: Tab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '11px 18px', fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer',
            background: 'none', border: 'none',
            borderBottom: `2.5px solid ${tab === t.id ? 'var(--primary)' : 'transparent'}`,
            color: tab === t.id ? 'var(--primary)' : 'var(--text3)',
            marginBottom: -1,
          }}>{t.label}</button>
        ))}
      </div>

      {/* Toolbar (stock tab only) */}
      {tab === 'raw' && (
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text3)' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search item…"
              style={{ height: 32, border: '1px solid var(--border)', borderRadius: 8, paddingLeft: 28, paddingRight: 10, fontSize: 12, background: 'var(--surface2)', color: 'var(--text1)', outline: 'none', width: 220, fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)} style={{
                padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)',
                background: categoryFilter === cat ? 'var(--text1)' : 'var(--surface2)',
                color: categoryFilter === cat ? '#fff' : 'var(--text2)',
              }}>{cat}</button>
            ))}
          </div>
          <button onClick={() => setLowStockOnly(!lowStockOnly)} style={{
            padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            background: lowStockOnly ? 'var(--red-bg, #fdecea)' : 'var(--surface)',
            color: lowStockOnly ? 'var(--red, #e53e3e)' : 'var(--text3)',
            border: `1px solid ${lowStockOnly ? 'var(--red, #e53e3e)' : 'var(--border)'}`,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <AlertTriangle size={11} /> Low Stock Only
          </button>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 8 }} />)}
          </div>
        ) : tab === 'raw' ? (
          <StockTable items={filtered} onAdjust={setAdjustItem} />
        ) : (
          <SuppliersTable suppliers={suppliers} />
        )}
      </div>

      {/* Adjust Modal */}
      {adjustItem && (
        <AdjustStockModal
          item={adjustItem}
          onClose={() => setAdjustItem(null)}
          onDone={() => { setAdjustItem(null); load(true); showToast('Stock updated!', 'success') }}
          toast={toast ?? (() => {})}
        />
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <AddItemModal
          suppliers={suppliers}
          onClose={() => setShowAddItem(false)}
          onDone={() => { setShowAddItem(false); load(true); showToast('Item added!', 'success') }}
          toast={toast ?? (() => {})}
        />
      )}
    </div>
  )
}

// ─── Stock Table ──────────────────────────────────────────────────────────────

function StockTable({ items, onAdjust }: { items: ApiInventoryItem[]; onAdjust: (item: ApiInventoryItem) => void }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <tr style={{ background: 'var(--surface2)' }}>
          {['Item', 'Category', 'Current Stock', 'Reorder Level', 'Supplier', 'Last Updated', 'Actions'].map(h => (
            <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map(item => {
          const stock = parseFloat(item.currentStock)
          const reorder = parseFloat(item.reorderLevel)
          const pct = reorder > 0 ? Math.min((stock / (reorder * 2)) * 100, 100) : 100
          return (
            <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', background: item.isLowStock ? 'var(--red-bg, rgba(229,62,62,0.04))' : 'var(--surface)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = item.isLowStock ? 'var(--red-bg, rgba(229,62,62,0.04))' : 'var(--surface)'}>
              <td style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--text1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {item.isLowStock && <AlertTriangle size={12} color="var(--red, #e53e3e)" />}
                  {item.name}
                </div>
              </td>
              <td style={{ padding: '10px 16px', color: 'var(--text3)', fontSize: 11 }}>{item.category}</td>
              <td style={{ padding: '10px 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontWeight: 700, color: item.isLowStock ? 'var(--red, #e53e3e)' : 'var(--text1)', fontSize: 13 }}>
                    {stock.toFixed(2)} {item.unit}
                  </span>
                  <div style={{ height: 4, width: 80, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pct < 30 ? 'var(--red, #e53e3e)' : pct < 60 ? 'var(--amber)' : 'var(--green)', borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                </div>
              </td>
              <td style={{ padding: '10px 16px', color: 'var(--text2)', fontSize: 12 }}>{reorder.toFixed(2)} {item.unit}</td>
              <td style={{ padding: '10px 16px', color: 'var(--text3)', fontSize: 11 }}>{item.supplier?.name ?? '—'}</td>
              <td style={{ padding: '10px 16px', color: 'var(--text3)', fontSize: 11 }}>
                {new Date(item.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </td>
              <td style={{ padding: '10px 16px' }}>
                <button onClick={() => onAdjust(item)} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text2)' }}>
                  Adjust Stock
                </button>
              </td>
            </tr>
          )
        })}
        {items.length === 0 && (
          <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: 'var(--text3)' }}>No items found</td></tr>
        )}
      </tbody>
    </table>
  )
}

// ─── Suppliers Table ──────────────────────────────────────────────────────────

function SuppliersTable({ suppliers }: { suppliers: ApiSupplier[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead style={{ position: 'sticky', top: 0 }}>
        <tr style={{ background: 'var(--surface2)' }}>
          {['Supplier', 'Contact', 'Email', 'Phone', 'Items Linked', 'Status'].map(h => (
            <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border)' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {suppliers.map(s => (
          <tr key={s.id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface)'}>
            <td style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--text1)' }}>{s.name}</td>
            <td style={{ padding: '10px 16px', color: 'var(--text2)' }}>{s.contactName ?? '—'}</td>
            <td style={{ padding: '10px 16px', color: 'var(--text3)', fontSize: 11 }}>{s.email ?? '—'}</td>
            <td style={{ padding: '10px 16px', color: 'var(--text2)', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{s.phone ?? '—'}</td>
            <td style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--blue)' }}>{s._count?.inventory ?? 0}</td>
            <td style={{ padding: '10px 16px' }}>
              <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: s.active ? 'var(--green-bg)' : 'var(--surface3)', color: s.active ? 'var(--green)' : 'var(--text3)' }}>
                {s.active ? 'Active' : 'Inactive'}
              </span>
            </td>
          </tr>
        ))}
        {suppliers.length === 0 && (
          <tr><td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: 'var(--text3)' }}>No suppliers found</td></tr>
        )}
      </tbody>
    </table>
  )
}

// ─── Adjust Stock Modal ───────────────────────────────────────────────────────

function AdjustStockModal({ item, onClose, onDone, toast }: { item: ApiInventoryItem; onClose: () => void; onDone: () => void; toast: (msg: string, type: ToastType) => void }) {
  const [qty, setQty]       = useState('')
  const [type, setType]     = useState<'IN' | 'OUT' | 'SET'>('IN')
  const [notes, setNotes]   = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    const q = parseFloat(qty)
    if (!qty || isNaN(q) || q <= 0) { toast('Enter a valid quantity', 'info'); return }
    setSaving(true)
    try {
      await inventoryApi.adjust(item.id, q, type, notes || undefined)
      onDone()
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Adjustment failed', 'info')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, width: 400, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text1)' }}>Adjust Stock</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}><X size={18} /></button>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
          {item.name} — current: <strong>{parseFloat(item.currentStock).toFixed(2)} {item.unit}</strong>
        </div>

        {/* Type selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {(['IN', 'OUT', 'SET'] as const).map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: type === t ? (t === 'OUT' ? 'var(--red, #e53e3e)' : t === 'IN' ? 'var(--green)' : 'var(--blue)') : 'var(--surface2)',
              color: type === t ? '#fff' : 'var(--text2)',
              border: `1px solid ${type === t ? 'transparent' : 'var(--border)'}`,
            }}>
              {t === 'IN' ? '+ Add Stock' : t === 'OUT' ? '- Remove' : '= Set Level'}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>
            Quantity ({item.unit})
          </label>
          <input type="number" min="0" step="0.01" placeholder="0.00" value={qty} onChange={e => setQty(e.target.value)}
            style={{ width: '100%', height: 38, border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', fontSize: 14, fontWeight: 700, background: 'var(--surface2)', color: 'var(--text1)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Notes (optional)</label>
          <input type="text" placeholder="Reason for adjustment…" value={notes} onChange={e => setNotes(e.target.value)}
            style={{ width: '100%', height: 34, border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', fontSize: 12, background: 'var(--surface2)', color: 'var(--text1)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text2)' }}>Cancel</button>
          <button onClick={submit} disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', background: 'var(--primary)', color: '#fff', border: 'none', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Add Item Modal ───────────────────────────────────────────────────────────

function AddItemModal({ suppliers, onClose, onDone, toast }: { suppliers: ApiSupplier[]; onClose: () => void; onDone: () => void; toast: (msg: string, type: ToastType) => void }) {
  const [form, setForm] = useState({ name: '', category: '', unit: 'kg', currentStock: '', reorderLevel: '', supplierId: '' })
  const [saving, setSaving] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const submit = async () => {
    if (!form.name.trim() || !form.unit.trim()) { toast('Name and unit are required', 'info'); return }
    setSaving(true)
    try {
      await inventoryApi.create({
        name: form.name.trim(),
        category: form.category || 'General',
        unit: form.unit,
        currentStock: parseFloat(form.currentStock) || 0,
        reorderLevel: parseFloat(form.reorderLevel) || 0,
        supplierId: form.supplierId || undefined,
      })
      onDone()
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Failed to add item', 'info')
    } finally {
      setSaving(false)
    }
  }

  const UNITS = ['kg', 'g', 'L', 'ml', 'pcs', 'dozen', 'box', 'pack']

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, width: 440, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text1)' }}>Add Inventory Item</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Item Name *', key: 'name' as const, placeholder: 'e.g. Basmati Rice', type: 'text' as const },
            { label: 'Category',    key: 'category' as const, placeholder: 'e.g. Grains', type: 'text' as const },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={set(f.key)}
                style={{ width: '100%', height: 36, border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', fontSize: 13, background: 'var(--surface2)', color: 'var(--text1)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Unit</label>
              <select value={form.unit} onChange={set('unit')}
                style={{ width: '100%', height: 36, border: '1px solid var(--border)', borderRadius: 8, padding: '0 8px', fontSize: 12, background: 'var(--surface2)', color: 'var(--text1)', outline: 'none' }}>
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Current Stock</label>
              <input type="number" min="0" step="0.01" placeholder="0" value={form.currentStock} onChange={set('currentStock')}
                style={{ width: '100%', height: 36, border: '1px solid var(--border)', borderRadius: 8, padding: '0 10px', fontSize: 13, background: 'var(--surface2)', color: 'var(--text1)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Reorder At</label>
              <input type="number" min="0" step="0.01" placeholder="0" value={form.reorderLevel} onChange={set('reorderLevel')}
                style={{ width: '100%', height: 36, border: '1px solid var(--border)', borderRadius: 8, padding: '0 10px', fontSize: 13, background: 'var(--surface2)', color: 'var(--text1)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
          </div>
          {suppliers.length > 0 && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Supplier (optional)</label>
              <select value={form.supplierId} onChange={set('supplierId')}
                style={{ width: '100%', height: 36, border: '1px solid var(--border)', borderRadius: 8, padding: '0 8px', fontSize: 12, background: 'var(--surface2)', color: 'var(--text1)', outline: 'none' }}>
                <option value="">— None —</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text2)' }}>Cancel</button>
          <button onClick={submit} disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', background: 'var(--primary)', color: '#fff', border: 'none', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  )
}
