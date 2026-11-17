import { useEffect } from 'react'
import { useUiStore } from '@/stores/ui-store'
import { readRoute, routeHash } from '@/utils/route'

/**
 * Keeps the current page in the URL hash (#/favorites, #/product/:id) so
 * pages are linkable and the browser back button works. The store's initial
 * value is read from the URL synchronously (see ui-store), so no first-render race.
 */
export function useHashRoute() {
  const view = useUiStore((s) => s.view)
  const productId = useUiStore((s) => s.selectedProductId)

  // URL → state (back/forward, manual edits).
  useEffect(() => {
    const onHash = () => {
      const route = readRoute()
      const s = useUiStore.getState()
      if (route.productId !== s.selectedProductId) {
        // Opening a product keeps the page it was opened from (for "Back").
        if (route.productId) s.selectProduct(route.productId)
        else s.showView(route.view)
      } else if (!route.productId && route.view !== s.view) {
        s.showView(route.view)
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // State → URL.
  useEffect(() => {
    const target = routeHash({ view, productId })
    if (window.location.hash === target) return
    if (target) window.location.hash = target
    else history.pushState(null, '', window.location.pathname + window.location.search)
    window.scrollTo({ top: 0 })
  }, [view, productId])
}
