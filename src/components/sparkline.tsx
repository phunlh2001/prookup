import { useId } from 'react'
import { cn } from '@/lib/utils'

/** Tiny single-series trend line. Decorative: the adjacent number carries the value. */
export function Sparkline({
  values,
  className,
  color = 'var(--chart-line)',
  area = true,
}: {
  values: number[]
  className?: string
  color?: string
  area?: boolean
}) {
  const id = useId()
  if (values.length < 2) return null
  const w = 100
  const h = 32
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - 3 - ((v - min) / span) * (h - 6)])
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn('h-8 w-full', className)} aria-hidden="true">
      {area && (
        <>
          <defs>
            <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.16" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${line}L${w},${h}L0,${h}Z`} fill={`url(#${id})`} />
        </>
      )}
      <path d={line} fill="none" stroke={color} strokeWidth="1.75" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  )
}
