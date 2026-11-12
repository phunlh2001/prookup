import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function SectionHeader({
  title,
  description,
  actions,
  className,
  id,
}: {
  title: string
  description?: ReactNode
  actions?: ReactNode
  className?: string
  id?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-3', className)}>
      <div>
        <h2 id={id} className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
