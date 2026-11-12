import { useMemo } from 'react'
import { calculatePricing } from '@shared/pricing.ts'
import { recommendProducts } from '@shared/recommend.ts'
import { scoreProduct } from '@shared/scoring.ts'
import { usePricingStore } from '@/stores/pricing-store'
import { useResearchStore } from '@/stores/research-store'
import type { Niche, Product } from '@/types'

export const isSimulatedProduct = (p: Product) =>
  [p.trend.source, p.supplier?.source, p.competition?.source].some((s) => s?.simulated)

/**
 * Research data with pricing + opportunity scores recomputed from the user's
 * pricing assumptions, using the same shared engines as the server.
 */
export function useResearchData() {
  const snapshot = useResearchStore((s) => s.snapshot)
  const assumptions = usePricingStore((s) => s.assumptions)

  return useMemo(() => {
    if (!snapshot) {
      return { products: [] as Product[], niches: [] as Niche[], recommended: [] as Product[], nicheById: new Map<string, Niche>() }
    }
    const products = snapshot.products.map((p) => {
      const pricing = p.supplier
        ? calculatePricing(p.supplier.sourcingCost, p.supplier.shippingCost, assumptions)
        : null
      const score = scoreProduct({
        trend: p.trend,
        pricing,
        competition: p.competition,
        simulated: isSimulatedProduct(p),
      })
      return { ...p, pricing, score }
    })
    const niches = snapshot.niches.map((n) => ({
      ...n,
      productCount: products.filter((p) => p.nicheId === n.id && p.score.total >= 45).length,
    }))
    return {
      products,
      niches,
      recommended: recommendProducts(products),
      nicheById: new Map(niches.map((n) => [n.id, n])),
    }
  }, [snapshot, assumptions])
}
