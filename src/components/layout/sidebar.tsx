import type { ReactNode } from 'react'
import { Award, Flame, Heart, LayoutDashboard, Layers } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Tooltip } from '@/components/ui/misc'
import { SidebarNiches } from '@/features/niches/sidebar-niches'
import { SidebarRecommendations } from '@/features/pricing/sidebar-recommendations'
import { SidebarTrendingProducts } from '@/features/products/sidebar-trending-products'
import { useResearchData } from '@/hooks/use-research-data'
import { cn } from '@/lib/utils'
import { useFavoriteCount } from '@/stores/favorites-store'
import { useResearchStore } from '@/stores/research-store'
import { useUiStore } from '@/stores/ui-store'

function SidebarSection({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon: typeof Flame
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <section className="px-3 py-3">
      <h2 className="mb-1.5 flex items-center gap-2 px-2 text-[11.5px] font-semibold tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3.5" />
        {title}
        {hint && (
          <Tooltip content={hint} side="right">
            <span className="ml-auto cursor-help rounded-full border px-1.5 text-[10px] leading-4 normal-case">?</span>
          </Tooltip>
        )}
      </h2>
      {children}
    </section>
  )
}

export function SidebarContent({ className }: { className?: string }) {
  const loading = useResearchStore((s) => s.loading)
  const { niches, products, recommended, nicheById } = useResearchData()
  const showView = useUiStore((s) => s.showView)
  const resetFilters = useUiStore((s) => s.resetProductFilters)
  const selected = useUiStore((s) => s.selectedProductId)
  const view = useUiStore((s) => s.view)
  const favoriteCount = useFavoriteCount()

  const navItem = (active: boolean) =>
    cn(
      'flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] font-medium transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
      active ? 'bg-muted text-foreground' : 'text-muted-foreground',
    )

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="flex h-16 shrink-0 items-center border-b px-5">
        <button
          onClick={() => {
            showView('dashboard')
            resetFilters()
          }}
          className="rounded-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-label="Prookup home"
        >
          <Logo />
        </button>
      </div>
      <nav className="scroll-thin flex-1 overflow-y-auto pb-6">
        <div className="space-y-0.5 px-3 pt-3">
          <button
            onClick={() => showView('dashboard')}
            aria-current={!selected && view === 'dashboard' ? 'page' : undefined}
            className={navItem(!selected && view === 'dashboard')}
          >
            <LayoutDashboard className="size-4" />
            Market overview
          </button>
          <button
            onClick={() => showView('favorites')}
            aria-current={!selected && view === 'favorites' ? 'page' : undefined}
            className={navItem(!selected && view === 'favorites')}
          >
            <Heart className={cn('size-4', favoriteCount > 0 && 'fill-rose-500 text-rose-500')} />
            Favorites
            {favoriteCount > 0 && (
              <span className="tabular ml-auto rounded-full bg-rose-50 px-1.5 text-[11px] leading-5 font-semibold text-rose-600">
                {favoriteCount}
              </span>
            )}
          </button>
        </div>
        <SidebarSection icon={Layers} title="Trending niches" hint="Popularity = average Google Trends interest (0–100) over the last 4 weeks. Growth compares the last 3 months with the 3 before.">
          <SidebarNiches niches={niches} loading={loading} />
        </SidebarSection>
        <SidebarSection icon={Flame} title="Trending products" hint="Rising products ordered by trend momentum (12-week slope).">
          <SidebarTrendingProducts products={products} nicheById={nicheById} loading={loading} />
        </SidebarSection>
        <SidebarSection icon={Award} title="Recommended & pricing" hint="Top 3 by opportunity score among products with positive modeled net profit and a non-declining trend. Estimates, not guarantees.">
          <SidebarRecommendations products={recommended} nicheById={nicheById} loading={loading} />
        </SidebarSection>
      </nav>
    </div>
  )
}
