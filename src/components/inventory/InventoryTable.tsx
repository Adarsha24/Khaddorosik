'use client';

import { InvItem } from '@/data/inventoryData';

type Props = { items: InvItem[] };

function getStatus(pct: number) {
  if (pct > 50) return { label: 'OK',       cls: 'bg-[#eafaf1] text-[#27ae60]', barCls: 'bg-[#27ae60]' };
  if (pct > 20) return { label: 'Low',      cls: 'bg-[#fff8e1] text-[#d4900a]', barCls: 'bg-[#f59e0b]' };
  return         { label: 'Critical',  cls: 'bg-[#fdecea] text-[#e53e3e]', barCls: 'bg-[#e53e3e]' };
}

export default function InventoryTable({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[#8a95a8]">
        <div className="text-[40px] mb-2 opacity-30">📦</div>
        <div className="text-[13px]">No items found</div>
      </div>
    );
  }

  return (
    <table className="w-full border-collapse bg-white rounded-xl overflow-hidden border border-[#e2e6ec] text-[12px]">
      <thead>
        <tr>
          {['Ingredient', 'Category', 'Current Stock', 'Unit', 'Reorder Level', 'Last Updated', 'Status'].map((h) => (
            <th key={h} className="bg-[#1e2433] text-white/80 px-3.5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.4px] first:pl-4 last:pr-4">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const st = getStatus(item.pct);
          return (
            <tr key={item.id} className="hover:bg-[#f7f8fb] transition-colors">
              <td className="px-4 py-2.5 border-b border-[#f5f7fa] font-semibold text-[#1e2433]">{item.name}</td>
              <td className="px-3.5 py-2.5 border-b border-[#f5f7fa]">
                <span className="text-[10px] bg-[#f0f2f5] text-[#4a5568] px-2 py-[2px] rounded-full font-medium">{item.cat}</span>
              </td>
              <td className="px-3.5 py-2.5 border-b border-[#f5f7fa]">
                <div className="flex items-center gap-2">
                  <div className="w-[70px] h-[6px] bg-[#f0f2f5] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${st.barCls}`} style={{ width: `${item.pct}%` }} />
                  </div>
                  <span className="font-semibold text-[#1e2433]">{item.stock} {item.unit}</span>
                </div>
              </td>
              <td className="px-3.5 py-2.5 border-b border-[#f5f7fa] text-[#4a5568]">{item.unit}</td>
              <td className="px-3.5 py-2.5 border-b border-[#f5f7fa] text-[#8a95a8]">{item.reorder} {item.unit}</td>
              <td className="px-3.5 py-2.5 border-b border-[#f5f7fa] text-[#8a95a8] text-[11px]">{item.updated}</td>
              <td className="px-3.5 pr-4 py-2.5 border-b border-[#f5f7fa]">
                <span className={`text-[10px] font-bold px-2 py-[3px] rounded-full ${st.cls}`}>{st.label}</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}