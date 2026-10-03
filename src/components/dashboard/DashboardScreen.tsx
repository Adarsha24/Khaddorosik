"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { reports, ApiDashboard } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

/* ───────────────────────── helpers ───────────────────────── */

const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(Math.round(n));
const fmtCur = (n: number) => `₹${fmt(n)}`;
const fmtCompact = (n: number) =>
  n >= 100000
    ? `₹${(n / 100000).toFixed(1)}L`
    : n >= 1000
      ? `₹${(n / 1000).toFixed(1)}k`
      : `₹${Math.round(n)}`;
const hourLabel = (h: number) =>
  h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`;
const hourFull = (h: number) =>
  h === 0
    ? "12 AM"
    : h < 12
      ? `${h} AM`
      : h === 12
        ? "12 PM"
        : `${h - 12} PM`;

const accent = (c: string) => ({ "--accent": c }) as React.CSSProperties;

/* ───────────────────────── icons ───────────────────────── */

const PATHS: Record<string, React.ReactNode> = {
  wallet: (
    <>
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </>
  ),
  calendar: (
    <>
      <path d="M8 2v4M16 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18" />
    </>
  ),
  trend: (
    <>
      <path d="M22 7 13.5 15.5 8.5 10.5 2 17" />
      <path d="M16 7h6v6" />
    </>
  ),
  receipt: (
    <>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
  clipboard: (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6M9 16h4" />
    </>
  ),
  chef: (
    <>
      <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z" />
      <path d="M6 17h12" />
    </>
  ),
  tables: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  box: (
    <>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
    </>
  ),
  refresh: (
    <>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M8 16H3v5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  up: <path d="M7 17 17 7M7 7h10v10" />,
  down: <path d="M7 7l10 10M17 7v10H7" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  utensils: (
    <>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </>
  ),
  bag: (
    <>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
    </>
  ),
  bike: (
    <>
      <circle cx="18.5" cy="17.5" r="3.5" />
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="15" cy="5" r="1" />
      <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="M18 17V9M13 17V5M8 17v-3" />
    </>
  ),
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </>
  ),
};

function Ico({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

function VegMark({ veg }: { veg?: boolean }) {
  const c = veg ? "var(--green)" : "var(--red)";
  return (
    <span
      title={veg ? "Veg" : "Non-veg"}
      style={{
        width: 15,
        height: 15,
        border: `1.6px solid ${c}`,
        borderRadius: 3,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{ width: 7, height: 7, borderRadius: "50%", background: c }}
      />
    </span>
  );
}

/* ───────────────────────── pieces ───────────────────────── */

function Kpi({
  title,
  value,
  icon,
  color,
  foot,
  delay,
}: {
  title: string;
  value: string;
  icon: string;
  color: string;
  foot: React.ReactNode;
  delay: number;
}) {
  return (
    <div
      className="db-card db-kpi db-rise"
      style={{ ...accent(color), animationDelay: `${delay}ms` }}
    >
      <div className="db-kpi-top">
        <span className="db-kpi-label">{title}</span>
        <span className="db-ico">
          <Ico name={icon} />
        </span>
      </div>
      <div className="db-kpi-value tabular-nums">{value}</div>
      <div className="db-kpi-foot">{foot}</div>
    </div>
  );
}

function CardHead({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="db-head">
      <div>
        <div className="db-title">{title}</div>
        {sub && <div className="db-sub">{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function Empty({
  icon,
  title,
  text,
  action,
}: {
  icon: string;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="db-empty">
      <span className="db-empty-ico">
        <Ico name={icon} size={22} />
      </span>
      <div className="db-empty-title">{title}</div>
      <div className="db-empty-text">{text}</div>
      {action}
    </div>
  );
}

function LiveRow({
  icon,
  label,
  value,
  color,
  onClick,
  children,
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
  color: string;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button className="db-live" style={accent(color)} onClick={onClick}>
      <span className="db-ico sm">
        <Ico name={icon} size={17} />
      </span>
      <span className="db-live-body">
        <span className="db-live-label">{label}</span>
        {children}
      </span>
      <span className="db-live-value tabular-nums">{value}</span>
      <span className="db-live-go">
        <Ico name="chevron" size={15} />
      </span>
    </button>
  );
}

function Skeleton() {
  return (
    <div className="db-page">
      <div className="db-skel" style={{ width: 280, height: 34, marginBottom: 10 }} />
      <div className="db-skel" style={{ width: 180, height: 16, marginBottom: 26 }} />
      <div className="db-kpis">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="db-skel" style={{ height: 138 }} />
        ))}
      </div>
      <div className="db-row-a">
        <div className="db-skel" style={{ height: 330 }} />
        <div className="db-skel" style={{ height: 330 }} />
      </div>
      <style>{CSS}</style>
    </div>
  );
}

/* ───────────────────────── screen ───────────────────────── */

export default function DashboardScreen({
  toast,
}: {
  toast: (m: string, t: "success" | "info" | "kitchen") => void;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ApiDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const d = await reports.dashboard();
        setData(d);
        setUpdatedAt(new Date());
      } catch (e) {
        if (!silent) toast("Failed to load dashboard", "info");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    const t = setInterval(() => load(true), 30000);
    return () => clearInterval(t);
  }, [load]);

  if (loading) return <Skeleton />;

  if (!data)
    return (
      <div className="db-page">
        <div className="db-card">
          <Empty
            icon="refresh"
            title="Couldn't load the dashboard"
            text="Check your connection and try again."
            action={
              <button className="db-btn primary" onClick={() => load()}>
                Try again
              </button>
            }
          />
        </div>
        <style>{CSS}</style>
      </div>
    );

  const {
    today,
    week,
    month,
    live,
    topItems,
    hourly,
    paymentMethods,
    orderTypes,
  } = data;

  /* greeting */
  const hr = new Date().getHours();
  const greeting = hr < 12 ? "morning" : hr < 17 ? "afternoon" : "evening";
  const firstName = (user?.name ?? "").split(" ")[0];
  const dateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  /* hourly chart: last 12 hours */
  const slice = Array.from({ length: 12 }, (_, i) => {
    const h = (hr - 11 + i + 24) % 24;
    return {
      label: hourLabel(h),
      full: hourFull(h),
      value: hourly[h]?.revenue ?? 0,
    };
  });
  const maxRev = Math.max(...slice.map((s) => s.value), 1);
  const peak = slice.reduce((a, b) => (b.value > a.value ? b : a), slice[0]);

  /* payments donut */
  const pmColors: Record<string, string> = {
    CASH: "var(--green)",
    CARD: "var(--blue)",
    UPI: "var(--purple)",
    WALLET: "var(--cyan)",
    SPLIT: "var(--amber)",
  };
  const totalPay = paymentMethods.reduce((s, p) => s + p.amount, 0);
  const R = 52;
  const C = 2 * Math.PI * R;
  let acc = 0;
  const segs = paymentMethods.map((p) => {
    const len = (p.amount / (totalPay || 1)) * C;
    const seg = {
      method: p.method,
      dash: `${Math.max(len - 3, 0)} ${C}`,
      offset: -acc,
    };
    acc += len;
    return seg;
  });

  /* items + order types */
  const maxQty = Math.max(...topItems.map((t) => t.qty), 1);
  const totalOT = orderTypes.reduce((s, o) => s + o.revenue, 0);
  const otColors: Record<string, string> = {
    DINE_IN: "var(--gold)",
    TAKEAWAY: "var(--blue)",
    DELIVERY: "var(--purple)",
  };
  const otIcon: Record<string, string> = {
    DINE_IN: "utensils",
    TAKEAWAY: "bag",
    DELIVERY: "bike",
  };

  const occPct =
    live.totalTables > 0
      ? Math.round((live.occupiedTables / live.totalTables) * 100)
      : 0;
  const growthUp = month.growth >= 0;

  return (
    <div className="db-page responsive-screen dashboard-screen">
      {/* ── Header ── */}
      <div className="db-top db-rise">
        <div>
          <div className="db-date">{dateStr}</div>
          <h1 className="db-h1">
            Good {greeting}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <div className="db-meta">
            <span className="live-dot" />
            <span>{user?.restaurant?.name ?? "Restaurant"}</span>
            <span className="db-dot-sep">·</span>
            <span>
              {updatedAt
                ? `Updated ${updatedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`
                : "Live"}
            </span>
          </div>
        </div>
        <div className="db-actions">
          <button
            className="db-btn icon"
            onClick={() => load(true)}
            title="Refresh"
            aria-label="Refresh"
          >
            <span className={refreshing ? "db-spin" : ""}>
              <Ico name="refresh" size={16} />
            </span>
          </button>
          <button className="db-btn" onClick={() => router.push("/kitchen")}>
            <Ico name="chef" size={16} /> Kitchen
          </button>
          <button className="db-btn" onClick={() => router.push("/tables")}>
            <Ico name="tables" size={16} /> Tables
          </button>
          <button
            className="db-btn primary"
            onClick={() => router.push("/billing")}
          >
            <Ico name="plus" size={16} /> New Bill
          </button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="db-kpis">
        <Kpi
          title="Today's Revenue"
          value={fmtCur(today.revenue)}
          icon="wallet"
          color="var(--gold)"
          delay={40}
          foot={<>{fmt(today.orders)} orders today</>}
        />
        <Kpi
          title="This Week"
          value={fmtCur(week.revenue)}
          icon="calendar"
          color="var(--green)"
          delay={80}
          foot={<>{fmt(week.orders)} orders</>}
        />
        <Kpi
          title="This Month"
          value={fmtCur(month.revenue)}
          icon="trend"
          color="var(--blue)"
          delay={120}
          foot={
            <>
              <span className={`db-chip ${growthUp ? "up" : "down"}`}>
                <Ico name={growthUp ? "up" : "down"} size={12} />
                {Math.abs(month.growth)}%
              </span>
              vs last month
            </>
          }
        />
        <Kpi
          title="Avg Order Value"
          value={fmtCur(month.orders > 0 ? month.revenue / month.orders : 0)}
          icon="receipt"
          color="var(--purple)"
          delay={160}
          foot={<>From {fmt(month.orders)} orders this month</>}
        />
      </div>

      {/* ── Sales chart + live status ── */}
      <div className="db-row-a">
        <div className="db-card db-rise" style={{ animationDelay: "200ms" }}>
          <CardHead
            title="Today's sales"
            sub="Hourly · last 12 hours"
            right={
              today.revenue > 0 ? (
                <div className="db-head-right">
                  <div className="db-big tabular-nums">
                    {fmtCur(today.revenue)}
                  </div>
                  {peak.value > 0 && (
                    <div className="db-sub">
                      Peak {peak.full} · {fmtCompact(peak.value)}
                    </div>
                  )}
                </div>
              ) : undefined
            }
          />
          {today.revenue === 0 ? (
            <Empty
              icon="chart"
              title="No sales yet today"
              text="Bills you complete will appear here hour by hour."
              action={
                <button
                  className="db-btn primary"
                  onClick={() => router.push("/billing")}
                >
                  <Ico name="plus" size={16} /> Start billing
                </button>
              }
            />
          ) : (
            <div className="db-chart">
              <div className="db-plot">
                <div className="db-grid">
                  {[fmtCompact(maxRev), fmtCompact(maxRev / 2), "₹0"].map(
                    (l, i) => (
                      <div key={i} className="db-gridline">
                        <span>{l}</span>
                      </div>
                    ),
                  )}
                </div>
                <div className="db-bars">
                  {slice.map((d, i) => (
                    <div
                      key={i}
                      className={`db-col${i === slice.length - 1 ? " now" : ""}`}
                    >
                      <div className="db-track">
                        <div
                          className="db-bar"
                          style={{
                            height: `${d.value > 0 ? Math.max(4, (d.value / maxRev) * 100) : 1.5}%`,
                            opacity: d.value === 0 ? 0.25 : undefined,
                          }}
                        />
                        <div className="db-tip">
                          {d.full}
                          <b>{fmtCur(d.value)}</b>
                        </div>
                      </div>
                      <span className="db-collabel">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="db-card db-rise" style={{ animationDelay: "240ms" }}>
          <CardHead title="Live now" sub="Refreshes every 30 seconds" />
          <div className="db-live-list">
            <LiveRow
              icon="clipboard"
              label="Pending orders"
              value={live.pendingOrders}
              color="var(--amber)"
              onClick={() => router.push("/billing")}
            />
            <LiveRow
              icon="chef"
              label="Active KOTs"
              value={live.activeKOTs}
              color="var(--red)"
              onClick={() => router.push("/kitchen")}
            />
            <LiveRow
              icon="tables"
              label="Tables occupied"
              value={`${live.occupiedTables}/${live.totalTables}`}
              color="var(--blue)"
              onClick={() => router.push("/tables")}
            >
              <span className="db-meter">
                <span style={{ width: `${occPct}%` }} />
              </span>
            </LiveRow>
            <LiveRow
              icon="box"
              label="Low stock alerts"
              value={live.lowStockItems}
              color={live.lowStockItems > 0 ? "var(--red)" : "var(--green)"}
              onClick={() => router.push("/inventory")}
            />
          </div>
        </div>
      </div>

      {/* ── Payments / items / order types ── */}
      <div className="db-row-b">
        {/* Payments donut */}
        <div className="db-card db-rise" style={{ animationDelay: "280ms" }}>
          <CardHead title="Payment breakdown" sub="This month" />
          {paymentMethods.length === 0 ? (
            <Empty
              icon="card"
              title="No payments yet"
              text="Payment methods will be split out here."
            />
          ) : (
            <>
              <div className="db-donut">
                <svg width="150" height="150" viewBox="0 0 140 140">
                  <circle
                    cx="70"
                    cy="70"
                    r={R}
                    fill="none"
                    strokeWidth="16"
                    style={{ stroke: "var(--surface2)" }}
                  />
                  {segs.map((s) => (
                    <circle
                      key={s.method}
                      cx="70"
                      cy="70"
                      r={R}
                      fill="none"
                      strokeWidth="16"
                      strokeDasharray={s.dash}
                      strokeDashoffset={s.offset}
                      transform="rotate(-90 70 70)"
                      style={{ stroke: pmColors[s.method] ?? "var(--text3)" }}
                    />
                  ))}
                </svg>
                <div className="db-donut-center">
                  <div className="db-donut-val tabular-nums">
                    {fmtCompact(totalPay)}
                  </div>
                  <div className="db-sub">collected</div>
                </div>
              </div>
              <div className="db-legend">
                {paymentMethods.map((p) => (
                  <div key={p.method} className="db-legend-row">
                    <span
                      className="db-swatch"
                      style={{ background: pmColors[p.method] ?? "var(--text3)" }}
                    />
                    <span className="db-legend-name">{p.method}</span>
                    <span className="db-legend-pct tabular-nums">
                      {Math.round((p.amount / (totalPay || 1)) * 100)}%
                    </span>
                    <span className="db-legend-amt tabular-nums">
                      {fmtCur(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Top items */}
        <div className="db-card db-rise" style={{ animationDelay: "320ms" }}>
          <CardHead title="Top selling items" sub="This month by quantity" />
          {topItems.length === 0 ? (
            <Empty
              icon="utensils"
              title="No sales data yet"
              text="Your best sellers will be ranked here."
            />
          ) : (
            <div className="db-items">
              {topItems.map((item, i) => (
                <div key={i} className="db-item">
                  <span className={`db-rank${i < 3 ? " top" : ""}`}>
                    {i + 1}
                  </span>
                  <div className="db-item-body">
                    <div className="db-item-name">
                      <VegMark veg={item.veg} />
                      <span>{item.name ?? "Unknown"}</span>
                    </div>
                    <div className="db-item-bar">
                      <span style={{ width: `${(item.qty / maxQty) * 100}%` }} />
                    </div>
                  </div>
                  <div className="db-item-right">
                    <div className="db-item-rev tabular-nums">
                      {fmtCur(item.revenue)}
                    </div>
                    <div className="db-sub tabular-nums">{fmt(item.qty)} sold</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order types */}
        <div className="db-card db-rise" style={{ animationDelay: "360ms" }}>
          <CardHead title="Order types" sub="This month revenue split" />
          {orderTypes.length === 0 ? (
            <Empty
              icon="bag"
              title="No orders yet"
              text="Dine-in, takeaway and delivery will be compared here."
            />
          ) : (
            <>
              <div className="db-stack">
                {orderTypes.map((o) => (
                  <span
                    key={o.type}
                    style={{
                      width: `${(o.revenue / (totalOT || 1)) * 100}%`,
                      background: otColors[o.type] ?? "var(--text3)",
                    }}
                  />
                ))}
              </div>
              <div className="db-ot-list">
                {orderTypes.map((o) => (
                  <div
                    key={o.type}
                    className="db-ot"
                    style={accent(otColors[o.type] ?? "var(--text3)")}
                  >
                    <span className="db-ico sm">
                      <Ico name={otIcon[o.type] ?? "bag"} size={16} />
                    </span>
                    <div className="db-ot-body">
                      <div className="db-ot-name">
                        {o.type.replace("_", " ")}
                      </div>
                      <div className="db-sub">{fmt(o.count)} orders</div>
                    </div>
                    <div className="db-item-right">
                      <div className="db-item-rev tabular-nums">
                        {fmtCur(o.revenue)}
                      </div>
                      <div className="db-sub tabular-nums">
                        {Math.round((o.revenue / (totalOT || 1)) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{CSS}</style>
    </div>
  );
}

/* ───────────────────────── styles (theme-aware) ───────────────────────── */

const CSS = `
.db-page{
  height:100%;overflow:auto;padding:26px 28px 40px;
  background:radial-gradient(900px 320px at 8% -6%, var(--gold-bg2), transparent 62%), var(--bg);
}
.db-rise{animation:dbRise .5s cubic-bezier(.2,.7,.2,1) both}
@keyframes dbRise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes dbSpin{to{transform:rotate(360deg)}}
@keyframes dbShimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
.db-spin{display:inline-flex;animation:dbSpin .8s linear infinite}

/* header */
.db-top{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:24px}
.db-date{font-size:12px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--gold)}
.db-h1{margin:4px 0 8px;font-size:30px;line-height:1.15;font-weight:800;letter-spacing:-.8px;color:var(--text1)}
.db-meta{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text3)}
.db-dot-sep{opacity:.5}
.db-actions{display:flex;gap:10px;flex-wrap:wrap}
.db-btn{
  display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 16px;border-radius:12px;
  background:var(--surface);border:1px solid var(--border);color:var(--text1);
  font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;
  transition:border-color .15s,color .15s,transform .1s,box-shadow .15s;
}
.db-btn:hover{border-color:var(--gold);color:var(--gold)}
.db-btn.icon{width:40px;padding:0;justify-content:center}
.db-btn.primary{
  background:linear-gradient(145deg,var(--gold-light),var(--gold) 55%,var(--gold-dark));
  border-color:transparent;color:#1a1204;box-shadow:0 8px 20px rgba(245,165,36,.3);
}
.db-btn.primary:hover{color:#1a1204;box-shadow:0 10px 26px rgba(245,165,36,.42)}

/* cards */
.db-card{
  background:var(--surface);border:1px solid var(--border);border-radius:20px;
  padding:22px;box-shadow:var(--shadow-sm, none);min-width:0;
}
.db-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:18px}
.db-title{font-size:15px;font-weight:800;letter-spacing:-.2px;color:var(--text1)}
.db-sub{font-size:12px;color:var(--text3);margin-top:2px}
.db-head-right{text-align:right}
.db-big{font-size:22px;font-weight:800;letter-spacing:-.5px;color:var(--text1)}

