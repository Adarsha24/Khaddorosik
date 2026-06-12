'use client'

import { useState, useEffect, useCallback } from 'react'
import { reports as reportsApi, ApiDashboard, ApiSalesReport, ApiItemsReport } from '@/lib/api'

type Tab = 'overview' | 'sales' | 'tax' | 'itemwise'
type Period = 'Today' | 'This Week' | 'This Month'

const PERIOD_MAP: Record<Period, string> = {
  'Today': 'today',
  'This Week': 'week',
  'This Month': 'month',
}

const fmt = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` :
  n >= 1000   ? `₹${(n / 1000).toFixed(1)}K`   : `₹${Math.round(n)}`

const fmtFull = (n: number) =>
  `₹${new Intl.NumberFormat('en-IN').format(Math.round(n))}`

interface Props {
  toast?: (msg: string, type: string) => void
}

export default function ReportsScreen({ toast }: Props) {
  const [tab, setTab]       = useState<Tab>('overview')
  const [period, setPeriod] = useState<Period>('Today')

  const [dash,  setDash]  = useState<ApiDashboard | null>(null)
  const [sales, setSales] = useState<ApiSalesReport | null>(null)
  const [items, setItems] = useState<ApiItemsReport | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (p: Period) => {
    setLoading(true)
    try {
      const pKey = PERIOD_MAP[p]
      const [d, s, it] = await Promise.all([
        reportsApi.dashboard(),
        reportsApi.sales(pKey),
        reportsApi.items(pKey),
      ])
      setDash(d); setSales(s); setItems(it)
    } catch (e) {
      toast?.('Failed to load reports', 'info')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load(period) }, [period, load])

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'sales',    label: 'Sales'    },
    { id: 'tax',      label: 'Tax'      },
    { id: 'itemwise', label: 'Item-wise'},
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        height: 52, background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, flexShrink: 0,
      }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text1)' }}>Reports &amp; Analytics</span>
        <div style={{ flex: 1 }} />
        {(['Today', 'This Week', 'This Month'] as Period[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{
            padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: period === p ? 'var(--text1)' : 'var(--surface2)',
            color: period === p ? '#fff' : 'var(--text2)',
            border: `1px solid ${period === p ? 'var(--text1)' : 'var(--border)'}`,
          }}>{p}</button>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 16px', flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '11px 18px', fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer',
            background: 'none', border: 'none',
            borderBottom: `2.5px solid ${tab === t.id ? 'var(--primary)' : 'transparent'}`,
            color: tab === t.id ? 'var(--primary)' : 'var(--text3)',
            marginBottom: -1,
          }}>{t.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? <LoadingSkeleton /> : (
          <>
            {tab === 'overview' && <OverviewTab dash={dash} sales={sales} items={items} />}
            {tab === 'sales'    && <SalesTab sales={sales} />}
            {tab === 'tax'      && <TaxTab sales={sales} />}
            {tab === 'itemwise' && <ItemWiseTab items={items} />}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Overview ────────────────────────────────────────────────────────────────

function OverviewTab({ dash, sales, items }: { dash: ApiDashboard | null; sales: ApiSalesReport | null; items: ApiItemsReport | null }) {
  if (!dash || !sales) return null
  const stats = [
    { label: "Today's Revenue",  val: fmtFull(dash.today.revenue),   sub: `${dash.today.orders} orders`,     col: 'var(--primary)' },
    { label: 'Weekly Revenue',   val: fmtFull(dash.week.revenue),    sub: `${dash.week.orders} orders`,      col: 'var(--blue)'    },
    { label: 'Monthly Revenue',  val: fmt(dash.month.revenue),       sub: `${dash.month.growth >= 0 ? '+' : ''}${dash.month.growth.toFixed(1)}% growth`, col: 'var(--green)' },
    { label: 'Avg Order Value',  val: fmtFull(sales.summary.avgOrderValue), sub: period(sales), col: 'var(--amber)' },
  ]

  const maxHourly = Math.max(...dash.hourly.map(h => h.revenue), 1)

  return (
    <>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16,
          }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.col, marginBottom: 4 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Live stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
        {[
          { label: 'Pending Orders',   val: dash.live.pendingOrders,   color: 'var(--amber)'  },
          { label: 'Active KOTs',      val: dash.live.activeKOTs,      color: 'var(--primary)'},
          { label: 'Occupied Tables',  val: `${dash.live.occupiedTables}/${dash.live.totalTables}`, color: 'var(--blue)' },
          { label: 'Low Stock Alerts', val: dash.live.lowStockItems,   color: 'var(--red)'    },
          { label: 'Paid Today',       val: fmtFull(dash.today.paid),  color: 'var(--green)'  },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 12 }}>
        {/* Hourly chart */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>Hourly Revenue (Today)</span>
          </div>
          <div style={{ padding: '16px', display: 'flex', alignItems: 'flex-end', gap: 4, height: 140 }}>
            {dash.hourly.map(h => {
              const pct = maxHourly > 0 ? (h.revenue / maxHourly) * 100 : 0
              return (
                <div key={h.hour} title={`${h.hour}:00 — ${fmtFull(h.revenue)} (${h.orders} orders)`}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <div style={{
                    width: '100%', height: `${Math.max(pct, 2)}%`, borderRadius: '3px 3px 0 0',
                    background: h.revenue > 0 ? 'var(--primary)' : 'var(--border)',
                    transition: 'height 0.3s', cursor: 'pointer', minHeight: 2,
                  }} />
                  <span style={{ fontSize: 8, color: 'var(--text3)' }}>{h.hour}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Category breakdown */}
        {items && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>Revenue by Category</span>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(() => {
                const cats = Object.entries(items.categoryBreakdown).sort((a, b) => b[1].revenue - a[1].revenue)
                const maxRev = cats[0]?.[1]?.revenue ?? 1
                const COLORS = ['var(--primary)', 'var(--blue)', 'var(--green)', 'var(--amber)', 'var(--purple)']
                return cats.slice(0, 5).map(([cat, data], i) => (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)' }}>{cat}</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>{fmt(data.revenue)}</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--surface3)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 3,
                        width: `${(data.revenue / maxRev) * 100}%`,
                        background: COLORS[i % COLORS.length],
                      }} />
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 12 }}>
        {/* Top items */}
        {items && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>Top Selling Items</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'var(--surface2)' }}>
                  {['Item', 'Category', 'Qty', 'Revenue'].map(h => (
                    <th key={h} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.topItems.slice(0, 8).map((item, i) => (
                  <tr key={item.menuItemId} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '9px 16px', fontWeight: 600, color: 'var(--text1)' }}>
                      <span style={{ marginRight: 6, fontSize: 10 }}>{item.veg ? '🟢' : '🔴'}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginRight: 6 }}>#{i + 1}</span>
                      {item.name}
                    </td>
                    <td style={{ padding: '9px 16px', color: 'var(--text3)', fontSize: 11 }}>{item.category}</td>
                    <td style={{ padding: '9px 16px', fontWeight: 700, color: 'var(--blue)' }}>{item.totalQty}</td>
                    <td style={{ padding: '9px 16px', fontWeight: 700, color: 'var(--primary)' }}>{fmt(item.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payment methods */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>Payment Methods</span>
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {dash.paymentMethods.map((pm, i) => {
              const COLORS = ['var(--primary)', 'var(--blue)', 'var(--green)', 'var(--amber)', 'var(--purple)']
              const total = dash.paymentMethods.reduce((s, p) => s + p.amount, 0) || 1
              return (
                <div key={pm.method}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text1)', textTransform: 'capitalize' }}>
                      {pm.method.toLowerCase().replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: COLORS[i % COLORS.length] }}>{fmt(pm.amount)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--surface3)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(pm.amount / total) * 100}%`, background: COLORS[i % COLORS.length], borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text3)', width: 30, textAlign: 'right' }}>{pm.count}x</span>
                  </div>
                </div>
              )
            })}
            {dash.paymentMethods.length === 0 && (
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>No payments yet</span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Sales Tab ───────────────────────────────────────────────────────────────

function SalesTab({ sales }: { sales: ApiSalesReport | null }) {
  if (!sales) return null
  const s = sales.summary
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { label: 'Total Orders',   val: String(s.totalOrders),   col: 'var(--blue)'    },
          { label: 'Gross Revenue',  val: fmtFull(s.subtotal),     col: 'var(--primary)' },
          { label: 'Avg Order',      val: fmtFull(s.avgOrderValue),col: 'var(--green)'   },
          { label: 'Total Discount', val: fmtFull(s.discountAmount),col: 'var(--amber)'  },
        ].map(c => (
          <div key={c.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.col }}>{c.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* By order type */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>By Order Type</span>
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sales.byType.map((t, i) => {
              const COLORS = ['var(--primary)', 'var(--blue)', 'var(--green)']
              const maxRev = Math.max(...sales.byType.map(x => x.revenue), 1)
              return (
                <div key={t.type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text1)', textTransform: 'capitalize' }}>{t.type.replace('_', ' ').toLowerCase()}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>{t.count} orders</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: COLORS[i % COLORS.length] }}>{fmt(t.revenue)}</span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(t.revenue / maxRev) * 100}%`, background: COLORS[i % COLORS.length], borderRadius: 3 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* By payment method */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>By Payment Method</span>
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sales.byMethod.map((m, i) => {
              const COLORS = ['var(--primary)', 'var(--blue)', 'var(--green)', 'var(--amber)']
              const maxAmt = Math.max(...sales.byMethod.map(x => x.amount), 1)
              return (
                <div key={m.method}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text1)', textTransform: 'capitalize' }}>{m.method.toLowerCase().replace('_', ' ')}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>{m.count}x</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: COLORS[i % COLORS.length] }}>{fmt(m.amount)}</span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(m.amount / maxAmt) * 100}%`, background: COLORS[i % COLORS.length], borderRadius: 3 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>Orders ({period(sales)})</span>
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead style={{ position: 'sticky', top: 0 }}>
              <tr style={{ background: 'var(--surface2)' }}>
                {['Bill #', 'Type', 'Time', 'Total'].map(h => (
                  <th key={h} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sales.orders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 16px', fontWeight: 600, color: 'var(--text1)' }}>#{o.billNo ? String(o.billNo).padStart(4, '0') : '—'}</td>
                  <td style={{ padding: '8px 16px', color: 'var(--text2)', textTransform: 'capitalize', fontSize: 11 }}>{o.orderType.replace('_', ' ').toLowerCase()}</td>
                  <td style={{ padding: '8px 16px', color: 'var(--text3)', fontSize: 11 }}>{new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td style={{ padding: '8px 16px', fontWeight: 700, color: 'var(--primary)' }}>{fmtFull(parseFloat(o.total))}</td>
                </tr>
              ))}
              {sales.orders.length === 0 && (
                <tr><td colSpan={4} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text3)' }}>No orders in this period</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

// ─── Tax Tab ─────────────────────────────────────────────────────────────────

function TaxTab({ sales }: { sales: ApiSalesReport | null }) {
  if (!sales) return null
  const s = sales.summary
  const taxRows = [
    { label: 'Gross Sales (Subtotal)', value: s.subtotal, highlight: false },
    { label: 'Discount Given',         value: -s.discountAmount, highlight: false },
    { label: 'Taxable Amount',         value: s.subtotal - s.discountAmount, highlight: false },
    { label: 'CGST Collected',         value: s.cgstAmount,  highlight: true  },
    { label: 'SGST Collected',         value: s.sgstAmount,  highlight: true  },
    { label: 'Total Tax Collected',    value: s.taxAmount,   highlight: true  },
    { label: 'Net Revenue (incl. tax)',value: s.totalRevenue,highlight: false },
  ]

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[
          { label: 'Total Tax Collected', val: fmtFull(s.taxAmount),    col: 'var(--primary)' },
          { label: 'CGST Collected',      val: fmtFull(s.cgstAmount),   col: 'var(--blue)'    },
          { label: 'SGST Collected',      val: fmtFull(s.sgstAmount),   col: 'var(--green)'   },
        ].map(c => (
          <div key={c.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: c.col }}>{c.val}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>Tax Breakdown — {period(sales)}</span>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{s.totalOrders} orders</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <tbody>
            {taxRows.map((row, i) => (
              <tr key={row.label} style={{ borderBottom: i < taxRows.length - 1 ? '1px solid var(--border)' : undefined, background: row.highlight ? 'var(--primary-light)' : 'var(--surface)' }}>
                <td style={{ padding: '12px 20px', color: row.highlight ? 'var(--primary)' : 'var(--text2)', fontWeight: row.highlight ? 700 : 500 }}>{row.label}</td>
                <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 700, color: row.value < 0 ? 'var(--red)' : row.highlight ? 'var(--primary)' : 'var(--text1)', fontSize: 14 }}>
                  {row.value < 0 ? `-${fmtFull(Math.abs(row.value))}` : fmtFull(row.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ─── Item-wise Tab ────────────────────────────────────────────────────────────

function ItemWiseTab({ items }: { items: ApiItemsReport | null }) {
  if (!items) return null
  const totalRev = items.topItems.reduce((s, i) => s + i.revenue, 0) || 1

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 4 }}>
        {[
          { label: 'Total Items Sold',   val: String(items.topItems.reduce((s, i) => s + i.totalQty, 0)),  col: 'var(--blue)'    },
          { label: 'Items Revenue',      val: fmt(items.topItems.reduce((s, i) => s + i.revenue, 0)),      col: 'var(--primary)' },
          { label: 'Categories Active',  val: String(Object.keys(items.categoryBreakdown).length),          col: 'var(--green)'   },
        ].map(c => (
          <div key={c.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.col }}>{c.val}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>Item Performance</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead style={{ position: 'sticky', top: 0 }}>
            <tr style={{ background: 'var(--surface2)' }}>
              {['#', 'Item', 'Category', 'Qty Sold', 'Revenue', 'Share'].map(h => (
                <th key={h} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.topItems.map((item, i) => (
              <tr key={item.menuItemId} style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                <td style={{ padding: '9px 16px', color: 'var(--text3)', fontWeight: 700 }}>{i + 1}</td>
                <td style={{ padding: '9px 16px', fontWeight: 600, color: 'var(--text1)' }}>
                  <span style={{ marginRight: 6 }}>{item.veg ? '🟢' : '🔴'}</span>{item.name}
                </td>
                <td style={{ padding: '9px 16px', color: 'var(--text3)', fontSize: 11 }}>{item.category}</td>
                <td style={{ padding: '9px 16px', fontWeight: 700, color: 'var(--blue)' }}>{item.totalQty}</td>
                <td style={{ padding: '9px 16px', fontWeight: 700, color: 'var(--primary)' }}>{fmt(item.revenue)}</td>
                <td style={{ padding: '9px 16px', minWidth: 100 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--surface3)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(item.revenue / totalRev) * 100}%`, background: 'var(--primary)', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text3)', width: 34, textAlign: 'right' }}>
                      {((item.revenue / totalRev) * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {items.topItems.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>No item data for this period</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function period(s: ApiSalesReport) {
  const from = new Date(s.from).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  const to   = new Date(s.to).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  return from === to ? from : `${from} – ${to}`
}

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
        ))}
      </div>
      <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />
      <div className="skeleton" style={{ height: 260, borderRadius: 12 }} />
    </div>
  )
}
