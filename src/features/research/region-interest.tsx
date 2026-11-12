import type { RegionInterest as Region } from '@/types'

/** Top US states by relative interest (single hue = magnitude). */
export function RegionInterest({ regions }: { regions: Region[] }) {
  if (!regions.length) {
    return <p className="text-[13px] text-muted-foreground">Regional interest is not available for this keyword.</p>
  }
  return (
    <ul className="space-y-2">
      {regions.map((r) => (
        <li key={r.code} className="grid grid-cols-[110px_1fr_32px] items-center gap-3 text-[13px]" title={`${r.region}: ${r.value}`}>
          <span className="truncate text-secondary-foreground">{r.region}</span>
          <span className="h-2 overflow-hidden rounded-full bg-muted">
            <span className="block h-full rounded-full bg-primary" style={{ width: `${r.value}%`, opacity: 0.35 + (r.value / 100) * 0.65 }} />
          </span>
          <span className="tabular text-right font-medium">{r.value}</span>
        </li>
      ))}
    </ul>
  )
}
