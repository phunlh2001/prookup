import { useState, type FormEvent } from 'react'
import { ExternalLink, Link2, Plus, Search, Store, TrendingUp, X } from 'lucide-react'
import { SimulatedBadge } from '@/components/indicators'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCustomResearchStore, useCustomSources } from '@/stores/custom-research-store'
import type { DataSource, Product } from '@/types'
import { formatDateTime } from '@/utils/format'

const KIND = {
  trends: { icon: TrendingUp, label: 'Search interest, regions, related queries' },
  search: { icon: Search, label: 'Competition signal from US search results' },
  supplier: { icon: Store, label: 'Sourcing price, availability, images' },
} as const

/** Accepts "aliexpress.com/item/1" as well as full URLs; only http(s). */
function normalizeUrl(raw: string): URL | null {
  const value = raw.trim()
  if (!value) return null
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (!url.hostname.includes('.')) return null
    return url
  } catch {
    return null
  }
}

const hostLabel = (url: URL) => url.hostname.replace(/^www\./, '')

function AddSourceForm({ productId }: { productId: string }) {
  const addSource = useCustomResearchStore((s) => s.addSource)
  const [url, setUrl] = useState('')
  const [label, setLabel] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const parsed = normalizeUrl(url)
    if (!parsed) {
      setError('Enter a valid http(s) link, e.g. https://www.aliexpress.com/item/…')
      return
    }
    addSource(productId, { url: parsed.href, label: label.trim() || hostLabel(parsed) })
    setUrl('')
    setLabel('')
    setError(null)
  }

  return (
    <form onSubmit={submit} className="space-y-1.5" noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            if (error) setError(null)
          }}
          placeholder="Link, e.g. https://www.aliexpress.com/item/…"
          aria-label="Source link"
          aria-invalid={!!error || undefined}
          className="h-9 text-[13px] sm:flex-[2]"
        />
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Name (optional), e.g. AliExpress"
          aria-label="Source name"
          maxLength={60}
          className="h-9 text-[13px] sm:flex-1"
        />
        <Button type="submit" size="sm" className="h-9" disabled={!url.trim()}>
          <Plus />
          Add source
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  )
}

export function ResearchSources({ product }: { product: Product }) {
  const custom = useCustomSources(product.id)
  const removeSource = useCustomResearchStore((s) => s.removeSource)
  const sources = [product.trend.source, product.competition?.source, product.supplier?.source].filter(
    (s): s is DataSource => !!s,
  )
  // Users can add their own links when the supplier provider found no match.
  const canAdd = !product.supplier

  return (
    <div className="space-y-4">
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
        {custom.map((s) => (
          <li key={s.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-accent-foreground">
              <Link2 className="size-4" />
            </span>
            <div className="min-w-0 flex-1 text-[13px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-foreground">{s.label}</span>
                <Badge variant="neutral">Added by you</Badge>
              </div>
              <p className="truncate text-xs text-muted-foreground" title={s.url}>
                {s.url}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">Added {formatDateTime(s.addedAt)}</p>
            </div>
            <div className="flex items-center gap-1">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Open <ExternalLink className="size-3" />
              </a>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${s.label}`}
                onClick={() => removeSource(product.id, s.id)}
              >
                <X />
              </Button>
            </div>
          </li>
        ))}
        {!product.competition && (
          <li className="py-3 text-xs text-muted-foreground last:pb-0">
            Competition data unavailable. It is excluded from the score rather than guessed.
          </li>
        )}
      </ul>

      {canAdd && (
        <div className="rounded-lg border border-dashed bg-muted/30 p-4">
          <p className="mb-2.5 text-[13px] text-muted-foreground">
            Not found on the supplier provider. Add links where you found this product (AliExpress, Amazon, Temu, …). They
            are saved only in this browser.
          </p>
          <AddSourceForm productId={product.id} />
        </div>
      )}
    </div>
  )
}
