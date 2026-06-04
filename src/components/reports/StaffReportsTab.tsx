'use client';

import { STAFF_SALES } from '@/data/reportsData';

const AVATAR_COLORS = [
  'bg-[#fff4e6] text-[#e67e22]',
  'bg-[#eef3fd] text-[#2d6be4]',
  'bg-[#eafaf1] text-[#27ae60]',
  'bg-[#f5f3ff] text-[#7c3aed]',
  'bg-[#fdecea] text-[#e53e3e]',
];

export default function StaffReportsTab() {
  return (
    <div className="bg-white rounded-xl border border-[#e2e6ec] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e2e6ec] flex items-center justify-between">
        <span className="text-[13px] font-bold text-[#1e2433]">Staff Performance</span>
        <span className="text-[11px] text-[#8a95a8]">Today</span>
      </div>
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr>
            {['Staff', 'Role', 'Orders', 'Revenue', 'Tables', 'Rating'].map((h) => (
              <th key={h} className="bg-[#1e2433] text-white/80 px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.4px]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {STAFF_SALES.map((s, i) => (
            <tr key={s.name} className="hover:bg-[#f7f8fb] transition-colors">
              <td className="px-4 py-2.5 border-b border-[#f5f7fa]">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {s.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-semibold text-[#1e2433]">{s.name}</span>
                </div>
              </td>
              <td className="px-4 py-2.5 border-b border-[#f5f7fa]">
                <span className="text-[10px] bg-[#f0f2f5] text-[#4a5568] px-2 py-[2px] rounded-full font-medium">{s.role}</span>
              </td>
              <td className="px-4 py-2.5 border-b border-[#f5f7fa] text-[#4a5568]">{s.orders}</td>
              <td className="px-4 py-2.5 border-b border-[#f5f7fa] font-bold text-[#e85c26]">{s.revenue}</td>
              <td className="px-4 py-2.5 border-b border-[#f5f7fa] text-[#4a5568]">{s.tables}</td>
              <td className="px-4 py-2.5 border-b border-[#f5f7fa] font-bold text-[#f59e0b]">⭐ {s.rating}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}