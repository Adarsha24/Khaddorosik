const cards = [
  { title: "Total Payroll", value: "₹0" },
  { title: "Paid", value: "0" },
  { title: "Pending", value: "0" },
  { title: "Employees", value: "0" },
];

export default function PayrollSummary() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl border bg-white p-5 shadow-sm"
        >
          <p className="text-sm text-gray-500">{card.title}</p>
          <h2 className="mt-2 text-2xl font-bold">{card.value}</h2>
        </div>
      ))}
    </div>
  );
}