"use client";
import { useEffect } from "react";

interface KOTItem {
  name: string;
  qty: number;
  notes?: string;
  veg?: boolean;
}

interface KOTPrintProps {
  billNo?: number;
  orderType: string;
  tableNo?: number | string;
  items: KOTItem[];
  createdAt?: string;
  onClose: () => void;
}

export default function KOTPrint({
  billNo,
  orderType,
  tableNo,
  items,
  createdAt,
  onClose,
}: KOTPrintProps) {
  const date = createdAt ? new Date(createdAt) : new Date();
  const dateStr = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
  const timeStr = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const handlePrint = () => window.print();

  // Auto-trigger the print dialog as soon as this mounts — kitchen tickets
  // should go out immediately, not wait for a second click.
  useEffect(() => {
    const t = setTimeout(() => window.print(), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <div
        className="no-print"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          zIndex: 9998,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={onClose}
      />

      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 9999,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          width: 320,
          maxHeight: "90vh",
          overflow: "auto",
        }}
        id="kot-print-area"
      >
        <div
          className="no-print"
          style={{
            display: "flex",
            gap: 8,
            padding: "12px 16px",
            borderBottom: "1px solid #e5e7eb",
            background: "#f9fafb",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <button
            onClick={handlePrint}
            style={{
              flex: 1,
              height: 38,
              borderRadius: 8,
              background: "#F59E0B",
              color: "#0B1120",
              border: "none",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            🖨️ Print KOT
          </button>
          <button
            onClick={onClose}
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: "#f3f4f6",
              border: "1px solid #e5e7eb",
              fontSize: 16,
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            padding: "20px 18px",
            fontFamily: "'Courier New', monospace",
            color: "#111",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 20, fontWeight: 900 }}>KITCHEN ORDER</div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
              {dateStr} · {timeStr}
            </div>
          </div>

          <div style={{ borderTop: "2px dashed #111", margin: "10px 0" }} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 900 }}>
              {orderType === "DINE_IN" && tableNo
                ? `TABLE ${tableNo}`
                : orderType.replace("_", " ")}
            </span>
            {billNo && (
              <span style={{ fontSize: 13, color: "#555" }}>#{billNo}</span>
            )}
          </div>

          <div style={{ borderTop: "2px dashed #111", margin: "10px 0" }} />

          {items.map((item, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 900, minWidth: 30 }}>
                  {item.qty}×
                </span>
                <span style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>
                  <span style={{ marginRight: 4 }}>{item.veg ? "●" : "◆"}</span>
                  {item.name}
                </span>
              </div>
              {item.notes && (
                <div
                  style={{
                    fontSize: 12,
                    color: "#b91c1c",
                    marginLeft: 38,
                    marginTop: 2,
                  }}
                >
                  ✎ {item.notes}
                </div>
              )}
            </div>
          ))}

          <div style={{ borderTop: "2px dashed #111", margin: "14px 0 4px" }} />
          <div style={{ textAlign: "center", fontSize: 10, color: "#999" }}>
            Khaddorosik POS
          </div>
        </div>
      </div>

      <style>{`
  @media print {
    body * {
      visibility: hidden;
    }
    #kot-print-area, #kot-print-area * {
      visibility: visible;
    }
    #kot-print-area {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      transform: none !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      max-height: none !important;
      width: 80mm !important;
    }
    .no-print { display: none !important; }
  }
`}</style>
    </>
  );
}
