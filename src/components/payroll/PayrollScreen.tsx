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

export default function PayrollScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

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
    <div style={{ padding: 24 }}>
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
              color: "white",
            }}
          >
            💰 Payroll Management
          </h1>

          <p
            style={{
              color: "#9CA3AF",
              marginTop: 8,
            }}
          >
            Manage employee salaries, payroll history and payments.
          </p>
        </div>

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
          icon={<Users size={20} />}
          color="#2563EB"
        />

        <StatCard
          title="Monthly Payroll"
          value={`₹${totalSalary.toLocaleString()}`}
          icon={<Wallet size={20} />}
          color="#10B981"
        />

        <StatCard
          title="Pending Payroll"
          value="₹0"
          icon={<Clock3 size={20} />}
          color="#F59E0B"
        />

        <StatCard
          title="Paid"
          value="₹0"
          icon={<CheckCircle2 size={20} />}
          color="#8B5CF6"
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
            color: "#94A3B8",
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
            border: "1px solid #2B3545",
            background: "#111827",
            color: "white",
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
          border: "1px solid #333",
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
              background: "#111827",
            }}
          >
            <tr>
              <th style={th}>Employee</th>
              <th style={th}>Role</th>
              <th style={th}>Phone</th>
              <th style={th}>Salary</th>
              <th style={th}>Status</th>
              <th style={th}>Action</th>
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
                  e.currentTarget.style.background = "#1F2937";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Employee */}
                <td style={td}>
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
                      }}
                    >
                      {emp.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "white",
                        }}
                      >
                        {emp.name}
                      </div>

                      <div
                        style={{
                          color: "#9CA3AF",
                          fontSize: 13,
                        }}
                      >
                        {emp.email || "No Email"}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td style={td}>
                  <span
                    style={{
                      background: "#1E40AF",
                      color: "#DBEAFE",
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
                <td style={td}>{emp.phone || "-"}</td>

                {/* Salary */}
                <td style={td}>
                  <span
                    style={{
                      fontWeight: 700,
                      color: "#10B981",
                      fontSize: 16,
                    }}
                  >
                    ₹{Number(emp.salary).toLocaleString()}
                  </span>
                </td>

                {/* Status */}
                <td style={td}>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: 30,
                      fontSize: 13,
                      fontWeight: 600,
                      background: emp.active ? "#064E3B" : "#7F1D1D",
                      color: emp.active ? "#A7F3D0" : "#FECACA",
                    }}
                  >
                    {emp.active ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* Actions */}
                <td style={td}>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    <button style={actionBlue}>
                      <Pencil size={16} />
                    </button>

                    <button style={actionRed}>
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
                    color: "#9CA3AF",
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

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      style={{
        background: "#111827",
        padding: 20,
        borderRadius: 12,
        border: "1px solid #333",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "#9ca3af",
          marginBottom: 10,
        }}
      >
        <span>{icon}</span>
        <span>{title}</span>
      </div>

      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color,
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
  color: "#D1D5DB",
  fontSize: 14,
  fontWeight: 600,
};

const td: React.CSSProperties = {
  padding: "16px",
  borderTop: "1px solid #374151",
  color: "white",
};

const actionBtn: React.CSSProperties = {
  border: "none",
  color: "white",
  width: 36,
  height: 36,
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 15,
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
