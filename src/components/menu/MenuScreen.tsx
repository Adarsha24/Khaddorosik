'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, Plus, X, Pencil, Trash2, Star } from 'lucide-react'
import { menu as menuApi, ApiMenuItem, ApiCategory } from '@/lib/api'
import type { ToastType } from '@/types'

interface Props { toast: (msg: string, type: ToastType) => void }

const fmt = (n: number) => `₹${new Intl.NumberFormat('en-IN').format(n)}`

const inputStyle: React.CSSProperties = {
  width: '100%', height: 36, border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px',
  fontSize: 13, background: 'var(--surface2)', color: 'var(--text1)', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
}
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase',
  letterSpacing: '0.04em', display: 'block', marginBottom: 4,
}

export default function MenuScreen({ toast }: Props) {
  const [items, setItems] = useState<ApiMenuItem[]>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<string>('all')
  const [editingItem, setEditingItem] = useState<ApiMenuItem | 'new' | null>(null)
  const [editingCat, setEditingCat] = useState<ApiCategory | 'new' | null>(null)
  const [deletingCat, setDeletingCat] = useState<ApiCategory | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const cats = await menuApi.categories()
      // Fetch every page so large menus are complete
      const all: ApiMenuItem[] = []
      let page = 1
      let totalPages = 1
      do {
        const res = await menuApi.items({ limit: '200', page: String(page) })
        all.push(...res.data)
        totalPages = res.meta.totalPages
        page++
      } while (page <= totalPages && page <= 25)
      setCategories(cats)
      setItems(all)
    } catch {
      toast('Failed to load menu', 'info')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const itemCounts = useMemo(() => {
    const m: Record<string, number> = {}
    items.forEach(i => { m[i.categoryId] = (m[i.categoryId] ?? 0) + 1 })
    return m
  }, [items])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter(i =>
      (catFilter === 'all' || i.categoryId === catFilter) &&
      (!q || i.name.toLowerCase().includes(q)),
    )
  }, [items, search, catFilter])

  const toggleAvailable = async (item: ApiMenuItem) => {
    const next = !item.available
    // optimistic update
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, available: next } : i))
    try {
      await menuApi.toggleAvailability(item.id, next)
    } catch (e) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, available: item.available } : i))
      toast(e instanceof Error ? e.message : 'Could not update item', 'info')
    }
  }

  const confirmDeleteCategory = async () => {
    if (!deletingCat) return
    setBusy(true)
    try {
      await menuApi.deleteCategory(deletingCat.id)
      toast(`${deletingCat.name} deleted`, 'success')
      if (catFilter === deletingCat.id) setCatFilter('all')
      setDeletingCat(null)
      load(true)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not delete category', 'info')
    } finally {
      setBusy(false)
    }
  }

  const catName = (id: string) => categories.find(c => c.id === id)?.name ?? '—'

  return (
    <div className="responsive-screen menu-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--surface3)' }}>
      {/* Header */}
      <div style={{ height: 52, background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text1)' }}>Menu Management</span>
        <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 4 }}>{items.length} items · {categories.length} categories</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setEditingCat('new')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)' }}>
          <Plus size={12} /> Category
        </button>
        <button onClick={() => {
          if (categories.length === 0) { toast('Create a category first', 'info'); return }
          setEditingItem('new')
        }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: 'var(--primary)', color: '#fff', border: 'none' }}>
          <Plus size={13} /> Add Item
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {/* Categories */}
        <div style={{ width: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)', overflowY: 'auto', flexShrink: 0, padding: 8 }}>
          {[{ id: 'all', name: 'All items', count: items.length } as const].map(a => (
            <button key={a.id} onClick={() => setCatFilter('all')}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', textAlign: 'left',
                background: catFilter === 'all' ? 'var(--primary)' : 'transparent', color: catFilter === 'all' ? '#fff' : 'var(--text1)' }}>
              <span>{a.name}</span><span>{a.count}</span>
            </button>
          ))}
          {categories.map(c => {
            const active = catFilter === c.id
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', borderRadius: 8, marginTop: 2, background: active ? 'var(--primary)' : 'transparent' }}>
                <button onClick={() => setCatFilter(c.id)}
                  style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'space-between', gap: 6, padding: '8px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'transparent', textAlign: 'left', color: active ? '#fff' : 'var(--text1)' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                  <span>{itemCounts[c.id] ?? 0}</span>
                </button>
                <button title="Rename" onClick={() => setEditingCat(c)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: active ? '#fff' : 'var(--text3)' }}><Pencil size={12} /></button>
                <button title="Delete" onClick={() => setDeletingCat(c)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px 4px 2px', color: active ? '#fff' : 'var(--red, #ef4444)' }}><Trash2 size={12} /></button>
              </div>
            )
          })}
          {!loading && categories.length === 0 && (
            <div style={{ padding: 12, fontSize: 12, color: 'var(--text3)' }}>No categories yet. Add one to get started.</div>
          )}
        </div>

        {/* Items */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '8px 16px', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: 260 }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items…"
                style={{ ...inputStyle, height: 32, paddingLeft: 28, fontSize: 12 }} />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8 }} />)}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr style={{ background: 'var(--surface2)' }}>
                    {['Item', 'Category', 'Price', 'Cost', 'Available', ''].map((h, i) => (
                      <th key={i} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(i => (
                    <tr key={i.id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', opacity: i.available ? 1 : 0.55 }}>
                      <td style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--text1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span title={i.veg ? 'Veg' : 'Non-veg'} style={{ width: 12, height: 12, border: `1.5px solid ${i.veg ? 'var(--green)' : 'var(--red, #ef4444)'}`, borderRadius: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: i.veg ? 'var(--green)' : 'var(--red, #ef4444)' }} />
                          </span>
                          {i.name}
                          {i.bestSeller && <Star size={12} style={{ color: 'var(--amber)', fill: 'var(--amber)' }} />}
                        </div>
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--text2)' }}>{i.category?.name ?? catName(i.categoryId)}</td>
                      <td style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--primary)' }}>{fmt(parseFloat(i.price))}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--text3)' }}>{i.costPrice ? fmt(parseFloat(i.costPrice)) : '—'}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <button onClick={() => toggleAvailable(i)} title={i.available ? 'Hide from menu' : 'Show on menu'}
                          style={{ padding: '2px 10px', borderRadius: 10, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: 'none',
                            background: i.available ? 'var(--green-bg)' : 'var(--surface3)', color: i.available ? 'var(--green)' : 'var(--text3)' }}>
                          {i.available ? 'Available' : 'Hidden'}
                        </button>
                      </td>
                      <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                        <button title="Edit" onClick={() => setEditingItem(i)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 4 }}><Pencil size={14} /></button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 60, textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>No items found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {editingItem && (
        <ItemModal
          item={editingItem === 'new' ? undefined : editingItem}
          categories={categories}
          defaultCategoryId={catFilter !== 'all' ? catFilter : categories[0]?.id}
          toast={toast}
          onClose={() => setEditingItem(null)}
          onSaved={(isNew) => { setEditingItem(null); load(true); toast(isNew ? 'Item added' : 'Item updated', 'success') }}
        />
      )}
      {editingCat && (
        <CategoryModal
          category={editingCat === 'new' ? undefined : editingCat}
          nextOrder={categories.length}
          toast={toast}
          onClose={() => setEditingCat(null)}
          onSaved={(isNew) => { setEditingCat(null); load(true); toast(isNew ? 'Category added' : 'Category updated', 'success') }}
        />
      )}
      {deletingCat && (
        <ModalShell title="Delete category?" onClose={() => !busy && setDeletingCat(null)} width={380}>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
            <b>{deletingCat.name}</b> will be removed.
            {(itemCounts[deletingCat.id] ?? 0) > 0
              ? ` It still has ${itemCounts[deletingCat.id]} item(s), so it can't be deleted until you move or hide them.`
              : ' This cannot be undone.'}
          </div>
          <FooterButtons
            onCancel={() => setDeletingCat(null)} onConfirm={confirmDeleteCategory}
            confirmLabel={busy ? 'Deleting…' : 'Delete'} disabled={busy} danger
          />
        </ModalShell>
      )}
    </div>
  )
}

