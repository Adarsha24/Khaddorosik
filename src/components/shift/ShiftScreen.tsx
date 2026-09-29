'use client'

import { useState, useEffect, useCallback } from 'react'
import { shifts as shiftsApi, ApiShift, ApiShiftReconciliation } from '@/lib/api'
import type { ToastType } from '@/types'

interface Props {
  toast: (msg: string, type: ToastType) => void
}

export default function ShiftScreen({ toast }: Props) {
  const [openShift, setOpenShift] = useState<ApiShift | null>(null)
  const [reconciliation, setReconciliation] = useState<ApiShiftReconciliation | null>(null)
  const [loading, setLoading] = useState(true)

  const [openingCash, setOpeningCash] = useState('')
  const [opening, setOpening] = useState(false)

  const [closingCash, setClosingCash] = useState('')
  const [closing, setClosing] = useState(false)
  const [closeResult, setCloseResult] = useState<(ApiShift & ApiShiftReconciliation) | null>(null)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await shiftsApi.current()
      const active = res.shifts.find((s) => s.status === 'OPEN') ?? null
      setOpenShift(active)
      setReconciliation(res.reconciliation)
    } catch {
      toast('Failed to load shift data', 'info')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  // Refresh reconciliation every 20s while a shift is open, so the
  // expected-cash figure stays current as sales come in.
  useEffect(() => {
    if (!openShift) return
    const id = setInterval(() => load(true), 20000)
    return () => clearInterval(id)
  }, [openShift, load])

  const handleOpen = async () => {
    if (!openingCash || Number(openingCash) < 0) {
      toast('Enter a valid opening cash amount', 'info')
      return
    }
    setOpening(true)
    try {
      await shiftsApi.open(Number(openingCash))
      toast('Shift opened', 'success')
      setOpeningCash('')
      await load()
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Failed to open shift', 'info')
    } finally {
      setOpening(false)
    }
  }

  const handleClose = async () => {
    if (!closingCash || Number(closingCash) < 0) {
      toast('Enter the actual counted cash amount', 'info')
      return
    }
    setClosing(true)
    try {
      const result = await shiftsApi.close(Number(closingCash))
      setCloseResult(result)
      toast('Shift closed', 'success')
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Failed to close shift', 'info')
    } finally {
      setClosing(false)
    }
  }

  const startNewShift = () => {
    setCloseResult(null)
    setClosingCash('')
    load()
  }

  if (loading) {
    return (
      <div style={{ padding: 24, color: 'var(--text3)' }}>Loading shift data…</div>
    )
  }

  // ── Post-close summary ──────────────────────────────────────────────
  if (closeResult) {
    const variance = closeResult.variance ?? 0
    const isExact = Math.abs(variance) < 0.01
    const isShort = variance < -0.01

    return (
      <div style={{ padding: 24, maxWidth: 480 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text1)', marginBottom: 20 }}>
          Shift Closed
        </h1>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 20, marginBottom: 16,
        }}>
          {[
            { label: 'Opening Cash', value: `₹${Number(closeResult.openingCash).toLocaleString('en-IN')}` },
            { label: 'Cash Sales Collected', value: `₹${closeResult.cashCollected.toLocaleString('en-IN')}` },
            { label: 'Expected Cash', value: `₹${closeResult.expectedCash.toLocaleString('en-IN')}` },
            { label: 'Actual Counted Cash', value: `₹${Number(closeResult.closingCash).toLocaleString('en-IN')}` },
          ].map((row) => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', padding: '8px 0',
              borderBottom: '1px solid var(--border)', fontSize: 13,
            }}>
              <span style={{ color: 'var(--text2)' }}>{row.label}</span>
              <span style={{ fontWeight: 700, color: 'var(--text1)' }}>{row.value}</span>
            </div>
          ))}

          <div style={{
            marginTop: 16, padding: 14, borderRadius: 10, textAlign: 'center',
            background: isExact ? 'var(--green-bg)' : 'var(--red-bg)',
          }}>
            <div style={{ fontSize: 12, color: isExact ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
              {isExact ? '✓ Matches exactly' : isShort ? '⚠ Cash Short' : '⚠ Cash Over'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: isExact ? 'var(--green)' : 'var(--red)' }}>
              {isExact ? 'No discrepancy' : `₹${Math.abs(variance).toLocaleString('en-IN')} ${isShort ? 'short' : 'over'}`}
            </div>
          </div>
        </div>

        <button
          onClick={startNewShift}
          className="btn-gold"
          style={{ width: '100%', padding: '12px 0', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
        >
          Start New Shift
        </button>
      </div>
    )
  }

  // ── No shift open: show "Open Shift" form ───────────────────────────
  if (!openShift) {
    return (
      <div style={{ padding: 24, maxWidth: 400 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text1)', marginBottom: 4 }}>
          Open Shift
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>
          No shift is currently open. Enter the starting cash to begin.
        </p>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 20,
        }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Opening Cash
          </label>
          <input
            type="number"
            value={openingCash}
            onChange={(e) => setOpeningCash(e.target.value)}
            placeholder="e.g. 2000"
            style={{
              width: '100%', height: 42, padding: '0 12px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--surface2)',
              color: 'var(--text1)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleOpen}
            disabled={opening}
            className="btn-gold"
            style={{ width: '100%', marginTop: 16, padding: '12px 0', borderRadius: 10, fontWeight: 700, cursor: opening ? 'not-allowed' : 'pointer', opacity: opening ? 0.7 : 1 }}
          >
            {opening ? 'Opening…' : 'Open Shift'}
          </button>
        </div>
      </div>
    )
  }

  // ── Shift open: live reconciliation + close form ────────────────────
  return (
    <div style={{ padding: 24, maxWidth: 480 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text1)' }}>Shift Open</h1>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>
        Opened {new Date(openShift.openedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
      </p>

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 20, marginBottom: 16,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 12 }}>
          Live Reconciliation
        </div>
        {[
          { label: 'Opening Cash', value: `₹${Number(openShift.openingCash).toLocaleString('en-IN')}` },
          { label: 'Cash Sales So Far', value: `₹${(reconciliation?.cashCollected ?? 0).toLocaleString('en-IN')}` },
          { label: 'Cash Payments Count', value: String(reconciliation?.cashPaymentCount ?? 0) },
        ].map((row) => (
          <div key={row.label} style={{
            display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13,
          }}>
            <span style={{ color: 'var(--text2)' }}>{row.label}</span>
            <span style={{ fontWeight: 600, color: 'var(--text1)' }}>{row.value}</span>
          </div>
        ))}
        <div style={{
          marginTop: 10, paddingTop: 10, borderTop: '1.5px solid var(--border)',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text1)' }}>Expected Cash in Drawer</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)' }}>
            ₹{(reconciliation?.expectedCash ?? 0).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 20,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 10 }}>
          Close Shift
        </div>
        <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>
          Enter the actual cash you counted in the drawer
        </label>
        <input
          type="number"
          value={closingCash}
          onChange={(e) => setClosingCash(e.target.value)}
          placeholder={`Expected: ₹${(reconciliation?.expectedCash ?? 0).toLocaleString('en-IN')}`}
          style={{
            width: '100%', height: 42, padding: '0 12px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--surface2)',
            color: 'var(--text1)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
          }}
        />
        <button
          onClick={handleClose}
          disabled={closing}
          style={{
            width: '100%', marginTop: 14, padding: '12px 0', borderRadius: 10, fontWeight: 700,
            cursor: closing ? 'not-allowed' : 'pointer', opacity: closing ? 0.7 : 1,
            background: 'var(--red)', color: '#fff', border: 'none',
          }}
        >
          {closing ? 'Closing…' : 'Close Shift'}
        </button>
      </div>
    </div>
  )
}