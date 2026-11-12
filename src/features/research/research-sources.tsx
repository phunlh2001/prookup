import { ExternalLink, Search, Store, TrendingUp } from 'lucide-react'
import { SimulatedBadge } from '@/components/indicators'
import type { DataSource, Product } from '@/types'
import { formatDateTime } from '@/utils/format'

const KIND = {
  trends: { icon: TrendingUp, label: 'Search interest, regions, related queries' },
  search: { icon: Search, label: 'Competition signal from US search results' },
  supplier: { icon: Store, label: 'Sourcing price, availability, images' },
} as const

export function ResearchSources({ product }: { product: Product }) {
  const sources = [product.trend.source, product.competition?.source, product.supplier?.source].filter(
    (s): s is DataSource => !!s,
  )
  return (
    <ul className="divide-y">
      {sources.map((s) => {
        const k = KIND[s.kind]
        return (
          <li key={s.kind} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <k.icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1 text-[13px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-foreground">{s.label}</span>
                {s.simulated && <SimulatedBadge />}
              </div>
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Updated {formatDateTime(s.fetchedAt)}</p>
            </div>
            {s.url && (
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Open <ExternalLink className="size-3" />
              </a>
            )}
          </li>
        )
      })}
      {!product.competition && (
        <li className="py-3 text-xs text-muted-foreground last:pb-0">
          Competition data unavailable. It is excluded from the score rather than guessed.
        </li>
      )}
    </ul>
  )
}
