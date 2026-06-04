'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'kitchen' | 'info';

export type ToastMsg = {
  message: string;
  type: ToastType;
  id: number;
};

type Props = {
  toast: ToastMsg | null;
};

const BG: Record<ToastType, string> = {
  success: 'bg-[#27ae60]',
  kitchen: 'bg-[#f59e0b]',
  info:    'bg-[#2d6be4]',
};

export default function Toast({ toast }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 2200);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (!toast) return null;

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-2.5 bg-[#1e2433] text-white px-4 py-2.5 rounded-xl shadow-xl transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <span className={`w-5 h-5 rounded-full ${BG[toast.type]} flex items-center justify-center text-[11px]`}>✓</span>
      <span className="text-[13px] font-medium">{toast.message}</span>
    </div>
  );
}
