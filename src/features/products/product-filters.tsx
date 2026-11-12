import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { DEFAULT_PRODUCT_FILTERS, useUiStore } from '@/stores/ui-store'
import type { Niche, TrendDirection } from '@/types'

function Field({ label, value, children }: { label: string; value?: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        {value && <span className="tabular font-semibold text-foreground">{value}</span>}
      </div>
      {children}
    </div>
  )
}

export function ProductFiltersBar({ niches }: { niches: Niche[] }) {
  const filters = useUiStore((s) => s.productFilters)
  const set = useUiStore((s) => s.setProductFilter)
  const reset = useUiStore((s) => s.resetProductFilters)
  const search = useUiStore((s) => s.search)
  const dirty = JSON.stringify(filters) !== JSON.stringify(DEFAULT_PRODUCT_FILTERS) || !!search
  const [lo, hi] = filters.priceRange

  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border bg-card p-4 shadow-card sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1.2fr_auto] lg:items-end">
      <Field label="Niche">
        <Select value={filters.nicheId} onValueChange={(v) => set('nicheId', v)}>
          <SelectTrigger aria-label="Niche">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All niches</SelectItem>
            {niches.map((n) => (
              <SelectItem key={n.id} value={n.id}>
                {n.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Trend direction">
        <Select value={filters.direction} onValueChange={(v) => set('direction', v as TrendDirection | 'all')}>
          <SelectTrigger aria-label="Trend direction">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any trend</SelectItem>
            <SelectItem value="rising">Rising</SelectItem>
            <SelectItem value="stable">Stable</SelectItem>
            <SelectItem value="declining">Declining</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Min. opportunity score" value={String(filters.minScore)}>
        <Slider
          value={[filters.minScore]}
          onValueChange={([v]) => set('minScore', v)}
          min={0}
          max={100}
          step={5}
          aria-label="Minimum opportunity score"
          className="h-9"
        />
      </Field>
      <Field label="Min. net margin" value={`${Math.round(filters.minMargin * 100)}%`}>
        <Slider
          value={[filters.minMargin * 100]}
          onValueChange={([v]) => set('minMargin', v / 100)}
          min={0}
          max={40}
          step={5}
          aria-label="Minimum estimated net margin"
          className="h-9"
        />
      </Field>
      <Field label="Selling price" value={`$${lo} – ${hi >= 200 ? '$200+' : `$${hi}`}`}>
        <Slider
          value={filters.priceRange}
          onValueChange={(v) => set('priceRange', [v[0], v[1]])}
          min={0}
          max={200}
          step={5}
          minStepsBetweenThumbs={1}
          aria-label="Selling price range"
          className="h-9"
        />
      </Field>
      <Button variant="ghost" size="sm" onClick={reset} disabled={!dirty} className="justify-self-start lg:mb-0.5">
        <RotateCcw />
        Reset
      </Button>
    </div>
  )
}
