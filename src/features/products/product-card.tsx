import { ArrowUpRight } from 'lucide-react'
import { GrowthText, OpportunityBadge, ScoreRing, SimulatedBadge, TrendBadge } from '@/components/indicators'
import { ProductThumb } from '@/components/niche-icon'
import { FavoriteButton } from '@/features/favorites/favorite-button'
import { isSimulatedProduct } from '@/hooks/use-research-data'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/ui-store'
import type { Niche, Product } from '@/types'
import { formatRatio, formatUSD } from '@/utils/format'

function Metric({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-[11px] text-muted-foreground">{label}</dt>
      <dd className={cn('tabular text-[13px]', strong ? 'font-semibold text-foreground' : 'font-medium')}>{value}</dd>
    </div>
  )
}

export function ProductCard({ product: p, niche }: { product: Product; niche?: Niche }) {
  const selectProduct = useUiStore((s) => s.selectProduct)
  const pr = p.pricing
  return (
    <article className="group relative flex flex-col rounded-xl border bg-card shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-start gap-3 p-4 pb-3">
        <ProductThumb src={p.images[0]} name={p.name} icon={niche?.icon} nicheId={p.nicheId} className="size-12" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">
            <button
              onClick={() => selectProduct(p.id)}
              className="text-left after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
            >
              {p.name}
            </button>
          </h3>
          <p className="truncate text-xs text-muted-foreground">{niche?.name}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <TrendBadge direction={p.trend.direction} growth={p.trend.growthPct} />
            {isSimulatedProduct(p) && <SimulatedBadge className="relative z-10" />}
          </div>
        </div>
        <ScoreRing score={p.score.total} level={p.score.level} />
      </div>

      <dl className="grid grid-cols-3 gap-x-3 gap-y-2.5 border-t px-4 py-3">
        <Metric label="Trend score" value={String(p.trend.interestScore)} />
        <Metric label="Sourcing" value={pr ? formatUSD(pr.sourcingCost) : '—'} />
        <Metric label="Sell at" value={pr ? formatUSD(pr.recommendedPrice) : '—'} strong />
        <div className="min-w-0">
          <dt className="text-[11px] text-muted-foreground">Search growth</dt>
          <dd className="text-[13px]">
            <GrowthText value={p.trend.growthPct} />
          </dd>
        </div>
        <Metric label="Gross profit" value={pr ? formatUSD(pr.grossProfit) : '—'} />
        <Metric label="Net margin" value={pr ? formatRatio(pr.netMargin, 0) : '—'} />
      </dl>

      <div className="mt-auto flex items-center justify-between border-t py-1.5 pr-2 pl-4">
        <OpportunityBadge level={p.score.level} />
        <div className="flex items-center gap-1">
          <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-70 transition-opacity group-hover:opacity-100">
            Research <ArrowUpRight className="size-3.5" />
          </span>
          <FavoriteButton productId={p.id} productName={p.name} />
        </div>
      </div>
    </article>
  )
}

export function ProductRow({ product: p, niche }: { product: Product; niche?: Niche }) {
  const selectProduct = useUiStore((s) => s.selectProduct)
  const pr = p.pricing
  return (
    <tr onClick={() => selectProduct(p.id)} className="cursor-pointer transition-colors hover:bg-muted/50">
      <td className="px-4 py-2.5">
        <button
          className="flex min-w-0 items-center gap-3 text-left focus-visible:outline-none"
          onClick={(e) => {
            e.stopPropagation()
            selectProduct(p.id)
          }}
        >
          <ProductThumb src={p.images[0]} name={p.name} icon={niche?.icon} nicheId={p.nicheId} className="size-9" />
          <span className="min-w-0">
            <span className="block truncate font-medium text-foreground">{p.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{niche?.name}</span>
          </span>
        </button>
      </td>
      <td className="tabular px-3 py-2.5 text-right font-medium">{p.trend.interestScore}</td>
      <td className="px-3 py-2.5 text-right">
        <GrowthText value={p.trend.growthPct} />
      </td>
      <td className="tabular px-3 py-2.5 text-right">{pr ? formatUSD(pr.sourcingCost) : '—'}</td>
      <td className="tabular px-3 py-2.5 text-right font-semibold">{pr ? formatUSD(pr.recommendedPrice) : '—'}</td>
      <td className="tabular px-3 py-2.5 text-right">{pr ? formatUSD(pr.grossProfit) : '—'}</td>
      <td className="tabular px-3 py-2.5 text-right">{pr ? formatRatio(pr.netMargin, 0) : '—'}</td>
      <td className="px-4 py-2.5">
        <div className="flex items-center justify-end gap-2">
          <span className="tabular font-semibold">{p.score.total}</span>
          <OpportunityBadge level={p.score.level} className="hidden xl:inline-flex" />
        </div>
      </td>
      <td className="py-1 pr-2">
        <FavoriteButton productId={p.id} productName={p.name} />
      </td>
    </tr>
  )
}
