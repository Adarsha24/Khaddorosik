'use client';

import { CATEGORY_PIE } from '@/data/reportsData';

export default function CategoryPie() {
  let cumulative = 0;
  const stops = CATEGORY_PIE.map((seg) => {
    const start = cumulative;
    cumulative += seg.pct;
    return `${seg.color} ${start}% ${cumulative}%`;
  });

  return (
    <div>
      <div className="flex justify-center mb-3">
        <div
          className="w-[120px] h-[120px] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
          style={{ background: `conic-gradient(${stops.join(',')})` }}
        />
      </div>
      <div className="flex flex-col gap-[7px]">
        {CATEGORY_PIE.map((seg) => (
          <div key={seg.name} className="flex items-center gap-2 text-[12px]">
            <span className="w-[10px] h-[10px] rounded-full shrink-0" style={{ background: seg.color }} />
            <span className="flex-1 text-[#4a5568]">{seg.name}</span>
            <span className="font-bold text-[#1e2433]">{seg.pct}%</span>
            <span className="text-[11px] text-[#8a95a8]">{seg.amt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}