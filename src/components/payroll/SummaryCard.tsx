import { ReactNode } from "react";

type SummaryCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
};

export default function SummaryCard({
  title,
  value,
  subtitle,
  icon,
}: SummaryCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p
            className="text-sm font-medium"
            style={{ color: "var(--text2)" }}
          >
            {title}
          </p>

          <h2
            className="text-3xl font-bold"
            style={{ color: "var(--text1)" }}
          >
            {value}
          </h2>

          <p
            className="text-xs"
            style={{ color: "var(--text3)" }}
          >
            {subtitle}
          </p>
        </div>

        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{
            background: "rgba(212,175,55,.12)",
            color: "var(--gold)",
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}