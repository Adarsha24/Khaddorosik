'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import InventoryTable       from './InventoryTable';
import PurchaseOrdersTab    from './PurchaseOrdersTab';
import ConsumptionReportTab from './ConsumptionReportTab';
import Toast, { ToastMsg, ToastType } from '@/components/billing/Toast';
import { INV_ITEMS, SEMI_FINISHED, INV_CATEGORIES } from '@/data/inventoryData';

type Tab = 'raw' | 'semi' | 'consumption' | 'purchase';

type Props = {
  toast?: (msg: string, type: ToastType) => void;
};


const TABS: { id: Tab; label: string }[] = [
  { id: 'raw',         label: 'Raw Materials'     },
  { id: 'semi',        label: 'Semi-Finished'      },
  { id: 'consumption', label: 'Consumption Report' },
  { id: 'purchase',    label: 'Purchase Orders'    },
];

export default function InventoryScreen({ toast: externalToast }: Props) {
  const [activeTab, setActiveTab]           = useState<Tab>('raw');
  const [search, setSearch]                 = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [lowStockOnly, setLowStockOnly]     = useState(false);
  const [toast, setToast]                   = useState<ToastMsg | null>(null);
  const toastId                             = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    toastId.current += 1;
    setToast({ message, type, id: toastId.current });
  }, []);

  const lowStockCount = INV_ITEMS.filter((i) => i.pct <= 20).length;
  const sourceItems   = activeTab === 'semi' ? SEMI_FINISHED : INV_ITEMS;

  const filteredItems = useMemo(() => {
    let items = sourceItems;
    if (search.trim())            items = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    if (activeCategory !== 'All') items = items.filter((i) => i.cat === activeCategory);
    if (lowStockOnly)             items = items.filter((i) => i.pct <= 20);
    return items;
  }, [sourceItems, search, activeCategory, lowStockOnly]);

  const showToolbar = activeTab === 'raw' || activeTab === 'semi';

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e6ec] px-4 h-12 flex items-center gap-2.5 shrink-0">
        <span className="text-[15px] font-bold text-[#1e2433]">Inventory Management</span>
        <div className="flex-1" />
        {lowStockCount > 0 && (
          <div className="flex items-center gap-1.5 bg-[#fdecea] text-[#e53e3e] px-3 py-[6px] rounded-[8px] text-[12px] font-semibold">
            ⚠️ {lowStockCount} Low Stock Alert{lowStockCount > 1 ? 's' : ''}
          </div>
        )}
        <button
          onClick={() => showToast('Stock added successfully', 'success')}
          className="px-3.5 py-[7px] rounded-[8px] bg-[#e85c26] text-white text-[12px] font-semibold cursor-pointer flex items-center gap-1.5 hover:bg-[#c94d1d] transition-colors"
        >
          + Add Stock
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-4 bg-white border-b border-[#e2e6ec] shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearch(''); setActiveCategory('All'); setLowStockOnly(false); }}
            className={`px-[18px] py-[11px] text-[13px] font-medium cursor-pointer border-b-[2.5px] -mb-px whitespace-nowrap transition-all
              ${activeTab === tab.id
                ? 'text-[#e85c26] border-[#e85c26] font-semibold'
                : 'text-[#8a95a8] border-transparent hover:text-[#1e2433]'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      {showToolbar && (
        <div className="bg-white px-4 py-2.5 flex items-center gap-2 border-b border-[#e2e6ec] shrink-0">
          <div className="relative max-w-[240px] flex-shrink-0">
            <span className="absolute left-[9px] top-1/2 -translate-y-1/2 text-[#8a95a8] text-[14px]">🔍</span>
            <input
              type="text"
              placeholder="Search ingredient…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 border border-[#e2e6ec] rounded-[8px] pl-8 pr-3 text-[12px] outline-none bg-[#f7f8fb] focus:border-[#e85c26] focus:bg-white transition-all"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {INV_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-[5px] rounded-full text-[11px] font-semibold border cursor-pointer whitespace-nowrap transition-all
                  ${activeCategory === cat
                    ? 'bg-[#1e2433] text-white border-[#1e2433]'
                    : 'border-[#e2e6ec] bg-[#f7f8fb] text-[#4a5568] hover:border-[#c8cdd8]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`px-3 py-[5px] rounded-full text-[11px] font-semibold border cursor-pointer whitespace-nowrap flex items-center gap-1 transition-all
              ${lowStockOnly
                ? 'bg-[#fdecea] text-[#e53e3e] border-[#fca5a5]'
                : 'border-[#e2e6ec] bg-white text-[#4a5568] hover:border-[#fca5a5] hover:text-[#e53e3e]'}`}
          >
            ⚠ Low Stock Only
          </button>
          <div className="flex-1" />
          <button
            onClick={() => showToast('Exported to CSV', 'success')}
            className="px-3.5 py-[7px] rounded-[8px] border border-[#e2e6ec] bg-white text-[#4a5568] text-[12px] font-semibold cursor-pointer flex items-center gap-1.5 hover:bg-[#f7f8fb] transition-colors"
          >
            ⬇️ Export
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {(activeTab === 'raw' || activeTab === 'semi') && <InventoryTable items={filteredItems} />}
        {activeTab === 'consumption' && <ConsumptionReportTab />}
        {activeTab === 'purchase'    && <PurchaseOrdersTab onToast={(msg) => showToast(msg, 'info')} />}
      </div>

      <Toast toast={toast} />
    </div>
  );
}