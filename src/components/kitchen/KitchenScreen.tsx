'use client';

import { useState, useCallback, useRef } from 'react';
import KotCard from '@/components/kitchen/KOTCard';
import Toast, { ToastMsg, ToastType } from '@/components/billing/Toast';
import { KOT_ORDERS, SERVED_ORDERS, KotOrder, KotStatus } from '@/data/kitchenData';

type TabFilter = 'all' | 'pending' | 'ready' | 'served';

export default function KitchenScreen() {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [liveOrders, setLiveOrders] = useState<KotOrder[]>([...KOT_ORDERS]);
  const [servedOrders] = useState<KotOrder[]>([...SERVED_ORDERS]);
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const toastCounter = useRef(0);

  const showToast = useCallback((message: string, type: ToastType) => {
    toastCounter.current += 1;
    setToast({ message, type, id: toastCounter.current });
  }, []);

  const handleMarkReady = useCallback((id: number) => {
    setLiveOrders(prev =>
      prev.map(o => o.id === id ? { ...o, status: 'ready' as KotStatus, color: '#27ae60' } : o)
    );
    showToast('Order marked as Ready ✓', 'success');
  }, [showToast]);

  const handleMarkServed = useCallback((id: number) => {
    setLiveOrders(prev =>
      prev.map(o => o.id === id ? { ...o, status: 'served' as KotStatus } : o)
    );
    showToast('Order marked as Served 🍽️', 'success');
  }, [showToast]);

  const handleReprint = useCallback((_id: number) => {
    showToast('KOT reprinted 🖨️', 'kitchen');
  }, [showToast]);

  const pendingOrders = liveOrders.filter(o => o.status === 'pending');
  const readyOrders   = liveOrders.filter(o => o.status === 'ready');
  const servedAllList = [...liveOrders.filter(o => o.status === 'served'), ...servedOrders];
  const allOrders     = [...liveOrders, ...servedOrders];

  const displayOrders: KotOrder[] = (() => {
    switch (activeTab) {
      case 'pending': return pendingOrders;
      case 'ready':   return readyOrders;
      case 'served':  return servedAllList;
      default:        return allOrders;
    }
  })();

  const tabs: { id: TabFilter; label: string; count: number }[] = [
    { id: 'all',     label: 'All',     count: allOrders.length },
    { id: 'pending', label: 'Pending', count: pendingOrders.length },
    { id: 'ready',   label: 'Ready',   count: readyOrders.length },
    { id: 'served',  label: 'Served',  count: servedAllList.length },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e6ec] px-4 h-12 flex items-center gap-3 shrink-0">
        <span className="text-[15px] font-bold text-[#1e2433]">Kitchen Display System</span>
        <span className="text-[12px] text-[#8a95a8]">Live KOT Orders</span>
        <div className="flex-1" />
        <div className="flex items-center gap-4 text-[12px]">
          <span className="flex items-center gap-1.5">
            <span className="w-[9px] h-[9px] rounded-full bg-[#f59e0b] inline-block" />
            Pending: <strong>{pendingOrders.length}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-[9px] h-[9px] rounded-full bg-[#27ae60] inline-block" />
            Ready: <strong>{readyOrders.length}</strong>
          </span>
        </div>
        <button
          onClick={() => showToast('Orders refreshed', 'info')}
          className="px-3.5 py-[7px] rounded-[8px] bg-[#e85c26] text-white text-[12px] font-semibold cursor-pointer flex items-center gap-1.5 hover:bg-[#c94d1d] transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-4 bg-white border-b border-[#e2e6ec] shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-[18px] py-[11px] text-[13px] font-medium cursor-pointer border-b-[2.5px] -mb-px flex items-center gap-1.5 transition-all
              ${activeTab === tab.id
                ? 'text-[#e85c26] border-[#e85c26] font-semibold'
                : 'text-[#8a95a8] border-transparent hover:text-[#1e2433]'}`}
          >
            {tab.label}
            <span className={`px-1.5 py-[1px] rounded-full text-[10px] font-semibold
              ${activeTab === tab.id ? 'bg-[#fff3ee] text-[#e85c26]' : 'bg-[#f0f2f5] text-[#8a95a8]'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* KOT Grid */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-wrap gap-2.5 content-start">
        {displayOrders.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center text-[#8a95a8] py-16 gap-2">
            <span className="text-[48px] opacity-30">👨‍🍳</span>
            <span className="text-[14px] font-medium">No orders in this view</span>
          </div>
        ) : (
          displayOrders.map(order => (
            <KotCard
              key={order.id}
              order={order}
              onMarkReady={handleMarkReady}
              onMarkServed={handleMarkServed}
              onReprint={handleReprint}
            />
          ))
        )}
      </div>

      <Toast toast={toast} />
    </div>
  );
}