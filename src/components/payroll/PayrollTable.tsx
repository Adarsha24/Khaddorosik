export default function PayrollTable() {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Employee</th>
            <th className="p-3 text-left">Month</th>
            <th className="p-3 text-left">Basic</th>
            <th className="p-3 text-left">Bonus</th>
            <th className="p-3 text-left">Deduction</th>
            <th className="p-3 text-left">Net Salary</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td colSpan={8} className="p-8 text-center text-gray-500">
              No payroll records found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}