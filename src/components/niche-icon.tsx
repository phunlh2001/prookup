import { useState } from 'react'
import { Box, CookingPot, Dumbbell, House, PawPrint, Sparkles, Tent, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const ICONS: Record<string, LucideIcon> = { PawPrint, CookingPot, Sparkles, Dumbbell, Tent, House }

/** Soft per-niche tints so niches are recognisable at a glance (always paired with the name). */
const TINTS: Record<string, string> = {
  'pet-accessories': 'bg-amber-50 text-amber-700',
  'home-kitchen': 'bg-sky-50 text-sky-700',
  'beauty-personal-care': 'bg-pink-50 text-pink-700',
  'fitness-wellness': 'bg-emerald-50 text-emerald-700',
  'outdoor-camping': 'bg-lime-50 text-lime-700',
  'smart-home': 'bg-violet-50 text-violet-700',
}

export function NicheIcon({ icon, nicheId, className }: { icon?: string; nicheId: string; className?: string }) {
  const Icon = (icon && ICONS[icon]) || Box
  return (
    <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', TINTS[nicheId] ?? 'bg-muted text-muted-foreground', className)}>
      <Icon className="size-[55%]" strokeWidth={1.8} />
    </span>
  )
}

/**
 * Product image from supplier data, or a niche-tinted placeholder when no
 * image is available (demo data never pretends to have real photos).
 */
export function ProductThumb({
  src,
  name,
  icon,
  nicheId,
  className,
}: {
  src?: string
  name: string
  icon?: string
  nicheId: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn('size-10 shrink-0 rounded-lg border bg-muted object-cover', className)}
      />
    )
  }
  return <NicheIcon icon={icon} nicheId={nicheId} className={cn('size-10 rounded-lg', className)} />
}
