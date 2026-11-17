/** Top-level pages shown in the main area (a product detail can open over either). */
export type MainView = 'dashboard' | 'favorites'

export interface Route {
  view: MainView
  productId: string | null
}

const PRODUCT_PREFIX = '#/product/'
const FAVORITES_HASH = '#/favorites'

/**
 * Parse the URL hash:
 *   ""                → dashboard
 *   "#/favorites"     → favorites page
 *   "#/product/:id"   → product detail
 */
export function readRoute(): Route {
  const h = typeof window === 'undefined' ? '' : window.location.hash
  if (h.startsWith(PRODUCT_PREFIX)) {
    return { view: 'dashboard', productId: decodeURIComponent(h.slice(PRODUCT_PREFIX.length)) }
  }
  return { view: h === FAVORITES_HASH ? 'favorites' : 'dashboard', productId: null }
}

/** The hash that represents a route ("" for the dashboard). */
export function routeHash({ view, productId }: Route): string {
  if (productId) return `${PRODUCT_PREFIX}${encodeURIComponent(productId)}`
  return view === 'favorites' ? FAVORITES_HASH : ''
}
