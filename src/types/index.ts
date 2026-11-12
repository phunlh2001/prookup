export type * from '@shared/types.ts'

import type { TrendDirection } from '@shared/types.ts'

export type ViewMode = 'grid' | 'list'

export type NicheFilter = 'all' | TrendDirection | 'top-growth'

export type ProductSort = 'growth' | 'opportunity' | 'profit' | 'recent'

export interface ProductFilters {
  nicheId: string
  direction: TrendDirection | 'all'
  minScore: number
  /** Minimum estimated net margin, 0–1. */
  minMargin: number
  /** Recommended selling price range in USD. */
  priceRange: [number, number]
}
