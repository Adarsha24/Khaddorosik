'use client';

import { useState, useCallback, useRef } from 'react';
import MenuGrid from './MenuGrid';
import OrderPanel from './OrderPanel';
import PaymentModal from './PaymentModal';
import Toast, { ToastMsg, ToastType } from './Toast';
import { MenuItem, CartItem } from '@/data/menuData';

export default function BillingScreen() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payOpen, setPayOpen] = useState(false);
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const toastId = useRef(0);

  const showToast = useCallback((message: string, type: ToastType) => {
    toastId.current += 1;
    setToast({ message, type, id: toastId.current });
  }, []);

  const addItem = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (!existing) return prev;
      if (existing.qty === 1) return prev.filter((c) => c.id !== id);
      return prev.map((c) => c.id === id ? { ...c, qty: c.qty - 1 } : c);
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    showToast('Order cleared', 'info');
  }, [showToast]);

  const grand = cart.reduce((s, i) => {
    const sub  = i.price * i.qty;
    const disc = Math.round(sub * 0.05);
    const base = sub - disc;
    return s + base + Math.round(base * 0.025) + Math.round(base * 0.025);
  }, 0);

  return (
    <div className="flex flex-1 overflow-hidden">
      <MenuGrid
        cart={cart}
        onAdd={addItem}
        onRemove={removeItem}
      />
      <OrderPanel
        cart={cart}
        onAdd={addItem}
        onRemove={removeItem}
        onClear={clearCart}
        onPay={() => setPayOpen(true)}
      />
      <PaymentModal
        open={payOpen}
        total={grand}
        onClose={() => setPayOpen(false)}
        onConfirm={() => {
          setPayOpen(false);
          clearCart();
          showToast('Payment confirmed! Bill printed 🧾', 'success');
        }}
      />
      <Toast toast={toast} />
    </div>
  );
}
