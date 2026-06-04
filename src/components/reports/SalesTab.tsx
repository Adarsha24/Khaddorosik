'use client';

import { DAILY_SALES } from '@/data/reportsData';

export default function SalesTab() {
  const maxRev = Math.max(...DAILY_SALES.map((d) => d.revenue));

  return (
    <div className="flex flex-col gap-4">
      {/* Weekly bar chart */}
      <div className="bg-white rounded-xl border border-[#e2e6ec] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e6ec] flex items-center justify-between">
          <span className="text-[13px] font-bold text-[#1e2433]">Weekly Revenue</span>
          <span className="text-[11px] text-[#8a95a8]">This Week</span>
        </div>
        <div className="px-4 py-4 flex gap-3 items-end h-[140px]">
          {DAILY_SALES.map((d, i) => {
            const isToday = i === DAILY_SALES.length - 1;
            const h = Math.max(8, (d.revenue / maxRev) * 100);
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] font-semibold text-[#4a5568]">
                  ₹{(d.revenue / 1000).toFixed(1)}k
                </span>
                <div
                  className="w-full rounded-t-[4px] transition-all"
                  style={{
                    height:    `${h}px`,
                    background: isToday ? '#e85c26' : '#1e2433',
                    opacity:    isToday ? 1 : 0.55,
                  }}
                />
                <span className={`text-[10px] font-medium ${isToday ? 'text-[#e85c26] font-bold' : 'text-[#8a95a8]'}`}>
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day-by-day breakdown table */}
      <div className="bg-white rounded-xl border border-[#e2e6ec] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e6ec]">
          <span className="text-[13px] font-bold text-[#1e2433]">Daily Breakdown</span>
        </div>
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr>
              {['Day', 'Revenue', 'Orders', 'Avg Ticket'].map((h) => (
                <th key={h} className="bg-[#f7f8fb] px-4 py-2.5 text-left text-[11px] font-bold text-[#8a95a8] uppercase tracking-[0.4px] border-b border-[#e2e6ec]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAILY_SALES.map((d, i) => {
              const isToday = i === DAILY_SALES.length - 1;
              return (
                <tr key={d.day} className={`hover:bg-[#f7f8fb] transition-colors ${isToday ? 'bg-[#fff3ee]' : ''}`}>
                  <td className="px-4 py-2.5 border-b border-[#f5f7fa] font-semibold text-[#1e2433]">
                    {d.day}
                    {isToday && (
                      <span className="ml-1.5 text-[10px] bg-[#e85c26] text-white px-1.5 py-[1px] rounded-full">Today</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 border-b border-[#f5f7fa] font-bold text-[#e85c26]">
                    ₹{d.revenue.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-2.5 border-b border-[#f5f7fa] text-[#4a5568]">{d.orders}</td>
                  <td className="px-4 py-2.5 border-b border-[#f5f7fa] text-[#4a5568]">
                    ₹{Math.round(d.revenue / d.orders).toLocaleString('en-IN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}