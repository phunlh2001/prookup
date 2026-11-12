import { GrowthText, TrendBadge } from '@/components/indicators'
import { NicheIcon } from '@/components/niche-icon'
import { Skeleton } from '@/components/ui/misc'
import { cn } from '@/lib/utils'
import { showNicheProducts, useUiStore } from '@/stores/ui-store'
import type { Niche } from '@/types'

export function SidebarNiches({ niches, loading }: { niches: Niche[]; loading: boolean }) {
  const activeNiche = useUiStore((s) => s.productFilters.nicheId)
  const sorted = [...niches].sort((a, b) => b.trend.interestScore - a.trend.interestScore)

  return (
    <ul className="space-y-0.5">
      {loading
        ? Array.from({ length: 5 }, (_, i) => (
            <li key={i} className="flex items-center gap-3 px-2 py-2">
              <Skeleton className="size-8 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
            </li>
          ))
        : sorted.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => showNicheProducts(n.id)}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                  activeNiche === n.id && 'bg-primary-soft hover:bg-primary-soft',
                )}
              >
                <NicheIcon icon={n.icon} nicheId={n.id} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-medium text-foreground">{n.name}</span>
                    <span className="tabular text-[13px] font-semibold text-foreground" title="Popularity score (0–100)">
                      {n.trend.interestScore}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <TrendBadge direction={n.trend.direction} className="px-1 py-0 text-[11px]" />
                      <GrowthText value={n.trend.growthPct} className="text-[11.5px]" />
                    </span>
                    <span className="tabular">{n.productCount} products</span>
                  </div>
                </div>
              </button>
            </li>
          ))}
    </ul>
  )
}
