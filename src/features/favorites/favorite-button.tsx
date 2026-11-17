import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/misc'
import { cn } from '@/lib/utils'
import { useFavoritesStore, useIsFavorite } from '@/stores/favorites-store'
import { useUiStore } from '@/stores/ui-store'

/**
 * One-click favorite toggle. `icon` for cards/rows, `labeled` for the
 * product detail header. Stops propagation so it works inside clickable
 * cards and table rows.
 */
export function FavoriteButton({
  productId,
  productName,
  variant = 'icon',
  className,
}: {
  productId: string
  productName: string
  variant?: 'icon' | 'labeled'
  className?: string
}) {
  const active = useIsFavorite(productId)

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const store = useFavoritesStore.getState()
    const addedAt = store.favorites[productId]
    const added = store.toggle(productId)
    if (added) {
      toast.success('Saved to favorites', {
        id: `fav-${productId}`,
        description: productName,
        action: { label: 'View', onClick: () => useUiStore.getState().showView('favorites') },
      })
    } else {
      toast('Removed from favorites', {
        id: `fav-${productId}`,
        description: productName,
        // Restore with the original date so the favorites order is kept.
        action: { label: 'Undo', onClick: () => useFavoritesStore.getState().add(productId, addedAt) },
      })
    }
  }

  const label = active ? `Remove ${productName} from favorites` : `Add ${productName} to favorites`
  const icon = (
    <Heart
      className={cn(
        'transition-[color,fill,transform] duration-200',
        active ? 'scale-110 fill-rose-500 text-rose-500' : 'text-muted-foreground group-hover/fav:text-rose-500',
      )}
    />
  )

  if (variant === 'labeled') {
    return (
      <Button
        variant="outline"
        onClick={onClick}
        aria-pressed={active}
        aria-label={label}
        className={cn('group/fav', active && 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100', className)}
      >
        {icon}
        {active ? 'Saved to favorites' : 'Save to favorites'}
      </Button>
    )
  }

  return (
    <Tooltip content={active ? 'Remove from favorites' : 'Add to favorites'}>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        aria-label={label}
        className={cn(
          'group/fav relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-rose-50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none active:scale-90 [&_svg]:size-[18px]',
          className,
        )}
      >
        {icon}
      </button>
    </Tooltip>
  )
}
