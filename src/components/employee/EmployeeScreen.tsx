'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { EMPLOYEES } from '@/data';
import type { ToastType } from '@/types';

interface Props { toast: (msg: string, type: ToastType) => void; }

const AV_COLORS: Record<string, { bg: string; col: string }> = {
  'ea-a': { bg: 'var(--primary-light)', col: 'var(--primary)' },
  'ea-b': { bg: 'var(--blue-bg)',       col: 'var(--blue)'    },
  'ea-c': { bg: 'var(--purple-bg)',     col: 'var(--purple)'  },
  'ea-d': { bg: 'var(--green-bg)',      col: 'var(--green)'   },
  'ea-e': { bg: 'var(--amber-bg)',      col: 'var(--amber)'   },
};

const PERMS = [
  'Billing & Orders','View Reports','Apply Discounts','Manage Inventory',
  'Cancel Orders','Cash Drawer Access','Admin Settings',
];
const DEFAULT_PERMS = [true, true, false, false, true, false, false];

export default function EmployeesScreen({ toast }: Props) {
  const [selected, setSelected] = useState(0);
  const [perms,    setPerms]    = useState(DEFAULT_PERMS);
  const emp = EMPLOYEES[selected];
  const av  = AV_COLORS[emp.cls] ?? { bg: 'var(--surface3)', col: 'var(--text2)' };

  const togglePerm = (i: number) =>
    setPerms((prev) => prev.map((p, idx) => (idx === i ? !p : p)));

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background: 'var(--surface3)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 shrink-0"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', height: 48 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text1)' }}>Staff Management</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => toast('Staff added!', 'success')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer"
          style={{ background: 'var(--primary)' }}><Plus size={13} /> Add Staff</button>
      </div>

      {/* Sub-tabs */}
      <div className="flex px-4 shrink-0" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        {['All Staff','Permissions','Sales Reports','Attendance'].map((t, i) => (
          <button key={t} className="py-3 px-5 text-[13px] font-medium cursor-pointer border-b-2 -mb-px whitespace-nowrap"
            style={i === 0 ? { color: 'var(--primary)', borderColor: 'var(--primary)', fontWeight: 600 } : { color: 'var(--text3)', borderColor: 'transparent' }}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Staff list */}
        <div className="overflow-y-auto shrink-0" style={{ width: 280, borderRight: '1px solid var(--border)', background: 'var(--surface)' }}>
          {EMPLOYEES.map((e, i) => {
            const c = AV_COLORS[e.cls] ?? { bg: 'var(--surface3)', col: 'var(--text2)' };
            return (
              <div key={e.name} onClick={() => setSelected(i)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all"
                style={{ borderBottom: '1px solid var(--border)', background: selected === i ? 'var(--primary-light)' : 'var(--surface)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: c.bg, color: c.col }}>{e.init}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)' }}>{e.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{e.role}</div>
                </div>
                <div className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: e.online ? 'var(--green)' : 'var(--border2)' }} />
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="flex-1 overflow-y-auto p-5" style={{ background: 'var(--surface2)' }}>
          <div style={{ maxWidth: 480 }}>
            {/* Profile card */}
            <div className="flex items-center gap-4 p-4 rounded-xl mb-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-extrabold shrink-0"
                style={{ background: av.bg, color: av.col }}>{emp.init}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text1)' }}>{emp.name}</div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: 'var(--primary-light)', color: 'var(--primary)' }}>{emp.role}</span>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Employee #0042 · Since March 2022</div>
              </div>
              <button className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)' }}>Edit</button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
              {[
                { val: '₹1.2L', lbl: 'Sales This Month', col: 'var(--primary)' },
                { val: '84',    lbl: 'Tables Served',     col: 'var(--text1)'  },
                { val: '4.8★',  lbl: 'Avg. Rating',       col: 'var(--green)'  },
              ].map(({ val, lbl, col }) => (
                <div key={lbl} className="rounded-xl p-4 text-center"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: col, marginBottom: 2 }}>{val}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>{lbl}</div>
                </div>
              ))}
            </div>

            {/* Permissions */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>Access Permissions</span>
              </div>
              {PERMS.map((perm, i) => (
                <div key={perm} className="flex items-center justify-between px-4 py-2.5"
                  style={{ borderBottom: i < PERMS.length - 1 ? '1px solid var(--border)' : undefined }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text1)' }}>{perm}</span>
                  <button onClick={() => togglePerm(i)}
                    className="relative transition-all cursor-pointer"
                    style={{ width: 40, height: 20, borderRadius: 10, background: perms[i] ? 'var(--primary)' : 'var(--border)', border: 'none' }}>
                    <span style={{
                      position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%',
                      background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      left: perms[i] ? 22 : 2, transition: 'left 0.15s',
                    }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
