'use client';

import { Reservation, ResStatus } from '@/data/reservationData';

type Props = {
  reservations: Reservation[];
  selectedId: number | null;
  onSelect: (r: Reservation) => void;
};

const STATUS_STYLES: Record<ResStatus, { label: string; cls: string }> = {
  conf: { label: 'Confirmed', cls: 'bg-[#eafaf1] text-[#27ae60]' },
  pend: { label: 'Pending',   cls: 'bg-[#fff8e1] text-[#d4900a]' },
  canc: { label: 'Cancelled', cls: 'bg-[#fdecea] text-[#e53e3e]' },
};

export default function ReservationList({ reservations, selectedId, onSelect }: Props) {
  if (reservations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[#8a95a8] py-16 gap-2">
        <span className="text-[40px] opacity-30">📅</span>
        <span className="text-[13px]">No reservations found</span>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {reservations.map((r) => {
        const st = STATUS_STYLES[r.status];
        const isActive = selectedId === r.id;
        return (
          <div
            key={r.id}
            onClick={() => onSelect(r)}
            className={`px-4 py-[11px] border-b border-[#e2e6ec] cursor-pointer flex gap-2.5 items-center transition-colors
              ${isActive ? 'bg-[#fff3ee]' : 'hover:bg-[#f7f8fb]'}`}
          >
            {/* Time block */}
            <div className="bg-[#1e2433] text-white rounded-[8px] px-[9px] py-[5px] text-center shrink-0">
              <div className="text-[13px] font-bold font-mono leading-tight">{r.time}</div>
              <div className="text-[9px] text-white/50 leading-tight mt-[1px]">{r.date}</div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-[#1e2433] truncate">{r.name}</div>
              <div className="text-[11px] text-[#8a95a8] mt-[1px] truncate">{r.detail}</div>
            </div>

            {/* Status badge */}
            <span className={`text-[10px] font-bold px-2 py-[3px] rounded-full shrink-0 ${st.cls}`}>
              {st.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}