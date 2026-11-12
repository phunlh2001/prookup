import type { ReactNode } from 'react'
import { ArrowLeft, Check, ShieldCheck, Truck } from 'lucide-react'
import { OPPORTUNITY_LABELS } from '@shared/scoring.ts'
import { EmptyState } from '@/components/empty-state'
import { GrowthText, OpportunityBadge, ScoreRing, SimulatedBadge, TrendBadge } from '@/components/indicators'
import { ProductThumb } from '@/components/niche-icon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PricingAssumptionsPanel } from '@/features/pricing/pricing-assumptions'
import { PricingBreakdown } from '@/features/pricing/pricing-breakdown'
import { InterestChart } from '@/features/research/interest-chart'
import { RegionInterest } from '@/features/research/region-interest'
import { ResearchSources } from '@/features/research/research-sources'
import { ScoreBreakdown } from '@/features/research/score-breakdown'
import { isSimulatedProduct, useResearchData } from '@/hooks/use-research-data'
import { cn } from '@/lib/utils'
import { showNicheProducts, useUiStore } from '@/stores/ui-store'
import type { DataSource, Product } from '@/types'
import { formatDate, formatDateTime, formatUSD } from '@/utils/format'

function SourceLine({ source }: { source: DataSource }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
      Source: {source.label} · updated {formatDateTime(source.fetchedAt)}
      {source.simulated && <SimulatedBadge />}
    </span>
  )
}

function Stat({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="rounded-lg bg-muted/60 px-3 py-2.5" title={hint}>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="tabular mt-0.5 text-[15px] font-semibold text-foreground">{children}</div>
    </div>
  )
}

const CONFIDENCE_STYLE = { high: 'success', medium: 'default', low: 'warning' } as const

function MarketOpportunity({ p }: { p: Product }) {
  const c = p.competition
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <ScoreRing score={p.score.total} level={p.score.level} size={64} />
        <div>
          <div className="text-[15px] font-semibold text-foreground">{OPPORTUNITY_LABELS[p.score.level]}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            Research confidence
            <Badge variant={CONFIDENCE_STYLE[p.score.confidence]} className="capitalize">
              {p.score.confidence}
            </Badge>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Demand score" hint="Average search interest over the last 4 weeks (0–100)">
          {p.trend.interestScore}
        </Stat>
        <Stat label="Trend momentum" hint="12-week slope relative to average interest (−100…100)">
          {p.trend.momentum > 0 ? '+' : ''}
          {p.trend.momentum}
        </Stat>
        <Stat label="Competition" hint={c?.evidence}>
          {c ? <span className="capitalize">{c.level}</span> : <span className="text-sm font-medium text-muted-foreground">n/a</span>}
        </Stat>
      </div>
      {c && <p className="text-xs text-muted-foreground">Competition evidence: {c.evidence}</p>}
      <ScoreBreakdown score={p.score} />
    </div>
  )
}

