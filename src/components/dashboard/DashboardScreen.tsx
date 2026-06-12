'use client'
import { useState, useEffect, useCallback } from 'react'
import { reports, ApiDashboard } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(Math.round(n))
const fmtCur = (n: number) => `₹${new Intl.NumberFormat('en-IN').format(Math.round(n))}`

const STAT_COLS = ['var(--gold)', 'var(--green)', 'var(--blue)', 'var(--purple)']

function StatCard({ label, value, sub, color, icon }: { label: string; value: string; sub?: string; color: string; icon: string }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
      padding: '20px 22px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: color, borderRadius: '14px 14px 0 0',
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text1)', letterSpacing: '-1px' }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{ fontSize: 28, opacity: 0.6 }}>{icon}</div>
      </div>
    </div>
  )
}

function LiveBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</span>
      <span style={{ fontSize: 18, fontWeight: 700, color }}>{value}</span>
    </div>
  )
}

function BarChart({ data, max }: { data: { label: string; value: number; color?: string }[]; max: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 80 }}>
            <div style={{
              width: '100%', borderRadius: '4px 4px 0 0',
              height: max > 0 ? `${Math.max(4, (d.value / max) * 80)}px` : '4px',
              background: d.color ?? 'var(--gold)',
              transition: 'height 0.5s ease',
              opacity: d.value === 0 ? 0.2 : 1,
            }} />
          </div>
          <div style={{ fontSize: 9, color: 'var(--text3)', textAlign: 'center' }}>{d.label}</div>
        </div>
      ))}
    </div>
  )
}

export default function DashboardScreen({ toast }: { toast: (m: string, t: 'success' | 'info' | 'kitchen') => void }) {
  const { user } = useAuth()
  const [data, setData] = useState<ApiDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const d = await reports.dashboard()
      setData(d)
    } catch (e) {
      if (!silent) toast('Failed to load dashboard', 'info')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])
  useEffect(() => { const t = setInterval(() => load(true), 30000); return () => clearInterval(t) }, [load])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text3)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>📊</div>
        <div>Loading dashboard…</div>
      </div>
    </div>
  )

  if (!data) return null

  const { today, week, month, live, topItems, hourly, paymentMethods, orderTypes } = data

  // Build hourly chart for last 18 hours
  const now = new Date().getHours()
  const hourlySlice = Array.from({ length: 12 }, (_, i) => {
    const h = (now - 11 + i + 24) % 24
    const label = h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`
    return { label, value: hourly[h]?.revenue ?? 0, color: 'var(--gold)' }
  })
  const maxRevenue = Math.max(...hourlySlice.map(h => h.value), 1)

  const pmColors: Record<string, string> = { CASH: 'var(--green)', CARD: 'var(--blue)', UPI: 'var(--purple)', WALLET: 'var(--cyan)', SPLIT: 'var(--amber)' }
  const totalPayments = paymentMethods.reduce((s, p) => s + p.amount, 0) || 1

  const otColors: Record<string, string> = { DINE_IN: 'var(--gold)', TAKEAWAY: 'var(--blue)', DELIVERY: 'var(--purple)' }

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: 20, background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text1)' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'} 👋
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>{user?.restaurant?.name ?? 'Restaurant'} · Live Dashboard</div>
        </div>
        <button
          onClick={() => load(true)}
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 14px', color: 'var(--text2)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {refreshing ? <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>↻</span> : '↻'} Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard label="Today's Revenue" value={fmtCur(today.revenue)} sub={`${today.paid} orders paid`} color={STAT_COLS[0]} icon="💰" />
        <StatCard label="This Week" value={fmtCur(week.revenue)} sub={`${week.orders} orders`} color={STAT_COLS[1]} icon="📅" />
        <StatCard label="This Month" value={fmtCur(month.revenue)} sub={month.growth >= 0 ? `↑ ${month.growth}% vs last month` : `↓ ${Math.abs(month.growth)}% vs last month`} color={month.growth >= 0 ? STAT_COLS[1] : 'var(--red)'} icon="📈" />
        <StatCard label="Avg Order Value" value={fmtCur(month.orders > 0 ? month.revenue / month.orders : 0)} sub={`${month.orders} orders this month`} color={STAT_COLS[3]} icon="🧾" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
        {/* Live Status */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', boxShadow: '0 0 6px var(--green)' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>Live Status</span>
          </div>
          <LiveBadge label="Pending Orders" value={live.pendingOrders} color="var(--amber)" />
          <LiveBadge label="Active KOTs" value={live.activeKOTs} color="var(--red)" />
          <LiveBadge label="Tables Occupied" value={live.occupiedTables} color="var(--blue)" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Table Occupancy</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>
              {live.occupiedTables}/{live.totalTables}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Low Stock Alerts</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: live.lowStockItems > 0 ? 'var(--red)' : 'var(--green)' }}>
              {live.lowStockItems}
            </span>
          </div>
        </div>

        {/* Revenue Chart */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)', marginBottom: 4 }}>Revenue Today (Hourly)</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 16 }}>Last 12 hours · {fmtCur(today.revenue)} total</div>
          <BarChart data={hourlySlice} max={maxRevenue} />
        </div>

        {/* Payment Methods */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)', marginBottom: 4 }}>Payment Breakdown</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 16 }}>This month</div>
          {paymentMethods.length === 0
            ? <div style={{ color: 'var(--text3)', fontSize: 12, textAlign: 'center', paddingTop: 24 }}>No payments yet</div>
            : paymentMethods.map((p) => (
              <div key={p.method} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: pmColors[p.method] ?? 'var(--text3)', display: 'inline-block' }} />
                    {p.method}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text1)' }}>{fmtCur(p.amount)}</span>
                </div>
                <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${(p.amount / totalPayments) * 100}%`, background: pmColors[p.method] ?? 'var(--text3)', borderRadius: 99, transition: 'width 0.5s' }} />
                </div>
              </div>
            ))
          }
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Top Items */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)', marginBottom: 4 }}>Top Selling Items</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 16 }}>This month by quantity</div>
          {topItems.length === 0
            ? <div style={{ color: 'var(--text3)', fontSize: 12, textAlign: 'center', paddingTop: 24 }}>No sales data yet</div>
            : topItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < topItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--gold-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'var(--gold)' }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ marginRight: 6, fontSize: 10 }}>{item.veg ? '🟢' : '🔴'}</span>
                    {item.name ?? 'Unknown'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{fmt(item.qty)} sold · {fmtCur(item.revenue)} revenue</div>
                </div>
              </div>
            ))
          }
        </div>

        {/* Order Types */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)', marginBottom: 4 }}>Order Types</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 20 }}>This month revenue split</div>
          {orderTypes.length === 0
            ? <div style={{ color: 'var(--text3)', fontSize: 12, textAlign: 'center', paddingTop: 24 }}>No orders yet</div>
            : orderTypes.map((ot) => (
              <div key={ot.type} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{ot.type === 'DINE_IN' ? '🍽️' : ot.type === 'TAKEAWAY' ? '📦' : '🛵'}</span>
                    {ot.type.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>
                    {fmtCur(ot.revenue)}
                    <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 400, marginLeft: 6 }}>({ot.count} orders)</span>
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 99 }}>
                  <div style={{
                    height: '100%',
                    width: `${(ot.revenue / (orderTypes.reduce((s, o) => s + o.revenue, 0) || 1)) * 100}%`,
                    background: otColors[ot.type] ?? 'var(--text3)',
                    borderRadius: 99, transition: 'width 0.5s',
                  }} />
                </div>
              </div>
            ))
          }
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
