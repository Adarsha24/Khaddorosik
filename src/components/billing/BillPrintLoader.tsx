'use client'

import { useEffect, useState } from 'react'
import { orders, restaurant as restaurantApi } from '@/lib/api'
import BillPrint from './BillPrint'

interface Props {
  orderId: string
  tableNo?: string
  onClose: () => void
}

export default function BillPrintLoader({
  orderId,
  tableNo,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(true)
  const [bill, setBill] = useState<any>(null)
  const [rest, setRest] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [orderData, restData] = await Promise.all([
          orders.get(orderId),
          restaurantApi.get(),
        ])
        setBill(orderData)
        setRest(restData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [orderId])

  if (loading) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          color: '#fff',
          fontSize: 18,
          fontWeight: 600,
        }}
      >
        Loading Bill...
      </div>
    )
  }

  if (!bill || !rest) return null

  return (
    <BillPrint
      billNo={bill.billNo}
      restaurantName={rest.name}
      restaurantAddress={rest.address}
      restaurantPhone={rest.phone}
      gstNumber={rest.gstNumber}

      orderType={bill.orderType}
      tableNo={tableNo}

      items={
        (bill.items ?? []).map((item: any) => ({
          name: item.menuItem?.name ?? "Item",
          qty: item.quantity,
          unitPrice: Number(item.unitPrice),
          veg: item.menuItem?.veg,
        }))
      }

      subtotal={Number(bill.subtotal)}
      cgstAmount={Number(bill.cgstAmount ?? 0)}
      sgstAmount={Number(bill.sgstAmount ?? 0)}
      taxAmount={Number(bill.taxAmount)}
      discountAmount={Number(bill.discountAmount ?? 0)}
      discountCode={bill.discountCode}
      total={Number(bill.total)}

      paymentMethod={bill.payments?.[0]?.method}
      customerName={bill.customer?.name}
      createdAt={bill.createdAt}

      onClose={onClose}
    />
  )
}