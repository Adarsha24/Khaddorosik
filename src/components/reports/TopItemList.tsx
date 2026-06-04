'use client';

import { TOP_ITEMS } from '@/data/reportsData';

export default function TopItemsList() {
  return (
    <div className="flex flex-col">
      {TOP_ITEMS.map((item, i) => (
        <div key={item.name} className="flex items-center gap-2.5 py-[7px] border-b border-[#f5f7fa] last:border-b-0 text-[12px]">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
            ${i < 2 ? 'bg-[#fff8e1] text-[#f59e0b]' : 'bg-[#f0f2f5] text-[#8a95a8]'}`}>
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-[#1e2433] truncate">{item.name}</div>
            <div className="h-[4px] bg-[#f0f2f5] rounded-full mt-[3px] overflow-hidden">
              <div className="h-full rounded-full bg-[#e85c26] opacity-70" style={{ width: `${item.pct}%` }} />
            </div>
          </div>
          <span className="text-[11px] text-[#8a95a8] shrink-0">{item.qty} sold</span>
          <span className="font-bold text-[#e85c26] shrink-0">{item.rev}</span>
        </div>
      ))}
    </div>
  );
}