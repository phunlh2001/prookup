import { OPPORTUNITY_LABELS } from '@shared/scoring.ts'
import { ScoreRing } from '@/components/indicators'
import { Skeleton } from '@/components/ui/misc'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/ui-store'
import type { Niche, Product } from '@/types'
import { formatRatio, formatUSD } from '@/utils/format'

/** Top 3 products ranked by the research engine (computed, never hardcoded). */
export function SidebarRecommendations({
  products,
  nicheById,
  loading,
}: {
  products: Product[]
  nicheById: Map<string, Niche>
  loading: boolean
}) {
  const selectProduct = useUiStore((s) => s.selectProduct)

  if (loading) return <div className="space-y-2">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>

  if (!products.length) {
    return (
      <p className="px-2 py-3 text-xs text-muted-foreground">
        No product meets the recommendation criteria (positive net profit, non-declining trend) under the current
        pricing assumptions.
      </p>
    )
  }

  return (
    <ol className="space-y-2">
      {products.map((p, i) => {
        const pr = p.pricing!
        return (
          <li key={p.id}>
            <button
              onClick={() => selectProduct(p.id)}
              className={cn(
                'w-full rounded-xl border bg-card p-3 text-left shadow-card transition-shadow hover:shadow-card-hover focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                i === 0 && 'border-primary/30',
              )}
            >
              <div className="flex items-start gap-3">
                <ScoreRing score={p.score.total} level={p.score.level} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-primary">#{i + 1}</span>
                    <span className="truncate text-[13px] font-semibold text-foreground">{p.name}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {nicheById.get(p.nicheId)?.name} · {OPPORTUNITY_LABELS[p.score.level]}
                  </p>
                </div>
              </div>
              <dl className="tabular mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Sourcing</dt>
                  <dd className="font-medium">{formatUSD(pr.sourcingCost)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Sell at</dt>
                  <dd className="font-semibold text-foreground">{formatUSD(pr.recommendedPrice)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Gross</dt>
                  <dd className="font-medium">{formatUSD(pr.grossProfit)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Net margin</dt>
                  <dd className="font-medium text-success">{formatRatio(pr.netMargin, 0)}</dd>
                </div>
              </dl>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
