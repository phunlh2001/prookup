import { create } from 'zustand'
import { readRoute, type MainView } from '@/utils/route'
import type { NicheFilter, ProductFilters, ProductSort, ViewMode } from '@/types'

export const DEFAULT_PRODUCT_FILTERS: ProductFilters = {
  nicheId: 'all',
  direction: 'all',
  minScore: 0,
  minMargin: 0,
  priceRange: [0, 200],
}

interface UiState {
  search: string
  nicheFilter: NicheFilter
  productFilters: ProductFilters
  sort: ProductSort
  viewMode: ViewMode
  /** Page shown in the main area when no product is open. */
  view: MainView
  selectedProductId: string | null
  mobileSidebarOpen: boolean

  setSearch: (q: string) => void
  setNicheFilter: (f: NicheFilter) => void
  setProductFilter: <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => void
  resetProductFilters: () => void
  setSort: (s: ProductSort) => void
  setViewMode: (v: ViewMode) => void
  /** Opens the research detail for a product (null = back to dashboard). */
  selectProduct: (id: string | null) => void
  /** Switch the main area to a page (closes any open product). */
  showView: (view: MainView) => void
  /** Jump to the product explorer filtered to a niche. */
  focusNiche: (nicheId: string) => void
  setMobileSidebarOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  search: '',
  nicheFilter: 'all',
  productFilters: DEFAULT_PRODUCT_FILTERS,
  sort: 'opportunity',
  viewMode: 'grid',
  ...(() => {
    const r = readRoute()
    return { view: r.view, selectedProductId: r.productId }
  })(),
  mobileSidebarOpen: false,

  setSearch: (search) => set({ search }),
  setNicheFilter: (nicheFilter) => set({ nicheFilter }),
  setProductFilter: (key, value) => set((s) => ({ productFilters: { ...s.productFilters, [key]: value } })),
  resetProductFilters: () => set({ productFilters: DEFAULT_PRODUCT_FILTERS, search: '' }),
  setSort: (sort) => set({ sort }),
  setViewMode: (viewMode) => set({ viewMode }),
  selectProduct: (selectedProductId) => set({ selectedProductId, mobileSidebarOpen: false }),
  showView: (view) => set({ view, selectedProductId: null, mobileSidebarOpen: false }),
  focusNiche: (nicheId) =>
    set((s) => ({
      view: 'dashboard',
      selectedProductId: null,
      mobileSidebarOpen: false,
      productFilters: { ...s.productFilters, nicheId },
    })),
  setMobileSidebarOpen: (mobileSidebarOpen) => set({ mobileSidebarOpen }),
}))

/** Show the product explorer filtered to a niche and scroll to it. */
export function showNicheProducts(nicheId: string) {
  useUiStore.getState().focusNiche(nicheId)
  // Wait for the dashboard to render (and the route's scroll reset) first.
  setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
}
