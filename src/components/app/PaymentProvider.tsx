'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import PaymentModal from '@/components/billing/PaymentModal'
import { payments } from '@/lib/api'
import type { CartItem } from '@/types'
import { useToast } from './ToastProvider'

type PaymentContextValue = {
  openPayment: (cart: CartItem[], orderId?: string, contextLabel?: string) => void
}

const PaymentContext = createContext<PaymentContextValue | null>(null)

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast()
  const [payCart, setPayCart] = useState<CartItem[]>([])
  const [payOrderId, setPayOrderId] = useState<string | undefined>()
  const [payContextLabel, setPayContextLabel] = useState<string | undefined>()
  const [payOpen, setPayOpen] = useState(false)

  const openPayment = useCallback((cart: CartItem[], orderId?: string, contextLabel?: string) => {
    setPayCart(cart)
    setPayOrderId(orderId)
    setPayContextLabel(contextLabel)
    setPayOpen(true)
  }, [])

  const confirmPayment = async (method: string, tipAmount?: number, splits?: { method: string; amount: number }[]) => {
    if (payOrderId) {
      try {
        await payments.create({
          orderId: payOrderId,
          method: method.toUpperCase(),
          tipAmount: tipAmount ?? 0,
          splits,
        })
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
    setPayContextLabel(undefined)
  }

  return (
    <PaymentContext.Provider value={{ openPayment }}>
      {children}
      {payOpen && (
        <PaymentModal
          cart={payCart}
          onClose={() => setPayOpen(false)}
          onConfirm={confirmPayment}
          contextLabel={payContextLabel}
        />
      )}
    </PaymentContext.Provider>
  )
}

export function usePayment() {
  const context = useContext(PaymentContext)
  if (!context) throw new Error('usePayment must be used inside PaymentProvider')
  return context
}