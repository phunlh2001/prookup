import { ChevronRight } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { GrowthText, SimulatedBadge, TrendBadge } from '@/components/indicators'
import { NicheIcon } from '@/components/niche-icon'
import { SectionHeader } from '@/components/section-header'
import { Sparkline } from '@/components/sparkline'
import { Card } from '@/components/ui/card'
import { Skeleton, ToggleGroup, ToggleGroupItem } from '@/components/ui/misc'
import { useResearchData } from '@/hooks/use-research-data'
import { useResearchStore } from '@/stores/research-store'
import { showNicheProducts, useUiStore } from '@/stores/ui-store'
import type { Niche, NicheFilter } from '@/types'
import { formatDate } from '@/utils/format'

const FILTERS: { value: NicheFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'rising', label: 'Rising' },
  { value: 'stable', label: 'Stable' },
  { value: 'declining', label: 'Declining' },
  { value: 'top-growth', label: 'Highest growth' },
]

function applyFilter(niches: Niche[], filter: NicheFilter, search: string) {
  const q = search.trim().toLowerCase()
  let list = q ? niches.filter((n) => n.name.toLowerCase().includes(q) || n.keyword.includes(q)) : niches
  if (filter === 'top-growth') return [...list].sort((a, b) => b.trend.growthPct - a.trend.growthPct)
  if (filter !== 'all') list = list.filter((n) => n.trend.direction === filter)
  return [...list].sort((a, b) => b.trend.interestScore - a.trend.interestScore)
}

export function NicheExplorer() {
  const { niches } = useResearchData()
  const loading = useResearchStore((s) => s.loading)
  const filter = useUiStore((s) => s.nicheFilter)
  const setFilter = useUiStore((s) => s.setNicheFilter)
  const search = useUiStore((s) => s.search)
  const list = applyFilter(niches, filter, search)
  const simulated = niches.some((n) => n.trend.source.simulated)

  const open = showNicheProducts

  return (
    <section aria-labelledby="niches-title" className="space-y-3">
      <SectionHeader
        id="niches-title"
        title="Trending niches explorer"
        description={
          <span className="inline-flex flex-wrap items-center gap-1.5">
            US search interest by niche. Source: {niches[0]?.trend.source.label ?? 'Google Trends'}
            {simulated && <SimulatedBadge />}
          </span>
        }
        actions={
          <ToggleGroup type="single" value={filter} onValueChange={(v) => v && setFilter(v as NicheFilter)} aria-label="Filter niches">
            {FILTERS.map((f) => (
              <ToggleGroupItem key={f.value} value={f.value}>
                {f.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        }
      />

      <Card className="overflow-hidden">
        {loading ? (
          <div className="divide-y">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <Skeleton className="size-8 rounded-lg" />
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="ml-auto h-6 w-24" />
              </div>
            ))}
          </div>
        ) : !list.length ? (
          <EmptyState compact title="No niches match" description="Try a different trend filter or clear the search." />
        ) : (
          <>
            {/* Table on md+ */}
            <table className="hidden w-full text-left text-[13px] md:table">
              <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Niche</th>
                  <th className="px-3 py-2.5 font-medium">Search interest</th>
                  <th className="px-3 py-2.5 text-right font-medium">Growth</th>
                  <th className="px-3 py-2.5 font-medium">Trend</th>
                  <th className="px-3 py-2.5 text-right font-medium">Products</th>
                  <th className="px-3 py-2.5 font-medium">Researched</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((n) => (
                  <tr
                    key={n.id}
                    onClick={() => open(n.id)}
                    className="group cursor-pointer transition-colors hover:bg-muted/50"
                  >
                    <td className="px-5 py-3">
                      <button
                        className="flex items-center gap-3 text-left font-medium text-foreground focus-visible:outline-none"
                        onClick={(e) => {
                          e.stopPropagation()
                          open(n.id)
                        }}
                      >
                        <NicheIcon icon={n.icon} nicheId={n.id} />
                        {n.name}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <span className="tabular w-7 font-semibold">{n.trend.interestScore}</span>
                        <Sparkline values={n.trend.series.slice(-26).map((p) => p.value)} className="h-7 w-24" />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <GrowthText value={n.trend.growthPct} />
                    </td>
                    <td className="px-3 py-3">
                      <TrendBadge direction={n.trend.direction} />
                    </td>
                    <td className="tabular px-3 py-3 text-right font-medium">{n.productCount}</td>
                    <td className="px-3 py-3 text-muted-foreground">{formatDate(n.researchedAt)}</td>
                    <td className="pr-4">
                      <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Cards on mobile */}
            <ul className="divide-y md:hidden">
              {list.map((n) => (
                <li key={n.id}>
                  <button onClick={() => open(n.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                    <NicheIcon icon={n.icon} nicheId={n.id} />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2 text-[13px] font-medium">
                        <span className="truncate">{n.name}</span>
                        <span className="tabular">{n.trend.interestScore}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <TrendBadge direction={n.trend.direction} />
                          <GrowthText value={n.trend.growthPct} />
                        </span>
                        <span>{n.productCount} products</span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </section>
  )
}
