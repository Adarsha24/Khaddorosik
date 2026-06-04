'use client';

import { useState } from 'react';
import StatCards       from './StatCards';
import HourlyChart     from './HourlyChart';
import CategoryPie     from './CategoryPie';
import TopItemsList    from './TopItemList';
import TaxSummary      from './TaxSummary';
import SalesTab        from './SalesTab';
import ItemWiseTab     from './ItemWiseTab';
import StaffReportsTab from './StaffReportsTab';

type Tab = 'overview' | 'sales' | 'tax' | 'itemwise' | 'staff';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview'      },
  { id: 'sales',    label: 'Sales'         },
  { id: 'tax',      label: 'Tax Reports'   },
  { id: 'itemwise', label: 'Item-wise'     },
  { id: 'staff',    label: 'Staff Reports' },
];

const PERIODS = ['Today', 'This Week', 'This Month'];

export default function ReportsScreen() {
  const [activeTab, setActiveTab]       = useState<Tab>('overview');
  const [activePeriod, setActivePeriod] = useState('Today');

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e6ec] px-4 h-12 flex items-center gap-2 shrink-0">
        <span className="text-[15px] font-bold text-[#1e2433]">Reports &amp; Analytics</span>
        <div className="flex-1" />
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setActivePeriod(p)}
            className={`px-3.5 py-[7px] rounded-[8px] text-[12px] font-semibold cursor-pointer border transition-colors
              ${activePeriod === p
                ? 'bg-[#1e2433] text-white border-[#1e2433]'
                : 'border-[#e2e6ec] bg-white text-[#4a5568] hover:bg-[#f7f8fb]'}`}
          >
            {p}
          </button>
        ))}
        <button className="px-3.5 py-[7px] rounded-[8px] bg-[#e85c26] text-white text-[12px] font-semibold cursor-pointer flex items-center gap-1.5 hover:bg-[#c94d1d] transition-colors">
          ⬇️ Export
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-4 bg-white border-b border-[#e2e6ec] shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-[18px] py-[11px] text-[13px] font-medium cursor-pointer border-b-[2.5px] -mb-px whitespace-nowrap transition-all
              ${activeTab === tab.id
                ? 'text-[#e85c26] border-[#e85c26] font-semibold'
                : 'text-[#8a95a8] border-transparent hover:text-[#1e2433]'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            <StatCards />

            <div className="grid gap-3" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
              <div className="bg-white rounded-xl border border-[#e2e6ec] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#e2e6ec] flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#1e2433]">Hourly Revenue</span>
                  <select className="text-[11px] border border-[#e2e6ec] rounded-[6px] px-2 py-1 text-[#4a5568] bg-[#f7f8fb] outline-none cursor-pointer">
                    <option>Today</option>
                    <option>Yesterday</option>
                  </select>
                </div>
                <div className="px-4 py-3">
                  <HourlyChart />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#e2e6ec] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#e2e6ec]">
                  <span className="text-[13px] font-bold text-[#1e2433]">Revenue by Category</span>
                </div>
                <div className="px-4 py-3">
                  <CategoryPie />
                </div>
              </div>
            </div>

            <div className="grid gap-3" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
              <div className="bg-white rounded-xl border border-[#e2e6ec] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#e2e6ec] flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#1e2433]">Top Selling Items</span>
                  <button className="text-[11px] text-[#2d6be4] font-semibold cursor-pointer hover:underline">View all →</button>
                </div>
                <div className="px-4 py-2">
                  <TopItemsList />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#e2e6ec] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#e2e6ec] flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#1e2433]">Tax Summary</span>
                  <button className="text-[11px] text-[#2d6be4] font-semibold cursor-pointer hover:underline">Export →</button>
                </div>
                <div className="px-1 py-1">
                  <TaxSummary />
                </div>
              </div>
            </div>
          </>
        )}

        {/* SALES */}
        {activeTab === 'sales' && <SalesTab />}

        {/* TAX */}
        {activeTab === 'tax' && (
          <div className="flex flex-col gap-4">
            <StatCards />
            <div className="bg-white rounded-xl border border-[#e2e6ec] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#e2e6ec] flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#1e2433]">Detailed Tax Report</span>
                <button className="px-3 py-[6px] rounded-[7px] bg-[#e85c26] text-white text-[11px] font-semibold cursor-pointer hover:bg-[#c94d1d] transition-colors">
                  ⬇️ Export
                </button>
              </div>
              <div className="px-1 py-1">
                <TaxSummary />
              </div>
              <div className="px-4 pb-4 pt-2 grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Taxable Amount',   value: '₹42,840', color: 'text-[#1e2433]'  },
                  { label: 'Total Tax Collected',    value: '₹4,284',  color: 'text-[#e85c26]'  },
                  { label: 'Net Revenue (after tax)', value: '₹38,556', color: 'text-[#27ae60]'  },
                ].map((box) => (
                  <div key={box.label} className="bg-[#f7f8fb] rounded-[10px] p-3 text-center border border-[#e2e6ec]">
                    <div className="text-[10px] text-[#8a95a8] font-medium mb-1">{box.label}</div>
                    <div className={`text-[18px] font-extrabold ${box.color}`}>{box.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ITEM-WISE */}
        {activeTab === 'itemwise' && <ItemWiseTab />}

        {/* STAFF */}
        {activeTab === 'staff' && <StaffReportsTab />}
      </div>
    </div>
  );
}