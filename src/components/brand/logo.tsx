import { logoAnimation } from '@/assets/lottie/animations'
import { Lottie } from '@/components/lottie'
import { cn } from '@/lib/utils'

/**
 * Prookup brand: an animated Lottie mark (a parcel being examined by a
 * magnifying glass) next to the wordmark.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* Brand-coloured tile shows while the Lottie engine lazy-loads. */}
      <span className="size-8 shrink-0 overflow-hidden rounded-[9px] bg-primary">
        <Lottie animationData={logoAnimation} className="size-full" />
      </span>
      <div className="leading-none">
        <span className="text-[17px] font-bold tracking-tight text-foreground">
          Pro<span className="text-primary">okup</span>
        </span>
        <span className="mt-0.5 block text-[10.5px] font-medium tracking-wide text-muted-foreground uppercase">
          Product look-up
        </span>
      </div>
    </div>
  )
}
