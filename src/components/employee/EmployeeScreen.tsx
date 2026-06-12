'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, X, RefreshCw } from 'lucide-react'
import { employees as employeesApi, ApiEmployee } from '@/lib/api'
import type { ToastType } from '@/types'

interface Props { toast: (msg: string, type: ToastType) => void }

const ROLE_COLORS: Record<string, { bg: string; col: string }> = {
  SUPER_ADMIN:   { bg: 'var(--purple-bg)', col: 'var(--purple)' },
  MANAGER:       { bg: 'var(--blue-bg)',   col: 'var(--blue)'   },
  CASHIER:       { bg: 'var(--primary-light)', col: 'var(--primary)' },
  WAITER:        { bg: 'var(--green-bg)',  col: 'var(--green)'  },
  HEAD_WAITER:   { bg: 'var(--green-bg)',  col: 'var(--green)'  },
  KITCHEN_STAFF: { bg: 'var(--amber-bg)',  col: 'var(--amber)'  },
  CHEF:          { bg: 'var(--amber-bg)',  col: 'var(--amber)'  },
}

const AVATAR_BG = ['var(--primary-light)', 'var(--blue-bg)', 'var(--purple-bg)', 'var(--green-bg)', 'var(--amber-bg)']
const AVATAR_COL = ['var(--primary)', 'var(--blue)', 'var(--purple)', 'var(--green)', 'var(--amber)']

const ROLES = ['MANAGER', 'CASHIER', 'WAITER', 'KITCHEN_STAFF', 'CHEF', 'HEAD_WAITER']

export default function EmployeesScreen({ toast }: Props) {
  const [staff, setStaff]       = useState<ApiEmployee[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<ApiEmployee | null>(null)
  const [showAdd, setShowAdd]   = useState(false)
  const [roleFilter, setRoleFilter] = useState('All')

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const data = await employeesApi.list()
      setStaff(data)
      // keep selected in sync
      setSelected(prev => prev ? (data.find(e => e.id === prev.id) ?? null) : null)
    } catch {
      toast('Failed to load staff', 'info')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const filtered = roleFilter === 'All' ? staff : staff.filter(e => e.role === roleFilter)

  const handleToggle = async (emp: ApiEmployee) => {
    try {
      await employeesApi.toggleActive(emp.id, !emp.active)
      await load(true)
      toast(`${emp.name} ${emp.active ? 'deactivated' : 'activated'}`, 'success')
    } catch {
      toast('Failed to update status', 'info')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--surface3)' }}>
      {/* Header */}
      <div style={{ height: 52, background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text1)' }}>Staff Management</span>
        <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 4 }}>{staff.length} staff</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => load(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text2)' }}>
          <RefreshCw size={12} />
        </button>
        <button onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: 'var(--primary)', color: '#fff', border: 'none' }}>
          <Plus size={13} /> Add Staff
        </button>
      </div>

      {/* Role filter tabs */}
      <div style={{ display: 'flex', background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 16px', flexShrink: 0 }}>
        {['All', ...ROLES].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)} style={{
            padding: '10px 16px', fontSize: 12, fontWeight: roleFilter === r ? 700 : 500, cursor: 'pointer',
            background: 'none', border: 'none',
            borderBottom: `2.5px solid ${roleFilter === r ? 'var(--primary)' : 'transparent'}`,
            color: roleFilter === r ? 'var(--primary)' : 'var(--text3)',
            marginBottom: -1,
          }}>
            {r === 'All' ? `All (${staff.length})` : `${r.charAt(0) + r.slice(1).toLowerCase()} (${staff.filter(e => e.role === r).length})`}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Staff list */}
        <div style={{ width: 280, background: 'var(--surface)', borderRight: '1px solid var(--border)', overflowY: 'auto', flexShrink: 0 }}>
          {loading ? (
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 8 }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>No staff found</div>
          ) : (
            filtered.map((e, idx) => {
              const rc = ROLE_COLORS[e.role] ?? ROLE_COLORS.WAITER
              const avBg  = AVATAR_BG[idx % AVATAR_BG.length]
              const avCol = AVATAR_COL[idx % AVATAR_COL.length]
              const isSelected = selected?.id === e.id
              return (
                <div key={e.id} onClick={() => setSelected(e)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', background: isSelected ? 'var(--primary-light)' : 'var(--surface)', transition: 'background 0.1s' }}
                  onMouseEnter={ev => { if (!isSelected) (ev.currentTarget as HTMLElement).style.background = 'var(--surface2)' }}
                  onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = isSelected ? 'var(--primary-light)' : 'var(--surface)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: avBg, color: avCol, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                    {e.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                    <div style={{ fontSize: 10, marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ padding: '1px 6px', borderRadius: 10, fontWeight: 700, background: rc.bg, color: rc.col }}>{e.role}</span>
                      {!e.active && <span style={{ color: 'var(--text3)' }}>inactive</span>}
                    </div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: e.active ? 'var(--green)' : 'var(--border2)', flexShrink: 0 }} />
                </div>
              )
            })
          )}
        </div>

        {/* Detail panel */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: 'var(--surface2)' }}>
          {selected ? (
            <EmployeeDetail emp={selected} onToggle={handleToggle} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text3)', fontSize: 13 }}>
              Select a staff member to view details
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <AddStaffModal
          onClose={() => setShowAdd(false)}
          onAdded={() => { setShowAdd(false); load(true); toast('Staff added!', 'success') }}
          toast={toast}
        />
      )}
    </div>
  )
}

