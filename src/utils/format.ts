const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export const formatUSD = (n: number) => usd.format(n)

/** 0.234 → "23.4%" */
export const formatRatio = (r: number, digits = 1) => `${(r * 100).toFixed(digits)}%`

/** 23.4 → "+23.4%" */
export function formatGrowth(pct: number) {
  const sign = pct > 0 ? '+' : pct < 0 ? '−' : ''
  return `${sign}${Math.abs(pct).toFixed(1)}%`
}

export function formatDate(
  iso: string,
  opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' },
) {
  return new Date(iso).toLocaleDateString('en-US', opts)
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })

export function formatRelative(iso: string, now = Date.now()) {
  const diff = (new Date(iso).getTime() - now) / 1000
  const abs = Math.abs(diff)
  if (abs < 45) return 'just now'
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour')
  return rtf.format(Math.round(diff / 86400), 'day')
}
