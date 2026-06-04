'use client';

import { useState, useCallback, useRef } from 'react';
import ReservationList from './ReservationList';
import ReservationDetail from './ReservationDetail';
import Toast, { ToastMsg, ToastType } from '@/components/billing/Toast';
import { RESERVATIONS, Reservation, ResStatus } from '@/data/reservationData';

type Tab = 'upcoming' | 'today' | 'all';

export default function ReservationScreen() {
  const [reservations, setReservations] = useState<Reservation[]>(RESERVATIONS);
  const [selectedId, setSelectedId] = useState<number | null>(RESERVATIONS[0]?.id ?? null);
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [rightMode, setRightMode] = useState<'view' | 'new'>('view');
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const toastId = useRef(0);

  const showToast = useCallback((message: string, type: ToastType) => {
    toastId.current += 1;
    setToast({ message, type, id: toastId.current });
  }, []);

  const filtered = reservations.filter((r) => {
    if (activeTab === 'today')    return r.date === 'Today';
    if (activeTab === 'upcoming') return r.date !== 'Yesterday';
    return true;
  });

  const counts = {
    upcoming: reservations.filter((r) => r.date !== 'Yesterday').length,
    today:    reservations.filter((r) => r.date === 'Today').length,
    all:      reservations.length,
  };

  const tabs: { id: Tab; label: string; count: number | null }[] = [
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { id: 'today',    label: 'Today',    count: counts.today },
    { id: 'all',      label: 'All',      count: null },
  ];

  const selected = reservations.find((r) => r.id === selectedId) ?? null;

  const handleSelect = (r: Reservation) => {
    setSelectedId(r.id);
    setRightMode('view');
  };

  const handleStatusChange = (id: number, status: ResStatus) => {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    showToast(
      status === 'conf' ? 'Reservation confirmed! ✓' : 'Reservation cancelled',
      status === 'conf' ? 'success' : 'info',
    );
  };

  const handleRightConfirm = (msg: string) => {
    showToast(msg, msg.startsWith('⚠️') ? 'info' : 'success');
    if (!msg.startsWith('⚠️')) setRightMode('view');
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e6ec] px-4 h-12 flex items-center gap-3 shrink-0">
        <span className="text-[15px] font-bold text-[#1e2433]">Reservations</span>
        <div className="flex-1" />
        <button
          onClick={() => showToast("Showing today's schedule", 'info')}
          className="px-3.5 py-[7px] rounded-[8px] border border-[#e2e6ec] bg-white text-[#4a5568] text-[12px] font-semibold cursor-pointer flex items-center gap-1.5 hover:bg-[#f7f8fb] transition-colors"
        >
          📅 Today
        </button>
        <button
          onClick={() => { setRightMode('new'); setSelectedId(null); }}
          className="px-3.5 py-[7px] rounded-[8px] bg-[#e85c26] text-white text-[12px] font-semibold cursor-pointer flex items-center gap-1.5 hover:bg-[#c94d1d] transition-colors"
        >
          + New Reservation
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-4 bg-white border-b border-[#e2e6ec] shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-[18px] py-[11px] text-[13px] font-medium cursor-pointer border-b-[2.5px] -mb-px flex items-center gap-1.5 transition-all
              ${activeTab === tab.id
                ? 'text-[#e85c26] border-[#e85c26] font-semibold'
                : 'text-[#8a95a8] border-transparent hover:text-[#1e2433]'}`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className={`px-1.5 py-[1px] rounded-full text-[10px] font-semibold
                ${activeTab === tab.id ? 'bg-[#fff3ee] text-[#e85c26]' : 'bg-[#f0f2f5] text-[#8a95a8]'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left list */}
        <div className="w-[320px] border-r border-[#e2e6ec] flex flex-col overflow-hidden shrink-0 bg-white">
          <ReservationList
            reservations={filtered}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>

        {/* Right detail / form */}
        <div className="flex-1 bg-[#f7f8fb] overflow-hidden flex flex-col">
          <ReservationDetail
            selected={selected}
            mode={rightMode}
            onConfirm={handleRightConfirm}
            onCancel={() => setRightMode('view')}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}