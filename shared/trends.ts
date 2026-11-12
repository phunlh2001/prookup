import type { InterestPoint, TrendDirection } from './types.ts'

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)

/** Derive summary trend metrics from a weekly interest series. */
export function summarizeSeries(series: InterestPoint[]): {
  interestScore: number
  growthPct: number
  direction: TrendDirection
  momentum: number
} {
  const values = series.map((p) => p.value)
  const interestScore = Math.round(avg(values.slice(-4)))

  const recent = avg(values.slice(-13))
  const prior = avg(values.slice(-26, -13))
  const growthPct = prior > 0 ? Math.round(((recent - prior) / prior) * 1000) / 10 : 0

  // Least-squares slope over the last 12 weeks, scaled so that a rise of the
  // full 0–100 range across 12 weeks ≈ 100.
  const window = values.slice(-12)
  const n = window.length
  let momentum = 0
  if (n >= 3) {
    const xMean = (n - 1) / 2
    const yMean = avg(window)
    let num = 0
    let den = 0
    window.forEach((y, x) => {
      num += (x - xMean) * (y - yMean)
      den += (x - xMean) ** 2
    })
    const slope = den ? num / den : 0
    momentum = Math.max(-100, Math.min(100, Math.round(((slope * (n - 1)) / Math.max(yMean, 1)) * 100)))
  }

  const direction: TrendDirection = growthPct >= 10 ? 'rising' : growthPct <= -10 ? 'declining' : 'stable'
  return { interestScore, growthPct, direction, momentum }
}
