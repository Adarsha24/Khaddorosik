'use client'

import LoginScreen from '@/components/auth/LoginScreen'
import Sidebar from '@/components/billing/Sidebar'
import Topbar from '@/components/billing/Topbar'
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
        background: 'var(--bg)', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ fontSize: 36 }}>POS</div>
        <div style={{ color: 'var(--text3)', fontSize: 13 }}>Loading Khaddorosik POS...</div>
      </div>
    )
  }

  if (!user) return <LoginScreen />

  return (
    <ToastProvider>
      <PaymentProvider>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <Topbar />
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <Sidebar />
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
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
