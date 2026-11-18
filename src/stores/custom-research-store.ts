import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserPricingInput, UserResearchSource } from '@/types'

const STORAGE_KEY = 'prookup-custom-research'

/**
 * Raw form values for a product's user-entered pricing. Kept as strings so a
 * half-typed draft survives reloads; parse with `parseCustomPricing`.
 */
export interface CustomPricingDraft {
  sourcingCost: string
  sellPrice: string
  shippingCost: string
  freeShipping: boolean
  updatedAt: string
}

export const EMPTY_PRICING_DRAFT: Omit<CustomPricingDraft, 'updatedAt'> = {
  sourcingCost: '',
  sellPrice: '',
  shippingCost: '',
  freeShipping: false,
}

interface CustomResearchState {
  /** Product id → the user's own pricing for products without a supplier offer. */
  pricing: Record<string, CustomPricingDraft>
  /** Product id → research links the user added (AliExpress, Amazon, …). */
  sources: Record<string, UserResearchSource[]>
  setPricing: (productId: string, patch: Partial<Omit<CustomPricingDraft, 'updatedAt'>>) => void
  clearPricing: (productId: string) => void
  addSource: (productId: string, source: Pick<UserResearchSource, 'label' | 'url'>) => void
  removeSource: (productId: string, sourceId: string) => void
}

/**
 * Custom pricing and research links, saved only in this browser. They belong
 * to the person using it and are never sent to the server.
 */
export const useCustomResearchStore = create<CustomResearchState>()(
  persist(
    (set) => ({
      pricing: {},
      sources: {},
      setPricing: (productId, patch) =>
        set((s) => ({
          pricing: {
            ...s.pricing,
            [productId]: {
              ...EMPTY_PRICING_DRAFT,
              ...s.pricing[productId],
              ...patch,
              updatedAt: new Date().toISOString(),
            },
          },
        })),
      clearPricing: (productId) =>
        set((s) => {
          const next = { ...s.pricing }
          delete next[productId]
          return { pricing: next }
        }),
      addSource: (productId, { label, url }) =>
        set((s) => ({
          sources: {
            ...s.sources,
            [productId]: [
              ...(s.sources[productId] ?? []),
              { id: crypto.randomUUID(), label, url, addedAt: new Date().toISOString() },
            ],
          },
        })),
      removeSource: (productId, sourceId) =>
        set((s) => {
          const list = (s.sources[productId] ?? []).filter((x) => x.id !== sourceId)
          const next = { ...s.sources }
          if (list.length) next[productId] = list
          else delete next[productId]
          return { sources: next }
        }),
    }),
    { name: STORAGE_KEY, version: 1 },
  ),
)

// Keep in sync when edited in another tab.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) void useCustomResearchStore.persist.rehydrate()
  })
}

const toAmount = (raw: string): number | null => {
  if (raw.trim() === '') return null
  const n = Number(raw)
  return Number.isFinite(n) && n >= 0 ? n : null
}

/**
 * Turn a draft into pricing input, or null while it is incomplete. Sourcing and
 * sell price are required; shipping is 0 when free, the default assumption
 * when left empty.
 */
export function parseCustomPricing(draft: CustomPricingDraft | undefined): UserPricingInput | null {
  if (!draft) return null
  const sourcingCost = toAmount(draft.sourcingCost)
  const sellPrice = toAmount(draft.sellPrice)
  if (sourcingCost == null || sellPrice == null || sellPrice <= 0) return null
  if (!draft.freeShipping && draft.shippingCost.trim() !== '' && toAmount(draft.shippingCost) == null) return null
  return {
    sourcingCost,
    sellPrice,
    shippingCost: draft.freeShipping ? 0 : toAmount(draft.shippingCost),
  }
}

export const useCustomPricingDraft = (productId: string) => useCustomResearchStore((s) => s.pricing[productId])

const NO_SOURCES: UserResearchSource[] = []
export const useCustomSources = (productId: string) => useCustomResearchStore((s) => s.sources[productId] ?? NO_SOURCES)
