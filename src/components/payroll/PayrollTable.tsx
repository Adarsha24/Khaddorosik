import { FileText, Plus } from "lucide-react";

export default function PayrollTable() {
  return (
    <div className="card overflow-hidden">
      {/* Table Header */}
      <div
        className="border-b px-6 py-4"
        style={{ borderColor: "var(--border)" }}
      >
        <h2
          className="text-lg font-semibold"
          style={{ color: "var(--text1)" }}
        >
          Payroll Records
        </h2>

        <p
          className="mt-1 text-sm"
          style={{ color: "var(--text2)" }}
        >
          View and manage employee salary records.
        </p>
      </div>

      <table className="w-full">
        <thead
          style={{
            background: "var(--surface2)",
          }}
        >
          <tr>
            {[
              "Employee",
              "Month",
              "Basic",
              "Bonus",
              "Deduction",
              "Net Salary",
              "Status",
              "Actions",
            ].map((heading) => (
              <th
                key={heading}
                className="px-6 py-4 text-left text-sm font-semibold"
                style={{
                  color: "var(--text2)",
                }}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          <tr>
            <td
              colSpan={8}
              className="px-6 py-16 text-center"
            >
              <div className="flex flex-col items-center">
                {/* Icon */}
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{
                    background: "var(--surface2)",
                    color: "var(--gold)",
                  }}
                >
                  <FileText size={30} />
                </div>

                <h3
                  className="text-xl font-semibold"
                  style={{ color: "var(--text1)" }}
                >
                  No Payroll Records
                </h3>

                <p
                  className="mt-2 max-w-md text-sm"
                  style={{ color: "var(--text2)" }}
                >
                  No payroll has been generated yet.
                  Create your first payroll record to begin managing employee salaries.
                </p>

                <button
                  className="btn-gold mt-6 inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  Create Payroll
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}