'use client'
import { useState } from 'react'
import { auth as authApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

export default function ForcedPasswordChange() {
  const { markPasswordChanged, logout } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await authApi.changePassword(currentPassword, newPassword)
      markPasswordChanged()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text1)' }}>Set a new password</div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>
            You're using a default password. Please set a new one to continue.
          </div>
        </div>

        <form
          onSubmit={submit}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 14,
          }}
        >
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%', height: 44, borderRadius: 10, border: '1px solid var(--border2)',
                padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                background: 'var(--surface2)', color: 'var(--text1)',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Min. 8 characters"
              style={{
                width: '100%', height: 44, borderRadius: 10, border: '1px solid var(--border2)',
                padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                background: 'var(--surface2)', color: 'var(--text1)',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                width: '100%', height: 44, borderRadius: 10, border: '1px solid var(--border2)',
                padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                background: 'var(--surface2)', color: 'var(--text1)',
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--red)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', height: 46, borderRadius: 10, background: 'var(--gold)',
              color: '#0B1120', border: 'none', fontWeight: 700, fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              marginTop: 4,
            }}
          >
            {loading ? 'Updating…' : 'Set Password & Continue'}
          </button>

          <button
            type="button"
            onClick={() => logout()}
            style={{
              width: '100%', height: 36, borderRadius: 10, background: 'transparent',
              color: 'var(--text3)', border: 'none', fontSize: 12, cursor: 'pointer',
            }}
          >
            Sign out instead
          </button>
        </form>
      </div>
    </div>
  )
}