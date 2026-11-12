import type { PricingAssumptions, PricingResult } from './types.ts'

/**
 * Default modeled-cost assumptions. They are estimates, not facts — the UI
 * lets users override every value.
 */
export const DEFAULT_PRICING_ASSUMPTIONS: PricingAssumptions = {
  defaultShippingCost: 4.5,
  paymentFeePct: 0.029,
  paymentFeeFixed: 0.3,
  adCostPerOrder: 9,
  targetNetMargin: 0.2,
  minLandedMultiple: 2,
  charmPricing: true,
}

const round2 = (n: number) => Math.round(n * 100) / 100

function charm(price: number): number {
  // Round up to the next x.99 (e.g. 23.41 → 23.99, 24.00 → 24.99).
  return Math.floor(price) + 0.99
}

/**
 * Recommended price = the higher of
 *  (a) the price that leaves `targetNetMargin` after landed cost, payment fees
 *      and ad cost:  P = (landed + ads + feeFixed) / (1 − feePct − targetMargin)
 *  (b) landed cost × `minLandedMultiple` (a common dropshipping floor).
 */
export function calculatePricing(
  sourcingCost: number,
  supplierShipping: number | null,
  assumptions: PricingAssumptions = DEFAULT_PRICING_ASSUMPTIONS,
): PricingResult {
  const a = assumptions
  const shippingEstimated = supplierShipping == null
  const shippingCost = supplierShipping ?? a.defaultShippingCost
  const landedCost = sourcingCost + shippingCost

  const denominator = 1 - a.paymentFeePct - a.targetNetMargin
  const byMargin =
    denominator > 0.05
      ? (landedCost + a.adCostPerOrder + a.paymentFeeFixed) / denominator
      : Number.POSITIVE_INFINITY
  const byMultiple = landedCost * a.minLandedMultiple

  const priceDriver = byMargin >= byMultiple ? 'target-margin' : 'landed-multiple'
  let price = Math.max(byMargin, byMultiple)
  if (!Number.isFinite(price)) price = byMultiple
  if (a.charmPricing) price = charm(price)
  price = round2(price)

  const paymentFees = round2(price * a.paymentFeePct + a.paymentFeeFixed)
  const grossProfit = round2(price - landedCost)
  const netProfit = round2(grossProfit - paymentFees - a.adCostPerOrder)

  return {
    sourcingCost: round2(sourcingCost),
    shippingCost: round2(shippingCost),
    shippingEstimated,
    landedCost: round2(landedCost),
    paymentFees,
    adCost: round2(a.adCostPerOrder),
    recommendedPrice: price,
    grossProfit,
    grossMargin: price > 0 ? grossProfit / price : 0,
    netProfit,
    netMargin: price > 0 ? netProfit / price : 0,
    priceDriver,
    assumptions: { ...a },
  }
}
