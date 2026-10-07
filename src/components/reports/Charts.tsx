'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

/* Dependency-free SVG charts. They measure their own width, so they stay
   crisp and readable on phones as well as desktop. */

export const PALETTE = [
  'var(--primary, #f59e0b)',
  'var(--blue, #3b82f6)',
  'var(--green, #10b981)',
  'var(--purple, #8b5cf6)',
  'var(--red, #ef4444)',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
]

export const inrShort = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${Math.round(n)}`

export const inrFull = (n: number) => `₹${new Intl.NumberFormat('en-IN').format(Math.round(n))}`

const countFmt = (n: number) => String(Math.round(n))

function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    setW(el.clientWidth)
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return { ref, w }
}

function niceMax(v: number) {
  if (v <= 0) return 1
  const exp = Math.pow(10, Math.floor(Math.log10(v)))
  const f = v / exp
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10
  return nf * exp
}

const axisText = { fill: 'var(--text3)', fontSize: 10 } as const

// ─── Card + empty state ───────────────────────────────────────────────────────

export function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, minWidth: 0 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  )
}

export function EmptyChart({ height = 140, text = 'No data for this period' }: { height?: number; text?: string }) {
  return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text3)', border: '1px dashed var(--border)', borderRadius: 10 }}>
      {text}
    </div>
  )
}

// ─── KPI card with optional sparkline ─────────────────────────────────────────

export function Kpi({ label, value, sub, color, spark }: { label: string; value: string; sub?: ReactNode; color: string; spark?: number[] }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, minWidth: 0, overflow: 'hidden' }}>
      <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{sub}</div>}
      {spark && spark.length > 1 && <Sparkline values={spark} color={color} />}
    </div>
  )
}

export function Sparkline({ values, color, height = 28 }: { values: number[]; color: string; height?: number }) {
  const { ref, w } = useWidth()
  const max = Math.max(...values, 1)
  const n = values.length
  const x = (i: number) => (n === 1 ? w / 2 : (w * i) / (n - 1))
  const y = (v: number) => 2 + (height - 4) * (1 - v / max)
  const line = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ')
  return (
    <div ref={ref} style={{ marginTop: 8, height }}>
      {w > 0 && (
        <svg width={w} height={height} style={{ display: 'block' }} aria-hidden="true">
          <path d={`${line} L${x(n - 1)},${height} L${x(0)},${height} Z`} style={{ fill: color, opacity: 0.12 }} />
          <path d={line} fill="none" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" style={{ stroke: color }} />
        </svg>
      )}
    </div>
  )
}

// ─── Area / line chart ────────────────────────────────────────────────────────

type Point = { label: string; value: number }

export function AreaChart({ data, height = 210, color = PALETTE[0], format = inrShort, detail = inrFull }: {
  data: Point[]; height?: number; color?: string; format?: (n: number) => string; detail?: (n: number) => string
}) {
  const { ref, w } = useWidth()
  const gid = 'ag' + useId().replace(/:/g, '')
  const [active, setActive] = useState<number | null>(null)

  const n = data.length
  const hasData = data.some(d => d.value > 0)
  if (n === 0 || !hasData) return <EmptyChart height={height} />

  const pad = { l: 44, r: 10, t: 10, b: 24 }
  const iw = Math.max(w - pad.l - pad.r, 10)
  const ih = height - pad.t - pad.b
  const maxV = niceMax(Math.max(...data.map(d => d.value)))
  const x = (i: number) => (n === 1 ? pad.l + iw / 2 : pad.l + (iw * i) / (n - 1))
  const y = (v: number) => pad.t + ih * (1 - v / maxV)

  let line = `M${x(0)},${y(data[0].value)}`
  for (let i = 1; i < n; i++) {
    const cx = (x(i - 1) + x(i)) / 2
    line += ` C${cx},${y(data[i - 1].value)} ${cx},${y(data[i].value)} ${x(i)},${y(data[i].value)}`
  }
  const area = `${line} L${x(n - 1)},${pad.t + ih} L${x(0)},${pad.t + ih} Z`

  const peak = data.reduce((b, d, i) => (d.value > data[b].value ? i : b), 0)
  const shown = active ?? peak
  const step = Math.ceil(n / Math.max(2, Math.floor(iw / 64)))

  const pick = (clientX: number, el: SVGSVGElement) => {
    const px = clientX - el.getBoundingClientRect().left
    const i = n === 1 ? 0 : Math.round(((px - pad.l) / iw) * (n - 1))
    setActive(Math.max(0, Math.min(n - 1, i)))
  }

  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6, minHeight: 18 }}>
        <span style={{ color: 'var(--text3)' }}>{active === null ? 'Peak · ' : ''}{data[shown].label}</span>
        <b style={{ color: 'var(--text1)', marginLeft: 8 }}>{detail(data[shown].value)}</b>
      </div>
      <div ref={ref} style={{ width: '100%' }}>
        {w > 0 && (
          <svg width={w} height={height} style={{ display: 'block', touchAction: 'pan-y' }}
            onPointerDown={e => pick(e.clientX, e.currentTarget)}
            onPointerMove={e => pick(e.clientX, e.currentTarget)}
            onPointerLeave={e => { if (e.pointerType === 'mouse') setActive(null) }}>
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.35 }} />
                <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.02 }} />
              </linearGradient>
            </defs>
            {[0, 0.5, 1].map(f => (
              <g key={f}>
                <line x1={pad.l} x2={pad.l + iw} y1={y(maxV * f)} y2={y(maxV * f)} strokeDasharray="3 4" style={{ stroke: 'var(--border)' }} />
                <text x={pad.l - 6} y={y(maxV * f) + 3} textAnchor="end" style={axisText}>{format(maxV * f)}</text>
              </g>
            ))}
            <path d={area} fill={`url(#${gid})`} />
            {n > 1 && <path d={line} fill="none" strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" style={{ stroke: color }} />}
            {data.map((d, i) => i % step === 0 && (
              <text key={i} x={x(i)} y={height - 6} textAnchor={i === 0 ? 'start' : 'middle'} style={axisText}>{d.label}</text>
            ))}
            {active !== null && (
              <line x1={x(active)} x2={x(active)} y1={pad.t} y2={pad.t + ih} strokeWidth={1} style={{ stroke: 'var(--text3)', opacity: 0.5 }} />
            )}
            <circle cx={x(shown)} cy={y(data[shown].value)} r={4.5} strokeWidth={2} style={{ fill: 'var(--surface)', stroke: color }} />
          </svg>
        )}
      </div>
    </div>
  )
}

