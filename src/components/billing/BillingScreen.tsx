"use client";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Printer,
  Plus,
  Minus,
  Trash2,
  Tag,
  Users,
  ShoppingCart,
  Pencil,
} from "lucide-react";
import {
  menu,
  orders,
  kot,
  type ApiMenuItem,
  type ApiCategory,
  type ApiKOT,
} from "@/lib/api";
import BillPrint from "@/components/billing/BillPrint";
import KOTPrint from "@/components/billing/KOTPrint";
import type { CartItem, ToastType } from "@/types";
import BillPrintLoader from "@/components/billing/BillPrintLoader";

type KOTItemForPrint = {
  name: string;
  qty: number;
  notes?: string;
  veg?: boolean;
};

type OrderRecord = Awaited<ReturnType<typeof orders.list>>["data"][number];

interface Props {
  toast: (msg: string, type: ToastType) => void;
  onPayment: (
    cart: CartItem[],
    orderId?: string,
    contextLabel?: string,
  ) => void;
  onNavigate: (id: string) => void;
}

const FILTERS = ["all", "veg", "nv", "best", "avail"];
const FILTER_LABELS: Record<string, string> = {
  all: "All Items",
  veg: "Veg",
  nv: "Non-Veg",
  best: "⭐ Best",
  avail: "✓ In Stock",
};

