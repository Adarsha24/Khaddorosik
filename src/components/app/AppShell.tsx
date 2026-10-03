'use client'

import LoginScreen from '@/components/auth/LoginScreen'
import Sidebar from '@/components/billing/Sidebar'
import Topbar from '@/components/billing/Topbar'
import ForcedPasswordChange from '@/components/auth/ForcedPasswordChange'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { PaymentProvider } from './PaymentProvider'
import { ToastProvider } from './ToastProvider'


function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', flexDirection: 'column', gap: 18,
      }}>
        <div className="brand-mark" style={{ width: 64, height: 64, borderRadius: 20, fontSize: 36, animation: 'pulse 1.6s ease-in-out infinite' }}>খ</div>
        <div className="brand-word" style={{ fontSize: 20 }}>Khaddo<em>রসিক</em></div>
        <div style={{ color: 'var(--text3)', fontSize: 12 }}>Getting your restaurant ready…</div>
      </div>
    )
  }

  if (!user) return <LoginScreen />

  if (user.mustChangePassword) {
    return <ForcedPasswordChange />
  }

  return (
    <ToastProvider>
      <PaymentProvider>
        <div className="pos-app" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <Topbar />
          <div className="pos-layout" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <Sidebar />
            <main className="pos-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
              {children}
            </main>
          </div>
        </div>
      </PaymentProvider>
    </ToastProvider>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthenticatedShell>{children}</AuthenticatedShell>
      </AuthProvider>
    </ThemeProvider>
  )
}