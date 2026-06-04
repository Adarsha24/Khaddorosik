'use client';

import { useState, useCallback } from 'react';
import Topbar from '@/components/billing/Topbar';
import Sidebar from '@/components/billing/Sidebar';
import BillingScreen from '@/components/billing/BillingScreen';
import TablesScreen from '@/components/tables/TablesScreen';
import KitchenScreen from '@/components/kitchen/KitchenScreen';
import ReservationScreen from '@/components/reservation/ReservationScreen';
import ReportsScreen from '@/components/reports/ReportsScreen';
import InventoryScreen from '@/components/inventory/InventoryScreen';
import EmployeesScreen from '@/components/employee/EmployeeScreen';
import CRMScreen from '@/components/crm/CRMScreen';

type Screen = 'billing' | 'tables' | 'kitchen' | 'reservation' | 'reports' | 'inventory' | 'employees' | 'crm';
type ToastType = 'success' | 'kitchen' | 'info';

export default function BillingPage() {
  const [activeScreen, setActiveScreen] = useState<Screen>('billing');
  const [toastMsg,     setToastMsg]     = useState('');
  const [toastType,    setToastType]    = useState<ToastType>('success');
  const [toastVisible, setToastVisible] = useState(false);

  const toast = useCallback((msg: string, type: ToastType) => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f0f2f5]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={activeScreen} onNavigate={setActiveScreen} />
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeScreen === 'billing'     && <BillingScreen/>}
          {activeScreen === 'tables'      && <TablesScreen      toast={toast} onNavigate={(id) => setActiveScreen(id as Screen)} />}
          {activeScreen === 'kitchen'     && <KitchenScreen  />}
          {activeScreen === 'reservation' && <ReservationScreen />}
          {activeScreen === 'reports'     && <ReportsScreen />}
          {activeScreen === 'inventory'   && <InventoryScreen/>}
          {activeScreen === 'employees'   && <EmployeesScreen   toast={toast} />}
          {activeScreen === 'crm'         && <CRMScreen toast={toast}/> }
        </main>
      </div>

      {/* Toast notification */}
      {toastVisible && (
        <div
          className="fixed bottom-5 right-5 z-300 flex items-center gap-2.5 px-4 py-3 rounded-xl"
          style={{
            background: '#1e2433',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            minWidth: 240,
            animation: 'slideIn 0.25s ease forwards',
          }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[11px]"
            style={{
              background:
                toastType === 'kitchen' ? '#f59e0b' :
                toastType === 'success' ? '#27ae60' : '#2d6be4',
            }}
          >
            {toastType === 'kitchen' ? '🍳' : toastType === 'success' ? '✓' : 'i'}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{toastMsg}</span>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}