export default function BillingScreen({ toast, onPayment, onNavigate }: Props) {
  const searchParams = useSearchParams();
  const tableId = searchParams.get("tableId") ?? undefined;
  const tableNo = searchParams.get("tableNo");
  const tableLabel = tableNo ? `Table ${tableNo}` : "Select Table";
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [filter, setFilter] = useState("all");
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [orderType, setOrderType] = useState("Dine In");
  const [activeTab, setActiveTab] = useState(0);
  const [menuItems, setMenuItems] = useState<ApiMenuItem[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [kotOrders, setKotOrders] = useState<ApiKOT[]>([]);
  const [orderId, setOrderId] = useState<string | undefined>();
  const [kotLoading, setKotLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [printKOT, setPrintKOT] = useState<{
    items: KOTItemForPrint[];
    billNo?: number;
  } | null>(null);
  const [orderHistory, setOrderHistory] = useState<
    Awaited<ReturnType<typeof orders.list>>["data"]
  >([]);
  const [parcelOrders, setParcelOrders] = useState<
    Awaited<ReturnType<typeof orders.list>>["data"]
  >([]);
  const [parcelLoading, setParcelLoading] = useState(false);
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);
  const [showBillPrint, setShowBillPrint] = useState(false);
  const [restaurant, setRestaurant] = useState<{
    name: string;
    address?: string;
    phone?: string;
    gstNumber?: string;
  } | null>(null);

  useEffect(() => {
    setActiveTab(0);
    setSearch("");
    setCat("all");
    setFilter("all");
    setCart({});
    setOrderId(undefined);
  }, [tableId, tableNo]);

  // Fetch menu data on mount
  // useEffect(() => {
  //   menu.items({ limit: '200' }).then(res => setMenuItems(res.data)).catch(() => {});
  //   menu.categories().then(setCategories).catch(() => {});
  // }, []);

  // region testing add

  useEffect(() => {
    console.log("BillingScreen mounted");

    menu
      .items({ limit: "200" })
      .then((res) => {
        console.log("Items loaded", res);
        setMenuItems(res.data);
      })
      .catch((e) => console.error("Items error", e));

    menu
      .categories()
      .then((res) => {
        console.log("Categories loaded", res);
        setCategories(res);
      })
      .catch((e) => console.error("Categories error", e));
  }, []);

  //endregion

  // Fetch KOTs when switching to Running KOT tab
  useEffect(() => {
    if (activeTab === 1) {
      kot
        .list("PENDING,PREPARING,READY")
        .then(setKotOrders)
        .catch(() => {});
    }
  }, [activeTab]);

  // Fetch order history when switching to Order History tab
  useEffect(() => {
    if (activeTab === 2) {
      setOrderHistoryLoading(true);
      orders
        .list({ limit: "50" })
        .then((res) => setOrderHistory(res.data))
        .catch(() => {})
        .finally(() => setOrderHistoryLoading(false));
    }
  }, [activeTab]);

  // Fetch parcel (Takeaway/Delivery) orders when switching to Parcel tab
  useEffect(() => {
    if (activeTab === 3) {
      setParcelLoading(true);
      orders
        .list({ limit: "50" })
        .then((res) =>
          setParcelOrders(
            res.data.filter(
              (o) => o.orderType === "TAKEAWAY" || o.orderType === "DELIVERY",
            ),
          ),
        )
        .catch(() => {})
        .finally(() => setParcelLoading(false));
    }
  }, [activeTab]);

  const items = useMemo(() => {
    let list = menuItems ?? [];
    if (cat !== "all")
      list = list.filter((i) => i.category?.name?.toLowerCase() === cat);
    if (filter === "veg") list = list.filter((i) => i.veg);
    if (filter === "nv") list = list.filter((i) => !i.veg);
    if (filter === "best") list = list.filter((i) => i.bestSeller);
    if (filter === "avail") list = list.filter((i) => i.available);
    if (search)
      list = list.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase()),
      );
    return list;
  }, [cat, filter, search, menuItems]);

  const allCats = useMemo(
    () => [
      { id: "all", name: "All", icon: "🍽️" },
      ...categories.map((c) => ({
        id: c.name.toLowerCase(),
        name: c.name,
        icon: "",
      })),
    ],
    [categories],
  );

  const addItem = (id: string) => {
    const item = menuItems.find((i) => i.id === id)!;
    setCart((prev) => {
      const existing = prev[id];
      return {
        ...prev,
        [id]: existing
          ? { ...existing, qty: existing.qty + 1 }
          : {
              id,
              name: item.name,
              price: Number(item.price),
              qty: 1,
              veg: item.veg,
              emoji: "",
            },
      };
    });
    toast(`${item.name} added`, "success");
  };

  const changeQty = (id: string, delta: number) => {
    setCart((prev) => {
      const next = { ...prev };
      if (!next[id]) return prev;
      next[id] = { ...next[id], qty: next[id].qty + delta };
      if (next[id].qty <= 0) delete next[id];
      return next;
    });
  };

  const clearCart = () => {
    setCart({});
    setOrderId(undefined);
  };

  const createOrder = async () => {
    if (cartItems.length === 0) return;
    if (orderId) return orderId;
    const orderTypeMap: Record<string, string> = {
      "Dine In": "DINE_IN",
      Takeaway: "TAKEAWAY",
      Delivery: "DELIVERY",
    };
    const order = await orders.create({
      orderType: orderTypeMap[orderType] ?? "DINE_IN",
      tableId: orderType === "Dine In" ? tableId : undefined,
      items: cartItems.map((i) => ({ menuItemId: i.id, quantity: i.qty })),
    });
    setOrderId(order.id);
    return order.id;
  };

  const sendKOT = async () => {
    if (cartItems.length === 0) return;
    setKotLoading(true);
    try {
      const newOrderId = await createOrder();
      toast("KOT sent to kitchen 🍳", "kitchen");
      setPrintKOT({
        items: cartItems.map((i) => ({ name: i.name, qty: i.qty, veg: i.veg })),
        billNo: undefined,
      });
      setActiveTab(1);
    } catch (e) {
      toast("Failed to send KOT", "info");
    } finally {
      setKotLoading(false);
    }
  };

  const proceedToPayment = async () => {
    if (cartItems.length === 0 || paymentLoading) return;
    setPaymentLoading(true);
    try {
      const nextOrderId = await createOrder();
      if (!nextOrderId) {
        toast("Create an order before payment", "info");
        return;
      }
      onPayment(cartItems, nextOrderId, tableNo ? tableLabel : undefined);
    } catch (e) {
      toast("Failed to create order for payment", "info");
    } finally {
      setPaymentLoading(false);
    }
  };

  const cartItems = Object.values(cart);
  const sub = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const disc = Math.round(sub * 0.05);
  const taxable = sub - disc;
  const cgst = Math.round(taxable * 0.025);
  const sgst = Math.round(taxable * 0.025);
  const grand = taxable + cgst + sgst;

  const TABS = [
    { label: "New Order", badge: null },
    {
      label: "Running KOT",
      badge: kotOrders.filter((k) => k.status !== "COMPLETED").length || null,
    },
    { label: "Order History", badge: null },
    { label: "Parcel", badge: null },
  ];

  return (
    <div className="billing-screen flex flex-1 overflow-hidden">
      {/* ── LEFT: Menu panel ── */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{ minHeight: 0 }}
      >
        {/* Tab bar — inline styles to avoid Tailwind purge on Vercel */}
        <div
          className="flex flex-shrink-0 px-4"
          style={{
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            position: "relative", // ← ADD
            zIndex: 10,
          }}
        >
          {TABS.map(({ label, badge }, i) => (
            <button
              key={label}
              type="button" // ← ADD THIS
              onClick={() => setActiveTab(i)}
              className="py-[11px] px-[18px] text-[13px] cursor-pointer transition-all whitespace-nowrap"
              style={{
                fontWeight: activeTab === i ? 600 : 400,
                color: activeTab === i ? "var(--primary)" : "var(--text3)",
                background: "transparent",
                border: "none",
                borderBottom:
                  activeTab === i
                    ? "2.5px solid var(--primary)"
                    : "2.5px solid transparent",
                marginBottom: -1,
                position: "relative", // ← ADD THIS
                zIndex: 1, // ← ADD THIS
              }}
            >
              {label}
              {badge != null && badge > 0 && (
                <span
                  className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background:
                      activeTab === i
                        ? "var(--primary-light)"
                        : "var(--surface3)",
                    color: activeTab === i ? "var(--primary)" : "var(--text3)",
                  }}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab 1: Running KOT ── */}
        {activeTab === 1 && (
          <div
            className="flex-1 overflow-y-auto p-4 flex flex-wrap gap-3 content-start"
            style={{ background: "var(--surface2)" }}
          >
            {kotOrders.length === 0 && (
              <div
                style={{
                  color: "var(--text3)",
                  padding: 40,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                No active KOTs
              </div>
            )}
            {kotOrders.map((order, oi) => {
              const isReady = order.status === "READY";
              const headerBg = isReady ? "var(--green)" : "var(--dark)";
              return (
                <div
                  key={order.id}
                  className="rounded-xl overflow-hidden flex-shrink-0"
                  style={{
                    width: 220,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    className="flex items-center justify-between px-3 py-2.5"
                    style={{ background: headerBg }}
                  >
                    <div>
                      <div className="text-[15px] font-extrabold text-white">
                        {order.order?.tableId
                          ? `Table`
                          : (order.order?.orderType ?? "Order")}
                      </div>
                      <div
                        className="text-[10px]"
                        style={{ color: "rgba(255,255,255,0.6)" }}
                      >
                        KOT #{oi + 1}
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{ background: "rgba(255,255,255,0.2)" }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="py-1.5">
                    {order.kotItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-3 py-1.5 text-[12px]"
                      >
                        <span
                          className="font-extrabold min-w-[18px]"
                          style={{ color: "var(--primary, #f59e0b)" }}
                        >
                          {item.quantity}×
                        </span>
                        <span
                          className="flex-1 font-medium"
                          style={{ color: "#20302d" }}
                        >
                          {item.orderItem?.menuItem?.name ?? "Item"}
                        </span>
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
                          style={{
                            background: item.done
                              ? "var(--green)"
                              : "var(--border)",
                            color: item.done ? "#fff" : "transparent",
                          }}
                        >
                          {item.done ? "✓" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div
                    className="flex gap-1.5 px-3 pb-3 pt-1.5"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <button
                      onClick={() => {
                        setPrintKOT({
                          items: order.kotItems.map((item) => ({
                            name: item.orderItem?.menuItem?.name ?? "Item",
                            qty: item.quantity,
                            veg: item.orderItem?.menuItem?.veg,
                            notes: item.orderItem?.notes,
                          })),
                          billNo: order.order?.billNo,
                        });
                        toast("KOT reprinted", "kitchen");
                      }}
                    >
                      Reprint
                    </button>
                    <button
                      onClick={async () => {
                        const next = isReady ? "COMPLETED" : "READY";
                        await kot.updateStatus(order.id, next).catch(() => {});
                        setKotOrders((prev) =>
                          prev.map((k) =>
                            k.id === order.id ? { ...k, status: next } : k,
                          ),
                        );
                        toast(
                          isReady ? "Marked served" : "Marked ready",
                          "success",
                        );
                      }}
                      className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold text-white cursor-pointer"
                      style={{
                        background: isReady ? "var(--green)" : "var(--primary)",
                        border: "none",
                      }}
                    >
                      {isReady ? "Served" : "Mark Ready"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Tab 2: Order History ── */}
        {activeTab === 2 && (
          <div
            className="flex-1 overflow-y-auto p-4"
            style={{ background: "var(--surface2)" }}
          >
            {orderHistoryLoading ? (
              <div
                style={{
                  color: "var(--text3)",
                  padding: 40,
                  textAlign: "center",
                }}
              >
                Loading order history…
              </div>
            ) : orderHistory.length === 0 ? (
              <div
                className="flex-1 flex flex-col items-center justify-center"
                style={{ color: "var(--text3)", paddingTop: 60 }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>🧾</div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--text1)",
                    marginBottom: 6,
                  }}
                >
                  No order history yet
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text3)",
                    marginBottom: 20,
                  }}
                >
                  Completed orders will appear here
                </div>
                <button
                  onClick={() => setActiveTab(0)}
                  className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white cursor-pointer"
                  style={{ background: "var(--primary)", border: "none" }}
                >
                  + Create New Order
                </button>
              </div>
            ) : (
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12,
                  }}
                >
                  <thead>
                    <tr style={{ background: "var(--surface2)" }}>
                      {["Bill #", "Type", "Time", "Status", "Total"].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              padding: "10px 16px",
                              textAlign: "left",
                              fontSize: 10,
                              fontWeight: 700,
                              color: "var(--text3)",
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              borderBottom: "1px solid var(--border)",
                            }}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {orderHistory.map((o) => (
                      <tr
                        key={o.id}
                        onClick={() => {
                          setOrderId(o.id);
                          setShowBillPrint(true);
                        }}
                        style={{
                          borderBottom: "1px solid var(--border)",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--surface2)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "")
                        }
                      >
                        <td
                          style={{
                            padding: "10px 16px",
                            fontWeight: 600,
                            color: "var(--text1)",
                          }}
                        >
                          #{o.billNo ? String(o.billNo).padStart(4, "0") : "—"}
                        </td>
                        <td
                          style={{
                            padding: "10px 16px",
                            color: "var(--text2)",
                            textTransform: "capitalize",
                          }}
                        >
                          {o.orderType.replace("_", " ").toLowerCase()}
                        </td>
                        <td
                          style={{
                            padding: "10px 16px",
                            color: "var(--text3)",
                          }}
                        >
                          {new Date(o.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td style={{ padding: "10px 16px" }}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 99,
                              fontSize: 10,
                              fontWeight: 700,
                              background:
                                o.status === "PAID"
                                  ? "var(--green-bg)"
                                  : "var(--surface3)",
                              color:
                                o.status === "PAID"
                                  ? "var(--green)"
                                  : "var(--text3)",
                            }}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "10px 16px",
                            fontWeight: 700,
                            color: "var(--primary, #f59e0b)",
                          }}
                        >
                          ₹{Number(o.total).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Tab 3: Parcel empty state ── */}
        {/* ── Tab 3: Parcel ── */}
        {activeTab === 3 && (
          <div
            className="flex-1 overflow-y-auto p-4"
            style={{ background: "var(--surface2)" }}
          >
            {parcelLoading ? (
              <div
                style={{
                  color: "var(--text3)",
                  padding: 40,
                  textAlign: "center",
                }}
              >
                Loading parcel orders…
              </div>
            ) : parcelOrders.length === 0 ? (
              <div
                className="flex-1 flex flex-col items-center justify-center"
                style={{ color: "var(--text3)", paddingTop: 60 }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--text1)",
                    marginBottom: 6,
                  }}
                >
                  No parcel orders
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text3)",
                    marginBottom: 20,
                  }}
                >
                  Takeaway and delivery orders will appear here
                </div>
                <button
                  onClick={() => setActiveTab(0)}
                  className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white cursor-pointer"
                  style={{ background: "var(--primary)", border: "none" }}
                >
                  + New Parcel Order
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                {parcelOrders.map((o) => (
                  <div
                    key={o.id}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background:
                          o.orderType === "DELIVERY"
                            ? "var(--blue-bg)"
                            : "var(--amber-bg, #fff4dc)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color:
                            o.orderType === "DELIVERY"
                              ? "var(--blue)"
                              : "#c88716",
                        }}
                      >
                        {o.orderType === "DELIVERY"
                          ? "🛵 Delivery"
                          : "🥡 Takeaway"}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 99,
                          background:
                            o.status === "PAID"
                              ? "var(--green-bg)"
                              : "var(--surface3)",
                          color:
                            o.status === "PAID"
                              ? "var(--green)"
                              : "var(--text3)",
                        }}
                      >
                        {o.status}
                      </span>
                    </div>

                    <div style={{ padding: "12px 14px" }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--text1)",
                          marginBottom: 4,
                        }}
                      >
                        Bill #
                        {o.billNo ? String(o.billNo).padStart(4, "0") : "—"}
                      </div>
                      {o.customer?.name && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text2)",
                            marginBottom: 2,
                          }}
                        >
                          {o.customer.name}
                          {o.customer.phone ? ` · ${o.customer.phone}` : ""}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: "var(--text3)" }}>
                        {new Date(o.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: "var(--primary, #f59e0b)",
                          marginTop: 8,
                        }}
                      >
                        ₹{Number(o.total).toFixed(2)}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "8px 14px",
                        borderTop: "1px solid var(--border)",
                        display: "flex",
                        gap: 6,
                      }}
                    >
                      <button
                        onClick={() => {
                          setOrderId(o.id);
                          setShowBillPrint(true);
                        }}
                        style={{
                          flex: 1,
                          padding: "7px 0",
                          borderRadius: 7,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          border: "1px solid var(--border)",
                          background: "var(--surface2)",
                          color: "var(--text2)",
                        }}
                      >
                        🧾 Print Bill
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab 0: New Order ── */}
        {activeTab === 0 && (
          <>
            {/* Toolbar */}
            <div
              className="billing-toolbar flex items-center gap-2 px-3.5 py-2.5 flex-shrink-0"
              style={{
                background: "var(--surface)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div className="relative" style={{ flex: 1, maxWidth: 280 }}>
                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text3)" }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search dishes…"
                  className="w-full h-8 rounded-lg pl-8 pr-3 text-[12px] outline-none"
                  style={{
                    border: "1px solid var(--border)",
                    background: "var(--surface2)",
                    fontFamily: "inherit",
                  }}
                />
              </div>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-all whitespace-nowrap"
                  style={
                    filter === f
                      ? {
                          background: "var(--primary-light)",
                          color: "var(--primary, #f59e0b)",
                          border: "1px solid #efb29f",
                        }
                      : {
                          background: "var(--surface)",
                          color: "var(--text2)",
                          border: "1px solid var(--border)",
                        }
                  }
                >
                  {FILTER_LABELS[f]}
                </button>
              ))}
              <div className="flex-1" />
              <button
                onClick={() => toast("Menu printed!", "info")}
                className="px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                style={{
                  background: "var(--surface)",
                  color: "var(--text2)",
                  border: "1px solid var(--border)",
                }}
              >
                <Printer size={11} /> Print Menu
              </button>
            </div>

            {/* Category bar */}
            <div
              className="flex gap-1.5 px-3.5 py-2 flex-shrink-0 overflow-x-auto hide-scrollbar"
              style={{
                background: "var(--surface)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {allCats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap cursor-pointer transition-all"
                  style={
                    cat === c.id
                      ? {
                          background: "var(--dark)",
                          color: "#fff",
                          border: "1px solid var(--dark)",
                        }
                      : {
                          background: "var(--surface2)",
                          color: "var(--text2)",
                          border: "1px solid var(--border)",
                        }
                  }
                >
                  {c.icon && <span className="text-[13px]">{c.icon}</span>}
                  {c.name}
                </button>
              ))}
            </div>

            {/* Items grid */}
            {/* Items grid */}
            <div
              className="flex-1 overflow-y-auto p-3"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 15,
                alignContent: "start",
                minHeight: 0,
              }}
            >
              {items.length === 0 && (
                <div
                  style={{
                    width: "100%",
                    textAlign: "center",
                    padding: 40,
                    color: "var(--text3)",
                  }}
                >
                  <Search
                    size={36}
                    style={{
                      display: "block",
                      margin: "0 auto 8px",
                      opacity: 0.3,
                    }}
                  />
                  No items found
                </div>
              )}
              {items.map((item) => {
                const inCart = cart[item.id];
                const price = Number(item.price);
                return (
                  <div
                    key={item.id}
                    onClick={() => addItem(item.id)}
                    className="rounded-xl overflow-hidden cursor-pointer"
                    style={{
                      width: 160,
                      flex: "0 0 160px",
                      height: 190,
                      display: "flex",
                      flexDirection: "column",
                      background: "var(--surface)",
                      border: `1px solid ${inCart ? "var(--green)" : "var(--border)"}`,
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = inCart
                        ? "var(--green)"
                        : "var(--primary)";
                      el.style.boxShadow = "0 4px 12px rgba(232,92,38,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = inCart
                        ? "var(--green)"
                        : "var(--border)";
                      el.style.boxShadow = "";
                    }}
                  >
                    <div
                      className="relative overflow-hidden"
                      style={{
                        height: 82,
                        flexShrink: 0,
                        background: "var(--surface3)",
                      }}
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div
                        className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-sm flex items-center justify-center"
                        style={{
                          border: `2px solid ${item.veg ? "#2e7d32" : "#b71c1c"}`,
                        }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: item.veg ? "#2e7d32" : "#b71c1c",
                          }}
                        />
                      </div>
                      {item.bestSeller && (
                        <div
                          className="absolute top-1.5 left-0 text-white text-[8px] font-bold px-1.5 py-0.5"
                          style={{
                            background: "#c88716",
                            borderRadius: "0 4px 4px 0",
                          }}
                        >
                          BEST
                        </div>
                      )}
                      <div
                        className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full"
                        style={{
                          background: item.available
                            ? "var(--green)"
                            : "var(--red)",
                        }}
                      />
                    </div>
                    <div
                      className="p-2"
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        minHeight: 0,
                      }}
                    >
                      <div
                        className="text-[11.5px] font-semibold mb-1"
                        style={{
                          color: "var(--text1)",
                          lineHeight: "1.2em",
                          maxHeight: "2.4em",
                          overflow: "hidden",
                        }}
                      >
                        {item.name}
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[13px] font-bold"
                          style={{ color: "var(--primary, #f59e0b)" }}
                        >
                          ₹{price}
                        </span>
                        {inCart ? (
                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => changeQty(item.id, -1)}
                              className="w-[22px] h-[22px] rounded flex items-center justify-center cursor-pointer"
                              style={{
                                border: "1px solid var(--border)",
                                background: "var(--surface2)",
                                color: "var(--text2)",
                              }}
                            >
                              <Minus size={10} />
                            </button>
                            <span
                              className="text-[12px] font-bold min-w-[16px] text-center"
                              style={{ color: "var(--primary, #f59e0b)" }}
                            >
                              {inCart.qty}
                            </span>
                            <button
                              onClick={() => changeQty(item.id, 1)}
                              className="w-[22px] h-[22px] rounded flex items-center justify-center cursor-pointer"
                              style={{
                                border: "1px solid var(--border)",
                                background: "var(--surface2)",
                                color: "var(--text2)",
                              }}
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addItem(item.id);
                            }}
                            className="w-6 h-6 rounded-md flex items-center justify-center text-white cursor-pointer"
                            style={{
                              background: "var(--primary)",
                              border: "none",
                            }}
                          >
                            <Plus size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── RIGHT: Order panel ── */}
      <div
        className="billing-order-panel w-[292px] flex flex-col flex-shrink-0"
        style={{
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
        }}
      >
        <div
          className="flex items-center gap-2 px-3.5 py-[11px]"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <ShoppingCart size={16} style={{ color: "var(--text3)" }} />
          <span
            className="text-[14px] font-bold flex-1"
            style={{ color: "var(--text1)" }}
          >
            Current Order
          </span>
          <button
            onClick={() => onNavigate("tables")}
            className="text-[11px] font-bold px-2 py-1 rounded cursor-pointer"
            style={{ background: "var(--blue-bg)", color: "var(--blue)" }}
          >
            {tableLabel}
          </button>
        </div>

        <div
          className="flex gap-1.5 px-3.5 py-2.5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {["Dine In", "Takeaway", "Delivery"].map((t) => (
            <button
              key={t}
              onClick={() => setOrderType(t)}
              className="flex-1 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer transition-all"
              style={
                orderType === t
                  ? {
                      background: "var(--dark)",
                      color: "#fff",
                      border: "1px solid var(--dark)",
                    }
                  : {
                      background: "var(--surface)",
                      color: "var(--text2)",
                      border: "1px solid var(--border)",
                    }
              }
            >
              {t}
            </button>
          ))}
        </div>

        <div
          className="flex items-center gap-2 px-3.5 py-2"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0"
            style={{ background: "var(--purple-bg)", color: "var(--purple)" }}
          >
            RK
          </div>
          <div className="flex-1 overflow-hidden">
            <div
              className="text-[12px] font-semibold truncate"
              style={{ color: "var(--text1)" }}
            >
              Rahul Khanna
            </div>
            <div className="text-[10px]" style={{ color: "var(--text3)" }}>
              +91 98765 43210
            </div>
          </div>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: "var(--green-bg)", color: "var(--green)" }}
          >
            240 pts
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {cartItems.length === 0 ? (
            <div
              className="text-center py-9 px-4"
              style={{ color: "var(--text3)" }}
            >
              <ShoppingCart
                size={40}
                style={{ display: "block", margin: "0 auto 8px", opacity: 0.4 }}
              />
              <div>No items yet.</div>
              <div className="text-[11px] mt-1">Click + to add dishes</div>
            </div>
          ) : (
            <>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 px-3.5 py-[7px]"
                  style={{ borderBottom: "1px solid #eef4ef" }}
                >
                  <div
                    className="w-[7px] h-[7px] rounded-full flex-shrink-0"
                    style={{
                      background: item.veg ? "var(--green)" : "var(--red)",
                    }}
                  />
                  <div
                    className="text-[11.5px] font-semibold leading-tight mb-1"
                    style={{
                      color: "var(--text1)",
                      display: "-webkit-box",
                      WebkitLineClamp: "2",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: 29,
                    }}
                  >
                    {item.name}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => changeQty(item.id, -1)}
                      className="w-5 h-5 rounded cursor-pointer flex items-center justify-center"
                      style={{
                        border: "1px solid var(--border)",
                        background: "var(--surface2)",
                        color: "var(--text2)",
                      }}
                    >
                      <Minus size={9} />
                    </button>
                    <span className="text-[12px] font-bold min-w-[14px] text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => changeQty(item.id, 1)}
                      className="w-5 h-5 rounded cursor-pointer flex items-center justify-center"
                      style={{
                        border: "1px solid var(--border)",
                        background: "var(--surface2)",
                        color: "var(--text2)",
                      }}
                    >
                      <Plus size={9} />
                    </button>
                  </div>
                  <div
                    className="text-[12px] font-semibold min-w-[44px] text-right"
                    style={{ color: "var(--text1)" }}
                  >
                    ₹{item.price * item.qty}
                  </div>
                </div>
              ))}
              <div
                className="px-3.5 py-2"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div
                  className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--text3)" }}
                >
                  Running KOT
                </div>
                {[
                  {
                    label: "Paneer Tikka ×2",
                    status: "Ready",
                    bg: "var(--green-bg)",
                    col: "var(--green)",
                  },
                  {
                    label: "Dal Makhani ×1",
                    status: "Prep",
                    bg: "#fff4dc",
                    col: "#c88716",
                  },
                ].map((k) => (
                  <div
                    key={k.label}
                    className="flex items-center gap-1.5 text-[11px] mb-1"
                  >
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase"
                      style={{ background: k.bg, color: k.col }}
                    >
                      {k.status}
                    </span>
                    <span style={{ color: "var(--text2)" }}>{k.label}</span>
                  </div>
                ))}
              </div>
              <div
                className="mx-3.5 my-1.5 rounded-lg px-2.5 py-2 flex items-center gap-1.5 cursor-pointer"
                style={{
                  border: "1px dashed var(--border2)",
                  color: "var(--text3)",
                  fontSize: "11.5px",
                }}
              >
                <Pencil size={12} /> Add order note or special instruction…
              </div>
            </>
          )}
        </div>

        {cartItems.length > 0 && (
          <div
            className="px-3.5 py-2.5"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {[
              { label: "Subtotal", val: `₹${sub}`, color: "var(--text2)" },
              {
                label: "🏷 Loyalty Discount (5%)",
                val: `−₹${disc}`,
                color: "var(--green)",
              },
              { label: "CGST (2.5%)", val: `₹${cgst}`, color: "var(--text2)" },
              { label: "SGST (2.5%)", val: `₹${sgst}`, color: "var(--text2)" },
            ].map(({ label, val, color }) => (
              <div
                key={label}
                className="flex justify-between text-[12px] mb-1"
                style={{ color }}
              >
                <span>{label}</span>
                <span>{val}</span>
              </div>
            ))}
            <div
              className="flex justify-between text-[15px] font-bold pt-1.5 mt-0.5"
              style={{
                borderTop: "1.5px solid var(--border)",
                color: "var(--text1)",
              }}
            >
              <span>Grand Total</span>
              <span style={{ color: "var(--primary, #f59e0b)" }}>₹{grand}</span>
            </div>
            <div className="mt-1.5">
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: "var(--green-bg)", color: "var(--green)" }}
              >
                You save ₹{disc} 🎉
              </span>
            </div>
          </div>
        )}

        <div
          className="px-3.5 pb-3.5 pt-2.5"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {[
              {
                label: kotLoading ? "…" : "KOT",
                Icon: Printer,
                onClick: sendKOT,
                green: false,
              },
              {
                label: "Clear",
                Icon: Trash2,
                onClick: clearCart,
                green: false,
              },
              {
                label: "Discount",
                Icon: Tag,
                onClick: () => toast("Discount applied", "info"),
                green: false,
              },
              {
                label: "CRM",
                Icon: Users,
                onClick: () => onNavigate("crm"),
                green: true,
              },
            ].map(({ label, Icon, onClick, green }) => (
              <button
                key={label}
                onClick={onClick}
                className="py-2 rounded-lg text-[11.5px] font-semibold flex flex-col items-center gap-0.5 cursor-pointer transition-all"
                style={{
                  border: `1px solid ${green ? "#a9d9bd" : "var(--border)"}`,
                  background: "var(--surface)",
                  color: green ? "var(--green)" : "var(--text2)",
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
          {orderId && (
            <button
              onClick={() => setShowBillPrint(true)}
              className="w-full py-2 mb-2 rounded-lg text-[12px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              style={{
                border: "1px solid var(--border)",
                background: "var(--surface2)",
                color: "var(--text2)",
              }}
            >
              🧾 Print Bill
            </button>
          )}
          <button
            onClick={proceedToPayment}
            className="w-full py-3 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            style={{
              background:
                cartItems.length > 0 ? "var(--primary)" : "var(--text3)",
              border: "none",
            }}
            onMouseEnter={(e) => {
              if (cartItems.length > 0)
                (e.currentTarget as HTMLElement).style.background =
                  "var(--primary-dark)";
            }}
            onMouseLeave={(e) => {
              if (cartItems.length > 0)
                (e.currentTarget as HTMLElement).style.background =
                  "var(--primary)";
            }}
          >
            {paymentLoading ? "Opening Payment..." : "💳 Proceed to Payment"}
          </button>
        </div>
      </div>
      {printKOT && (
        <KOTPrint
          items={printKOT.items}
          billNo={printKOT.billNo}
          orderType={
            orderType === "Dine In"
              ? "DINE_IN"
              : orderType === "Takeaway"
                ? "TAKEAWAY"
                : "DELIVERY"
          }
          tableNo={tableNo ?? undefined}
          onClose={() => setPrintKOT(null)}
        />
      )}

      {showBillPrint && orderId && (
        <BillPrintLoader
          orderId={orderId}
          tableNo={tableNo ?? undefined}
          onClose={() => setShowBillPrint(false)}
        />
      )}
    </div>
  );
}
