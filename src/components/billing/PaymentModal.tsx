'use client';

import { useState } from 'react';

type Props = {
  open: boolean;
  total: number;
  onClose: () => void;
  onConfirm: () => void;
};

type PayMethod = 'cash' | 'card' | 'upi' | 'paytm' | 'wallet' | 'split';
type TipOption = 'none' | '5' | '10' | 'custom';

const PAY_METHODS: { id: PayMethod; icon: string; label: string }[] = [
  { id: 'cash',   icon: '💵', label: 'Cash' },
  { id: 'card',   icon: '💳', label: 'Card' },
  { id: 'upi',    icon: '📱', label: 'UPI' },
  { id: 'paytm',  icon: '🅿️', label: 'Paytm' },
  { id: 'wallet', icon: '👛', label: 'Wallet' },
  { id: 'split',  icon: '✂️', label: 'Split' },
];

export default function PaymentModal({ open, total, onClose, onConfirm }: Props) {
  const [payMethod, setPayMethod] = useState<PayMethod>('cash');
  const [tipOption, setTipOption] = useState<TipOption>('none');

  if (!open) return null;

  const subtotal = Math.round(total / 1.05 / 0.95);
  const gst      = Math.round(subtotal * 0.05);
  const discount = Math.round(subtotal * 0.05);
  const display  = total || 1456;

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-[400px] max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#dce6df]">
          <span className="text-[16px] font-bold text-[#20302d] flex items-center gap-2">
            💳 Settle Payment
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#80908a] hover:bg-[#eef4ef] cursor-pointer text-[18px]"
          >
            ×
          </button>
        </div>

        {/* Summary */}
        <div className="bg-[#f7f9f5] px-5 py-5 text-center border-b border-[#dce6df]">
          <div className="text-[32px] font-bold text-[#20302d]">₹{display.toLocaleString('en-IN')}</div>
          <div className="text-[12px] text-[#80908a] mt-1">Table 7 • Rahul Khanna • 3 guests</div>
          <div className="flex justify-center gap-3 mt-2 text-[11px] text-[#80908a]">
            <span>Subtotal: ₹1,380</span>
            <span>GST: ₹138</span>
            <span className="text-[#1f9d65]">Discount: −₹69</span>
          </div>
        </div>

        {/* Payment methods */}
        <div className="px-5 pt-4">
          <div className="text-[11px] font-semibold text-[#80908a] uppercase tracking-[0.5px] mb-2.5">
            Payment Method
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {PAY_METHODS.map(({ id, icon, label }) => (
              <button
                key={id}
                onClick={() => setPayMethod(id)}
                className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border-2 text-[12px] font-semibold cursor-pointer transition-all
                  ${payMethod === id
                    ? 'border-[#d9572b] bg-[#fff0e8] text-[#d9572b]'
                    : 'border-[#dce6df] bg-white text-[#4b5b56] hover:border-[#bfd0c7]'}`}
              >
                <span className="text-[22px]">{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Split section */}
          {payMethod === 'split' && (
            <div className="bg-[#f7f9f5] rounded-xl p-3.5 mb-4">
              <div className="text-[11px] font-semibold text-[#80908a] uppercase tracking-[0.5px] mb-2">Split Payment</div>
              <div className="flex items-center justify-between mb-2 gap-3">
                <span className="text-[12px] font-medium flex items-center gap-1.5">💵 Cash</span>
                <input type="number" defaultValue="800" className="flex-1 border border-[#dce6df] rounded-[6px] px-2 py-1.5 text-[12px] text-right outline-none focus:border-[#d9572b]" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[12px] font-medium flex items-center gap-1.5">📱 UPI</span>
                <input type="number" defaultValue="656" className="flex-1 border border-[#dce6df] rounded-[6px] px-2 py-1.5 text-[12px] text-right outline-none focus:border-[#d9572b]" />
              </div>
            </div>
          )}

          {/* Tip */}
          <div className="mb-4">
            <div className="text-[11px] font-semibold text-[#80908a] uppercase tracking-[0.5px] mb-2">Add Tip</div>
            <div className="flex gap-2">
              {(['none', '5', '10', 'custom'] as TipOption[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTipOption(t)}
                  className={`flex-1 py-2 rounded-[8px] text-[11.5px] font-semibold border cursor-pointer transition-all
                    ${tipOption === t
                      ? 'bg-[#20302d] text-white border-[#20302d]'
                      : 'border-[#dce6df] bg-white text-[#4b5b56] hover:bg-[#f7f9f5]'}`}
                >
                  {t === 'none' ? 'No Tip' : t === 'custom' ? 'Custom' : `${t}% (₹${Math.round(display * Number(t) / 100)})`}
                </button>
              ))}
            </div>
          </div>

          {/* Confirm */}
          <button
            onClick={onConfirm}
            className="w-full py-3.5 rounded-xl bg-[#d9572b] text-white text-[15px] font-bold flex items-center justify-center gap-2 hover:bg-[#b94422] transition-colors cursor-pointer mb-5"
          >
            ✓ Confirm Payment • ₹{display.toLocaleString('en-IN')}
          </button>
        </div>
      </div>
    </div>
  );
}
