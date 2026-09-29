// import { Download, Plus } from "lucide-react";

// import PayrollSummary from "@/components/payroll/PayrollSummary";
// import PayrollFilters from "@/components/payroll/PayrollFilters";
// import PayrollTable from "@/components/payroll/PayrollTable";

// export default function PayrollPage() {
//   return (
//     <div className="p-6 space-y-6 max-w-full overflow-x-hidden">

//       {/* Header */}
//       <div className="flex items-center justify-between gap-4 flex-wrap">

//         <div>
//           <div className="flex items-center gap-3">
//             <h1 className="text-xl font-bold text-[var(--text1)]">
//               Payroll Management
//             </h1>

//             <span className="text-sm text-[var(--text3)]">
//               0 Records
//             </span>
//           </div>

//           <p className="mt-1 text-[var(--text2)]">
//             Manage employee salaries and monthly payroll.
//           </p>
//         </div>

//         <div className="flex gap-3 flex-shrink-0">
//           <button className="btn-outline flex items-center gap-0 whitespace-nowrap">
//             <Download size={15} />
//             Export
//           </button>

//           <button className="btn-gold flex items-center gap-0 whitespace-nowrap">
//             <Plus size={15} />
//             Add Payroll
//           </button>
//         </div>

//       </div>

//       {/* Summary */}
//       <PayrollSummary />

//       {/* Filters */}
//       <PayrollFilters />

//       {/* Table */}
//       <PayrollTable />

//     </div>
//   );
// }
import PayrollScreen from '@/components/payroll/PayrollScreen'

export default function Page() {
  return <PayrollScreen />
}