import { FlaskConical, MapPin, Search, X } from 'lucide-react'
import { discoveryAnimation } from '@/assets/lottie/animations'
import { Lottie } from '@/components/lottie'
import { Input } from '@/components/ui/input'
import { useResearchStore } from '@/stores/research-store'
import { useUiStore } from '@/stores/ui-store'
import { SyncIndicator } from './sync-indicator'

export function GlobalSearch() {
  const search = useUiStore((s) => s.search)
  const setSearch = useUiStore((s) => s.setSearch)
  const selectProduct = useUiStore((s) => s.selectProduct)
  const selected = useUiStore((s) => s.selectedProductId)

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          if (selected) selectProduct(null)
        }}
        placeholder="Search products or niches…"
        className="pr-8 pl-9"
        aria-label="Search products and niches"
      />
      {search && (
        <button
          onClick={() => setSearch('')}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}

export function DemoDataBanner() {
  const status = useResearchStore((s) => s.status)
  const simulatedProviders = status?.providers.filter((p) => p.simulated) ?? []
  if (!simulatedProviders.length) return null
  const all = simulatedProviders.length === status?.providers.length

  return (
    <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-warning-soft px-4 py-3 text-[13px] text-orange-900">
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-warning" />
      <p>
        <span className="font-semibold">{all ? 'Demo mode: all research data is simulated.' : 'Some data is simulated.'}</span>{' '}
        {simulatedProviders.map((p) => p.kind).join(', ')} {simulatedProviders.length === 1 ? 'uses a' : 'use'} demo
        provider{simulatedProviders.length === 1 ? '' : 's'}. These numbers are not real Google Trends statistics or
        supplier prices. Add API keys in <code className="rounded bg-orange-100 px-1">.env</code> to collect real data.
      </p>
    </div>
  )
}

export function DashboardHeader() {
  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <GlobalSearch />
        <SyncIndicator />
      </div>

      <div className="relative overflow-hidden rounded-2xl border bg-card px-6 py-6 shadow-card sm:px-8">
        <div className="relative z-10 max-w-xl">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-accent-foreground">
            <MapPin className="size-3.5" />
            Market: United States
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
            Discover What&apos;s Trending in the US Market
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-[15px]">
            Find profitable products and emerging niches before everyone else.
          </p>
        </div>
        <Lottie
          animationData={discoveryAnimation}
          className="absolute -right-2 -bottom-4 hidden size-44 opacity-90 md:block"
        />
      </div>

      <DemoDataBanner />
    </header>
  )
}
