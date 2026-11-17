import { useMemo } from 'react'
import { Heart, Info } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { SectionHeader } from '@/components/section-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/misc'
import { ProductCard } from '@/features/products/product-card'
import { useResearchData } from '@/hooks/use-research-data'
import { useFavoritesStore } from '@/stores/favorites-store'
import { useResearchStore } from '@/stores/research-store'
import { useUiStore } from '@/stores/ui-store'

export function FavoritesPage() {
  const loading = useResearchStore((s) => s.loading)
  const { products, nicheById } = useResearchData()
  const favorites = useFavoritesStore((s) => s.favorites)
  const clear = useFavoritesStore((s) => s.clear)
  const showView = useUiStore((s) => s.showView)

  const { saved, missing } = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]))
    // Most recently added first.
    const ids = Object.entries(favorites)
      .sort(([, a], [, b]) => b.localeCompare(a))
      .map(([id]) => id)
    return {
      saved: ids.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : [])),
      missing: ids.filter((id) => !byId.has(id)),
    }
  }, [products, favorites])

  const avgScore = saved.length ? Math.round(saved.reduce((s, p) => s + p.score.total, 0) / saved.length) : 0

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Favorite products"
        description="Products you saved for later research. Favorites are stored in this browser."
        actions={
          saved.length > 0 && (
            <div className="flex items-center gap-4 rounded-lg border bg-card px-3 py-1.5 text-xs shadow-card">
              <span className="text-muted-foreground">
                Saved <span className="tabular font-semibold text-foreground">{saved.length}</span>
              </span>
              <span className="text-muted-foreground">
                Avg. score <span className="tabular font-semibold text-foreground">{avgScore}</span>
              </span>
            </div>
          )
        }
      />

      {missing.length > 0 && !loading && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/60 px-4 py-3 text-[13px] text-secondary-foreground">
          <span className="flex items-center gap-2">
            <Info className="size-4 shrink-0 text-muted-foreground" />
            {missing.length} saved {missing.length === 1 ? 'product is' : 'products are'} no longer in the latest
            research.
          </span>
          <Button variant="ghost" size="sm" onClick={() => clear(missing)}>
            Remove {missing.length === 1 ? 'it' : 'them'}
          </Button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : saved.length === 0 ? (
        <Card>
          <EmptyState
            title="No favorite products yet"
            description="Click the heart on any product to save it here for quick access."
            action={
              <Button variant="soft" size="sm" onClick={() => showView('dashboard')}>
                <Heart />
                Browse trending products
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {saved.map((p) => (
            <ProductCard key={p.id} product={p} niche={nicheById.get(p.nicheId)} />
          ))}
        </div>
      )}
    </div>
  )
}
