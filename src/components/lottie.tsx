import { lazy, Suspense } from 'react'
import { cn } from '@/lib/utils'

// The Lottie engine is large; load it lazily so it never blocks first paint.
// LottieLight = SVG renderer without the expression engine (our animations use none).
const LottiePlayer = lazy(() => import('lottie-react').then((m) => ({ default: m.LottieLight })))

export function Lottie({
  animationData,
  className,
  loop = true,
  label,
}: {
  animationData: object
  className?: string
  loop?: boolean
  /** Accessible description; omit for purely decorative animations. */
  label?: string
}) {
  return (
    <div
      className={cn('pointer-events-none select-none', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Suspense fallback={null}>
        <LottiePlayer src={animationData} autoplay loop={loop} className="size-full" />
      </Suspense>
    </div>
  )
}
