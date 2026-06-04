'use client';

import { useState } from 'react';
import { Reservation, ResStatus } from '@/data/reservationData';

type Props = {
  selected: Reservation | null;
  mode: 'view' | 'new';
  onConfirm: (msg: string) => void;
  onCancel: () => void;
  onStatusChange: (id: number, status: ResStatus) => void;
};

const TABLE_OPTIONS = [
  'Select table',
  'Table 1 (2 pax)',
  'Table 3 (4 pax)',
  'Table 4 (2 pax)',
  'Table 6 (6 pax)',
  'Table 8 (2 pax)',
  'Table 9 (8 pax)',
  'Table 10 (4 pax)',
  'Table 12 (4 pax)',
  'Table 14 (2 pax)',
];

const inputCls =
  'w-full h-[34px] border border-[#e2e6ec] rounded-[8px] px-[10px] text-[12px] outline-none bg-[#f7f8fb] focus:border-[#e85c26] focus:bg-white transition-all';
const labelCls =
  'text-[11px] font-bold text-[#8a95a8] uppercase tracking-[0.4px] mb-[5px] mt-3 block';

export default function ReservationDetail({ selected, mode, onConfirm, onCancel, onStatusChange }: Props) {
  const [form, setForm] = useState({
    name: '', phone: '', datetime: '', table: 'Select table', guests: '', note: '',
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.name.trim() || form.table === 'Select table') {
      onConfirm('⚠️ Please fill Guest Name and Table');
      return;
    }
    onConfirm('Reservation confirmed! ✓');
  };

  /* ── NEW RESERVATION FORM ── */
  if (mode === 'new') {
    return (
      <div className="overflow-y-auto h-full px-4 py-4">
        <div className="text-[14px] font-bold text-[#1e2433] mb-[2px]">New Reservation</div>
        <div className="text-[11px] text-[#8a95a8] mb-3">Fill details below to book a table</div>

        <label className={labelCls}>Guest Name</label>
        <input
          className={inputCls} type="text" placeholder="Full name"
          value={form.name} onChange={(e) => set('name', e.target.value)}
        />

        <label className={labelCls}>Phone Number</label>
        <input
          className={inputCls} type="text" placeholder="+91 XXXXX XXXXX"
          value={form.phone} onChange={(e) => set('phone', e.target.value)}
        />

        <label className={labelCls}>Date & Time</label>
        <input
          className={inputCls} type="datetime-local"
          value={form.datetime} onChange={(e) => set('datetime', e.target.value)}
        />

        <label className={labelCls}>Table</label>
        <select
          className={`${inputCls} cursor-pointer`}
          value={form.table}
          onChange={(e) => set('table', e.target.value)}
        >
          {TABLE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
        </select>

        <label className={labelCls}>Number of Guests</label>
        <input
          className={inputCls} type="number" placeholder="e.g. 4" min="1"
          value={form.guests} onChange={(e) => set('guests', e.target.value)}
        />

        <label className={labelCls}>Special Request</label>
        <textarea
          className="w-full border border-[#e2e6ec] rounded-[8px] px-[10px] py-2 text-[12px] outline-none bg-[#f7f8fb] focus:border-[#e85c26] focus:bg-white transition-all resize-none h-[64px]"
          placeholder="Allergies, occasion, seating preference…"
          value={form.note}
          onChange={(e) => set('note', e.target.value)}
        />

        <div className="flex gap-2 mt-3">
          <button
            onClick={onCancel}
            className="flex-1 py-[9px] rounded-[8px] border border-[#e2e6ec] bg-white text-[#4a5568] text-[12px] font-semibold cursor-pointer hover:bg-[#f7f8fb] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-[2] py-[9px] rounded-[8px] bg-[#e85c26] text-white text-[12px] font-semibold cursor-pointer hover:bg-[#c94d1d] transition-colors"
          >
            Confirm Reservation
          </button>
        </div>
      </div>
    );
  }

  /* ── EMPTY STATE ── */
  if (!selected) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-[#8a95a8]">
        <div className="text-[40px] mb-2 opacity-30">📋</div>
        <div className="text-[13px] font-medium">Select a reservation</div>
        <div className="text-[11px] mt-1">to view details</div>
      </div>
    );
  }

  /* ── VIEW DETAIL ── */
  const statusMap: Record<ResStatus, { label: string; cls: string }> = {
    conf: { label: 'Confirmed', cls: 'bg-[#eafaf1] text-[#27ae60]' },
    pend: { label: 'Pending',   cls: 'bg-[#fff8e1] text-[#d4900a]' },
    canc: { label: 'Cancelled', cls: 'bg-[#fdecea] text-[#e53e3e]' },
  };
  const st = statusMap[selected.status];

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between items-center py-[8px] border-b border-[#f5f7fa] text-[12px]">
      <span className="text-[#8a95a8] font-medium">{label}</span>
      <span className="font-semibold text-[#1e2433] text-right max-w-[60%]">{value}</span>
    </div>
  );

  return (
    <div className="overflow-y-auto h-full">
      {/* Dark header */}
      <div className="px-4 py-3 bg-[#1e2433]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[15px] font-bold text-white">{selected.name}</div>
            <div className="text-[11px] text-white/50 mt-[2px]">{selected.phone}</div>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 mt-[3px] ${st.cls}`}>
            {st.label}
          </span>
        </div>
      </div>

      {/* Detail rows */}
      <div className="px-4 py-1">
        <Row label="Date"   value={selected.date} />
        <Row label="Time"   value={selected.time} />
        <Row label="Guests" value={`${selected.guests} pax`} />
        <Row label="Table"  value={selected.table} />
        {selected.note && <Row label="Note" value={selected.note} />}
      </div>

      {/* Action buttons */}
      <div className="px-4 py-3 flex flex-col gap-2">
        {selected.status === 'pend' && (
          <button
            onClick={() => onStatusChange(selected.id, 'conf')}
            className="w-full py-[9px] rounded-[8px] bg-[#27ae60] text-white text-[12px] font-semibold cursor-pointer hover:bg-[#219150] transition-colors"
          >
            ✓ Confirm Reservation
          </button>
        )}
        {selected.status === 'conf' && (
          <button
            onClick={() => onConfirm('Guest seated and order started')}
            className="w-full py-[9px] rounded-[8px] bg-[#e85c26] text-white text-[12px] font-semibold cursor-pointer hover:bg-[#c94d1d] transition-colors"
          >
            🪑 Seat Guest & Start Order
          </button>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => onConfirm('Reminder sent to guest')}
            className="flex-1 py-[9px] rounded-[8px] border border-[#e2e6ec] bg-white text-[#4a5568] text-[12px] font-semibold cursor-pointer hover:bg-[#f7f8fb] transition-colors"
          >
            📲 Send Reminder
          </button>
          {selected.status !== 'canc' && (
            <button
              onClick={() => onStatusChange(selected.id, 'canc')}
              className="flex-1 py-[9px] rounded-[8px] border border-[#fdecea] bg-[#fdecea] text-[#e53e3e] text-[12px] font-semibold cursor-pointer hover:bg-[#fbd0cc] transition-colors"
            >
              ✕ Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}