import { BadgeDollarSign, Flame, Layers, Rocket, type LucideIcon } from 'lucide-react'
import { Sparkline } from '@/components/sparkline'
import { Card } from '@/components/ui/card'
import { Skeleton, Tooltip } from '@/components/ui/misc'
import { cn } from '@/lib/utils'
import { useResearchStore } from '@/stores/research-store'
import type { OverviewStat } from '@/types'

const CARDS: { key: 'trendingNiches' | 'trendingProducts' | 'risingProducts' | 'opportunities'; label: string; icon: LucideIcon; hint: string }[] = [
  { key: 'trendingNiches', label: 'Trending niches', icon: Layers, hint: 'Researched niches whose search interest is rising or stable.' },
  { key: 'trendingProducts', label: 'Trending products', icon: Flame, hint: 'Researched products whose search interest is rising or stable.' },
  { key: 'risingProducts', label: 'Rising products', icon: Rocket, hint: 'Products with ≥ 20% search-interest growth (last 3 months vs prior 3).' },
  { key: 'opportunities', label: 'Research opportunities', icon: BadgeDollarSign, hint: 'Opportunity score ≥ 65 and estimated net margin ≥ 15% (server default assumptions).' },
]

function Delta({ stat }: { stat: OverviewStat }) {
  if (stat.previous == null) return <span className="text-xs text-muted-foreground">First research period</span>
  const d = stat.current - stat.previous
  return (
    <span className="text-xs text-muted-foreground">
      <span className={cn('tabular font-semibold', d > 0 ? 'text-success' : d < 0 ? 'text-warning' : 'text-muted-foreground')}>
        {d > 0 ? '▲' : d < 0 ? '▼' : '•'} {d > 0 ? '+' : ''}
        {d}
      </span>{' '}
      vs previous period
    </span>
  )
}

export function MarketOverview() {
  const overview = useResearchStore((s) => s.snapshot?.overview)
  const loading = useResearchStore((s) => s.loading)

  return (
    <section aria-label="Market overview" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {CARDS.map(({ key, label, icon: Icon, hint }) => {
        const stat = overview?.[key]
        return (
          <Card key={key} className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <Tooltip content={hint}>
                <span className="cursor-help text-[13px] font-medium text-muted-foreground">{label}</span>
              </Tooltip>
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Icon className="size-4" />
              </span>
            </div>
            {loading || !stat ? (
              <>
                <Skeleton className="h-7 w-14" />
                <Skeleton className="h-3 w-28" />
              </>
            ) : (
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <div className="tabular text-[28px] leading-none font-semibold tracking-tight text-foreground">{stat.current}</div>
                  <div className="mt-2">
                    <Delta stat={stat} />
                  </div>
                </div>
                <Sparkline values={stat.history} className="hidden h-9 w-20 sm:block" />
              </div>
            )}
          </Card>
        )
      })}
    </section>
  )
}
