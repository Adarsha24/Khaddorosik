'use client';
import { useEffect, useState } from 'react';
import { Search, Bell, Settings, HelpCircle } from 'lucide-react';

export default function Topbar() {
  const [time, setTime] = useState('');
  const [activeMode, setActiveMode] = useState('Fine Dine');

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
      }));
    };
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

      {/* Outlet name */}
      <div className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
        <strong className="font-semibold text-white">Arsalan Biriyani</strong>
        &nbsp;•&nbsp;Kolkata, West Bengal
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
            className="px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-all border"
            style={
              activeMode === m
                ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }
                : { borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', background: 'transparent' }
            }
          >
            {m}
          </button>
        ))}
      </div>

      {/* Icon buttons */}
      <div className="flex items-center gap-2">
        {[
          { Icon: Search, title: 'Search', dot: false },
          { Icon: Bell,   title: 'Notifications', dot: true },
          { Icon: Settings, title: 'Settings', dot: false },
          { Icon: HelpCircle, title: 'Help', dot: false },
        ].map(({ Icon, title, dot }) => (
          <button
            key={title}
            title={title}
            className="relative w-[34px] h-[34px] rounded-lg flex items-center justify-center cursor-pointer transition-all"
            style={{
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.75)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
          >
            <Icon size={15} />
            {dot && (
              <span
                className="absolute top-[6px] right-[6px] w-[7px] h-[7px] rounded-full"
                style={{ background: '#f59e0b', border: '1.5px solid var(--dark)' }}
              />
            )}
          </button>
        ))}

        {/* Avatar */}
        <div
          className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white font-bold text-[13px] ml-1 cursor-pointer"
          style={{ background: 'var(--primary)', border: '2px solid rgba(255,255,255,0.25)' }}
        >
          AK
        </div>
      </div>
    </div>
  );
}
