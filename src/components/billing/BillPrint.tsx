'use client'

interface BillItem {
  name: string
  qty: number
  unitPrice: number
  veg?: boolean
}

interface BillProps {
  billNo?: number
  restaurantName: string
  restaurantAddress?: string
  restaurantPhone?: string
  gstNumber?: string
  orderType: string
  tableNo?: number | string
  items: BillItem[]
  subtotal: number
  cgstAmount: number
  sgstAmount: number
  taxAmount: number
  discountAmount?: number
  discountCode?: string
  total: number
  paymentMethod?: string
  customerName?: string
  loyaltyPoints?: number
  createdAt?: string
  onClose: () => void
}

export default function BillPrint({
  billNo, restaurantName, restaurantAddress, restaurantPhone, gstNumber,
  orderType, tableNo, items, subtotal, cgstAmount, sgstAmount, taxAmount,
  discountAmount, discountCode, total, paymentMethod, customerName, loyaltyPoints,
  createdAt, onClose,
}: BillProps) {
  const fmt = (n: number) => `₹${n.toFixed(2)}`
  const date = createdAt ? new Date(createdAt) : new Date()
  const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

  const handlePrint = () => window.print()

  return (
    <>
      {/* Backdrop (hidden on print) */}
      <div
        className="no-print"
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onClick={onClose}
      />

      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 9999, background: '#fff', borderRadius: 12,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        width: 340, maxHeight: '90vh', overflow: 'auto',
      }}
        id="bill-print-area"
      >
        {/* Action bar (hidden on print) */}
        <div className="no-print" style={{
          display: 'flex', gap: 8, padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb', background: '#f9fafb',
          borderRadius: '12px 12px 0 0',
        }}>
          <button
            onClick={handlePrint}
            style={{
              flex: 1, height: 38, borderRadius: 8, background: '#F59E0B', color: '#0B1120',
              border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
          >
            🖨️ Print Bill
          </button>
          <button
            onClick={onClose}
            style={{
              width: 38, height: 38, borderRadius: 8, background: '#f3f4f6',
              border: '1px solid #e5e7eb', fontSize: 16, cursor: 'pointer', color: '#6b7280',
            }}
          >
            ✕
          </button>
        </div>

        {/* Bill content */}
        <div style={{ padding: '20px 18px', fontFamily: "'Courier New', monospace", color: '#111', fontSize: 12 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 2 }}>{restaurantName}</div>
            {restaurantAddress && <div style={{ fontSize: 10, color: '#555', lineHeight: 1.4 }}>{restaurantAddress}</div>}
            {restaurantPhone && <div style={{ fontSize: 10, color: '#555' }}>📞 {restaurantPhone}</div>}
            {gstNumber && <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>GSTIN: {gstNumber}</div>}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px dashed #999', margin: '10px 0' }} />

          {/* Bill meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontWeight: 700 }}>Bill #{billNo ?? '—'}</span>
            <span style={{ color: '#555', fontSize: 11 }}>{dateStr} {timeStr}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#555', marginBottom: 2 }}>
            <span>Type: {orderType.replace('_', ' ')}</span>
            {tableNo && <span>Table: {tableNo}</span>}
          </div>
          {customerName && (
            <div style={{ fontSize: 11, color: '#555' }}>Customer: {customerName}</div>
          )}

          <div style={{ borderTop: '1px dashed #999', margin: '10px 0' }} />

          {/* Items header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: '#555', marginBottom: 6 }}>
            <span style={{ flex: 1 }}>ITEM</span>
            <span style={{ width: 28, textAlign: 'right' }}>QTY</span>
            <span style={{ width: 52, textAlign: 'right' }}>RATE</span>
            <span style={{ width: 60, textAlign: 'right' }}>TOTAL</span>
          </div>

          {/* Items */}
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, paddingRight: 4 }}>
                <span style={{ fontSize: 10, marginRight: 4 }}>{item.veg ? '●' : '◆'}</span>
                <span style={{ fontSize: 12 }}>{item.name}</span>
              </div>
              <span style={{ width: 28, textAlign: 'right', fontSize: 12 }}>{item.qty}</span>
              <span style={{ width: 52, textAlign: 'right', fontSize: 12 }}>{item.unitPrice.toFixed(2)}</span>
              <span style={{ width: 60, textAlign: 'right', fontSize: 12, fontWeight: 600 }}>{(item.qty * item.unitPrice).toFixed(2)}</span>
            </div>
          ))}

          <div style={{ borderTop: '1px dashed #999', margin: '10px 0' }} />

          {/* Totals */}
          {[
            { label: 'Subtotal', value: subtotal },
            ...(discountAmount && discountAmount > 0 ? [{ label: `Discount (${discountCode ?? ''})`, value: -discountAmount }] : []),
            { label: `CGST (${cgstAmount > 0 ? ((cgstAmount / (subtotal - (discountAmount ?? 0))) * 100).toFixed(1) : 0}%)`, value: cgstAmount },
            { label: `SGST (${sgstAmount > 0 ? ((sgstAmount / (subtotal - (discountAmount ?? 0))) * 100).toFixed(1) : 0}%)`, value: sgstAmount },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
              <span style={{ color: '#555' }}>{label}</span>
              <span style={{ color: value < 0 ? '#16a34a' : '#111' }}>
                {value < 0 ? `-₹${Math.abs(value).toFixed(2)}` : `₹${value.toFixed(2)}`}
              </span>
            </div>
          ))}

          <div style={{ borderTop: '2px solid #111', margin: '8px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 900 }}>
            <span>TOTAL</span>
            <span>₹{total.toFixed(2)}</span>
          </div>

          {paymentMethod && (
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: '#555' }}>
              Paid via {paymentMethod}
            </div>
          )}

          <div style={{ borderTop: '1px dashed #999', margin: '12px 0 8px' }} />

          {/* Loyalty */}
          {loyaltyPoints !== undefined && loyaltyPoints > 0 && (
            <div style={{ textAlign: 'center', fontSize: 10, color: '#555', marginBottom: 8 }}>
              🌟 Loyalty points earned: {Math.floor(total)} pts · Total: {loyaltyPoints} pts
            </div>
          )}

          {/* Footer */}
          <div style={{ textAlign: 'center', fontSize: 10, color: '#777', lineHeight: 1.6 }}>
            Thank you for dining with us!<br />
            Visit again soon 🙏<br />
            <span style={{ fontSize: 9 }}>Powered by Khaddorosik POS</span>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body > *:not(#bill-print-area) { display: none !important; }
          #bill-print-area {
            position: static !important;
            transform: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            max-height: none !important;
            width: 80mm !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </>
  )
}
