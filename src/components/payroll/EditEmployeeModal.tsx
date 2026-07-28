"use client";

import { useEffect, useState } from "react";

type Employee = {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  salary: number;
  active: boolean;
};

type Props = {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
};

export default function EditEmployeeModal({
  open,
  employee,
  onClose,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    role: "",
    phone: "",
    email: "",
    salary: "",
    active: true,
  });

  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name,
        role: employee.role,
        phone: employee.phone || "",
        email: employee.email || "",
        salary: String(employee.salary),
        active: employee.active,
      });
    }
  }, [employee]);

  if (!open || !employee) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2>Edit Employee</h2>

        <input
          style={input}
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          placeholder="Employee Name"
        />

        <select
          style={input}
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
        >
          <option value="MANAGER">Manager</option>
          <option value="HEAD_WAITER">Head Waiter</option>
          <option value="WAITER">Waiter</option>
          <option value="CASHIER">Cashier</option>
          <option value="CHEF">Chef</option>
          <option value="KITCHEN_STAFF">Kitchen Staff</option>
        </select>

        <input
          style={input}
          value={form.phone}
          placeholder="Phone"
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
        />

        <input
          style={input}
          value={form.email}
          placeholder="Email"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          style={input}
          type="number"
          value={form.salary}
          placeholder="Salary"
          onChange={(e) =>
            setForm({ ...form, salary: e.target.value })
          }
        />

        <label
          style={{
            display: "flex",
            gap: 10,
            marginTop: 20,
            alignItems: "center",
          }}
        >
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) =>
              setForm({
                ...form,
                active: e.target.checked,
              })
            }
          />

          Active Employee
        </label>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 25,
          }}
        >
          <button onClick={onClose}>
            Cancel
          </button>

          <button
            style={{
              background: "#2563EB",
              color: "white",
              padding: "10px 18px",
              border: "none",
              borderRadius: 8,
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const modal: React.CSSProperties = {
  width: 520,
  background: "#111827",
  padding: 25,
  borderRadius: 12,
  border: "1px solid #333",
};

const input: React.CSSProperties = {
  width: "100%",
  marginTop: 15,
  padding: 12,
  borderRadius: 8,
  border: "1px solid #444",
  background: "#1F2937",
  color: "white",
};