/* icon tile */
.db-ico{
  width:38px;height:38px;border-radius:12px;flex-shrink:0;
  display:inline-flex;align-items:center;justify-content:center;
  color:var(--accent);background:color-mix(in srgb,var(--accent) 14%,transparent);
}
.db-ico.sm{width:34px;height:34px;border-radius:10px}

/* KPIs */
.db-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:16px}
.db-kpi{position:relative;overflow:hidden;transition:transform .2s,border-color .2s}
.db-kpi::before{
  content:"";position:absolute;left:0;top:0;right:0;height:3px;
  background:linear-gradient(90deg,var(--accent),transparent 85%);opacity:.9;
}
.db-kpi:hover{transform:translateY(-2px);border-color:var(--border2)}
.db-kpi-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.db-kpi-label{font-size:13px;font-weight:600;color:var(--text3)}
.db-kpi-value{font-size:32px;font-weight:800;letter-spacing:-1px;line-height:1.1;color:var(--text1)}
.db-kpi-foot{display:flex;align-items:center;gap:8px;margin-top:12px;font-size:12px;color:var(--text3)}
.db-chip{
  display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:99px;
  font-size:11.5px;font-weight:800;
}
.db-chip.up{color:var(--green);background:var(--green-bg)}
.db-chip.down{color:var(--red);background:var(--red-bg)}