// ─── Bar chart ────────────────────────────────────────────────────────────────

export function BarChart({ data, height = 190, color = PALETTE[1], format = countFmt, detail = countFmt, unit = '' }: {
  data: Point[]; height?: number; color?: string; format?: (n: number) => string; detail?: (n: number) => string; unit?: string
}) {
  const { ref, w } = useWidth()
  const [active, setActive] = useState<number | null>(null)

  const n = data.length
  if (n === 0 || !data.some(d => d.value > 0)) return <EmptyChart height={height} />

  const pad = { l: 34, r: 6, t: 10, b: 24 }
  const iw = Math.max(w - pad.l - pad.r, 10)
  const ih = height - pad.t - pad.b
  const maxV = niceMax(Math.max(...data.map(d => d.value)))
  const slot = iw / n
  const bw = Math.max(3, Math.min(34, slot * 0.62))
  const y = (v: number) => pad.t + ih * (1 - v / maxV)
  const peak = data.reduce((b, d, i) => (d.value > data[b].value ? i : b), 0)
  const shown = active ?? peak
  const step = Math.ceil(n / Math.max(2, Math.floor(iw / 40)))

  const pick = (clientX: number, el: SVGSVGElement) => {
    const px = clientX - el.getBoundingClientRect().left - pad.l
    setActive(Math.max(0, Math.min(n - 1, Math.floor(px / slot))))
  }

  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6, minHeight: 18 }}>
        <span style={{ color: 'var(--text3)' }}>{active === null ? 'Busiest · ' : ''}{data[shown].label}</span>
        <b style={{ color: 'var(--text1)', marginLeft: 8 }}>{detail(data[shown].value)}{unit}</b>
      </div>
      <div ref={ref} style={{ width: '100%' }}>
        {w > 0 && (
          <svg width={w} height={height} style={{ display: 'block', touchAction: 'pan-y' }}
            onPointerDown={e => pick(e.clientX, e.currentTarget)}
            onPointerMove={e => pick(e.clientX, e.currentTarget)}
            onPointerLeave={e => { if (e.pointerType === 'mouse') setActive(null) }}>
            {[0, 0.5, 1].map(f => (
              <g key={f}>
                <line x1={pad.l} x2={pad.l + iw} y1={y(maxV * f)} y2={y(maxV * f)} strokeDasharray="3 4" style={{ stroke: 'var(--border)' }} />
                <text x={pad.l - 6} y={y(maxV * f) + 3} textAnchor="end" style={axisText}>{format(maxV * f)}</text>
              </g>
            ))}
            {data.map((d, i) => {
              const bx = pad.l + slot * i + (slot - bw) / 2
              const by = y(d.value)
              return (
                <g key={i}>
                  <rect x={bx} y={by} width={bw} height={Math.max(pad.t + ih - by, d.value > 0 ? 2 : 0)} rx={3}
                    style={{ fill: color, opacity: i === shown ? 1 : 0.55 }} />
                  {i % step === 0 && (
                    <text x={bx + bw / 2} y={height - 6} textAnchor="middle" style={axisText}>{d.label}</text>
                  )}
                </g>
              )
            })}
          </svg>
        )}
      </div>
    </div>
  )
}

