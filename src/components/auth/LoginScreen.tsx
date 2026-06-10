'use client'
import { useState, FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function LoginScreen() {
  const { login } = useAuth()
  const [email, setEmail]       = useState('admin@khaddorosik.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--surface2)', fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 20, padding: '40px 36px',
        width: 380, boxShadow: '0 8px 40px rgba(0,0,0,0.12)', border: '1px solid var(--border)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', fontSize: 24,
          }}>🍽️</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text1)' }}>Khaddorosik POS</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Sign in to continue</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoFocus
              style={{
                width: '100%', height: 40, borderRadius: 10, border: '1px solid var(--border)',
                padding: '0 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                background: 'var(--surface2)', fontFamily: 'inherit', color: 'var(--text1)',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', height: 40, borderRadius: 10, border: '1px solid var(--border)',
                padding: '0 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                background: 'var(--surface2)', fontFamily: 'inherit', color: 'var(--text1)',
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#fff0f0', border: '1px solid #fecaca', borderRadius: 8,
              padding: '8px 12px', fontSize: 12, color: '#dc2626',
            }}>{error}</div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              height: 44, borderRadius: 10, background: loading ? 'var(--text3)' : 'var(--primary)',
              color: '#fff', border: 'none', fontWeight: 700, fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4,
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--text3)' }}>
          Default: admin@khaddorosik.com / admin123
        </div>
      </div>
    </div>
  )
}
