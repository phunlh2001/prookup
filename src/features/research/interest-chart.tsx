import { useId, useState } from 'react'
import { useElementWidth } from '@/hooks/use-element-width'
import type { InterestPoint } from '@/types'
import { formatDate } from '@/utils/format'

const H = 220
const PAD = { top: 24, right: 12, bottom: 26, left: 30 }

/**
 * Weekly Google Trends interest (0–100) for the last 12 months.
 * Single series → no legend; the card title names it. Crosshair + tooltip on
 * hover; the last 13 weeks ("recent period") are shaded for comparison.
 */
export function InterestChart({ series }: { series: InterestPoint[] }) {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const gradId = useId()

  const n = series.length
  const innerW = Math.max(0, width - PAD.left - PAD.right)
  const innerH = H - PAD.top - PAD.bottom
  const x = (i: number) => PAD.left + (n > 1 ? (i / (n - 1)) * innerW : 0)
  const y = (v: number) => PAD.top + innerH - (v / 100) * innerH

  const line = series.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join('')
  const area = `${line}L${x(n - 1)},${y(0)}L${x(0)},${y(0)}Z`
  const recentStart = Math.max(0, n - 13)

  // Month ticks: first point of each month, thinned to fit.
  const ticks: number[] = []
  series.forEach((p, i) => {
    if (i === 0 || p.date.slice(0, 7) !== series[i - 1].date.slice(0, 7)) ticks.push(i)
  })
  const every = width < 480 ? 3 : width < 720 ? 2 : 1
  const shownTicks = ticks.filter((_, i) => i % every === 0)

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left
    const i = Math.round(((px - PAD.left) / innerW) * (n - 1))
    setHover(i >= 0 && i < n ? i : null)
  }

  const hp = hover != null ? series[hover] : null
  const tipLeft = hover != null ? Math.min(Math.max(x(hover), 70), width - 70) : 0

  return (
    <div ref={ref} className="relative w-full" style={{ height: H }}>
      {width > 0 && n > 1 && (
        <svg
          width={width}
          height={H}
          className="block touch-none"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          role="img"
          aria-label={`Search interest over the last 12 months, from ${series[0].value} to ${series[n - 1].value}`}
        >
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--chart-line)" stopOpacity="0.14" />
              <stop offset="1" stopColor="var(--chart-line)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* recent period band */}
          <rect x={x(recentStart)} y={PAD.top} width={x(n - 1) - x(recentStart)} height={innerH} fill="var(--muted)" opacity="0.7" />
          <text x={x(n - 1)} y={PAD.top - 8} textAnchor="end" className="fill-muted-foreground text-[10.5px]">
            Last 3 months
          </text>

          {/* grid */}
          {[0, 25, 50, 75, 100].map((v) => (
            <g key={v}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(v)} y2={y(v)} stroke="var(--chart-grid)" />
              <text x={PAD.left - 8} y={y(v)} dy="0.32em" textAnchor="end" className="tabular fill-muted-foreground text-[10.5px]">
                {v}
              </text>
            </g>
          ))}
          {shownTicks.map((i) => (
            <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="fill-muted-foreground text-[10.5px]">
              {new Date(series[i].date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
            </text>
          ))}

          <path d={area} fill={`url(#${gradId})`} />
          <path d={line} fill="none" stroke="var(--chart-line)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

          {hover != null && hp && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH} stroke="var(--foreground)" strokeOpacity="0.25" />
              <circle cx={x(hover)} cy={y(hp.value)} r="5" fill="var(--chart-line)" stroke="var(--card)" strokeWidth="2" />
            </g>
          )}
        </svg>
      )}
      {hp && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg border bg-popover px-2.5 py-1.5 text-xs shadow-card-hover"
          style={{ left: tipLeft }}
        >
          <div className="text-muted-foreground">Week of {formatDate(hp.date)}</div>
          <div className="tabular font-semibold text-foreground">Interest {hp.value}</div>
        </div>
      )}
    </div>
  )
}