export function ProductDetail({ productId }: { productId: string }) {
  const { products, nicheById } = useResearchData()
  const selectProduct = useUiStore((s) => s.selectProduct)
  const p = products.find((x) => x.id === productId)

  const back = (
    <Button variant="ghost" size="sm" onClick={() => selectProduct(null)} className="-ml-2">
      <ArrowLeft />
      Back to market overview
    </Button>
  )

  if (!p) {
    return (
      <div className="space-y-4">
        {back}
        <Card>
          <EmptyState title="Product not found" description="It may have been removed from the research watchlist in the latest sync." />
        </Card>
      </div>
    )
  }

  const niche = nicheById.get(p.nicheId)
  const t = p.trend
  const recent = t.series.slice(-13)
  const prior = t.series.slice(-26, -13)
  const avg = (xs: { value: number }[]) => (xs.length ? Math.round(xs.reduce((s, x) => s + x.value, 0) / xs.length) : 0)

  return (
    <div className="space-y-5">
      {back}

      {/* ---- Product information ---- */}
      <Card>
        <CardContent className="flex flex-col gap-5 md:flex-row">
          <div className="flex shrink-0 gap-2 md:flex-col">
            <ProductThumb src={p.images[0]} name={p.name} icon={niche?.icon} nicheId={p.nicheId} className="size-28 rounded-xl md:size-36" />
            {p.images.length > 1 && (
              <div className="flex gap-2">
                {p.images.slice(1, 4).map((src) => (
                  <img key={src} src={src} alt="" loading="lazy" className="size-12 rounded-lg border object-cover" />
                ))}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => niche && showNicheProducts(niche.id)}
                className="text-xs font-medium text-primary hover:underline"
              >
                {niche?.name}
              </button>
              <TrendBadge direction={t.direction} />
              <OpportunityBadge level={p.score.level} />
              {isSimulatedProduct(p) && <SimulatedBadge />}
            </div>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">{p.name}</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{p.description}</p>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
              {p.characteristics.map((c) => (
                <li key={c} className="flex items-center gap-1.5 text-[13px] text-secondary-foreground">
                  <Check className="size-3.5 text-success" />
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Research keyword: <span className="font-medium text-foreground">“{p.keyword}”</span> · first discovered{' '}
              {formatDate(p.discoveredAt)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ---- Market demand ---- */}
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader>
            <CardTitle>Search interest · last 12 months (US)</CardTitle>
            <CardDescription>
              <SourceLine source={t.source} />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Current interest">{t.interestScore}</Stat>
              <Stat label="Last 3 months avg.">{avg(recent)}</Stat>
              <Stat label="Previous 3 months">{avg(prior)}</Stat>
              <Stat label="Growth vs previous">
                <GrowthText value={t.growthPct} />
              </Stat>
            </div>
            <InterestChart series={t.series} />
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer select-none hover:text-foreground">View data table</summary>
              <div className="scroll-thin mt-2 max-h-48 overflow-y-auto rounded-lg border">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      <th className="px-3 py-1.5 font-medium">Week of</th>
                      <th className="px-3 py-1.5 text-right font-medium">Interest</th>
                    </tr>
                  </thead>
                  <tbody className="tabular divide-y">
                    {[...t.series].reverse().map((pt) => (
                      <tr key={pt.date}>
                        <td className="px-3 py-1">{formatDate(pt.date)}</td>
                        <td className="px-3 py-1 text-right">{pt.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Interest by state</CardTitle>
              <CardDescription>Relative interest, top 10 (100 = highest)</CardDescription>
            </CardHeader>
            <CardContent>
              <RegionInterest regions={t.regions} />
            </CardContent>
          </Card>
          {t.relatedQueries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Rising related searches</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {t.relatedQueries.map((q) => (
                    <li key={q.query} className="flex items-center justify-between gap-3 text-[13px]">
                      <span className="truncate text-secondary-foreground">{q.query}</span>
                      <Badge variant={q.growth === 'Breakout' ? 'success' : 'neutral'}>{q.growth}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ---- Pricing + opportunity ---- */}
      <div className="grid gap-5 xl:grid-cols-[1fr_400px]">
        <Card>
          <CardHeader>
            <CardTitle>Pricing analysis</CardTitle>
            <CardDescription>
              {p.supplier ? <SourceLine source={p.supplier.source} /> : 'No supplier pricing available'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {p.pricing && p.supplier ? (
              <div className="space-y-5">
                <PricingBreakdown pricing={p.pricing} />
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5" /> Supplier: {p.supplier.supplierName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Truck className="size-3.5" /> Delivery: {p.supplier.shippingDays ?? 'not reported'}
                  </span>
                  <span>
                    Availability:{' '}
                    {{ in_stock: 'In stock', limited: 'Limited', unknown: 'Not reported' }[p.supplier.availability]}
                  </span>
                  {p.supplier.url && (
                    <a href={p.supplier.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      View supplier listing
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-muted-foreground">
                The supplier provider returned no matching offer, so pricing is not estimated. Prookup never invents
                sourcing prices.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Market opportunity</CardTitle>
              <CardDescription>Estimated from demand, momentum, profit and competition</CardDescription>
            </CardHeader>
            <CardContent>
              <MarketOpportunity p={p} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pricing assumptions</CardTitle>
              <CardDescription>Adjust modeled costs. Recommendations update instantly.</CardDescription>
            </CardHeader>
            <CardContent>
              <PricingAssumptionsPanel />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ---- Sources ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Research sources</CardTitle>
          <CardDescription>Every external datum shows its provider and when it was collected.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResearchSources product={p} />
        </CardContent>
      </Card>

      <p className={cn('pb-4 text-center text-xs text-muted-foreground')}>
        Recommended price {p.pricing ? formatUSD(p.pricing.recommendedPrice) : 'n/a'} and all scores are estimates for
        research purposes, not guaranteed business outcomes.
      </p>
    </div>
  )
}