// ─── Donut chart with legend ──────────────────────────────────────────────────

export type Slice = { label: string; value: number; color?: string; meta?: string }

export function DonutChart({ slices, centerLabel, centerValue, format = inrShort, size = 148 }: {
  slices: Slice[]; centerLabel?: string; centerValue?: string; format?: (n: number) => string; size?: number
}) {
  const data = slices.filter(s => s.value > 0)
  const total = data.reduce((s, x) => s + x.value, 0)
  if (total <= 0) return <EmptyChart height={size} />

  const stroke = 18
  const r = size / 2 - stroke / 2 - 2
  const cx = size / 2
  const C = 2 * Math.PI * r
  let acc = 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, margin: '0 auto' }}>
        <svg width={size} height={size} aria-hidden="true">
          <circle cx={cx} cy={cx} r={r} fill="none" strokeWidth={stroke} style={{ stroke: 'var(--surface3, rgba(128,128,128,0.15))' }} />
          {data.map((s, i) => {
            const frac = s.value / total
            const len = Math.max(frac * C - (data.length > 1 ? 3 : 0), 0.5)
            const el = (
              <circle key={i} cx={cx} cy={cx} r={r} fill="none" strokeWidth={stroke}
                strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc * C}
                transform={`rotate(-90 ${cx} ${cx})`} style={{ stroke: s.color ?? PALETTE[i % PALETTE.length] }} />
            )
            acc += frac
            return el
          })}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', pointerEvents: 'none' }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text1)' }}>{centerValue ?? format(total)}</div>
          <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{centerLabel ?? 'Total'}</div>
        </div>
      </div>

      <div style={{ flex: '1 1 150px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, flexShrink: 0, background: s.color ?? PALETTE[i % PALETTE.length] }} />
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text2)' }}>{s.label}</span>
            <b style={{ color: 'var(--text1)' }}>{format(s.value)}</b>
            <span style={{ width: 34, textAlign: 'right', color: 'var(--text3)', fontSize: 11 }}>{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Horizontal bars (rankings) ───────────────────────────────────────────────

export type BarRow = { label: string; value: number; meta?: string; color?: string }

export function HBars({ rows, format = inrShort, color = PALETTE[0] }: { rows: BarRow[]; format?: (n: number) => string; color?: string }) {
  if (rows.length === 0 || !rows.some(r => r.value > 0)) return <EmptyChart height={120} />
  const max = Math.max(...rows.map(r => r.value), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      {rows.map((r, i) => (
        <div key={i}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 12, marginBottom: 4 }}>
            <span style={{ width: 16, color: 'var(--text3)', fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text1)', fontWeight: 600 }}>{r.label}</span>
            {r.meta && <span style={{ color: 'var(--text3)', fontSize: 11, whiteSpace: 'nowrap' }}>{r.meta}</span>}
            <b style={{ color: 'var(--text1)', whiteSpace: 'nowrap' }}>{format(r.value)}</b>
          </div>
          <div style={{ height: 7, borderRadius: 4, background: 'var(--surface3, rgba(128,128,128,0.15))', marginLeft: 24, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.max((r.value / max) * 100, 2)}%`, borderRadius: 4, background: r.color ?? color }} />
          </div>
        </div>
      ))}
    </div>
  )
}