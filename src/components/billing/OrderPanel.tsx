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
    <aside className="w-[292px] bg-white border-l border-[#dce6df] flex flex-col shrink-0">
      {/* Header */}
      <div className="px-3.5 py-[11px] border-b border-[#dce6df] flex items-center gap-2">
        <span className="text-base text-[#80908a]">🛒</span>
        <span className="text-[14px] font-bold text-[#20302d] flex-1">Current Order</span>
        <button className="bg-[#e7f2f2] text-[#2f6f73] rounded-[6px] px-[9px] py-[3px] text-[11px] font-bold cursor-pointer hover:bg-[#d7ebeb] transition-colors">
          🪑 Table 7
        </button>
      </div>

      {/* Order type */}
      <div className="flex px-3.5 py-[9px] gap-[5px] border-b border-[#dce6df]">
        {(['dinein', 'takeaway', 'delivery'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            className={`flex-1 py-1.5 rounded-[6px] text-center text-[11px] font-semibold cursor-pointer border transition-all
              ${orderType === t
                ? 'bg-[#20302d] text-white border-[#20302d]'
                : 'border-[#dce6df] text-[#4b5b56] hover:bg-[#f7f9f5]'}`}
          >
            {t === 'dinein' ? 'Dine In' : t === 'takeaway' ? 'Takeaway' : 'Delivery'}
          </button>
        ))}
      </div>

      {/* Customer */}
      <div className="px-3.5 py-2 border-b border-[#dce6df] flex items-center gap-[7px]">
        <div className="w-7 h-7 rounded-full bg-[#f1ecfb] text-[#7957c2] flex items-center justify-center font-bold text-[11px] shrink-0">
          RK
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="text-[12px] font-semibold text-[#20302d] truncate">Rahul Khanna</div>
          <div className="text-[10px] text-[#80908a]">+91 98765 43210</div>
        </div>
        <span className="text-[10px] text-[#1f9d65] font-semibold bg-[#e8f7ef] px-1.5 py-[2px] rounded-full">240 pts</span>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto py-1">
        {!hasItems ? (
          <div className="text-center py-9 px-4 text-[#80908a]">
            <div className="text-[40px] mb-2 opacity-40">🛒</div>
            <div className="text-[13px]">No items yet.</div>
            <div className="text-[11px]">Click + to add dishes</div>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="px-3.5 py-[7px] flex items-center gap-[7px] border-b border-[#eef4ef] hover:bg-[#f7f9f5] transition-colors">
              <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${item.veg ? 'bg-[#1f9d65]' : 'bg-[#d64545]'}`} />
              <div className="flex-1">
                <div className="text-[12px] font-medium text-[#20302d] leading-[1.3]">{item.name}</div>
              </div>
              <div className="flex items-center gap-[3px] shrink-0">
                <button
                  onClick={() => onRemove(item.id)}
                  className="w-5 h-5 rounded-[4px] border border-[#dce6df] bg-[#f7f9f5] text-[13px] text-[#4b5b56] flex items-center justify-center cursor-pointer hover:bg-[#dce6df]"
                >−</button>
                <span className="text-[12px] font-bold min-w-[14px] text-center">{item.qty}</span>
                <button
                  onClick={() => onAdd(item)}
                  className="w-5 h-5 rounded-[4px] border border-[#dce6df] bg-[#f7f9f5] text-[13px] text-[#4b5b56] flex items-center justify-center cursor-pointer hover:bg-[#dce6df]"
                >+</button>
              </div>
              <span className="text-[12px] font-semibold text-[#20302d] min-w-[44px] text-right">
                ₹{item.price * item.qty}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Running KOT (shown when has items) */}
      {hasItems && (
        <div className="px-3.5 py-2 border-t border-[#dce6df]">
          <div className="text-[10px] font-semibold text-[#80908a] uppercase tracking-[0.5px] mb-1.5">Running KOT</div>
          <div className="flex flex-col gap-[3px]">
            <div className="flex items-center gap-1.5 text-[11px] py-[3px]">
              <span className="bg-[#e8f7ef] text-[#1f9d65] px-1.5 py-[2px] rounded-full text-[9px] font-bold uppercase">Ready</span>
              <span className="flex-1">Paneer Tikka ×2</span>
              <span className="text-[#1f9d65] text-[13px]">✓</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] py-[3px]">
              <span className="bg-[#fff4dc] text-[#c88716] px-1.5 py-[2px] rounded-full text-[9px] font-bold uppercase">Prep</span>
              <span className="flex-1">Dal Makhani ×1</span>
              <span className="text-[#c88716] text-[13px]">⏱</span>
            </div>
          </div>
        </div>
      )}

      {/* Order note */}
      {hasItems && (
        <div className="mx-3.5 my-1.5 border border-dashed border-[#bfd0c7] rounded-[8px] px-2.5 py-[7px] text-[#80908a] text-[11.5px] cursor-pointer flex items-center gap-1.5 hover:border-[#d9572b] hover:text-[#d9572b] transition-colors">
          ✏️ Add order note or special instruction…
        </div>
      )}

      {/* Totals */}
      {hasItems && (
        <div className="px-3.5 py-2.5 border-t border-[#dce6df]">
          <div className="flex justify-between text-[12px] text-[#4b5b56] mb-1 items-center">
            <span>Subtotal</span><span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-[12px] text-[#1f9d65] mb-1 items-center">
            <span className="flex items-center gap-1">🏷️ Loyalty Discount (5%)</span>
            <span>−₹{discount}</span>
          </div>
          <div className="flex justify-between text-[12px] text-[#4b5b56] mb-1 items-center">
            <span>CGST (2.5%)</span><span>₹{cgst}</span>
          </div>
          <div className="flex justify-between text-[12px] text-[#4b5b56] mb-1 items-center">
            <span>SGST (2.5%)</span><span>₹{sgst}</span>
          </div>
          <div className="flex justify-between text-[15px] font-bold text-[#20302d] pt-1.5 mt-0.5 border-t-[1.5px] border-[#dce6df]">
            <span>Grand Total</span><span>₹{grand}</span>
          </div>
          <div className="mt-1.5">
            <span className="text-[10px] bg-[#e8f7ef] text-[#1f9d65] px-[7px] py-[2px] rounded-full font-semibold">
              You save ₹{discount} 🎉
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-3.5 py-2.5 border-t border-[#dce6df] flex flex-col gap-[7px]">
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
                  ? 'text-[#1f9d65] border-[#a9d9bd] hover:bg-[#e8f7ef]'
                  : 'border-[#dce6df] bg-white text-[#4b5b56] hover:bg-[#f7f9f5]'}`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <button
          onClick={onPay}
          className="w-full py-[11px] rounded-xl bg-[#d9572b] text-white text-[14px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#b94422] transition-colors cursor-pointer"
        >
          💳 Proceed to Payment
        </button>
      </div>
    </aside>
  );
}
