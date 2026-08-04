'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import type { ToastType } from '@/types'

type ToastContextValue = {
  toast: (msg: string, type: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toastMsg, setToastMsg] = useState('')
  const [toastType, setToastType] = useState<ToastType>('success')
  const [toastVisible, setToastVisible] = useState(false)

  const toast = useCallback((msg: string, type: ToastType) => {
    setToastMsg(msg)
    setToastType(type)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2800)
  }, [])

  const toastColors: Record<ToastType, string> = {
    success: 'var(--green)',
    info: 'var(--blue)',
    kitchen: 'var(--amber)',
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
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
            {toastType === 'kitchen' ? 'K' : toastType === 'success' ? 'OK' : 'i'}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{toastMsg}</span>
        </div>
      )}
      <style>{`
        @keyframes toastIn { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context.toast
}
