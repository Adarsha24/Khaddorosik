'use client';
import { Search, Download, Plus } from 'lucide-react';
import { CUSTOMERS } from '@/data';
import type { ToastType } from '@/types';

interface Props { toast: (msg: string, type: ToastType) => void; }

const TAG_STYLE: Record<string, { bg: string; col: string }> = {
  vip:      { bg: 'var(--purple-bg)', col: 'var(--purple)' },
  loyal:    { bg: 'var(--blue-bg)',   col: 'var(--blue)'   },
  new:      { bg: 'var(--green-bg)',  col: 'var(--green)'  },
  inactive: { bg: 'var(--surface3)', col: 'var(--text3)'  },
};

export default function CRMScreen({ toast }: Props) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background: 'var(--surface3)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 shrink-0"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', height: 48 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text1)' }}>Customer Relationship Management</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => toast('Exported!', 'info')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
          style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)' }}><Download size={12} /> Export</button>
        <button onClick={() => toast('Customer added!', 'success')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer"
          style={{ background: 'var(--primary)' }}><Plus size={13} /> Add Customer</button>
      </div>

      {/* Sub-tabs */}
      <div className="flex px-4 shrink-0" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        {['All Customers','Loyalty Program','Feedback','Campaigns'].map((t, i) => (
          <button key={t} className="py-3 px-5 text-[13px] font-medium cursor-pointer border-b-2 -mb-px whitespace-nowrap"
            style={i === 0 ? { color: 'var(--primary)', borderColor: 'var(--primary)', fontWeight: 600 } : { color: 'var(--text3)', borderColor: 'transparent' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 shrink-0"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }} />
          <input placeholder="Search customer…"
            style={{ height: 32, border: '1px solid var(--border)', borderRadius: 8, paddingLeft: 30, paddingRight: 10, fontSize: 12, fontFamily: 'inherit', background: 'var(--surface2)', outline: 'none', width: 260 }} />
        </div>
        {['All','VIP','Loyal','New','Inactive'].map((f, i) => (
          <button key={f} className="px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border"
            style={i === 0 ? { background: 'var(--primary-light)', color: 'var(--primary)', borderColor: '#f4b8a4' } : { background: 'var(--surface)', color: 'var(--text2)', borderColor: 'var(--border)' }}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead style={{ position: 'sticky', top: 0 }}>
            <tr style={{ background: 'var(--surface2)' }}>
              {['Customer','Phone','Visits','Total Spent','Last Visit','Loyalty Pts','Rating','Tag'].map((h) => (
                <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CUSTOMERS.map((c) => {
              const tag = TAG_STYLE[c.tag] ?? TAG_STYLE.inactive;
              return (
                <tr key={c.name} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}>
                  <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text1)' }}>{c.name}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--text2)', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{c.phone}</td>
                  <td style={{ padding: '10px 16px', fontWeight: 600, textAlign: 'center' }}>{c.visits}</td>
                  <td style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--primary)' }}>{c.spent}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--text2)' }}>{c.last}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: 'var(--amber-bg)', color: 'var(--amber)' }}>{c.pts} pts</span>
                  </td>
                  <td style={{ padding: '10px 16px', fontWeight: 600, color: '#f59e0b' }}>{c.rating !== '—' ? `★ ${c.rating}` : '—'}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: tag.bg, color: tag.col, textTransform: 'capitalize' }}>{c.tag}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
