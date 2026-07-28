import PayrollSummary from "@/components/payroll/PayrollSummary";
import PayrollFilters from "@/components/payroll/PayrollFilters";
import PayrollTable from "@/components/payroll/PayrollTable";

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payroll</h1>
          <p className="text-gray-500">
            Manage employee salaries and payroll.
          </p>
        </div>

        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          + New Payroll
        </button>
      </div>

      <PayrollSummary />

      <PayrollFilters />

      <PayrollTable />
    </div>
  );
}