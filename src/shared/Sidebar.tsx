'use client';
import {
  Receipt, LayoutGrid, ChefHat, CalendarDays,
  BarChart2, Package, Users, HeartHandshake,
  RefreshCw, LogOut,
} from 'lucide-react';
import type { ScreenId } from '@/types';

const TOP_NAV = [
  { id: 'billing'     as ScreenId, icon: Receipt,       label: 'Billing'  },
  { id: 'tables'      as ScreenId, icon: LayoutGrid,    label: 'Tables',   badge: 3 },
  { id: 'kitchen'     as ScreenId, icon: ChefHat,       label: 'Kitchen'  },
  { id: 'reservation' as ScreenId, icon: CalendarDays,  label: 'Reserv.'  },
];
const BOTTOM_NAV = [
  { id: 'reports'     as ScreenId, icon: BarChart2,     label: 'Reports'  },
  { id: 'inventory'   as ScreenId, icon: Package,       label: 'Invntry'  },
  { id: 'employees'   as ScreenId, icon: Users,         label: 'Staff'    },
  { id: 'crm'         as ScreenId, icon: HeartHandshake,label: 'CRM'      },
];

interface Props {
  active: ScreenId;
  onNavigate: (id: ScreenId) => void;
}

function NavBtn({
  id, icon: Icon, label, badge, active, onNavigate,
}: {
  id: ScreenId; icon: React.ElementType; label: string;
  badge?: number; active: ScreenId; onNavigate: (id: ScreenId) => void;
}) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onNavigate(id)}
      title={label}
      className="relative w-[46px] h-[46px] rounded-[10px] flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all text-[8.5px] font-semibold text-center tracking-wide"
      style={isActive ? { background: 'var(--primary)', color: '#fff' } : { color: 'var(--text3)' }}
      onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; }}
      onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      <Icon size={19} />
      <span>{label}</span>
      {badge != null && (
        <span
          className="absolute top-[5px] right-[5px] w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
          style={{ background: 'var(--amber)' }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

const Divider = () => (
  <div className="w-[30px] h-px my-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
);

export default function Sidebar({ active, onNavigate }: Props) {
  return (
    <div
      className="w-[62px] flex flex-col items-center py-2.5 gap-0.5 flex-shrink-0 overflow-hidden"
      style={{ background: 'var(--dark2)' }}
    >
      {TOP_NAV.map((n) => (
        <NavBtn key={n.id} {...n} active={active} onNavigate={onNavigate} />
      ))}

      <Divider />

      {BOTTOM_NAV.map((n) => (
        <NavBtn key={n.id} {...n} active={active} onNavigate={onNavigate} />
      ))}

      <div className="flex-1" />
      <Divider />

      {([{ Icon: RefreshCw, label: 'Sync' }, { Icon: LogOut, label: 'Exit' }] as const).map(({ Icon, label }) => (
        <button
          key={label}
          title={label}
          className="w-[46px] h-[46px] rounded-[10px] flex flex-col items-center justify-center gap-0.5 text-[8.5px] font-semibold cursor-pointer transition-all"
          style={{ color: 'var(--text3)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <Icon size={17} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
