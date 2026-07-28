"use client";

type Employee = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
  onDelete: () => void;
};

export default function DeleteEmployeeModal({
  open,
  employee,
  onClose,
  onDelete,
}: Props) {
  if (!open || !employee) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={iconCircle}>🗑️</div>

        <h2
          style={{
            marginTop: 20,
            marginBottom: 10,
            color: "white",
          }}
        >
          Delete Employee
        </h2>

        <p
          style={{
            color: "#9CA3AF",
            textAlign: "center",
            lineHeight: 1.7,
          }}
        >
          Are you sure you want to delete
          <br />
          <b style={{ color: "white" }}>{employee.name}</b> ?
        </p>

        <div
          style={{
            display: "flex",
            gap: 15,
            marginTop: 30,
          }}
        >
          <button
            style={cancelBtn}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            style={deleteBtn}
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.65)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const modal: React.CSSProperties = {
  width: 430,
  background: "#111827",
  borderRadius: 18,
  padding: 35,
  border: "1px solid #374151",
  textAlign: "center",
};

const iconCircle: React.CSSProperties = {
  width: 80,
  height: 80,
  borderRadius: "50%",
  margin: "auto",
  background: "#7F1D1D",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: 34,
};

const cancelBtn: React.CSSProperties = {
  flex: 1,
  padding: 13,
  background: "#374151",
  color: "white",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
};

const deleteBtn: React.CSSProperties = {
  flex: 1,
  padding: 13,
  background: "#DC2626",
  color: "white",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
};