/* rows */
.db-row-a{display:grid;grid-template-columns:minmax(0,1.9fr) minmax(0,1fr);gap:16px;margin-bottom:16px}
.db-row-b{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}

/* chart */
.db-chart{padding-top:28px}
.db-plot{position:relative;height:210px}
.db-grid{position:absolute;inset:0 0 26px 0;display:flex;flex-direction:column;justify-content:space-between}
.db-gridline{height:0;border-top:1px dashed var(--border);position:relative}
.db-gridline span{position:absolute;left:0;top:-8px;font-size:10px;color:var(--text3);background:var(--surface);padding-right:6px}
.db-bars{position:absolute;inset:0 0 0 46px;display:flex;gap:10px}
.db-col{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center}
.db-track{flex:1;width:100%;position:relative;display:flex;align-items:flex-end}
.db-bar{
  width:100%;border-radius:8px 8px 3px 3px;opacity:.7;
  background:linear-gradient(180deg,var(--gold-light),var(--gold-dark));
  transition:height .6s cubic-bezier(.2,.7,.2,1),opacity .15s;
}
.db-col:hover .db-bar{opacity:1}
.db-col.now .db-bar{opacity:1;box-shadow:0 0 18px rgba(245,165,36,.4)}
.db-collabel{height:26px;line-height:26px;font-size:10.5px;color:var(--text3);font-weight:600}
.db-col.now .db-collabel{color:var(--gold)}
.db-tip{
  position:absolute;top:-6px;left:50%;transform:translate(-50%,-100%);
  background:var(--text1);color:var(--bg);padding:6px 10px;border-radius:9px;
  font-size:11px;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .12s;z-index:3;
  display:flex;flex-direction:column;align-items:center;gap:1px;
}
.db-tip b{font-size:12.5px}
.db-col:hover .db-tip{opacity:1}

