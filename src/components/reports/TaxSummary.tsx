'use client';

import { TAX_ROWS } from '@/data/reportsData';

export default function TaxSummary() {
  return (
    <table className="w-full border-collapse text-[12px]">
      <thead>
        <tr>
          {['Tax Type', 'Taxable Amt', 'Tax'].map((h) => (
            <th key={h} className="bg-[#f7f8fb] px-3 py-2 text-left text-[11px] font-bold text-[#8a95a8] uppercase tracking-[0.4px] border-b border-[#e2e6ec]">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {TAX_ROWS.map((row) => (
          <tr key={row.type} className="hover:bg-[#f7f8fb] transition-colors">
            <td className="px-3 py-2 border-b border-[#e2e6ec]">
              <span className={`text-[10px] font-bold px-2 py-[3px] rounded-full ${row.cls}`}>{row.type}</span>
            </td>
            <td className="px-3 py-2 border-b border-[#e2e6ec] text-[#4a5568]">{row.taxable}</td>
            <td className="px-3 py-2 border-b border-[#e2e6ec] font-semibold text-[#1e2433]">{row.tax}</td>
          </tr>
        ))}
        <tr className="bg-[#f7f8fb]">
          <td className="px-3 py-2 font-bold text-[#1e2433]">Total Tax</td>
          <td className="px-3 py-2" />
          <td className="px-3 py-2 font-extrabold text-[#e85c26]">₹4,284</td>
        </tr>
      </tbody>
    </table>
  );
}