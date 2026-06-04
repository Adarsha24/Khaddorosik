'use client';

import { useMemo, useState } from 'react';
import { CartItem, MenuItem } from '@/data/menuData';

type Props = {
  cart: CartItem[];
  onAdd: (item: MenuItem) => void;
  onRemove: (id: number) => void;
  onClear: () => void;
  onPay: () => void;
};

export default function OrderPanel({ cart, onAdd, onRemove, onClear, onPay }: Props) {
  const [orderType, setOrderType] = useState<'dinein' | 'takeaway' | 'delivery'>('dinein');

  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const discount = Math.round(subtotal * 0.05);
  const taxBase  = subtotal - discount;
  const cgst     = Math.round(taxBase * 0.025);
  const sgst     = Math.round(taxBase * 0.025);
  const grand    = taxBase + cgst + sgst;
  const hasItems = cart.length > 0;

  return (
    <aside className="w-[292px] bg-white border-l border-[#e2e6ec] flex flex-col shrink-0">
      {/* Header */}
      <div className="px-3.5 py-[11px] border-b border-[#e2e6ec] flex items-center gap-2">
        <span className="text-base text-[#8a95a8]">🛒</span>
        <span className="text-[14px] font-bold text-[#1e2433] flex-1">Current Order</span>
        <button className="bg-[#eef3fd] text-[#2d6be4] rounded-[6px] px-[9px] py-[3px] text-[11px] font-bold cursor-pointer hover:bg-[#d8e8fc] transition-colors">
          🪑 Table 7
        </button>
      </div>

      {/* Order type */}
      <div className="flex px-3.5 py-[9px] gap-[5px] border-b border-[#e2e6ec]">
        {(['dinein', 'takeaway', 'delivery'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            className={`flex-1 py-1.5 rounded-[6px] text-center text-[11px] font-semibold cursor-pointer border transition-all
              ${orderType === t
                ? 'bg-[#1e2433] text-white border-[#1e2433]'
                : 'border-[#e2e6ec] text-[#4a5568] hover:bg-[#f7f8fb]'}`}
          >
            {t === 'dinein' ? 'Dine In' : t === 'takeaway' ? 'Takeaway' : 'Delivery'}
          </button>
        ))}
      </div>

      {/* Customer */}
      <div className="px-3.5 py-2 border-b border-[#e2e6ec] flex items-center gap-[7px]">
        <div className="w-7 h-7 rounded-full bg-[#f5f3ff] text-[#7c3aed] flex items-center justify-center font-bold text-[11px] shrink-0">
          RK
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="text-[12px] font-semibold text-[#1e2433] truncate">Rahul Khanna</div>
          <div className="text-[10px] text-[#8a95a8]">+91 98765 43210</div>
        </div>
        <span className="text-[10px] text-[#27ae60] font-semibold bg-[#eafaf1] px-1.5 py-[2px] rounded-full">240 pts</span>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto py-1">
        {!hasItems ? (
          <div className="text-center py-9 px-4 text-[#8a95a8]">
            <div className="text-[40px] mb-2 opacity-40">🛒</div>
            <div className="text-[13px]">No items yet.</div>
            <div className="text-[11px]">Click + to add dishes</div>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="px-3.5 py-[7px] flex items-center gap-[7px] border-b border-[#f5f7fa] hover:bg-[#f7f8fb] transition-colors">
              <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${item.veg ? 'bg-[#27ae60]' : 'bg-[#e53e3e]'}`} />
              <div className="flex-1">
                <div className="text-[12px] font-medium text-[#1e2433] leading-[1.3]">{item.name}</div>
              </div>
              <div className="flex items-center gap-[3px] shrink-0">
                <button
                  onClick={() => onRemove(item.id)}
                  className="w-5 h-5 rounded-[4px] border border-[#e2e6ec] bg-[#f7f8fb] text-[13px] text-[#4a5568] flex items-center justify-center cursor-pointer hover:bg-[#e2e6ec]"
                >−</button>
                <span className="text-[12px] font-bold min-w-[14px] text-center">{item.qty}</span>
                <button
                  onClick={() => onAdd(item)}
                  className="w-5 h-5 rounded-[4px] border border-[#e2e6ec] bg-[#f7f8fb] text-[13px] text-[#4a5568] flex items-center justify-center cursor-pointer hover:bg-[#e2e6ec]"
                >+</button>
              </div>
              <span className="text-[12px] font-semibold text-[#1e2433] min-w-[44px] text-right">
                ₹{item.price * item.qty}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Running KOT (shown when has items) */}
      {hasItems && (
        <div className="px-3.5 py-2 border-t border-[#e2e6ec]">
          <div className="text-[10px] font-semibold text-[#8a95a8] uppercase tracking-[0.5px] mb-1.5">Running KOT</div>
          <div className="flex flex-col gap-[3px]">
            <div className="flex items-center gap-1.5 text-[11px] py-[3px]">
              <span className="bg-[#eafaf1] text-[#27ae60] px-1.5 py-[2px] rounded-full text-[9px] font-bold uppercase">Ready</span>
              <span className="flex-1">Paneer Tikka ×2</span>
              <span className="text-[#27ae60] text-[13px]">✓</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] py-[3px]">
              <span className="bg-[#fff8e1] text-[#f59e0b] px-1.5 py-[2px] rounded-full text-[9px] font-bold uppercase">Prep</span>
              <span className="flex-1">Dal Makhani ×1</span>
              <span className="text-[#f59e0b] text-[13px]">⏱</span>
            </div>
          </div>
        </div>
      )}

      {/* Order note */}
      {hasItems && (
        <div className="mx-3.5 my-1.5 border border-dashed border-[#d0d5de] rounded-[8px] px-2.5 py-[7px] text-[#8a95a8] text-[11.5px] cursor-pointer flex items-center gap-1.5 hover:border-[#e85c26] hover:text-[#e85c26] transition-colors">
          ✏️ Add order note or special instruction…
        </div>
      )}

      {/* Totals */}
      {hasItems && (
        <div className="px-3.5 py-2.5 border-t border-[#e2e6ec]">
          <div className="flex justify-between text-[12px] text-[#4a5568] mb-1 items-center">
            <span>Subtotal</span><span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-[12px] text-[#27ae60] mb-1 items-center">
            <span className="flex items-center gap-1">🏷️ Loyalty Discount (5%)</span>
            <span>−₹{discount}</span>
          </div>
          <div className="flex justify-between text-[12px] text-[#4a5568] mb-1 items-center">
            <span>CGST (2.5%)</span><span>₹{cgst}</span>
          </div>
          <div className="flex justify-between text-[12px] text-[#4a5568] mb-1 items-center">
            <span>SGST (2.5%)</span><span>₹{sgst}</span>
          </div>
          <div className="flex justify-between text-[15px] font-bold text-[#1e2433] pt-1.5 mt-0.5 border-t-[1.5px] border-[#e2e6ec]">
            <span>Grand Total</span><span>₹{grand}</span>
          </div>
          <div className="mt-1.5">
            <span className="text-[10px] bg-[#eafaf1] text-[#27ae60] px-[7px] py-[2px] rounded-full font-semibold">
              You save ₹{discount} 🎉
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-3.5 py-2.5 border-t border-[#e2e6ec] flex flex-col gap-[7px]">
        <div className="flex gap-1.5">
          {[
            { icon: '🖨️', label: 'KOT', color: 'default' },
            { icon: '🗑️', label: 'Clear', color: 'default', onClick: onClear },
            { icon: '🏷️', label: 'Discount', color: 'default' },
            { icon: '👥', label: 'CRM', color: 'green' },
          ].map(({ icon, label, color, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className={`flex-1 py-2 border rounded-[8px] text-[11.5px] font-semibold cursor-pointer text-center flex items-center justify-center gap-1 transition-all
                ${color === 'green'
                  ? 'text-[#27ae60] border-[#aed6bc] hover:bg-[#eafaf1]'
                  : 'border-[#e2e6ec] bg-white text-[#4a5568] hover:bg-[#f7f8fb]'}`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <button
          onClick={onPay}
          className="w-full py-[11px] rounded-xl bg-[#e85c26] text-white text-[14px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#c94d1d] transition-colors cursor-pointer"
        >
          💳 Proceed to Payment
        </button>
      </div>
    </aside>
  );
}
