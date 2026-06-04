'use client';

import { useState } from 'react';
import { KotOrder } from '@/data/kitchenData';

type Props = {
  order: KotOrder;
  onMarkReady: (id: number) => void;
  onMarkServed: (id: number) => void;
  onReprint: (id: number) => void;
};

function getTimeBg(time: string, status: string) {
  if (status === 'ready' || status === 'served') return 'rgba(255,255,255,0.22)';
  const mins = parseInt(time);
  if (mins >= 15) return 'rgba(231,76,60,0.75)';
  if (mins >= 8)  return 'rgba(245,158,11,0.75)';
  return 'rgba(255,255,255,0.15)';
}

export default function KotCard({ order, onMarkReady, onMarkServed, onReprint }: Props) {
  const [items, setItems] = useState(order.items.map(i => ({ ...i })));

  const toggleItem = (idx: number) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, done: !it.done } : it));
  };

  const headerBg =
    order.status === 'ready'  ? '#27ae60' :
    order.status === 'served' ? '#8a95a8' : '#1e2433';

  const timeBg = getTimeBg(order.time, order.status);
  const allDone = items.every(i => i.done);

  return (
    <div className="w-[220px] bg-white rounded-xl border border-[#e2e6ec] overflow-hidden shrink-0 flex flex-col shadow-sm">
      {/* Header */}
      <div className="px-3 py-[9px] flex items-center justify-between" style={{ background: headerBg }}>
        <span className="text-[15px] font-extrabold text-white">Table {order.table}</span>
        <span
          className="text-[10px] px-2 py-[2px] rounded-full font-semibold text-white"
          style={{ background: timeBg }}
        >
          {order.time} ago
        </span>
      </div>

      {/* Colour bar */}
      <div className="h-[4px] w-full" style={{ background: order.color }} />

      {/* Items */}
      <div className="py-1.5 flex-1">
        {items.map((item, idx) => (
          <div key={idx} className="px-3 py-[5px] flex items-center gap-2 text-[12px]">
            <span className="text-[13px] font-extrabold text-[#e85c26] min-w-[18px]">{item.q}×</span>
            <span className={`flex-1 font-medium ${item.done ? 'line-through text-[#8a95a8]' : 'text-[#1e2433]'}`}>
              {item.n}
            </span>
            {order.status !== 'served' ? (
              <button
                onClick={() => toggleItem(idx)}
                className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all cursor-pointer shrink-0
                  ${item.done ? 'bg-[#27ae60] border-[#27ae60] text-white' : 'border-[#e2e6ec] text-[#8a95a8] hover:border-[#27ae60]'}`}
              >
                {item.done && <span className="text-[10px]">✓</span>}
              </button>
            ) : (
              <span className="w-5 h-5 rounded-full bg-[#27ae60] flex items-center justify-center shrink-0 text-white text-[10px]">✓</span>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-[#e2e6ec] flex gap-1.5">
        {order.status !== 'served' && (
          <button
            onClick={() => onReprint(order.id)}
            className="flex-1 py-1.5 rounded-[6px] text-[11px] font-semibold cursor-pointer border border-[#e2e6ec] bg-[#f7f8fb] text-[#4a5568] hover:bg-[#e2e6ec] transition-colors"
          >
            Reprint
          </button>
        )}
        {order.status === 'pending' && (
          <button
            onClick={() => onMarkReady(order.id)}
            className={`flex-1 py-1.5 rounded-[6px] text-[11px] font-semibold cursor-pointer border transition-colors
              ${allDone ? 'bg-[#27ae60] border-[#27ae60] text-white hover:bg-[#219150]' : 'bg-[#f7f8fb] border-[#e2e6ec] text-[#4a5568] hover:bg-[#e2e6ec]'}`}
          >
            Mark Ready
          </button>
        )}
        {order.status === 'ready' && (
          <button
            onClick={() => onMarkServed(order.id)}
            className="flex-1 py-1.5 rounded-[6px] text-[11px] font-semibold cursor-pointer border bg-[#27ae60] border-[#27ae60] text-white hover:bg-[#219150] transition-colors"
          >
            Mark Served
          </button>
        )}
        {order.status === 'served' && (
          <div className="flex-1 py-1.5 rounded-[6px] text-[11px] font-semibold text-center text-[#27ae60] bg-[#eafaf1] border border-[#c3e6cb]">
            ✓ Served
          </div>
        )}
      </div>
    </div>
  );
}