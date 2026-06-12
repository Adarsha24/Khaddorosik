'use client'
import { useState, useCallback } from 'react'
import BillingScreen     from '@/components/billing/BillingScreen'
import TablesScreen      from '@/components/tables/TablesScreen'
import KitchenScreen     from '@/components/kitchen/KitchenScreen'
import ReservationScreen from '@/components/reservation/ReservationScreen'
import ReportsScreen     from '@/components/reports/ReportsScreen'
import InventoryScreen   from '@/components/inventory/InventoryScreen'
import CRMScreen         from '@/components/crm/CRMScreen'
import EmployeesScreen   from '@/components/employee/EmployeeScreen'
import DashboardScreen   from '@/components/dashboard/DashboardScreen'
import PaymentModal      from '@/components/billing/PaymentModal'
import Topbar            from '@/components/billing/Topbar'
import Sidebar           from '@/components/billing/Sidebar'
import LoginScreen       from '@/components/auth/LoginScreen'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { payments } from '@/lib/api'
import type { ScreenId, CartItem, ToastType } from '@/types'

function POSApp() {
  const { user, loading } = useAuth()
  const [screen,       setScreen]       = useState<ScreenId>('dashboard')
  const [toastMsg,     setToastMsg]     = useState('')
  const [toastType,    setToastType]    = useState<ToastType>('success')
  const [toastVisible, setToastVisible] = useState(false)
  const [payCart,      setPayCart]      = useState<CartItem[]>([])
  const [payOrderId,   setPayOrderId]   = useState<string | undefined>()
  const [payOpen,      setPayOpen]      = useState(false)

  const toast = useCallback((msg: string, type: ToastType) => {
    setToastMsg(msg)
    setToastType(type)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2800)
  }, [])

  const openPayment = useCallback((cart: CartItem[], orderId?: string) => {
    setPayCart(cart)
    setPayOrderId(orderId)
    setPayOpen(true)
  }, [])

  const confirmPayment = async (method: string, amount?: number, splits?: { method: string; amount: number }[]) => {
    if (payOrderId) {
      try {
        await payments.create({ orderId: payOrderId, method: method.toUpperCase(), splits })
        toast('Payment confirmed! Order closed.', 'success')
      } catch (e: unknown) {
        toast(e instanceof Error ? e.message : 'Payment failed. Try again.', 'info')
        return
      }
    } else {
      toast('Payment recorded.', 'success')
    }
    setPayOpen(false)
    setPayOrderId(undefined)
  }

  if (loading) return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ fontSize: 36 }}>🍽️</div>
      <div style={{ color: 'var(--text3)', fontSize: 13 }}>Loading Khaddorosik POS…</div>
    </div>
  )

  if (!user) return <LoginScreen />

  const toastColors: Record<ToastType, string> = {
    success: 'var(--green)', info: 'var(--blue)', kitchen: 'var(--amber)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Topbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar active={screen} onNavigate={setScreen} />

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
          {screen === 'dashboard'   && <DashboardScreen   toast={toast} />}
          {screen === 'billing'     && <BillingScreen     toast={toast} onPayment={openPayment} onNavigate={(id) => setScreen(id as ScreenId)} />}
          {screen === 'tables'      && <TablesScreen      toast={toast} onNavigate={(id) => setScreen(id as ScreenId)} />}
          {screen === 'kitchen'     && <KitchenScreen     toast={toast} />}
          {screen === 'reservation' && <ReservationScreen toast={toast} />}
          {screen === 'reports'     && <ReportsScreen />}
          {screen === 'inventory'   && <InventoryScreen   toast={toast} />}
          {screen === 'employees'   && <EmployeesScreen   toast={toast} />}
          {screen === 'crm'         && <CRMScreen         toast={toast} />}
        </main>
      </div>

      {/* Toast */}
      {toastVisible && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 18px', borderRadius: 12,
          background: 'var(--surface)', border: '1px solid var(--border)',
          color: 'var(--text1)', boxShadow: 'var(--shadow-lg)',
          minWidth: 260, animation: 'toastIn 0.25s ease forwards',
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: toastColors[toastType],
            color: '#fff', fontSize: 11, fontWeight: 700,
          }}>
            {toastType === 'kitchen' ? '🍳' : toastType === 'success' ? '✓' : 'i'}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{toastMsg}</span>
        </div>
      )}

      {payOpen && (
        <PaymentModal
          cart={payCart}
          onClose={() => setPayOpen(false)}
          onConfirm={confirmPayment}
        />
      )}

      <style>{`
        @keyframes toastIn { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }
      `}</style>
    </div>
  )
}

export default function Page() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <POSApp />
      </AuthProvider>
    </ThemeProvider>
  )
}
