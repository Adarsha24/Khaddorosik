'use client';
import { useEffect } from 'react';
import { CheckCircle, ChefHat, Info } from 'lucide-react';
import type { ToastType } from '@/types';

interface Props {
  msg: string;
  type: ToastType;
  show: boolean;
  onHide: () => void;
}

export default function Toast({ msg, type, show, onHide }: Props) {
  useEffect(() => {
    if (!show) return;
    const id = setTimeout(onHide, 2200);
    return () => clearTimeout(id);
  }, [show, onHide]);

  if (!show) return null;

  const iconBg =
    type === 'kitchen' ? 'var(--amber)' :
    type === 'success' ? 'var(--green)' :
    'var(--blue)';
  const Icon = type === 'kitchen' ? ChefHat : type === 'success' ? CheckCircle : Info;

  return (
    <div
      className="fixed bottom-5 right-5 z-[300] flex items-center gap-2.5 px-4 py-3 rounded-xl toast-anim"
      style={{ background: 'var(--dark)', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', minWidth: 240 }}
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        <Icon size={11} color="#fff" />
      </div>
      <span className="text-[13px] font-medium">{msg}</span>
    </div>
  );
}
