'use client'

import { useState, useEffect, useCallback } from 'react'
import { auditLogs as auditLogsApi, ApiAuditLog } from '@/lib/api'
import type { ToastType } from '@/types'

interface Props {
  toast: (msg: string, type: ToastType) => void
}

const ACTION_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  DISCOUNT_APPLIED: { label: 'Discount Applied', color: 'var(--green)', icon: '🏷️' },
  DISCOUNT_CHANGED: { label: 'Discount Changed', color: 'var(--amber)', icon: '🏷️' },
  ORDER_CANCELLED: { label: 'Order Cancelled', color: 'var(--red)', icon: '✕' },
  SHIFT_CLOSED: { label: 'Shift Closed', color: 'var(--text2)', icon: '💰' },
  SHIFT_CLOSED_WITH_VARIANCE: { label: 'Shift Closed — Variance', color: 'var(--red)', icon: '⚠️' },
  PAYROLL_CREATED: { label: 'Payroll Created', color: 'var(--blue)', icon: '💵' },
  PAYROLL_PAID: { label: 'Payroll Marked Paid', color: 'var(--green)', icon: '✓' },
  EMPLOYEE_ACTIVATED: { label: 'Employee Activated', color: 'var(--green)', icon: '👤' },
  EMPLOYEE_DEACTIVATED: { label: 'Employee Deactivated', color: 'var(--red)', icon: '👤' },
}

function formatDetails(details?: Record<string, unknown>): string {
  if (!details) return ''
  return Object.entries(details)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ')
}

export default function AuditLogScreen({ toast }: Props) {
  const [logs, setLogs] = useState<ApiAuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await auditLogsApi.list({ limit: '100' })
      setLogs(data)
    } catch {
      toast('Failed to load audit logs', 'info')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const filtered = filter === 'all' ? logs : logs.filter((l) => l.entityType === filter)
  const entityTypes = [...new Set(logs.map((l) => l.entityType))]

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text1)' }}>Activity Log</h1>
        <button
          onClick={load}
          style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: 'var(--surface2)', border: '1px solid var(--border)',
            color: 'var(--text2)', cursor: 'pointer',
          }}
        >
          ↻ Refresh
        </button>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>
        A record of sensitive actions — discounts, cancellations, payroll, and shift closes.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', ...entityTypes].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              padding: '5px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              background: filter === t ? 'var(--text1)' : 'var(--surface2)',
              color: filter === t ? 'var(--bg)' : 'var(--text2)',
              border: `1px solid ${filter === t ? 'var(--text1)' : 'var(--border)'}`,
            }}
          >
            {t === 'all' ? 'All' : t}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>No activity recorded yet</div>
        ) : (
          filtered.map((log, i) => {
            const meta = ACTION_LABELS[log.action] ?? { label: log.action, color: 'var(--text2)', icon: '•' }
            return (
              <div
                key={log.id}
                style={{
                  padding: '12px 16px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : undefined,
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{meta.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: meta.color }}>{meta.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>by {log.userName}</span>
                  </div>
                  {log.details && (
                    <div style={{ fontSize: 11, color: 'var(--text3)', wordBreak: 'break-word' }}>
                      {formatDetails(log.details)}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {new Date(log.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}