/* empty */
.db-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:34px 12px;gap:6px}
.db-empty-ico{
  width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;
  color:var(--gold);background:var(--gold-bg2);margin-bottom:8px;
}
.db-empty-title{font-size:14.5px;font-weight:800;color:var(--text1)}
.db-empty-text{font-size:12.5px;color:var(--text3);max-width:260px;margin-bottom:12px}

/* live status */
.db-live-list{display:flex;flex-direction:column;gap:8px}
.db-live{
  display:flex;align-items:center;gap:12px;width:100%;text-align:left;
  padding:12px;border-radius:14px;background:var(--surface2);border:1px solid transparent;
  font-family:inherit;color:inherit;cursor:pointer;transition:border-color .15s,transform .1s;
}
.db-live:hover{border-color:color-mix(in srgb,var(--accent) 55%,transparent)}
.db-live-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:7px}
.db-live-label{font-size:13px;font-weight:600;color:var(--text2)}
.db-live-value{font-size:21px;font-weight:800;letter-spacing:-.4px;color:var(--accent)}
.db-live-go{color:var(--text4);display:inline-flex;transition:transform .15s,color .15s}
.db-live:hover .db-live-go{color:var(--accent);transform:translateX(2px)}
.db-meter{display:block;height:5px;border-radius:99px;background:var(--border)}
.db-meter span{display:block;height:100%;border-radius:99px;background:var(--accent);transition:width .6s}

