'use client';

import { PURCHASE_ORDERS, POStatus } from '@/data/inventoryData';

const PO_STATUS: Record<POStatus, { label: string; cls: string }> = {
  pend: { label: 'Pending',   cls: 'bg-[#fff8e1] text-[#d4900a]' },
  conf: { label: 'Confirmed', cls: 'bg-[#eafaf1] text-[#27ae60]' },
  delv: { label: 'Delivered', cls: 'bg-[#eef3fd] text-[#2d6be4]' },
  canc: { label: 'Cancelled', cls: 'bg-[#fdecea] text-[#e53e3e]' },
};

type Props = { onToast: (msg: string) => void };

export default function PurchaseOrdersTab({ onToast }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Orders',     value: '5',       color: 'text-[#1e2433]' },
          { label: 'Pending',          value: '1',       color: 'text-[#d4900a]' },
          { label: 'Month Spend',      value: '₹16,560', color: 'text-[#e85c26]' },
          { label: 'Delivered',        value: '2',       color: 'text-[#27ae60]' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-[#e2e6ec] px-4 py-3">
            <div className="text-[11px] text-[#8a95a8] font-medium mb-1">{s.label}</div>
            <div className={`text-[20px] font-extrabold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>
      <table className="w-full border-collapse bg-white rounded-xl overflow-hidden border border-[#e2e6ec] text-[12px]">
        <thead>
          <tr>
            {['PO #', 'Vendor', 'Items', 'Amount', 'Date', 'Status', 'Action'].map((h) => (
              <th key={h} className="bg-[#1e2433] text-white/80 px-3.5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.4px]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PURCHASE_ORDERS.map((po) => {
            const st = PO_STATUS[po.status];
            return (
              <tr key={po.id} className="hover:bg-[#f7f8fb] transition-colors">
                <td className="px-3.5 py-2.5 border-b border-[#f5f7fa] font-semibold text-[#2d6be4]">{po.id}</td>
                <td className="px-3.5 py-2.5 border-b border-[#f5f7fa] font-medium text-[#1e2433]">{po.vendor}</td>
                <td className="px-3.5 py-2.5 border-b border-[#f5f7fa] text-[#4a5568]">{po.items} items</td>
                <td className="px-3.5 py-2.5 border-b border-[#f5f7fa] font-bold text-[#e85c26]">{po.amount}</td>
                <td className="px-3.5 py-2.5 border-b border-[#f5f7fa] text-[#8a95a8]">{po.date}</td>
                <td className="px-3.5 py-2.5 border-b border-[#f5f7fa]">
                  <span className={`text-[10px] font-bold px-2 py-[3px] rounded-full ${st.cls}`}>{st.label}</span>
                </td>
                <td className="px-3.5 py-2.5 border-b border-[#f5f7fa]">
                  <button onClick={() => onToast(`Viewing ${po.id}`)} className="text-[11px] text-[#2d6be4] font-semibold cursor-pointer hover:underline">View →</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}