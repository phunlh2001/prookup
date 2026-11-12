import type { ReactNode } from 'react'
import { emptyAnimation } from '@/assets/lottie/animations'
import { Lottie } from '@/components/lottie'
import { cn } from '@/lib/utils'

export function EmptyState({
  title,
  description,
  action,
  className,
  compact,
}: {
  title: string
  description?: string
  action?: ReactNode
  className?: string
  compact?: boolean
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 text-center', compact ? 'py-6' : 'py-12', className)}>
      <Lottie animationData={emptyAnimation} className={compact ? 'size-20' : 'size-32'} />
      <p className="mt-2 text-sm font-semibold text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
