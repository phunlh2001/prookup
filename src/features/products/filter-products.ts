import type { Niche, Product, ProductFilters, ProductSort } from '@/types'

export function filterProducts(
  products: Product[],
  filters: ProductFilters,
  search: string,
  nicheById: Map<string, Niche>,
): Product[] {
  const q = search.trim().toLowerCase()
  return products.filter((p) => {
    if (q) {
      const hay = `${p.name} ${p.keyword} ${nicheById.get(p.nicheId)?.name ?? ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (filters.nicheId !== 'all' && p.nicheId !== filters.nicheId) return false
    if (filters.direction !== 'all' && p.trend.direction !== filters.direction) return false
    if (p.score.total < filters.minScore) return false
    if (filters.minMargin > 0 && (p.pricing?.netMargin ?? -1) < filters.minMargin) return false
    const price = p.pricing?.recommendedPrice
    const [lo, hi] = filters.priceRange
    if (price != null && (price < lo || (hi < 200 && price > hi))) return false
    return true
  })
}

export function sortProducts(products: Product[], sort: ProductSort): Product[] {
  const list = [...products]
  switch (sort) {
    case 'growth':
      return list.sort((a, b) => b.trend.growthPct - a.trend.growthPct)
    case 'profit':
      return list.sort((a, b) => (b.pricing?.netProfit ?? -Infinity) - (a.pricing?.netProfit ?? -Infinity))
    case 'recent':
      return list.sort((a, b) => b.discoveredAt.localeCompare(a.discoveredAt) || b.score.total - a.score.total)
    default:
      return list.sort((a, b) => b.score.total - a.score.total)
  }
}
