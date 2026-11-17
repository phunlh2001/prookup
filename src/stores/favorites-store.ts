import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STORAGE_KEY = 'prookup-favorites'

interface FavoritesState {
  /** Favorite product ids → ISO time they were added. */
  favorites: Record<string, string>
  toggle: (productId: string) => boolean
  add: (productId: string, addedAt?: string) => void
  remove: (productId: string) => void
  clear: (productIds?: string[]) => void
}

/**
 * Favorite products, saved in this browser (there are no user accounts yet).
 * Ids are stable across research refreshes, so favorites survive daily syncs.
 */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: {},
      toggle: (productId) => {
        const on = !(productId in get().favorites)
        if (on) get().add(productId)
        else get().remove(productId)
        return on
      },
      add: (productId, addedAt = new Date().toISOString()) =>
        set((s) => ({ favorites: { ...s.favorites, [productId]: addedAt } })),
      remove: (productId) =>
        set((s) => {
          const next = { ...s.favorites }
          delete next[productId]
          return { favorites: next }
        }),
      clear: (productIds) =>
        set((s) => {
          if (!productIds) return { favorites: {} }
          const next = { ...s.favorites }
          for (const id of productIds) delete next[id]
          return { favorites: next }
        }),
    }),
    { name: STORAGE_KEY, version: 1 },
  ),
)

// Keep favorites in sync when they change in another tab.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) void useFavoritesStore.persist.rehydrate()
  })
}

export const useIsFavorite = (productId: string) => useFavoritesStore((s) => productId in s.favorites)

export const useFavoriteCount = () => useFavoritesStore((s) => Object.keys(s.favorites).length)
