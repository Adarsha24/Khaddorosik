'use client';

import { useState, useEffect } from 'react';

export default function Topbar() {
  const [time, setTime] = useState('');
  const [mode, setMode] = useState<'finedine' | 'takeaway' | 'delivery'>('finedine');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-[52px] bg-[#1e2433] flex items-center px-0 gap-0 shrink-0 z-50">
      {/* Logo */}
      <div className="text-[20px] font-bold text-white tracking-tight px-4 border-r border-white/10 mr-4">
        pet<span className="text-[#e85c26]">pooja</span>
      </div>

      {/* Outlet */}
      <div className="text-[13px] text-white/70 font-medium">
        <strong className="text-white font-semibold">Arsalan Biriyani</strong>
        &nbsp;•&nbsp;Kolkata, West Bengal
      </div>

      <div className="flex-1" />

      {/* Clock */}
      <div className="text-[12px] text-white/50 font-mono pr-4 border-r border-white/10 mr-2">
        {time}
      </div>

      {/* Mode pills */}
      <div className="flex gap-1.5 items-center mr-4">
        {(['finedine', 'takeaway', 'delivery'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold border cursor-pointer transition-all ${
              mode === m
                ? 'bg-[#e85c26] text-white border-[#e85c26]'
                : 'border-white/20 text-white/60 hover:text-white/90'
            }`}
          >
            {m === 'finedine' ? 'Fine Dine' : m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Action icons */}
      <div className="flex items-center gap-2 px-4">
        {[
          { icon: '🔍', title: 'Search' },
          { icon: '🔔', title: 'Notifications', dot: true },
          { icon: '⚙️', title: 'Settings' },
          { icon: '❓', title: 'Help' },
        ].map(({ icon, title, dot }) => (
          <button
            key={title}
            title={title}
            className="w-[34px] h-[34px] rounded-[8px] border border-white/15 bg-white/8 flex items-center justify-center cursor-pointer text-white/75 text-base hover:bg-white/15 hover:text-white relative transition-all"
          >
            <span className="text-sm">{icon}</span>
            {dot && (
              <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full bg-[#f59e0b] border-[1.5px] border-[#1e2433]" />
            )}
          </button>
        ))}
        <div className="w-[34px] h-[34px] rounded-full bg-[#e85c26] flex items-center justify-center text-white font-bold text-[13px] cursor-pointer border-2 border-white/25">
          AK
        </div>
      </div>
    </header>
  );
}
