'use client';

type Screen =
  | 'billing'
  | 'tables'
  | 'kitchen'
  | 'reservation'
  | 'reports'
  | 'inventory'
  | 'employees'
  | 'crm';

const NAV_TOP: { id: Screen; icon: string; label: string; badge?: number }[] = [
  { id: 'billing',     icon: '🧾', label: 'Billing' },
  { id: 'tables',      icon: '🪑', label: 'Tables',  badge: 3 },
  { id: 'kitchen',     icon: '👨‍🍳', label: 'Kitchen' },
  { id: 'reservation', icon: '📅', label: 'Reserv.' },
];

const NAV_BOTTOM: { id: Screen; icon: string; label: string }[] = [
  { id: 'reports',   icon: '📊', label: 'Reports' },
  { id: 'inventory', icon: '📦', label: 'Inventory' },
  { id: 'employees', icon: '👥', label: 'Staff' },
  { id: 'crm',       icon: '🤝', label: 'CRM' },
];

type Props = {
  active: Screen;
  onNavigate: (s: Screen) => void;
};

export default function Sidebar({ active, onNavigate }: Props) {
  const NavItem = ({
    id, icon, label, badge,
  }: { id: Screen; icon: string; label: string; badge?: number }) => (
    <button
      onClick={() => onNavigate(id)}
      className={`w-[46px] h-[46px] rounded-[10px] flex flex-col items-center justify-center cursor-pointer gap-[2px] text-[8.5px] font-semibold text-center tracking-[0.2px] transition-all relative
        ${active === id ? 'bg-[#d9572b] text-white' : 'text-[#80908a] hover:bg-white/7 hover:text-[#ccc]'}`}
    >
      <span className="text-[18px] leading-none">{icon}</span>
      <span>{label}</span>
      {badge && (
        <span className="absolute top-[5px] right-[5px] w-4 h-4 rounded-full bg-[#c88716] text-white text-[9px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <aside className="w-[62px] bg-[#284a45] flex flex-col items-center py-2.5 gap-0.5 shrink-0 overflow-hidden">
      {NAV_TOP.map((n) => <NavItem key={n.id} {...n} />)}

      <div className="w-[30px] h-px bg-white/8 my-1" />

      {NAV_BOTTOM.map((n) => <NavItem key={n.id} {...n} />)}

      <div className="flex-1" />

      <div className="w-[30px] h-px bg-white/8 my-1" />

      <NavItem id={'billing' as Screen} icon="🔄" label="Sync" />
      <NavItem id={'billing' as Screen} icon="🚪" label="Exit" />
    </aside>
  );
}
