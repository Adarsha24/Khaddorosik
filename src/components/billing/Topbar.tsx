'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

const svgProps = {
  width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true,
}
const SunIcon = () => (
  <svg {...svgProps}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
)
const MoonIcon = () => (
  <svg {...svgProps}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
)
const BellIcon = () => (
  <svg {...svgProps}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
)

export default function Topbar() {
  const { user } = useAuth()
  const { theme, toggle } = useTheme()
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }))
      setDate(now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const rest = user?.restaurant
  const role = user?.role?.replace('_', ' ').toLowerCase()

  return (
    <header
      className="pos-topbar"
      style={{
        height: 58, background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 18px', gap: 0,
        flexShrink: 0, zIndex: 50,
      }}
    >
      {/* Brand */}
      <div className="pos-brand" style={{ paddingRight: 18, borderRight: '1px solid var(--border)', marginRight: 18 }}>
        <span className="brand-word" style={{ fontSize: 18 }}>
          Khaddo<em>রসিক</em>
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)', marginLeft: 7, letterSpacing: 1.2 }}>POS</span>
      </div>

      {/* Restaurant */}
      <div className="pos-restaurant">
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text1)', lineHeight: 1.25 }}>{rest?.name ?? '—'}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text3)', textTransform: 'capitalize' }}>
          {rest?.address ? rest.address.split(',')[0] : 'Restaurant'} · {role}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {rest?.gstNumber && (
        <div className="pos-gst chip" style={{ marginRight: 12 }}>
          <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600 }}>GSTIN</span>
          <span style={{ fontSize: 11.5, color: 'var(--gold)', fontFamily: "'DM Mono', monospace" }}>{rest.gstNumber}</span>
        </div>
      )}

      {/* Clock */}
      <div className="pos-clock" style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 16, paddingRight: 16, borderRight: '1px solid var(--border)' }}>
        <span className="live-dot" title="Connected" />
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text1)', fontFamily: "'DM Mono', monospace", lineHeight: 1.2 }}>{time}</div>
          <div style={{ fontSize: 10.5, color: 'var(--text3)' }}>{date}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="icon-btn"
          onClick={toggle}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <button className="icon-btn" aria-label="Notifications">
          <BellIcon />
          <span style={{
            position: 'absolute', top: 7, right: 8, width: 8, height: 8, borderRadius: '50%',
            background: 'var(--gold)', border: '2px solid var(--surface)',
          }} />
        </button>
      </div>
    </header>
  )
}
