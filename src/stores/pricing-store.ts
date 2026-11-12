import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_PRICING_ASSUMPTIONS } from '@shared/pricing.ts'
import type { PricingAssumptions } from '@/types'

interface PricingState {
  assumptions: PricingAssumptions
  setAssumption: <K extends keyof PricingAssumptions>(key: K, value: PricingAssumptions[K]) => void
  reset: () => void
}

/** User-adjustable pricing assumptions (persisted per browser). */
export const usePricingStore = create<PricingState>()(
  persist(
    (set) => ({
      assumptions: DEFAULT_PRICING_ASSUMPTIONS,
      setAssumption: (key, value) => set((s) => ({ assumptions: { ...s.assumptions, [key]: value } })),
      reset: () => set({ assumptions: DEFAULT_PRICING_ASSUMPTIONS }),
    }),
    {
      name: 'prookup-pricing',
      merge: (persisted, current) => ({
        ...current,
        assumptions: {
          ...DEFAULT_PRICING_ASSUMPTIONS,
          ...((persisted as Partial<PricingState>)?.assumptions ?? {}),
        },
      }),
    },
  ),
)

export const isDefaultAssumptions = (a: PricingAssumptions) =>
  (Object.keys(DEFAULT_PRICING_ASSUMPTIONS) as (keyof PricingAssumptions)[]).every(
    (k) => a[k] === DEFAULT_PRICING_ASSUMPTIONS[k],
  )
