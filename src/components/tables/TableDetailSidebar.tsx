'use client';
import type { TableData, ToastType } from '@/types';

interface Props {
  table: TableData;
  toast: (msg: string, type: ToastType) => void;   // ← your file has 'onToast'
  onNavigate: (id: string) => void;
}

const DETAIL_ITEMS = [
  { name: 'Butter Chicken', qty: 2, price: 640 },
  { name: 'Garlic Naan',    qty: 4, price: 240 },
  { name: 'Dal Makhani',    qty: 1, price: 200 },
  { name: 'Masala Lassi',   qty: 2, price: 160 },
];

export default function TableDetailSidebar({ table, toast, onNavigate }: Props) {
  return (
    <div className="w-[260px] flex flex-col flex-shrink-0"
      style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}>

      {/* Header */}
      <div className="px-3.5 py-3"
        style={{ background: 'var(--dark)', borderBottom: '1px solid var(--border)' }}>
        <div className="text-[14px] font-bold text-white">Table {table.num}</div>
        <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {table.cap} seats • {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
        </div>
      </div>

      {/* Detail rows */}
      {[
        { label: 'Waiter',     val: table.waiter ?? '—',                          mono: false, primary: false, badge: false },
        { label: 'Guests',     val: table.status !== 'available' ? '3 pax' : '—', mono: false, primary: false, badge: false },
        { label: 'Time',       val: table.time ?? '—',                            mono: true,  primary: true,  badge: false },
        { label: 'KOT Status', val: table.status === 'running' ? '2 Pending' : '—', mono: false, primary: false, badge: table.status === 'running' },
      ].map(({ label, val, mono, primary, badge }) => (
        <div key={label} className="flex justify-between items-center px-3.5 py-2 text-[12px]"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text3)', fontWeight: 500 }}>{label}</span>
          {badge
            ? <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{val}</span>
            : <span style={{ fontWeight: 600, color: primary ? 'var(--primary)' : 'var(--text1)', fontFamily: mono ? "'DM Mono', monospace" : undefined }}>{val}</span>
          }
        </div>
      ))}

      {/* Order items label */}
      <div className="px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider"
        style={{ color: 'var(--text3)' }}>Order Items</div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto">
        {DETAIL_ITEMS.map((item) => (
          <div key={item.name} className="flex items-center gap-2 px-3.5 py-1.5 text-[12px]"
            style={{ borderBottom: '1px solid var(--surface3)' }}>
            <span className="flex-1 font-medium" style={{ color: 'var(--text1)' }}>{item.name}</span>
            <span style={{ color: 'var(--text3)' }}>×{item.qty}</span>
            <span className="font-semibold">₹{item.price}</span>
          </div>
        ))}
        <div className="flex items-center px-3.5 py-2 text-[12px] font-bold"
          style={{ borderTop: '1px solid var(--border)', color: 'var(--primary)' }}>
          <span className="flex-1">Total</span>
          <span>₹1,240</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-3.5 py-2.5 flex flex-col gap-1.5"
        style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => { toast('Moved to billing', 'success'); onNavigate('billing'); }}
          className="w-full py-2.5 rounded-lg text-[12px] font-semibold cursor-pointer"
          style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)' }}>
          📋 Add Items
        </button>
        <button
          onClick={() => toast('KOT printed', 'kitchen')}
          className="w-full py-2.5 rounded-lg text-[12px] font-semibold cursor-pointer"
          style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)' }}>
          🖨 Print KOT
        </button>
        <button
          onClick={() => toast('Opening payment…', 'info')}
          className="w-full py-2.5 rounded-lg text-[12px] font-bold text-white cursor-pointer"
          style={{ background: 'var(--primary)', border: 'none' }}>
          💳 Settle Bill
        </button>
      </div>
    </div>
  );
}
