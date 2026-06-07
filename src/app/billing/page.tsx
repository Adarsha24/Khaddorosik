'use client';
import { useState, useCallback } from 'react';
import BillingScreen     from '@/components/billing/BillingScreen';
import TablesScreen      from '@/components/tables/TablesScreen';
import KitchenScreen     from '@/components/kitchen/KitchenScreen';
import ReservationScreen from '@/components/reservation/ReservationScreen';
import ReportsScreen     from '@/components/reports/ReportsScreen';
import InventoryScreen   from '@/components/inventory/InventoryScreen';
import CRMScreen         from '@/components/crm/CRMScreen';
import type { ScreenId, CartItem, ToastType } from '@/types';
import Topbar from '@/components/billing/Topbar';
import Sidebar from '@/components/billing/Sidebar';
import EmployeesScreen from '@/components/employee/EmployeeScreen';
import PaymentModal from '@/components/billing/PaymentModal';

export default function POSApp() {
  const [screen,       setScreen]       = useState<ScreenId>('billing');
  const [toastMsg,     setToastMsg]     = useState('');
  const [toastType,    setToastType]    = useState<ToastType>('success');
  const [toastVisible, setToastVisible] = useState(false);
  const [payCart,      setPayCart]      = useState<CartItem[]>([]);
  const [payOpen,      setPayOpen]      = useState(false);

  const toast = useCallback((msg: string, type: ToastType) => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  }, []);

  const openPayment   = (cart: CartItem[]) => { setPayCart(cart); setPayOpen(true); };
  const confirmPayment = () => { setPayOpen(false); toast('Payment confirmed! 🎉', 'success'); };

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

      {/* Toast */}
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
