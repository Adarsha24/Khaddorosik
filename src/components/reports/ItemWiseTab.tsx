'use client';

import { ITEM_WISE } from '@/data/reportsData';

export default function ItemWiseTab() {
  const maxRev = Math.max(...ITEM_WISE.map((i) => i.rev));

  return (
    <div className="bg-white rounded-xl border border-[#e2e6ec] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e2e6ec] flex items-center justify-between">
        <span className="text-[13px] font-bold text-[#1e2433]">Item-wise Sales</span>
        <button className="text-[11px] text-[#2d6be4] font-semibold hover:underline cursor-pointer">Export →</button>
      </div>
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr>
            {['#', 'Item Name', 'Category', 'Qty Sold', 'Revenue', 'Avg Price', 'Share'].map((h) => (
              <th key={h} className="bg-[#1e2433] text-white/80 px-3.5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.4px]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ITEM_WISE.map((item, i) => {
            const sharePct = Math.round((item.rev / maxRev) * 100);
            return (
              <tr key={item.name} className="hover:bg-[#f7f8fb] transition-colors">
                <td className="px-3.5 py-2.5 border-b border-[#f5f7fa] text-[#8a95a8]">{i + 1}</td>
                <td className="px-3.5 py-2.5 border-b border-[#f5f7fa] font-semibold text-[#1e2433]">{item.name}</td>
                <td className="px-3.5 py-2.5 border-b border-[#f5f7fa]">
                  <span className="text-[10px] bg-[#f0f2f5] text-[#4a5568] px-2 py-[2px] rounded-full font-medium">{item.cat}</span>
                </td>
                <td className="px-3.5 py-2.5 border-b border-[#f5f7fa] text-[#4a5568]">{item.qty}</td>
                <td className="px-3.5 py-2.5 border-b border-[#f5f7fa] font-bold text-[#e85c26]">
                  ₹{item.rev.toLocaleString('en-IN')}
                </td>
                <td className="px-3.5 py-2.5 border-b border-[#f5f7fa] text-[#4a5568]">₹{item.avg}</td>
                <td className="px-3.5 py-2.5 border-b border-[#f5f7fa]">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-[5px] bg-[#f0f2f5] rounded-full overflow-hidden">
                      <div className="h-full bg-[#e85c26] opacity-70 rounded-full" style={{ width: `${sharePct}%` }} />
                    </div>
                    <span className="text-[10px] text-[#8a95a8]">{sharePct}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}