'use client';

const CONSUMPTION = [
  { name: 'Chicken Breast', used: 8.5, unit: 'kg', cost: '₹2,125', dishes: 42 },
  { name: 'Basmati Rice',   used: 12,  unit: 'kg', cost: '₹840',   dishes: 56 },
  { name: 'Paneer',         used: 4.8, unit: 'kg', cost: '₹960',   dishes: 29 },
  { name: 'Mutton',         used: 6.0, unit: 'kg', cost: '₹3,600', dishes: 18 },
  { name: 'Butter',         used: 1.2, unit: 'kg', cost: '₹360',   dishes: 84 },
  { name: 'Cream',          used: 2.4, unit: 'L',  cost: '₹480',   dishes: 35 },
  { name: 'Tomatoes',       used: 3.5, unit: 'kg', cost: '₹175',   dishes: 68 },
  { name: 'Onions',         used: 7.0, unit: 'kg', cost: '₹210',   dishes: 95 },
];

export default function ConsumptionReportTab() {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Cost Today',  value: '₹8,750', color: 'text-[#e85c26]' },
          { label: 'Ingredients Used',  value: '8',      color: 'text-[#1e2433]' },
          { label: 'Dishes Prepared',   value: '427',    color: 'text-[#27ae60]' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-[#e2e6ec] px-4 py-3">
            <div className="text-[11px] text-[#8a95a8] font-medium mb-1">{s.label}</div>
            <div className={`text-[20px] font-extrabold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>
      <table className="w-full border-collapse bg-white rounded-xl overflow-hidden border border-[#e2e6ec] text-[12px]">
        <thead>
          <tr>
            {['Ingredient', 'Consumed', 'Unit', 'Cost', 'Dishes'].map((h) => (
              <th key={h} className="bg-[#1e2433] text-white/80 px-3.5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.4px]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CONSUMPTION.map((row) => (
            <tr key={row.name} className="hover:bg-[#f7f8fb] transition-colors">
              <td className="px-3.5 py-2.5 border-b border-[#f5f7fa] font-semibold text-[#1e2433]">{row.name}</td>
              <td className="px-3.5 py-2.5 border-b border-[#f5f7fa] text-[#4a5568] font-medium">{row.used}</td>
              <td className="px-3.5 py-2.5 border-b border-[#f5f7fa] text-[#8a95a8]">{row.unit}</td>
              <td className="px-3.5 py-2.5 border-b border-[#f5f7fa] font-bold text-[#e85c26]">{row.cost}</td>
              <td className="px-3.5 py-2.5 border-b border-[#f5f7fa] text-[#4a5568]">{row.dishes} dishes</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}