'use client';

import { HOURLY_DATA, HOURLY_LABELS } from '@/data/reportsData';

export default function HourlyChart() {
  const max = Math.max(...HOURLY_DATA);
  const now  = new Date().getHours();

  return (
    <div className="flex gap-[5px] items-end h-[108px] pb-1">
      {HOURLY_DATA.map((v, i) => {
        const isNow    = i === now;
        const barH     = Math.max(4, (v / max) * 84);
        const valLabel = v > 0 ? (v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`) : '';

        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-[2px] group cursor-pointer">
            <span className="text-[8px] font-semibold text-[#4a5568] min-h-[12px] leading-none">
              {valLabel}
            </span>
            <div
              className="w-full rounded-t-[3px] transition-opacity"
              style={{
                height:    `${barH}px`,
                background: '#e85c26',
                opacity:    isNow ? 1 : 0.55,
                boxShadow:  isNow ? '0 2px 6px rgba(232,92,38,0.45)' : 'none',
              }}
            />
            <span className={`text-[8.5px] font-medium leading-none ${isNow ? 'text-[#e85c26] font-bold' : 'text-[#8a95a8]'}`}>
              {HOURLY_LABELS[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}