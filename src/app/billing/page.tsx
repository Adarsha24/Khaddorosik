'use client';
import { useState, useCallback } from 'react';
import BillingScreen     from '@/components/billing/BillingScreen';
import TablesScreen      from '@/components/tables/TablesScreen';
import KitchenScreen     from '@/components/kitchen/KitchenScreen';
import ReservationScreen from '@/components/reservation/ReservationScreen';
import ReportsScreen     from '@/components/reports/ReportsScreen';
import InventoryScreen   from '@/components/inventory/InventoryScreen';
import CRMScreen         from '@/components/crm/CRMScreen';
import EmployeesScreen   from '@/components/employee/EmployeeScreen';
import PaymentModal      from '@/components/billing/PaymentModal';
import Topbar            from '@/components/billing/Topbar';
import Sidebar           from '@/components/billing/Sidebar';
import LoginScreen       from '@/components/auth/LoginScreen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { payments } from '@/lib/api';
import type { ScreenId, CartItem, ToastType } from '@/types';

function POSApp() {
  const { user, loading } = useAuth();
  const [screen,       setScreen]       = useState<ScreenId>('billing');
  const [toastMsg,     setToastMsg]     = useState('');
  const [toastType,    setToastType]    = useState<ToastType>('success');
  const [toastVisible, setToastVisible] = useState(false);
  const [payCart,      setPayCart]      = useState<CartItem[]>([]);
  const [payOrderId,   setPayOrderId]   = useState<string | undefined>();
  const [payOpen,      setPayOpen]      = useState(false);

  const toast = useCallback((msg: string, type: ToastType) => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  }, []);

  const openPayment = (cart: CartItem[], orderId?: string) => {
    setPayCart(cart);
    setPayOrderId(orderId);
    setPayOpen(true);
  };

  const confirmPayment = async (method: string) => {
    if (payOrderId) {
      try {
        await payments.create({ orderId: payOrderId, method: method.toUpperCase() });
        toast('Payment confirmed! 🎉', 'success');
      } catch (e) {
        toast('Payment failed. Try again.', 'info');
        return;
      }
    } else {
      toast('Payment confirmed! 🎉', 'success');
    }
    setPayOpen(false);
    setPayOrderId(undefined);
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", color: 'var(--text3)' }}>
      Loading…
    </div>
  );

  if (!user) return <LoginScreen />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif" }}>
      <Topbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar active={screen} onNavigate={setScreen} />

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--surface3)' }}>
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

      {toastVisible && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 300,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 12,
          background: 'var(--dark)', color: '#fff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)', minWidth: 240,
          animation: 'toastIn 0.25s ease forwards',
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
            background: toastType === 'kitchen' ? 'var(--amber)' : toastType === 'success' ? 'var(--green)' : 'var(--blue)',
          }}>
            {toastType === 'kitchen' ? '🍳' : toastType === 'success' ? '✓' : 'i'}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{toastMsg}</span>
        </div>
      )}

      {payOpen && (
        <PaymentModal cart={payCart} onClose={() => setPayOpen(false)} onConfirm={confirmPayment} />
      )}

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <POSApp />
    </AuthProvider>
  );
}