/* donut */
.db-donut{position:relative;width:150px;height:150px;margin:2px auto 18px}
.db-donut-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.db-donut-val{font-size:20px;font-weight:800;letter-spacing:-.5px;color:var(--text1)}
.db-legend{display:flex;flex-direction:column;gap:2px}
.db-legend-row{display:flex;align-items:center;gap:10px;padding:8px 2px;border-top:1px solid var(--border);font-size:13px}
.db-legend-row:first-child{border-top:none}
.db-swatch{width:10px;height:10px;border-radius:4px;flex-shrink:0}
.db-legend-name{flex:1;font-weight:600;color:var(--text2)}
.db-legend-pct{color:var(--text3);font-size:12px}
.db-legend-amt{min-width:72px;text-align:right;font-weight:800;color:var(--text1)}

/* top items */
.db-items{display:flex;flex-direction:column}
.db-item{display:flex;align-items:center;gap:12px;padding:11px 0;border-top:1px solid var(--border)}
.db-item:first-child{border-top:none;padding-top:0}
.db-rank{
  width:26px;height:26px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:800;color:var(--text3);background:var(--surface2);
}
.db-rank.top{color:#1a1204;background:linear-gradient(145deg,var(--gold-light),var(--gold-dark))}
.db-item-body{flex:1;min-width:0}
.db-item-name{display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:700;color:var(--text1)}
.db-item-name span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.db-item-bar{height:4px;border-radius:99px;background:var(--surface2);margin-top:8px}
.db-item-bar span{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--gold-dark),var(--gold-light));transition:width .6s}
.db-item-right{text-align:right;flex-shrink:0}
.db-item-rev{font-size:13.5px;font-weight:800;color:var(--text1)}

