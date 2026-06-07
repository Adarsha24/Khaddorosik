'use client';
import { useEffect, useState } from 'react';

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const BellIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const SettingsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const HelpIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const ICON_BTNS = [
  { id: 'search',   Icon: SearchIcon,   dot: false },
  { id: 'bell',     Icon: BellIcon,     dot: true  },
  { id: 'settings', Icon: SettingsIcon, dot: false },
  { id: 'help',     Icon: HelpIcon,     dot: false },
];

export default function Topbar() {
  const [time,       setTime]       = useState('');
  const [activeMode, setActiveMode] = useState('Fine Dine');

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
      }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="flex-shrink-0 flex items-center h-[52px] px-4 gap-0"
      style={{ background: 'var(--dark)', zIndex: 100 }}
    >
      {/* Logo */}
      <div
        className="text-[20px] font-bold text-white tracking-tight pr-5 mr-4"
        style={{ borderRight: '1px solid rgba(255,255,255,0.12)' }}
      >
        pet<span style={{ color: 'var(--primary)' }}>pooja</span>
      </div>

      {/* Outlet */}
      <div className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
        <strong className="font-semibold text-white">Spice Garden Fine Dine</strong>
        &nbsp;•&nbsp;Koramangala, Bengaluru
      </div>

      <div className="flex-1" />

      {/* Clock */}
      <div
        className="text-[12px] pr-3 mr-3"
        style={{
          color: 'rgba(255,255,255,0.5)',
          fontFamily: "'DM Mono', monospace",
          borderRight: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        {time}
      </div>

      {/* Mode pills */}
      <div className="flex gap-1.5 items-center mr-4">
        {['Fine Dine', 'Takeaway', 'Delivery'].map((m) => (
          <button
            key={m}
            onClick={() => setActiveMode(m)}
            className="px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-all"
            style={
              activeMode === m
                ? { background: 'var(--primary)', color: '#fff', border: '1px solid var(--primary)' }
                : { border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', background: 'transparent' }
            }
          >
            {m}
          </button>
        ))}
      </div>

      {/* Icon buttons — inline SVG, no lucide SSR issues */}
      <div className="flex items-center gap-2">
        {ICON_BTNS.map(({ id, Icon, dot }) => (
          <button
            key={id}
            className="relative flex items-center justify-center cursor-pointer transition-all"
            style={{
              width: 34, height: 34, borderRadius: 8, flexShrink: 0,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.8)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
          >
            <Icon />
            {dot && (
              <span
                style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 7, height: 7, borderRadius: '50%',
                  background: 'var(--amber)', border: '1.5px solid var(--dark)',
                }}
              />
            )}
          </button>
        ))}

        {/* Avatar */}
        <div
          className="flex items-center justify-center text-white font-bold cursor-pointer ml-1"
          style={{
            width: 34, height: 34, borderRadius: '50%', fontSize: 13, flexShrink: 0,
            background: 'var(--primary)', border: '2px solid rgba(255,255,255,0.25)',
          }}
        >
          AK
        </div>
      </div>
    </div>
  );
}
