"use client";
import EmployeeModal from "@/components/payroll/EmployeeModal";
import EditEmployeeModal from "@/components/payroll/EditEmployeeModal";
import DeleteEmployeeModal from "@/components/payroll/DeleteEmployeeModal";
import { useEffect, useState } from "react";
import {
  Users,
  Wallet,
  Clock3,
  CheckCircle2,
  Pencil,
  Trash2,
  HandCoins,
  Search,
  Moon,
  Sun,
  LucideIcon,
} from "lucide-react";

type Employee = {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  salary: number;
  active: boolean;
};

type Theme = "dark" | "light";

// ---------------------------------------------------------------------------
// Theme tokens
// ---------------------------------------------------------------------------
function getColors(theme: Theme) {
  const isDark = theme === "dark";

  return {
    isDark,
    pageBg: isDark ? "#0B1220" : "#F3F4F6",
    cardBg: isDark ? "#111827" : "#FFFFFF",
    border: isDark ? "#333333" : "#E5E7EB",
    textPrimary: isDark ? "#FFFFFF" : "#111827",
    textSecondary: isDark ? "#9CA3AF" : "#6B7280",
    tableHeaderBg: isDark ? "#111827" : "#F9FAFB",
    tableRowHover: isDark ? "#1F2937" : "#F3F4F6",
    tableBorder: isDark ? "#374151" : "#E5E7EB",
    inputBg: isDark ? "#111827" : "#FFFFFF",
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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  const c = getColors(theme);

  useEffect(() => {
    setEmployees([
      {
        id: "1",
        name: "Rahul Sharma",
        role: "MANAGER",
        phone: "9876543210",
        email: "rahul@gmail.com",
        salary: 35000,
        active: true,
      },
      {
        id: "2",
        name: "Priya Das",
        role: "CASHIER",
        phone: "9123456789",
        email: "priya@gmail.com",
        salary: 22000,
        active: true,
      },
      {
        id: "3",
        name: "Amit Roy",
        role: "WAITER",
        phone: "9871112222",
        email: "amit@gmail.com",
        salary: 18000,
        active: false,
      },
      {
        id: "4",
        name: "Sneha Paul",
        role: "CHEF",
        phone: "9000011111",
        email: "sneha@gmail.com",
        salary: 42000,
        active: true,
      },
    ]);

    // loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      const res = await fetch("/api/employees");

      if (!res.ok) return;

      const data = await res.json();

      setEmployees(data.data ?? data);
    } catch (err) {
      console.log(err);
    }
  }

  const filtered = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalEmployees = employees.length;

  const totalSalary = employees.reduce(
    (sum, emp) => sum + Number(emp.salary ?? 0),
    0,
  );

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
          <h1
            style={{
              margin: 0,
              fontSize: 34,
              color: c.textPrimary,
            }}
          >
            💰 Payroll Management
          </h1>

          <p
            style={{
              color: c.textSecondary,
              marginTop: 8,
            }}
          >
            Manage employee salaries, payroll history and payments.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle theme"
            style={{
              background: c.cardBg,
              border: `1px solid ${c.border}`,
              color: c.textPrimary,
              width: 44,
              height: 44,
              borderRadius: 10,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

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
            + Add Employee
          </button>
        </div>
      </div>

      {/* Stats */}

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
          value={totalEmployees}
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
          value="₹0"
          icon={Clock3}
          color="#F59E0B"
          colors={c}
        />

        <StatCard
          title="Paid"
          value="₹0"
          icon={CheckCircle2}
          color="#8B5CF6"
          colors={c}
        />
      </div>

      {/* Search */}

      <div
        style={{
          position: "relative",
          marginBottom: 25,
        }}
      >
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

      {/* Table */}

      <div
        style={{
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${c.border}`,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead
            style={{
              background: c.tableHeaderBg,
            }}
          >
            <tr>
              <th style={{ ...th, color: c.textSecondary }}>Employee</th>
              <th style={{ ...th, color: c.textSecondary }}>Role</th>
              <th style={{ ...th, color: c.textSecondary }}>Phone</th>
              <th style={{ ...th, color: c.textSecondary }}>Salary</th>
              <th style={{ ...th, color: c.textSecondary }}>Status</th>
              <th style={{ ...th, color: c.textSecondary }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((emp) => (
              <tr
                key={emp.id}
                style={{
                  transition: "0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = c.tableRowHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Employee */}
                <td style={{ ...td, borderTop: `1px solid ${c.tableBorder}` }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
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
                      {emp.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: c.textPrimary,
                        }}
                      >
                        {emp.name}
                      </div>

                      <div
                        style={{
                          color: c.textSecondary,
                          fontSize: 13,
                        }}
                      >
                        {emp.email || "No Email"}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td style={{ ...td, borderTop: `1px solid ${c.tableBorder}` }}>
                  <span
                    style={{
                      background: c.roleBadgeBg,
                      color: c.roleBadgeText,
                      padding: "6px 12px",
                      borderRadius: 20,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {emp.role.replace("_", " ")}
                  </span>
                </td>

                {/* Phone */}
                <td
                  style={{
                    ...td,
                    borderTop: `1px solid ${c.tableBorder}`,
                    color: c.textPrimary,
                  }}
                >
                  {emp.phone || "-"}
                </td>

                {/* Salary */}
                <td style={{ ...td, borderTop: `1px solid ${c.tableBorder}` }}>
                  <span
                    style={{
                      fontWeight: 700,
                      color: c.salaryColor,
                      fontSize: 16,
                    }}
                  >
                    ₹{Number(emp.salary).toLocaleString()}
                  </span>
                </td>

                {/* Status */}
                <td style={{ ...td, borderTop: `1px solid ${c.tableBorder}` }}>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: 30,
                      fontSize: 13,
                      fontWeight: 600,
                      background: emp.active ? c.activeBg : c.inactiveBg,
                      color: emp.active ? c.activeText : c.inactiveText,
                    }}
                  >
                    {emp.active ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* Actions */}
                <td style={{ ...td, borderTop: `1px solid ${c.tableBorder}` }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    <button
                      style={actionBlue}
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setEditOpen(true);
                      }}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      style={actionRed}
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>

                    <button style={actionGreen}>
                      <HandCoins size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: 60,
                    textAlign: "center",
                    color: c.textSecondary,
                  }}
                >
                  No Employees Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EmployeeModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={loadEmployees}
      />
      <EditEmployeeModal
        open={editOpen}
        employee={selectedEmployee}
        onClose={() => setEditOpen(false)}
      />
      <DeleteEmployeeModal
        open={deleteOpen}
        employee={selectedEmployee}
        onClose={() => setDeleteOpen(false)}
        onDelete={() => {
          alert("Delete API will be connected later 😊");
          setDeleteOpen(false);
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatCard — fixed-size icon badge keeps every card's header row the same
// height, which is what was causing the misalignment before.
// ---------------------------------------------------------------------------
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
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

        <span
          style={{
            color: colors.textSecondary,
            fontSize: 14,
          }}
        >
          {title}
        </span>
      </div>

      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color,
          marginTop: 14,
        }}
      >
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

const td: React.CSSProperties = {
  padding: "16px",
};

const actionBtn: React.CSSProperties = {
  border: "none",
  color: "white",
  width: 36,
  height: 36,
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 15,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const actionBlue: React.CSSProperties = {
  ...actionBtn,
  background: "#2563EB",
};

const actionRed: React.CSSProperties = {
  ...actionBtn,
  background: "#DC2626",
};

const actionGreen: React.CSSProperties = {
  ...actionBtn,
  background: "#10B981",
};