import {
  CalendarDays,
  ChevronDown,
  Download,
  Filter,
  Search,
} from "lucide-react";

export default function PayrollFilters() {
  return (
    <div className="card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        {/* Left Side */}
        <div className="flex flex-1 flex-wrap gap-4">

          {/* Search */}
          <div className="relative min-w-[250px] flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text3)" }}
            />

            <input
              type="text"
              placeholder="Search employee..."
              className="input w-full pl-10"
            />
          </div>

          {/* Month */}

          <div className="relative">
            <CalendarDays
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text3)" }}
            />

            <select
              className="input min-w-[160px] appearance-none pl-10 pr-10"
            >
              <option>All Months</option>
              <option>January</option>
              <option>February</option>
              <option>March</option>
              <option>April</option>
              <option>May</option>
              <option>June</option>
              <option>July</option>
              <option>August</option>
              <option>September</option>
              <option>October</option>
              <option>November</option>
              <option>December</option>
            </select>

            <ChevronDown
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text3)" }}
            />
          </div>

          {/* Year */}

          <div className="relative">
            <select
              className="input min-w-[130px] appearance-none pr-10"
            >
              <option>2026</option>
              <option>2025</option>
              <option>2024</option>
            </select>

            <ChevronDown
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text3)" }}
            />
          </div>

          {/* Status */}

          <div className="relative">
            <Filter
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text3)" }}
            />

            <select
              className="input min-w-[160px] appearance-none pl-10 pr-10"
            >
              <option>All Status</option>
              <option>Paid</option>
              <option>Pending</option>
            </select>

            <ChevronDown
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text3)" }}
            />
          </div>
        </div>

        {/* Right Side */}

        <button className="btn-outline inline-flex items-center gap-2">
          <Download size={18} />
          Export
        </button>
      </div>
    </div>
  );
}