// ─── Employee Detail ──────────────────────────────────────────────────────────

function EmployeeDetail({ emp, onToggle }: { emp: ApiEmployee; onToggle: (e: ApiEmployee) => void }) {
  const rc = ROLE_COLORS[emp.role] ?? ROLE_COLORS.WAITER

  return (
    <div style={{ maxWidth: 480 }}>
      {/* Profile card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: rc.bg, color: rc.col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, flexShrink: 0 }}>
          {emp.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text1)', marginBottom: 4 }}>{emp.name}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: rc.bg, color: rc.col }}>{emp.role}</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: emp.active ? 'var(--green-bg)' : 'var(--surface3)', color: emp.active ? 'var(--green)' : 'var(--text3)' }}>
              {emp.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <button onClick={() => onToggle(emp)} style={{
          padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          border: `1px solid ${emp.active ? 'var(--red, #e53e3e)' : 'var(--green)'}`,
          background: emp.active ? 'var(--red-bg, #fdecea)' : 'var(--green-bg)',
          color: emp.active ? 'var(--red, #e53e3e)' : 'var(--green)',
        }}>
          {emp.active ? 'Deactivate' : 'Activate'}
        </button>
      </div>

      {/* Contact info */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Contact</div>
        {[
          { label: 'Phone', val: emp.phone ?? '—' },
          { label: 'Email', val: emp.email ?? (emp.user?.email ?? '—') },
          { label: 'Login',  val: emp.user ? 'Has portal access' : 'No portal access' },
        ].map((row, i, arr) => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : undefined }}>
            <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>{row.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text1)' }}>{row.val}</span>
          </div>
        ))}
      </div>

      {/* Role permissions */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Role Permissions</div>
        {getRolePermissions(emp.role).map((perm, i, arr) => (
          <div key={perm.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : undefined }}>
            <span style={{ fontSize: 12, color: 'var(--text1)', fontWeight: 500 }}>{perm.label}</span>
            <span style={{ fontSize: 18 }}>{perm.allowed ? '✅' : '❌'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function getRolePermissions(role: string) {
  const ALL = [
    { label: 'Billing & Orders',    SUPER_ADMIN: true,  MANAGER: true,  CASHIER: true,  WAITER: true,  KITCHEN: false },
    { label: 'View Reports',        SUPER_ADMIN: true,  MANAGER: true,  CASHIER: false, WAITER: false, KITCHEN: false },
    { label: 'Apply Discounts',     SUPER_ADMIN: true,  MANAGER: true,  CASHIER: true,  WAITER: false, KITCHEN: false },
    { label: 'Manage Inventory',    SUPER_ADMIN: true,  MANAGER: true,  CASHIER: false, WAITER: false, KITCHEN: true  },
    { label: 'Cancel Orders',       SUPER_ADMIN: true,  MANAGER: true,  CASHIER: false, WAITER: false, KITCHEN: false },
    { label: 'Admin Settings',      SUPER_ADMIN: true,  MANAGER: false, CASHIER: false, WAITER: false, KITCHEN: false },
    { label: 'Kitchen Display',     SUPER_ADMIN: true,  MANAGER: true,  CASHIER: false, WAITER: false, KITCHEN: true  },
  ]
  return ALL.map(p => ({ label: p.label, allowed: (p as Record<string, boolean>)[role] ?? false }))
}

// ─── Add Staff Modal ──────────────────────────────────────────────────────────

function AddStaffModal({ onClose, onAdded, toast }: { onClose: () => void; onAdded: () => void; toast: (msg: string, type: ToastType) => void }) {
  const [form, setForm] = useState({ name: '', role: 'WAITER', userRole: 'WAITER', phone: '', email: '', password: '' })
  const [saving, setSaving] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const submit = async () => {
    if (!form.name.trim()) { toast('Name is required', 'info'); return }
    setSaving(true)
    try {
      await employeesApi.create({
        name: form.name.trim(),
        role: form.role,
        userRole: form.userRole,
        phone: form.phone || undefined,
        email: form.email || undefined,
        password: form.password || undefined,
      })
      onAdded()
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Failed to add staff', 'info')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, width: 420, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text1)' }}>Add Staff Member</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Name *</label>
            <input value={form.name} onChange={set('name')} placeholder="Full name"
              style={{ width: '100%', height: 36, border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', fontSize: 13, background: 'var(--surface2)', color: 'var(--text1)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Job Role</label>
              <select value={form.role} onChange={set('role')}
                style={{ width: '100%', height: 36, border: '1px solid var(--border)', borderRadius: 8, padding: '0 8px', fontSize: 12, background: 'var(--surface2)', color: 'var(--text1)', outline: 'none' }}>
                {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Portal Access</label>
              <select value={form.userRole} onChange={set('userRole')}
                style={{ width: '100%', height: 36, border: '1px solid var(--border)', borderRadius: 8, padding: '0 8px', fontSize: 12, background: 'var(--surface2)', color: 'var(--text1)', outline: 'none' }}>
                {['WAITER', 'CASHIER', 'KITCHEN', 'MANAGER'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          {[
            { label: 'Phone', key: 'phone' as const, placeholder: '9876543210', type: 'tel' },
            { label: 'Email (for login)', key: 'email' as const, placeholder: 'staff@restaurant.com', type: 'email' },
            { label: 'Password (if email given)', key: 'password' as const, placeholder: 'min. 8 chars', type: 'password' },
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
            {saving ? 'Saving…' : 'Add Staff'}
          </button>
        </div>
      </div>
    </div>
  )
}
