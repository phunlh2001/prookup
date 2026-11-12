export const PRODUCT_HASH_PREFIX = '#/product/'

/** Product id from the current URL hash (#/product/:id), or null. */
export function readProductHash(): string | null {
  const h = typeof window === 'undefined' ? '' : window.location.hash
  return h.startsWith(PRODUCT_HASH_PREFIX) ? decodeURIComponent(h.slice(PRODUCT_HASH_PREFIX.length)) : null
}
