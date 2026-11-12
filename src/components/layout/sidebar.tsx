import type { ReactNode } from 'react'
import { Award, Flame, LayoutDashboard, Layers } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Tooltip } from '@/components/ui/misc'
import { SidebarNiches } from '@/features/niches/sidebar-niches'
import { SidebarRecommendations } from '@/features/pricing/sidebar-recommendations'
import { SidebarTrendingProducts } from '@/features/products/sidebar-trending-products'
import { useResearchData } from '@/hooks/use-research-data'
import { cn } from '@/lib/utils'
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
  const selectProduct = useUiStore((s) => s.selectProduct)
  const resetFilters = useUiStore((s) => s.resetProductFilters)
  const selected = useUiStore((s) => s.selectedProductId)

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="flex h-16 shrink-0 items-center border-b px-5">
        <button
          onClick={() => {
            selectProduct(null)
            resetFilters()
          }}
          className="rounded-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-label="Prookup home"
        >
          <Logo />
        </button>
      </div>
      <nav className="scroll-thin flex-1 overflow-y-auto pb-6">
        <div className="px-3 pt-3">
          <button
            onClick={() => selectProduct(null)}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] font-medium transition-colors hover:bg-muted',
              !selected ? 'bg-muted text-foreground' : 'text-muted-foreground',
            )}
          >
            <LayoutDashboard className="size-4" />
            Market overview
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
