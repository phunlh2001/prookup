import { TrendBadge } from '@/components/indicators'
import { ProductThumb } from '@/components/niche-icon'
import { Skeleton } from '@/components/ui/misc'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/ui-store'
import type { Niche, Product } from '@/types'

/** Products gaining the most search interest right now. */
export function SidebarTrendingProducts({
  products,
  nicheById,
  loading,
}: {
  products: Product[]
  nicheById: Map<string, Niche>
  loading: boolean
}) {
  const selectProduct = useUiStore((s) => s.selectProduct)
  const selected = useUiStore((s) => s.selectedProductId)
  const trending = products
    .filter((p) => p.trend.direction === 'rising')
    .sort((a, b) => b.trend.momentum - a.trend.momentum || b.trend.growthPct - a.trend.growthPct)
    .slice(0, 6)

  if (loading) {
    return (
      <ul className="space-y-0.5">
        {Array.from({ length: 4 }, (_, i) => (
          <li key={i} className="flex items-center gap-3 px-2 py-2">
            <Skeleton className="size-9 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
          </li>
        ))}
      </ul>
    )
  }

  if (!trending.length) {
    return <p className="px-2 py-3 text-xs text-muted-foreground">No rising products in this research period.</p>
  }

  return (
    <ul className="space-y-0.5">
      {trending.map((p) => {
        const niche = nicheById.get(p.nicheId)
        return (
          <li key={p.id}>
            <button
              onClick={() => selectProduct(p.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                selected === p.id && 'bg-primary-soft hover:bg-primary-soft',
              )}
            >
              <ProductThumb src={p.images[0]} name={p.name} icon={niche?.icon} nicheId={p.nicheId} className="size-9" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-medium text-foreground">{p.name}</span>
                  <span className="tabular text-[13px] font-semibold" title="Popularity score (0–100)">
                    {p.trend.interestScore}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-muted-foreground">{niche?.name}</span>
                  <TrendBadge direction={p.trend.direction} growth={p.trend.growthPct} className="px-1 py-0 text-[11px]" />
                </div>
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
