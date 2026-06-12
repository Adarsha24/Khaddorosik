'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

export default function Topbar() {
  const { user } = useAuth()
  const { theme, toggle } = useTheme()
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }))
      setDate(now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const rest = user?.restaurant

  return (
    <header style={{
      height: 54, background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', padding: '0 16px', gap: 0,
      flexShrink: 0, zIndex: 50,
    }}>
      {/* Brand */}
      <div style={{ paddingRight: 16, borderRight: '1px solid var(--border)', marginRight: 16 }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text1)', letterSpacing: '-0.5px' }}>
          Khaddo<span style={{ color: 'var(--gold)' }}>রসিক</span>
        </span>
        <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 6, verticalAlign: 'middle' }}>POS</span>
      </div>

      {/* Restaurant info */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>{rest?.name ?? '—'}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>
          {rest?.address ? rest.address.split(',')[0] : 'Restaurant'} · {user?.role?.replace('_', ' ')}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* GST badge */}
      {rest?.gstNumber && (
        <div style={{ padding: '4px 12px', background: 'var(--gold-bg)', border: '1px solid var(--border)', borderRadius: 8, marginRight: 12 }}>
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>GSTIN </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gold)', fontFamily: "'DM Mono', monospace" }}>{rest.gstNumber}</span>
        </div>
      )}

      {/* Clock */}
      <div style={{ textAlign: 'right', marginRight: 16, paddingRight: 16, borderRight: '1px solid var(--border)' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text1)', fontFamily: "'DM Mono', monospace", letterSpacing: '1px' }}>{time}</div>
        <div style={{ fontSize: 10, color: 'var(--text3)' }}>{date}</div>
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        style={{
          width: 34, height: 34, borderRadius: 8, marginRight: 8,
          background: 'var(--surface)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 16,
        }}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* Notification bell */}
      <button style={{
        width: 34, height: 34, borderRadius: 8,
        background: 'var(--surface)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontSize: 16, color: 'var(--text2)', position: 'relative',
      }}>
        🔔
        <span style={{
          position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%',
          background: 'var(--gold)', border: '1.5px solid var(--bg2)',
        }} />
      </button>
    </header>
  )
}
