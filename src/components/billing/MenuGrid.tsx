'use client';

import { useState, useMemo } from 'react';
import { MENU_CATS, MENU_ITEMS, MenuItem, CartItem } from '@/data/menuData';

type Filter = 'all' | 'veg' | 'nv' | 'best' | 'avail';

type Props = {
  cart: CartItem[];
  onAdd: (item: MenuItem) => void;
  onRemove: (id: number) => void;
};

export default function MenuGrid({ cart, onAdd, onRemove }: Props) {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [filter, setFilter] = useState<Filter>('all');

  const cartMap = useMemo(() => {
    const m: Record<number, number> = {};
    cart.forEach((c) => { m[c.id] = c.qty; });
    return m;
  }, [cart]);

  const visible = useMemo(() => {
    let items = MENU_ITEMS;
    if (search.trim()) items = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    if (activeCat !== 'all') items = items.filter((i) => i.cat === activeCat);
    if (filter === 'veg')    items = items.filter((i) => i.veg);
    if (filter === 'nv')     items = items.filter((i) => !i.veg);
    if (filter === 'best')   items = items.filter((i) => i.best);
    if (filter === 'avail')  items = items.filter((i) => i.avail);
    return items;
  }, [search, activeCat, filter]);

  const FilterChip = ({ id, label, icon }: { id: Filter; label: string; icon?: React.ReactNode }) => (
    <button
      onClick={() => setFilter(id)}
      className={`px-3 py-[5px] rounded-full text-[11px] font-semibold cursor-pointer border whitespace-nowrap flex items-center gap-1 transition-all
        ${filter === id
          ? 'bg-[#fff3ee] text-[#e85c26] border-[#f4b8a4]'
          : 'border-[#e2e6ec] bg-white text-[#4a5568] hover:border-[#c8cdd8]'}`}
    >
      {icon}{label}
    </button>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex px-4 bg-white border-b border-[#e2e6ec] shrink-0">
        {['New Order', 'Running KOT', 'Order History', 'Parcel'].map((t, i) => (
          <div
            key={t}
            className={`px-[18px] py-[11px] text-[13px] font-medium cursor-pointer border-b-[2.5px] -mb-px whitespace-nowrap transition-all
              ${i === 0
                ? 'text-[#e85c26] border-[#e85c26] font-semibold'
                : 'text-[#8a95a8] border-transparent hover:text-[#1e2433]'}`}
          >
            {t}
            {t === 'Running KOT' && (
              <span className={`ml-1 px-1.5 py-[1px] rounded-full text-[10px] font-semibold ${i === 0 ? 'bg-[#fff3ee] text-[#e85c26]' : 'bg-[#f0f2f5] text-[#8a95a8]'}`}>4</span>
            )}
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white px-3.5 py-2.5 flex gap-2 items-center border-b border-[#e2e6ec] shrink-0">
        <div className="relative flex-1 max-w-[280px]">
          <span className="absolute left-[9px] top-1/2 -translate-y-1/2 text-[#8a95a8] text-[15px]">🔍</span>
          <input
            type="text"
            placeholder="Search dishes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 border border-[#e2e6ec] rounded-lg pl-8 pr-2.5 text-[12px] outline-none bg-[#f7f8fb] focus:border-[#e85c26] focus:bg-white transition-all"
          />
        </div>

        <FilterChip id="all"   label="All Items" />
        <FilterChip id="veg"   label="Veg"       icon={<span className="w-2 h-2 rounded-full border-2 border-[#2e7d32] flex items-center justify-center"><span className="w-1 h-1 rounded-full bg-[#2e7d32]" /></span>} />
        <FilterChip id="nv"    label="Non-Veg"   icon={<span className="w-2 h-2 rounded-full border-2 border-[#b71c1c] flex items-center justify-center"><span className="w-1 h-1 rounded-full bg-[#b71c1c]" /></span>} />
        <FilterChip id="best"  label="⭐ Best" />
        <FilterChip id="avail" label="✓ In Stock" />

        <div className="flex-1" />
        <button className="px-3 py-[5px] rounded-full text-[11px] font-semibold border border-[#e2e6ec] bg-white text-[#4a5568] flex items-center gap-1 hover:bg-[#f7f8fb] cursor-pointer">
          🖨️ Print Menu
        </button>
      </div>

      {/* Category bar */}
      <div className="bg-white px-3.5 py-2 flex gap-1.5 overflow-x-auto border-b border-[#e2e6ec] shrink-0 scrollbar-none">
        {MENU_CATS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium cursor-pointer whitespace-nowrap border flex items-center gap-1.5 transition-all
              ${activeCat === cat.id
                ? 'bg-[#1e2433] text-white border-[#1e2433]'
                : 'border-[#e2e6ec] bg-[#f7f8fb] text-[#4a5568] hover:border-[#c8cdd8]'}`}
          >
            {cat.icon && <span className="text-[13px]">{cat.icon}</span>}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div
        className="flex-1 overflow-y-auto p-3 grid gap-2.5 content-start"
        style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(136px,1fr))' }}
      >
        {visible.map((item) => {
          const qty = cartMap[item.id] || 0;
          return (
            <div
              key={item.id}
              onClick={() => item.avail && onAdd(item)}
              className={`bg-white border rounded-xl overflow-hidden cursor-pointer transition-all relative group
                ${!item.avail ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(232,92,38,0.12)]'}
                ${qty > 0 ? 'border-[#27ae60]' : 'border-[#e2e6ec] hover:border-[#e85c26]'}`}
            >
              {/* ── IMAGE THUMB ── */}
              <div className="h-[82px] relative overflow-hidden bg-[#f0f2f5]">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                {/* Emoji fallback — hidden by default */}
                <div
                  className="absolute inset-0 items-center justify-center text-[30px]"
                  style={{ display: 'none' }}
                >
                  {item.emoji}
                </div>

                {/* Veg / Non-Veg dot */}
                <span className={`absolute top-[6px] right-[6px] w-[14px] h-[14px] rounded-[3px] border-2 bg-white flex items-center justify-center
                  ${item.veg ? 'border-[#2e7d32]' : 'border-[#b71c1c]'}`}>
                  <span className={`w-[7px] h-[7px] rounded-full ${item.veg ? 'bg-[#2e7d32]' : 'bg-[#b71c1c]'}`} />
                </span>

                {/* Best seller tag */}
                {item.best && (
                  <span className="absolute top-[6px] left-0 bg-[#f59e0b] text-white text-[8px] font-bold px-1.5 py-[2px] rounded-r-[4px] tracking-[0.3px]">
                    BEST
                  </span>
                )}

                {/* Availability dot */}
                <span className={`absolute bottom-[6px] left-[6px] w-2 h-2 rounded-full border border-white ${item.avail ? 'bg-[#27ae60]' : 'bg-[#e53e3e]'}`} />
              </div>

              {/* Body */}
              <div className="p-2 pt-[8px]">
                <div className="text-[11.5px] font-semibold text-[#1e2433] leading-[1.3] mb-1 h-[29px] overflow-hidden">
                  {item.name}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#e85c26]">₹{item.price}</span>

                  {qty === 0 ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); item.avail && onAdd(item); }}
                      className="w-6 h-6 rounded-[6px] bg-[#e85c26] text-white text-[17px] flex items-center justify-center hover:bg-[#c94d1d] transition-colors leading-none"
                    >
                      +
                    </button>
                  ) : (
                    <div className="flex items-center gap-[3px]" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="w-[22px] h-[22px] rounded-[5px] border border-[#e2e6ec] bg-[#f7f8fb] text-[14px] text-[#4a5568] flex items-center justify-center cursor-pointer hover:bg-[#e2e6ec]"
                      >−</button>
                      <span className="text-[12px] font-bold min-w-[16px] text-center text-[#e85c26]">{qty}</span>
                      <button
                        onClick={() => onAdd(item)}
                        className="w-[22px] h-[22px] rounded-[5px] border border-[#e2e6ec] bg-[#f7f8fb] text-[14px] text-[#4a5568] flex items-center justify-center cursor-pointer hover:bg-[#e2e6ec]"
                      >+</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}