// ─── Shared modal bits ────────────────────────────────────────────────────────

function ModalShell({ title, onClose, width = 440, children }: { title: string; onClose: () => void; width?: number; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, width, maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text1)' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function FooterButtons({ onCancel, onConfirm, confirmLabel, disabled, danger }: { onCancel: () => void; onConfirm: () => void; confirmLabel: string; disabled?: boolean; danger?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
      <button onClick={onCancel} disabled={disabled}
        style={{ flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text2)' }}>Cancel</button>
      <button onClick={onConfirm} disabled={disabled}
        style={{ flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', border: 'none', color: '#fff', opacity: disabled ? 0.7 : 1,
          background: danger ? 'var(--red, #ef4444)' : 'var(--primary)' }}>{confirmLabel}</button>
    </div>
  )
}

// ─── Item modal (add / edit) ──────────────────────────────────────────────────

function ItemModal({ item, categories, defaultCategoryId, toast, onClose, onSaved }: {
  item?: ApiMenuItem; categories: ApiCategory[]; defaultCategoryId?: string
  toast: (msg: string, type: ToastType) => void; onClose: () => void; onSaved: (isNew: boolean) => void
}) {
  const [form, setForm] = useState({
    name: item?.name ?? '',
    categoryId: item?.categoryId ?? defaultCategoryId ?? '',
    price: item ? String(parseFloat(item.price)) : '',
    costPrice: item?.costPrice ? String(parseFloat(item.costPrice)) : '',
    description: item?.description ?? '',
    imageUrl: item?.imageUrl ?? '',
    veg: item?.veg ?? true,
    bestSeller: item?.bestSeller ?? false,
    available: item?.available ?? true,
  })
  const [saving, setSaving] = useState(false)
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm(p => ({ ...p, [k]: v }))

  const submit = async () => {
    const name = form.name.trim()
    const price = Number(form.price)
    const costPrice = form.costPrice.trim() === '' ? 0 : Number(form.costPrice)
    if (!name) { toast('Item name is required', 'info'); return }
    if (!form.categoryId) { toast('Choose a category', 'info'); return }
    if (!Number.isFinite(price) || price <= 0) { toast('Enter a valid price', 'info'); return }
    if (!Number.isFinite(costPrice) || costPrice < 0) { toast('Enter a valid cost price', 'info'); return }
    const imageUrl = form.imageUrl.trim()
    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) { toast('Image URL must start with http(s)://', 'info'); return }

    const payload = {
      categoryId: form.categoryId, name, price, costPrice, veg: form.veg,
      description: form.description.trim() || undefined,
      imageUrl: imageUrl || undefined,
      available: form.available, bestSeller: form.bestSeller,
    }
    setSaving(true)
    try {
      if (item) await menuApi.updateItem(item.id, payload)
      else await menuApi.createItem(payload)
      onSaved(!item)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to save item', 'info')
    } finally {
      setSaving(false)
    }
  }

  const check = (label: string, k: 'veg' | 'bestSeller' | 'available') => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)', cursor: 'pointer' }}>
      <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)} /> {label}
    </label>
  )

  return (
    <ModalShell title={item ? 'Edit Item' : 'Add Item'} onClose={() => !saving && onClose()}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={labelStyle}>Name *</label>
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Paneer Tikka" />
        </div>
        <div>
          <label style={labelStyle}>Category *</label>
          <select style={inputStyle} value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Price (₹) *</label>
            <input style={inputStyle} type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Cost price (₹)</label>
            <input style={inputStyle} type="number" min="0" step="0.01" value={form.costPrice} onChange={e => set('costPrice', e.target.value)} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <input style={inputStyle} value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Image URL</label>
          <input style={inputStyle} value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://…" />
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {check('Vegetarian', 'veg')}
          {check('Best seller', 'bestSeller')}
          {check('Available', 'available')}
        </div>
      </div>
      <FooterButtons onCancel={onClose} onConfirm={submit} disabled={saving} confirmLabel={saving ? 'Saving…' : item ? 'Save Changes' : 'Add Item'} />
    </ModalShell>
  )
}

