import { LayoutGrid, List } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { SectionHeader } from '@/components/section-header'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton, ToggleGroup, ToggleGroupItem } from '@/components/ui/misc'
import { useResearchData } from '@/hooks/use-research-data'
import { useResearchStore } from '@/stores/research-store'
import { useUiStore } from '@/stores/ui-store'
import type { ProductSort, ViewMode } from '@/types'
import { filterProducts, sortProducts } from './filter-products'
import { ProductCard, ProductRow } from './product-card'
import { ProductFiltersBar } from './product-filters'

const SORTS: { value: ProductSort; label: string }[] = [
  { value: 'opportunity', label: 'Highest opportunity score' },
  { value: 'growth', label: 'Highest trend growth' },
  { value: 'profit', label: 'Highest estimated profit' },
  { value: 'recent', label: 'Recently discovered' },
]

export function ProductExplorer() {
  const { products, niches, nicheById } = useResearchData()
  const loading = useResearchStore((s) => s.loading)
  const { productFilters, search, sort, setSort, viewMode, setViewMode, resetProductFilters } = useUiStore()

  const list = sortProducts(filterProducts(products, productFilters, search, nicheById), sort)

  return (
    <section id="products" aria-labelledby="products-title" className="scroll-mt-20 space-y-3">
      <SectionHeader
        id="products-title"
        title="Trending products explorer"
        description={
          loading ? 'Loading research…' : `${list.length} of ${products.length} researched products · prices use your pricing assumptions`
        }
        actions={
          <>
            <Select value={sort} onValueChange={(v) => setSort(v as ProductSort)}>
              <SelectTrigger className="w-[210px]" aria-label="Sort products">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {SORTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as ViewMode)} aria-label="View mode">
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <List />
              </ToggleGroupItem>
            </ToggleGroup>
          </>
        }
      />

      <ProductFiltersBar niches={niches} />

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : !list.length ? (
        <div className="rounded-xl border bg-card shadow-card">
          <EmptyState
            title="No products match these filters"
            description="Loosen the opportunity, margin or price filters to see more research results."
            action={
              <Button variant="soft" size="sm" onClick={resetProductFilters}>
                Reset filters
              </Button>
            }
          />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} niche={nicheById.get(p.nicheId)} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card shadow-card">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Product</th>
                <th className="px-3 py-2.5 text-right font-medium">Trend</th>
                <th className="px-3 py-2.5 text-right font-medium">Growth</th>
                <th className="px-3 py-2.5 text-right font-medium">Sourcing</th>
                <th className="px-3 py-2.5 text-right font-medium">Sell at</th>
                <th className="px-3 py-2.5 text-right font-medium">Gross profit</th>
                <th className="px-3 py-2.5 text-right font-medium">Net margin</th>
                <th className="px-4 py-2.5 text-right font-medium">Opportunity</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map((p) => (
                <ProductRow key={p.id} product={p} niche={nicheById.get(p.nicheId)} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
