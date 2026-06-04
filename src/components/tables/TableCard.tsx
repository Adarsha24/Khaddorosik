'use client';
import { CheckCircle, User, Calendar } from 'lucide-react';
import type { TableData } from '@/types';

interface Props {
  table: TableData;
  isSelected: boolean;   // ← your file has 'selected' — fix to 'isSelected'
  onClick: () => void;
}

const STATUS_STYLES: Record<string, { border: string; bg: string; badgeBg: string; badgeCol: string }> = {
  available: { border: '#c3e6cb',        bg: 'var(--green-bg)',   badgeBg: 'var(--green-bg)',     badgeCol: 'var(--green)'   },
  occupied:  { border: '#f59e0b',        bg: '#fffdf7',           badgeBg: '#fff8e1',             badgeCol: '#d4900a'        },
  running:   { border: 'var(--primary)', bg: '#fff8f5',           badgeBg: 'var(--primary-light)', badgeCol: 'var(--primary)' },
  reserved:  { border: 'var(--blue)',    bg: 'var(--blue-bg)',    badgeBg: 'var(--blue-bg)',      badgeCol: 'var(--blue)'    },
};

export default function TableCard({ table, isSelected, onClick }: Props) {
  const s = STATUS_STYLES[table.status];

  return (
    <div
      onClick={onClick}
      className="rounded-xl overflow-hidden cursor-pointer transition-all flex-shrink-0"
      style={{
        width: 132,
        height: 100,
        border: `2px solid ${isSelected ? 'var(--primary)' : s.border}`,
        background: s.bg,
        boxShadow: isSelected ? '0 4px 16px rgba(232,92,38,0.18)' : undefined,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = '';
        (e.currentTarget as HTMLElement).style.boxShadow = isSelected ? '0 4px 16px rgba(232,92,38,0.18)' : '';
      }}
    >
      <div className="flex items-center justify-between px-2.5 py-1.5">
        <span className="text-[15px] font-extrabold" style={{ color: 'var(--text1)' }}>T{table.num}</span>
        <span className="text-[10px]" style={{ color: 'var(--text3)' }}>{table.cap}p</span>
        <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
          style={{ background: s.badgeBg, color: s.badgeCol }}>
          {table.status}
        </span>
      </div>

      <div className="px-2.5">
        {table.status === 'available' && (
          <div className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: 'var(--green)' }}>
            <CheckCircle size={13} /> Available
          </div>
        )}
        {(table.status === 'occupied' || table.status === 'running') && (
          <>
            <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text3)' }}>
              <User size={10} /> {table.waiter}
            </div>
            <div className="text-[13px] font-bold mt-0.5" style={{ color: 'var(--primary)' }}>{table.amt}</div>
            <div className="text-[10px]" style={{ color: 'var(--text3)', fontFamily: "'DM Mono', monospace" }}>{table.time}</div>
          </>
        )}
        {table.status === 'reserved' && (
          <>
            <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text3)' }}>
              <Calendar size={10} /> {table.name ?? 'Reserved'}
            </div>
            <div className="text-[10px] font-semibold mt-1" style={{ color: 'var(--blue)' }}>{table.rtime}</div>
          </>
        )}
      </div>
    </div>
  );
}