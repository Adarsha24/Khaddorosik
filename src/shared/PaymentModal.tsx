'use client';
import { useState } from 'react';
import { X, Banknote, CreditCard, Smartphone, Wallet, ArrowLeftRight } from 'lucide-react';
import type { CartItem } from '@/types';

interface Props {
  cart: CartItem[];
  onClose: () => void;
  onConfirm: () => void;
}

const METHODS = [
  { id: 'cash',   label: 'Cash',   Icon: Banknote        },
  { id: 'card',   label: 'Card',   Icon: CreditCard      },
  { id: 'upi',    label: 'UPI',    Icon: Smartphone      },
  { id: 'wallet', label: 'Wallet', Icon: Wallet          },
  { id: 'paytm',  label: 'Paytm',  Icon: Smartphone      },
  { id: 'split',  label: 'Split',  Icon: ArrowLeftRight  },
];

const TIPS = ['No Tip', '5%', '10%', 'Custom'];

export default function PaymentModal({ cart, onClose, onConfirm }: Props) {
  const [method, setMethod] = useState('cash');
  const [tip, setTip] = useState('No Tip');

  const sub      = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const disc     = Math.round(sub * 0.05);
  const taxable  = sub - disc;
  const cgst     = Math.round(taxable * 0.025);
  const sgst     = Math.round(taxable * 0.025);
  const grand    = taxable + cgst + sgst;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="modal-anim rounded-2xl w-[520px] max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--surface)', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <span className="text-[16px] font-bold" style={{ color: 'var(--text1)' }}>
            💳 Settle Payment
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
            style={{ border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text2)' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Summary */}
        <div
          className="px-5 py-4"
          style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="text-[28px] font-extrabold text-center" style={{ color: 'var(--text1)' }}>
            ₹{grand.toLocaleString('en-IN')}
          </div>
          <div className="text-center text-[12px] mt-1" style={{ color: 'var(--text3)' }}>
            Table 7 • Rahul Khanna • 3 guests
          </div>
          <div className="flex justify-center gap-4 mt-2 text-[11px]" style={{ color: 'var(--text3)' }}>
            <span>Subtotal: ₹{sub.toLocaleString('en-IN')}</span>
            <span>GST: ₹{(cgst + sgst).toLocaleString('en-IN')}</span>
            <span style={{ color: 'var(--green)' }}>Discount: −₹{disc.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="px-5 py-4">
          {/* Methods */}
          <div
            className="text-[11px] font-bold uppercase tracking-wider mb-2.5"
            style={{ color: 'var(--text3)' }}
          >
            Payment Method
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {METHODS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setMethod(id)}
                className="border-2 rounded-xl py-3 flex flex-col items-center gap-1.5 text-[12px] font-semibold cursor-pointer transition-all"
                style={
                  method === id
                    ? { borderColor: 'var(--primary)', background: 'var(--primary-light)', color: 'var(--primary)' }
                    : { borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text2)' }
                }
              >
                <Icon size={22} />
                {label}
              </button>
            ))}
          </div>

          {/* Split section */}
          {method === 'split' && (
            <div className="rounded-lg p-3 mb-4" style={{ background: 'var(--surface2)' }}>
              <div
                className="text-[11px] font-bold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text3)' }}
              >
                Split Payment
              </div>
              {[
                { label: '💵 Cash', defaultVal: '800' },
                { label: '📱 UPI',  defaultVal: String(grand - 800) },
              ].map(({ label, defaultVal }) => (
                <div key={label} className="flex items-center gap-2 mb-1.5 text-[12px]">
                  <span className="flex-1 font-medium" style={{ color: 'var(--text2)' }}>{label}</span>
                  <input
                    type="number"
                    defaultValue={defaultVal}
                    className="w-20 h-[30px] rounded-lg px-2 text-right text-[12px] outline-none"
                    style={{ border: '1px solid var(--border)', fontFamily: 'inherit' }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Tip */}
          <div
            className="text-[11px] font-bold uppercase tracking-wider mb-2.5"
            style={{ color: 'var(--text3)' }}
          >
            Add Tip
          </div>
          <div className="flex gap-2 mb-5">
            {TIPS.map((t) => (
              <button
                key={t}
                onClick={() => setTip(t)}
                className="px-3 py-1.5 rounded-full border text-[11px] font-semibold cursor-pointer transition-all"
                style={
                  tip === t
                    ? { background: 'var(--green-bg)', color: 'var(--green)', borderColor: '#aed6bc' }
                    : { background: 'var(--surface2)', color: 'var(--text2)', borderColor: 'var(--border)' }
                }
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={onConfirm}
            className="w-full py-3.5 rounded-xl text-[15px] font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-all"
            style={{ background: 'var(--green)', border: 'none' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#219150'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--green)'; }}
          >
            ✓ Confirm Payment • ₹{grand.toLocaleString('en-IN')}
          </button>
        </div>
      </div>
    </div>
  );
}