// ─── Category modal (add / rename) ────────────────────────────────────────────

function CategoryModal({ category, nextOrder, toast, onClose, onSaved }: {
  category?: ApiCategory; nextOrder: number
  toast: (msg: string, type: ToastType) => void; onClose: () => void; onSaved: (isNew: boolean) => void
}) {
  const [name, setName] = useState(category?.name ?? '')
  const [order, setOrder] = useState(String(category?.displayOrder ?? nextOrder))
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    const n = name.trim()
    const o = Math.trunc(Number(order))
    if (!n) { toast('Category name is required', 'info'); return }
    if (!Number.isFinite(o)) { toast('Display order must be a number', 'info'); return }
    setSaving(true)
    try {
      if (category) await menuApi.updateCategory(category.id, { name: n, displayOrder: o, active: category.active })
      else await menuApi.createCategory({ name: n, displayOrder: o })
      onSaved(!category)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to save category', 'info')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell title={category ? 'Edit Category' : 'Add Category'} onClose={() => !saving && onClose()} width={380}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={labelStyle}>Name *</label>
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} autoFocus
            onKeyDown={e => { if (e.key === 'Enter') submit() }} />
        </div>
        <div>
          <label style={labelStyle}>Display order</label>
          <input style={inputStyle} type="number" value={order} onChange={e => setOrder(e.target.value)} />
          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>Lower numbers appear first in billing.</div>
        </div>
      </div>
      <FooterButtons onCancel={onClose} onConfirm={submit} disabled={saving} confirmLabel={saving ? 'Saving…' : category ? 'Save Changes' : 'Add Category'} />
    </ModalShell>
  )
}