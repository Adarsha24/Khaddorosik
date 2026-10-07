'use client';

import { useState } from 'react';
import type { CartItem } from '@/types';

type Props = {
  cart: CartItem[];
  onClose: () => void;
  onConfirm: (method: string, tipAmount: number) => void;
  total?: number;
  open?: boolean;
  contextLabel?: string;
};

type PayMethod = 'cash' | 'card' | 'upi' | 'wallet';
type TipOption = 'none' | '5' | '10' | 'custom';

const PAY_METHODS: { id: PayMethod; label: string }[] = [
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
  { id: 'upi', label: 'UPI' },
  { id: 'wallet', label: 'Wallet' },
];

export default function PaymentModal({ cart, total, open, onClose, onConfirm, contextLabel }: Props) {
  const [payMethod, setPayMethod] = useState<PayMethod>('cash');
  const [tipOption, setTipOption] = useState<TipOption>('none');
  const [customTip, setCustomTip] = useState('');

  if (open === false) return null;

  // Fallback only — callers should pass the server-calculated `total`.
  // No discount is assumed here; discounts are applied server-side.
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartTotal = parseFloat((cartSubtotal * 1.05).toFixed(2));

  const baseTotal = total ?? cartTotal;

  const tipAmount =
    tipOption === '5' ? Math.round(baseTotal * 0.05)
    : tipOption === '10' ? Math.round(baseTotal * 0.10)
    : tipOption === 'custom' ? (Number(customTip) || 0)
    : 0;

  const display = baseTotal + tipAmount;

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-[400px] max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#dce6df]">
          <span className="text-[16px] font-bold text-[#20302d]">Settle Payment</span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#80908a] hover:bg-[#eef4ef] cursor-pointer text-[18px]"
          >
            x
          </button>
        </div>

        <div className="bg-[#f7f9f5] px-5 py-5 text-center border-b border-[#dce6df]">
          <div className="text-[32px] font-bold text-[#20302d]">Rs {display.toLocaleString('en-IN')}</div>
          <div className="text-[12px] text-[#80908a] mt-1">{contextLabel ?? 'Walk-in order'}</div>
          {tipAmount > 0 && (
            <div className="text-[11px] text-[#80908a] mt-1">
              (Rs {baseTotal.toLocaleString('en-IN')} + Rs {tipAmount.toLocaleString('en-IN')} tip)
            </div>
          )}
        </div>

        <div className="px-5 pt-4">
          <div className="text-[11px] font-semibold text-[#80908a] uppercase tracking-[0.5px] mb-2.5">
            Payment Method
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {PAY_METHODS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setPayMethod(id)}
                className={`flex items-center justify-center py-3 rounded-xl border-2 text-[12px] font-semibold cursor-pointer transition-all
                  ${payMethod === id
                    ? 'border-[#d9572b] bg-[#fff0e8] text-[#d9572b]'
                    : 'border-[#dce6df] bg-white text-[#4b5b56] hover:border-[#bfd0c7]'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <div className="text-[11px] font-semibold text-[#80908a] uppercase tracking-[0.5px] mb-2">Add Tip</div>
            <div className="flex gap-2">
              {(['none', '5', '10', 'custom'] as TipOption[]).map((tip) => (
                <button
                  key={tip}
                  onClick={() => setTipOption(tip)}
                  className={`flex-1 py-2 rounded-[8px] text-[11.5px] font-semibold border cursor-pointer transition-all
                    ${tipOption === tip
                      ? 'bg-[#20302d] text-white border-[#20302d]'
                      : 'border-[#dce6df] bg-white text-[#4b5b56] hover:bg-[#f7f9f5]'}`}
                >
                  {tip === 'none' ? 'No Tip' : tip === 'custom' ? 'Custom' : `${tip}%`}
                </button>
              ))}
            </div>
            {tipOption === 'custom' && (
              <input
                type="number"
                value={customTip}
                onChange={(e) => setCustomTip(e.target.value)}
                placeholder="Enter tip amount"
                className="w-full mt-2 px-3 py-2 rounded-lg border border-[#dce6df] text-[13px] outline-none"
              />
            )}
          </div>

          <button
            onClick={() => onConfirm(payMethod, tipAmount)}
            className="w-full py-3.5 rounded-xl bg-[#d9572b] text-white text-[15px] font-bold flex items-center justify-center gap-2 hover:bg-[#b94422] transition-colors cursor-pointer mb-5"
          >
            Confirm Payment - Rs {display.toLocaleString('en-IN')}
          </button>
        </div>
      </div>
    </div>
  );
}