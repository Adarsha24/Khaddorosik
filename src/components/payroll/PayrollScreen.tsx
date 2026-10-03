"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Wallet,
  Clock3,
  CheckCircle2,
  HandCoins,
  Search,
  LucideIcon,
} from "lucide-react";
import {
  payroll as payrollApi,
  employees as employeesApi,
  ApiPayroll,
  ApiEmployee,
} from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getColors(theme: "dark" | "light") {
  const isDark = theme === "dark";
  return {
    isDark,
    pageBg: "var(--bg)",
    cardBg: "var(--surface)",
    border: "var(--border)",
    textPrimary: isDark ? "#FFFFFF" : "#111827",
    textSecondary: isDark ? "#9CA3AF" : "#6B7280",
    tableHeaderBg: "var(--surface)",
    tableRowHover: isDark ? "#1F2937" : "#F3F4F6",
    tableBorder: isDark ? "#374151" : "#E5E7EB",
    inputBg: "var(--surface)",
    inputBorder: isDark ? "#2B3545" : "#D1D5DB",
    inputText: isDark ? "#FFFFFF" : "#111827",
    inputPlaceholderIcon: isDark ? "#94A3B8" : "#9CA3AF",
    roleBadgeBg: isDark ? "#1E40AF" : "#DBEAFE",
    roleBadgeText: isDark ? "#DBEAFE" : "#1E40AF",
    activeBg: isDark ? "#064E3B" : "#D1FAE5",
    activeText: isDark ? "#A7F3D0" : "#065F46",
    inactiveBg: isDark ? "#7F1D1D" : "#FEE2E2",
    inactiveText: isDark ? "#FECACA" : "#991B1B",
    salaryColor: isDark ? "#10B981" : "#059669",
  };
}

