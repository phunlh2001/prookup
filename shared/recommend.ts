import type { Product } from './types.ts'

/**
 * Rank research results into recommendations. Only products with supplier
 * pricing, a positive modeled net profit and a non-declining trend qualify.
 * The ranking is always derived from data — never a fixed list.
 */
export function recommendProducts(products: Product[], count = 3): Product[] {
  return products
    .filter((p) => p.pricing && p.pricing.netProfit > 0 && p.trend.direction !== 'declining')
    .sort((a, b) => b.score.total - a.score.total || b.trend.growthPct - a.trend.growthPct)
    .slice(0, count)
}