/* order types */
.db-stack{display:flex;height:10px;border-radius:99px;overflow:hidden;gap:3px;margin-bottom:18px;background:var(--surface2)}
.db-stack span{display:block;height:100%;border-radius:99px;transition:width .6s}
.db-ot-list{display:flex;flex-direction:column;gap:8px}
.db-ot{display:flex;align-items:center;gap:12px;padding:12px;border-radius:14px;background:var(--surface2)}
.db-ot-body{flex:1;min-width:0}
.db-ot-name{font-size:13.5px;font-weight:700;color:var(--text1);text-transform:capitalize}

/* skeleton */
.db-skel{
  border-radius:20px;border:1px solid var(--border);
  background:linear-gradient(90deg,var(--surface) 0%,var(--surface2) 50%,var(--surface) 100%);
  background-size:800px 100%;animation:dbShimmer 1.4s linear infinite;
}

/* responsive */
@media (max-width:1180px){
  .db-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}
  .db-row-b{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:900px){
  .db-row-a{grid-template-columns:minmax(0,1fr)}
  .db-row-b{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:640px){
  .db-page{padding:16px 14px 30px}
  .db-h1{font-size:24px}
  .db-kpi-value{font-size:26px}
  .db-actions{width:100%}
  .db-actions .db-btn{flex:1;justify-content:center}
  .db-actions .db-btn.icon{flex:0 0 40px}
}
`;