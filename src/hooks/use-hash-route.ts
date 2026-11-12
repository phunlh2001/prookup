import { useEffect } from 'react'
import { useUiStore } from '@/stores/ui-store'
import { PRODUCT_HASH_PREFIX as PREFIX, readProductHash } from '@/utils/route'


/**
 * Keeps the selected product in the URL (#/product/:id) so detail views are
 * linkable and the browser back button works. The store's initial value is
 * read from the URL synchronously (see ui-store), so no first-render race.
 */
export function useHashRoute() {
  const selected = useUiStore((s) => s.selectedProductId)
  const selectProduct = useUiStore((s) => s.selectProduct)

  // URL → state (back/forward, manual edits).
  useEffect(() => {
    const onHash = () => {
      const id = readProductHash()
      if (id !== useUiStore.getState().selectedProductId) selectProduct(id)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [selectProduct])

  // State → URL.
  useEffect(() => {
    if (readProductHash() === selected) return
    if (selected) window.location.hash = `${PREFIX}${encodeURIComponent(selected)}`
    else history.pushState(null, '', window.location.pathname + window.location.search)
    window.scrollTo({ top: 0 })
  }, [selected])
}
