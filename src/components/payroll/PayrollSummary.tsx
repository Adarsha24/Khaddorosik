import {
  IndianRupee,
  CheckCircle2,
  Clock3,
  Users,
} from "lucide-react";

import SummaryCard from "./SummaryCard";

const cards = [
  {
    title: "Total Payroll",
    value: "₹0",
    subtitle: "Monthly Salary Expense",
    icon: <IndianRupee size={22} />,
  },
  {
    title: "Paid",
    value: "0",
    subtitle: "Completed Payments",
    icon: <CheckCircle2 size={22} />,
  },
  {
    title: "Pending",
    value: "0",
    subtitle: "Awaiting Approval",
    icon: <Clock3 size={22} />,
  },
  {
    title: "Employees",
    value: "0",
    subtitle: "Registered Employees",
    icon: <Users size={22} />,
  },
];

export default function PayrollSummary() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <SummaryCard
          key={card.title}
          {...card}
        />
      ))}
    </div>
  );
}