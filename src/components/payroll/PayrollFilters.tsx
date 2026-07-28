export default function PayrollFilters() {
  return (
    <div className="flex flex-wrap gap-4 rounded-xl border bg-white p-4">
      <input
        placeholder="Search employee..."
        className="rounded-lg border px-3 py-2"
      />

      <select className="rounded-lg border px-3 py-2">
        <option>All Months</option>
      </select>

      <select className="rounded-lg border px-3 py-2">
        <option>All Years</option>
      </select>

      <select className="rounded-lg border px-3 py-2">
        <option>All Status</option>
        <option>Paid</option>
        <option>Pending</option>
      </select>
    </div>
  );
}