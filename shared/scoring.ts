import type {
  CompetitionSignal,
  ConfidenceLevel,
  OpportunityLevel,
  OpportunityScore,
  PricingResult,
  ScoreFactor,
  ScoreFactorKey,
  TrendSignal,
} from './types.ts'

/** Base weights; must sum to 1. Missing factors have their weight redistributed. */
export interface ScoringConfig {
  weights: Record<ScoreFactorKey, number>
  /** Gross profit (USD) that maps to a factor value of 100. */
  grossProfitCeiling: number
  /** Net margin that maps to a factor value of 100. */
  netMarginCeiling: number
  /** Growth % that maps to 100 (and its negative to 0). */
  growthCeiling: number
}

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  weights: {
    momentum: 0.18,
    demand: 0.18,
    growth: 0.16,
    grossProfit: 0.14,
    margin: 0.14,
    competition: 0.12,
    confidence: 0.08,
  },
  grossProfitCeiling: 35,
  netMarginCeiling: 0.3,
  growthCeiling: 80,
}

const LABELS: Record<ScoreFactorKey, string> = {
  momentum: 'Trend momentum',
  demand: 'Search demand',
  growth: 'Market growth',
  grossProfit: 'Gross profit',
  margin: 'Net margin',
  competition: 'Competition (inverse)',
  confidence: 'Data confidence',
}

const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n))

export function opportunityLevel(score: number): OpportunityLevel {
  if (score >= 80) return 'excellent'
  if (score >= 65) return 'promising'
  if (score >= 45) return 'moderate'
  return 'low'
}

export const OPPORTUNITY_LABELS: Record<OpportunityLevel, string> = {
  excellent: 'Excellent Opportunity',
  promising: 'Promising',
  moderate: 'Moderate',
  low: 'Low Potential',
}

/** Confidence reflects how much of the input is real, complete data. */
export function dataConfidence(input: ScoreInput): { value: number; level: ConfidenceLevel } {
  let value = 0
  value += input.trend.series.length >= 40 ? 30 : input.trend.series.length >= 12 ? 18 : 5
  // User-entered prices count, but less than verified supplier data.
  if (input.pricing?.priceDriver === 'user-entered') value += 12
  else if (input.pricing) value += input.pricing.shippingEstimated ? 18 : 25
  value += input.competition ? 20 : 0
  value += input.trend.regions.length > 0 ? 10 : 0
  value += input.trend.relatedQueries.length > 0 ? 15 : 0
  // Simulated data can never be "high confidence".
  if (input.simulated) value = Math.min(value, 40)
  value = clamp(value)
  const level: ConfidenceLevel = value >= 75 ? 'high' : value >= 45 ? 'medium' : 'low'
  return { value, level }
}

export interface ScoreInput {
  trend: TrendSignal
  pricing: PricingResult | null
  competition: CompetitionSignal | null
  simulated: boolean
}

export function scoreProduct(
  input: ScoreInput,
  config: ScoringConfig = DEFAULT_SCORING_CONFIG,
): OpportunityScore {
  const { trend, pricing, competition } = input
  const confidence = dataConfidence(input)

  const raw: Record<ScoreFactorKey, number | null> = {
    momentum: clamp(50 + trend.momentum / 2),
    demand: clamp(trend.interestScore),
    growth: clamp(50 + (trend.growthPct / config.growthCeiling) * 50),
    grossProfit: pricing ? clamp((pricing.grossProfit / config.grossProfitCeiling) * 100) : null,
    margin: pricing ? clamp((pricing.netMargin / config.netMarginCeiling) * 100) : null,
    competition: competition ? clamp(100 - competition.index) : null,
    confidence: confidence.value,
  }

  const keys = Object.keys(config.weights) as ScoreFactorKey[]
  const availableWeight = keys.reduce(
    (sum, k) => (raw[k] == null ? sum : sum + config.weights[k]),
    0,
  )

  const factors: ScoreFactor[] = keys.map((key) => {
    const value = raw[key]
    const available = value != null
    return {
      key,
      label: LABELS[key],
      value: available ? Math.round(value) : 0,
      weight: available && availableWeight > 0 ? config.weights[key] / availableWeight : 0,
      available,
    }
  })

  const total = Math.round(factors.reduce((s, f) => s + f.value * f.weight, 0))
  return {
    total,
    level: opportunityLevel(total),
    confidence: confidence.level,
    factors,
  }
}
