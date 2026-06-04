'use client';
import { useState } from 'react';
import { RefreshCw, Plus } from 'lucide-react';
import { TABLES } from '@/data';
import TableCard from './TableCard';
import TableDetailSidebar from './TableDetailSidebar';
import type { TableData, ToastType } from '@/types';

// ✅ FIXED: was { onNavigateBilling: () => void } — now matches page.tsx
interface Props {
  toast: (msg: string, type: ToastType) => void;
  onNavigate: (id: string) => void;
}

const STATUS_FILTER_OPTS = [
  { key: 'all',       label: 'All (18)',      dot: '#888'           },
  { key: 'available', label: 'Available (7)', dot: 'var(--green)'   },
  { key: 'occupied',  label: 'Occupied (6)',  dot: '#f59e0b'        },
  { key: 'running',   label: 'Running (3)',   dot: 'var(--primary)' },
  { key: 'reserved',  label: 'Reserved (2)',  dot: 'var(--blue)'    },
];

const FLOORS = [
  { key: 'ground',  label: 'Ground Floor'    },
  { key: 'rooftop', label: 'Rooftop Terrace' },
  { key: 'private', label: 'Private Dining'  },
];

export default function TablesScreen({ toast, onNavigate }: Props) {
  const [selectedTable, setSelectedTable] = useState<TableData>(TABLES[4]);
  const [floor,         setFloor]         = useState('ground');
  const [statusFilter,  setStatusFilter]  = useState('all');

  const filtered = TABLES.filter(
    (t) => statusFilter === 'all' || t.status === statusFilter
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-12 flex-shrink-0"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <span className="text-[15px] font-bold" style={{ color: 'var(--text1)' }}>Table Management</span>
        <span className="text-[12px]" style={{ color: 'var(--text3)' }}>Ground Floor + Rooftop</span>
        <div className="flex-1" />
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border cursor-pointer"
          style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)' }}>
          <RefreshCw size={13} /> Refresh
        </button>
        <button onClick={() => toast('New table added', 'success')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white cursor-pointer"
          style={{ background: 'var(--primary)' }}>
          <Plus size={13} /> Add Table
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Status filter bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0"
            style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
            <div className="flex gap-1">
              {STATUS_FILTER_OPTS.map(({ key, label, dot }) => (
                <button key={key} onClick={() => setStatusFilter(key)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border cursor-pointer transition-all"
                  style={statusFilter === key
                    ? { background: 'var(--dark)', color: '#fff', borderColor: 'var(--dark)' }
                    : { background: 'var(--surface2)', color: 'var(--text2)', borderColor: 'var(--border)' }}>
                  <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: dot }} />
                  {label}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <button className="px-3 py-1 rounded-full text-[11px] font-semibold border cursor-pointer"
              style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)' }}>
              Merge Tables
            </button>
            <button className="px-3 py-1 rounded-full text-[11px] font-semibold border cursor-pointer"
              style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)' }}>
              Move Order
            </button>
          </div>

          {/* Floor tabs */}
          <div className="flex flex-shrink-0"
            style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)', padding: '6px 16px 0' }}>
            {FLOORS.map(({ key, label }) => (
              <button key={key} onClick={() => setFloor(key)}
                className="px-4 py-2 text-[12px] font-semibold cursor-pointer border-b-2 transition-all -mb-px"
                style={floor === key
                  ? { color: 'var(--primary)', borderColor: 'var(--primary)' }
                  : { color: 'var(--text3)',   borderColor: 'transparent'    }}>
                {label}
              </button>
            ))}
          </div>

          {/* Tables grid */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-wrap gap-2.5 content-start">
            {filtered.map((t) => (
              <TableCard
                key={t.num}
                table={t}
                isSelected={selectedTable.num === t.num}
                onClick={() => setSelectedTable(t)}
              />
            ))}
            <button onClick={() => toast('New table added', 'success')}
              className="rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all flex-shrink-0"
              style={{ width: 132, height: 100, border: '2px dashed var(--border)', background: 'var(--surface)', color: 'var(--text3)', fontSize: 11 }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--primary)'; el.style.color = 'var(--primary)'; el.style.background = 'var(--primary-light)'; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--text3)'; el.style.background = 'var(--surface)'; }}>
              <Plus size={22} />
              <span>Add Table</span>
            </button>
          </div>
        </div>

        {/* Detail sidebar */}
        <TableDetailSidebar
          table={selectedTable}
          toast={toast}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}