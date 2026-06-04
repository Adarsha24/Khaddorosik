'use client';

import { STAT_CARDS } from '@/data/reportsData';

export default function StatCards() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {STAT_CARDS.map((card) => (
        <div key={card.label} className="bg-white rounded-xl border border-[#e2e6ec] px-4 py-3.5 relative overflow-hidden">
          <div className={`absolute right-3.5 top-3.5 w-9 h-9 rounded-[8px] flex items-center justify-center text-[18px] ${card.iconColor}`}>
            {card.icon}
          </div>
          <div className="text-[11px] font-semibold text-[#8a95a8] uppercase tracking-[0.4px] mb-1.5">
            {card.label}
          </div>
          <div className="text-[22px] font-extrabold text-[#1e2433] leading-none mb-1">
            {card.value}
          </div>
          <div className={`text-[11px] font-semibold flex items-center gap-1 ${card.up ? 'text-[#27ae60]' : 'text-[#e53e3e]'}`}>
            <span>{card.up ? '↑' : '↓'}</span>
            {card.delta}
          </div>
        </div>
      ))}
    </div>
  );
}