export default function PayrollScreen() {
  const [records, setRecords] = useState<ApiPayroll[]>([]);
  const [employeeList, setEmployeeList] = useState<ApiEmployee[]>([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Follows the top bar's day/night button
  const { theme } = useTheme();
  const c = getColors(theme);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [pay, emps] = await Promise.all([
        payrollApi.list(),
        employeesApi.list(),
      ]);
      setRecords(pay);
      setEmployeeList(emps);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkPaid = async (id: string) => {
    await payrollApi.updateStatus(id, "PAID");
    await load(true);
  };

  const filtered = records.filter((r) =>
    (r.employee?.name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const totalSalary = records.reduce((sum, r) => sum + Number(r.netSalary), 0);
  const paidCount = records.filter((r) => r.status === "PAID").length;
  const pendingCount = records.filter((r) => r.status === "PENDING").length;

  return (
    <div style={{ padding: 24, background: c.pageBg, minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 34, color: c.textPrimary }}>
            💰 Payroll Management
          </h1>
          <p style={{ color: c.textSecondary, marginTop: 8 }}>
            Manage employee salaries, payroll history and payments.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setOpenModal(true)}
            style={{
              background: "#F59E0B",
              color: "#111827",
              border: "none",
              padding: "14px 22px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 10px 20px rgba(245,158,11,.35)",
            }}
          >
            + Add Payroll
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 20,
          marginBottom: 25,
        }}
      >
        <StatCard
          title="Employees"
          value={employeeList.length}
          icon={Users}
          color="#2563EB"
          colors={c}
        />
        <StatCard
          title="Monthly Payroll"
          value={`₹${totalSalary.toLocaleString()}`}
          icon={Wallet}
          color="#10B981"
          colors={c}
        />
        <StatCard
          title="Pending Payroll"
          value={pendingCount}
          icon={Clock3}
          color="#F59E0B"
          colors={c}
        />
        <StatCard
          title="Paid"
          value={paidCount}
          icon={CheckCircle2}
          color="#8B5CF6"
          colors={c}
        />
      </div>

      <div style={{ position: "relative", marginBottom: 25 }}>
        <Search
          size={18}
          style={{
            position: "absolute",
            left: 16,
            top: 15,
            color: c.inputPlaceholderIcon,
          }}
        />
        <input
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 18px 14px 46px",
            borderRadius: 10,
            border: `1px solid ${c.inputBorder}`,
            background: c.inputBg,
            color: c.inputText,
            fontSize: 14,
            outline: "none",
          }}
        />
      </div>

      <div
        style={{
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${c.border}`,
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: c.tableHeaderBg }}>
            <tr>
              <th style={{ ...th, color: c.textSecondary }}>Employee</th>
              <th style={{ ...th, color: c.textSecondary }}>Month</th>
              <th style={{ ...th, color: c.textSecondary }}>Basic</th>
              <th style={{ ...th, color: c.textSecondary }}>Net Salary</th>
              <th style={{ ...th, color: c.textSecondary }}>Status</th>
              <th style={{ ...th, color: c.textSecondary }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: 60,
                    textAlign: "center",
                    color: c.textSecondary,
                  }}
                >
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: 60,
                    textAlign: "center",
                    color: c.textSecondary,
                  }}
                >
                  No Payroll Records
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r.id}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = c.tableRowHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <td
                    style={{ ...td, borderTop: `1px solid ${c.tableBorder}` }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          background: "#F59E0B",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontWeight: 700,
                          color: "#111827",
                          fontSize: 18,
                          flexShrink: 0,
                        }}
                      >
                        {(r.employee?.name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 600, color: c.textPrimary }}>
                        {r.employee?.name ?? "—"}
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      ...td,
                      borderTop: `1px solid ${c.tableBorder}`,
                      color: c.textPrimary,
                    }}
                  >
                    {MONTHS[r.month - 1]} {r.year}
                  </td>
                  <td
                    style={{
                      ...td,
                      borderTop: `1px solid ${c.tableBorder}`,
                      color: c.textPrimary,
                    }}
                  >
                    ₹{r.basicSalary.toLocaleString()}
                  </td>
                  <td
                    style={{ ...td, borderTop: `1px solid ${c.tableBorder}` }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: c.salaryColor,
                        fontSize: 16,
                      }}
                    >
                      ₹{r.netSalary.toLocaleString()}
                    </span>
                  </td>
                  <td
                    style={{ ...td, borderTop: `1px solid ${c.tableBorder}` }}
                  >
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: 30,
                        fontSize: 13,
                        fontWeight: 600,
                        background:
                          r.status === "PAID" ? c.activeBg : c.inactiveBg,
                        color:
                          r.status === "PAID" ? c.activeText : c.inactiveText,
                      }}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td
                    style={{ ...td, borderTop: `1px solid ${c.tableBorder}` }}
                  >
                    {r.status === "PENDING" && (
                      <button
                        onClick={() => handleMarkPaid(r.id)}
                        style={{
                          border: "none",
                          color: "white",
                          background: "#10B981",
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <HandCoins size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {openModal && (
        <AddPayrollForm
          employees={employeeList}
          onClose={() => setOpenModal(false)}
          onSaved={() => {
            setOpenModal(false);
            load(true);
          }}
        />
      )}
    </div>
  );
}

function AddPayrollForm({
  employees,
  onClose,
  onSaved,
}: {
  employees: ApiEmployee[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [basicSalary, setBasicSalary] = useState("");
  const [bonus, setBonus] = useState("0");
  const [deduction, setDeduction] = useState("0");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const netSalary =
    (Number(basicSalary) || 0) +
    (Number(bonus) || 0) -
    (Number(deduction) || 0);

  const submit = async () => {
    setError("");
    if (!employeeId) {
      setError("Select an employee");
      return;
    }
    if (!basicSalary || Number(basicSalary) <= 0) {
      setError("Enter a valid basic salary");
      return;
    }
    setSaving(true);
    try {
      await payrollApi.create({
        employeeId,
        month,
        year,
        basicSalary: Number(basicSalary),
        bonus: Number(bonus) || 0,
        deduction: Number(deduction) || 0,
      });
      onSaved();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create payroll");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid var(--border)",
    borderRadius: 8,
    background: "var(--surface)",
    color: "var(--text1)",
    fontSize: 14,
    outline: "none",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: 520,
          background: "var(--bg)",
          borderRadius: 16,
          border: "1px solid var(--border)",
          padding: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,.35)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 20, color: "var(--text1)" }}>
          💰 Generate Payroll
        </h2>

        <div style={{ marginBottom: 16 }}>
          <label>Employee</label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            style={inputStyle}
          >
            <option value="">Select Employee</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} — {e.role}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginBottom: 16,
          }}
        >
          <div>
            <label>Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              style={inputStyle}
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={inputStyle}
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          <div>
            <label>Basic Salary</label>
            <input
              type="number"
              value={basicSalary}
              onChange={(e) => setBasicSalary(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label>Bonus</label>
            <input
              type="number"
              value={bonus}
              onChange={(e) => setBonus(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label>Deduction</label>
          <input
            type="number"
            value={deduction}
            onChange={(e) => setDeduction(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 10,
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div style={{ fontSize: 14, color: "var(--text2)" }}>Net Salary</div>
          <div style={{ fontSize: 30, fontWeight: 700, color: "var(--gold)" }}>
            ₹ {netSalary.toLocaleString("en-IN")}
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 12, fontSize: 13, color: "#EF4444" }}>
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 24,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "transparent",
              cursor: "pointer",
              color: "var(--text1)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            style={{
              padding: "10px 22px",
              border: "none",
              borderRadius: 8,
              background: "var(--gold)",
              color: "#000",
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving…" : "Save Payroll"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  colors,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  colors: ReturnType<typeof getColors>;
}) {
  return (
    <div
      style={{
        background: colors.cardBg,
        padding: 20,
        borderRadius: 12,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${color}1A`,
          }}
        >
          <Icon size={20} color={color} />
        </div>
        <span style={{ color: colors.textSecondary, fontSize: 14 }}>
          {title}
        </span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color, marginTop: 14 }}>
        {value}
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "16px",
  textAlign: "left",
  fontSize: 14,
  fontWeight: 600,
};
const td: React.CSSProperties = { padding: "16px" };