'use client'
import { useState, FormEvent, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

type Stage = 'email' | 'password' | 'otp-sent'

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg)',
    backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245,158,11,0.12) 0%, transparent 70%)',
    fontFamily: 'inherit', padding: 20,
  },
  wrap: {
    width: '100%', maxWidth: 420,
    animation: 'fadeUp 0.3s ease',
  },
  logo: {
    textAlign: 'center', marginBottom: 32,
  },
  logoIcon: {
    width: 64, height: 64, borderRadius: 20,
    background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 14px', fontSize: 30,
    boxShadow: '0 8px 24px rgba(245,158,11,0.35)',
  },
  logoTitle: { fontSize: 22, fontWeight: 800, color: 'var(--text1)', letterSpacing: '-0.5px' },
  logoSub: { fontSize: 12, color: 'var(--text3)', marginTop: 4 },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: '32px 28px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
  },
  stageLabel: { fontSize: 15, fontWeight: 700, color: 'var(--text1)', marginBottom: 6 },
  stageSub: { fontSize: 12, color: 'var(--text3)', marginBottom: 24 },
  label: { fontSize: 11, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: {
    width: '100%', height: 44, borderRadius: 10, border: '1px solid var(--border2)',
    padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box',
    background: 'var(--surface2)', color: 'var(--text1)', fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  },
  btn: {
    width: '100%', height: 46, borderRadius: 10,
    background: 'var(--gold)', color: '#0B1120',
    border: 'none', fontWeight: 700, fontSize: 14,
    cursor: 'pointer', marginTop: 8, fontFamily: 'inherit',
    transition: 'background 0.15s, box-shadow 0.15s',
  },
  btnDisabled: { background: 'var(--text3)', cursor: 'not-allowed' },
  btnOutline: {
    width: '100%', height: 40, borderRadius: 10,
    background: 'transparent', color: 'var(--text2)',
    border: '1px solid var(--border2)', fontWeight: 500, fontSize: 13,
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'background 0.15s',
  },
  error: {
    background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--red)', marginTop: 8,
  },
  success: {
    background: 'var(--green-bg)', border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--green)', marginTop: 8,
  },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0', color: 'var(--text3)', fontSize: 11 },
  divLine: { flex: 1, height: 1, background: 'var(--border)' },
  back: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text3)', cursor: 'pointer', marginBottom: 20, background: 'none', border: 'none', padding: 0, fontFamily: 'inherit' },
  otpRow: { display: 'flex', gap: 10, justifyContent: 'center' },
  otpInput: {
    width: 46, height: 54, borderRadius: 10, border: '2px solid var(--border2)',
    textAlign: 'center', fontSize: 22, fontWeight: 700, color: 'var(--text1)',
    background: 'var(--surface2)', outline: 'none', fontFamily: "'DM Mono', monospace",
    transition: 'border-color 0.15s',
  },
  hint: { fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginTop: 16 },
}

export default function LoginScreen() {
  const { login, loginWithOtp } = useAuth()
  const [stage, setStage] = useState<Stage>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (stage === 'otp-sent') otpRefs.current[0]?.focus()
  }, [stage])

  const handleEmailNext = async (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStage('password')
  }

  const handlePasswordLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(email, password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async () => {
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message ?? 'Failed to send OTP'); return }
      setStage('otp-sent')
      setInfo(`OTP sent to ${email}`)
    } catch {
      setError('Network error. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...otp]; next[idx] = digit; setOtp(next)
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus()
  }

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      const next = [...otp]; next[idx - 1] = ''; setOtp(next)
      otpRefs.current[idx - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setOtp(text.split(''))
      otpRefs.current[5]?.focus()
    }
  }

  const handleOtpVerify = async (e: FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) { setError('Enter all 6 digits'); return }
    setError(''); setLoading(true)
    try {
      await loginWithOtp(email, code)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid OTP')
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={S.logo}>
          <div style={S.logoIcon}>🍽️</div>
          <div style={S.logoTitle}>Khaddorosik POS</div>
          <div style={S.logoSub}>Restaurant Management System</div>
        </div>

        <div style={S.card}>
          {/* ── Stage: email ── */}
          {stage === 'email' && (
            <form onSubmit={handleEmailNext}>
              <div style={S.stageLabel}>Welcome back</div>
              <div style={S.stageSub}>Enter your restaurant email to sign in</div>
              <label style={S.label}>Email address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required autoFocus placeholder="admin@yourrestaurant.com"
                style={S.input}
                onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border2)')}
              />
              <button type="submit" style={{ ...S.btn, marginTop: 18 }}>
                Continue →
              </button>
              <div style={{ ...S.hint, marginTop: 20 }}>
                10 demo restaurants available · Default password: <code style={{ color: 'var(--gold)' }}>admin123</code>
              </div>
            </form>
          )}

          {/* ── Stage: password ── */}
          {stage === 'password' && (
            <>
              <button style={S.back} onClick={() => { setStage('email'); setError('') }}>
                ← Back
              </button>
              <div style={S.stageLabel}>Sign in</div>
              <div style={{ ...S.stageSub, wordBreak: 'break-all' }}>{email}</div>

              <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={S.label}>Password</label>
                  <input
                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                    required autoFocus placeholder="Enter password"
                    style={S.input}
                    onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border2)')}
                  />
                </div>
                {error && <div style={S.error}>{error}</div>}
                <button type="submit" style={loading ? { ...S.btn, ...S.btnDisabled } : S.btn} disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              <div style={S.divider}>
                <div style={S.divLine} />
                <span>or</span>
                <div style={S.divLine} />
              </div>

              <button
                style={S.btnOutline} onClick={handleSendOtp} disabled={loading}
                onMouseOver={e => (e.currentTarget.style.background = 'var(--surface2)')}
                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
              >
                {loading ? 'Sending OTP…' : '🔐 Sign in with Email OTP'}
              </button>
            </>
          )}

          {/* ── Stage: OTP ── */}
          {stage === 'otp-sent' && (
            <>
              <button style={S.back} onClick={() => { setStage('password'); setError(''); setOtp(['','','','','','']) }}>
                ← Back
              </button>
              <div style={S.stageLabel}>Enter OTP</div>
              <div style={S.stageSub}>6-digit code sent to <strong style={{ color: 'var(--text1)' }}>{email}</strong></div>

              {info && <div style={S.success}>{info}</div>}

              <form onSubmit={handleOtpVerify}>
                <div style={{ ...S.otpRow, margin: '24px 0 8px' }} onPaste={handleOtpPaste}>
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el }}
                      type="text" inputMode="numeric" maxLength={1}
                      value={d}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      style={{
                        ...S.otpInput,
                        borderColor: d ? 'var(--gold)' : 'var(--border2)',
                      }}
                    />
                  ))}
                </div>
                {error && <div style={S.error}>{error}</div>}
                <button
                  type="submit"
                  style={loading || otp.join('').length !== 6 ? { ...S.btn, ...S.btnDisabled } : S.btn}
                  disabled={loading || otp.join('').length !== 6}
                >
                  {loading ? 'Verifying…' : 'Verify & Sign In'}
                </button>
              </form>

              <div style={S.hint}>
                Didn't receive it?{' '}
                <span
                  style={{ color: 'var(--gold)', cursor: 'pointer' }}
                  onClick={handleSendOtp}
                >
                  Resend OTP
                </span>
                &nbsp;· Valid for 10 minutes
              </div>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--text4)' }}>
          © {new Date().getFullYear()} Khaddorosik POS · Secure multi-tenant restaurant management
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        input[type=text]::-webkit-outer-spin-button,
        input[type=text]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>
    </div>
  )
}
