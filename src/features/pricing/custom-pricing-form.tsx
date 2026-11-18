import { Info, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  EMPTY_PRICING_DRAFT,
  parseCustomPricing,
  useCustomPricingDraft,
  useCustomResearchStore,
} from '@/stores/custom-research-store'
import type { PricingResult } from '@/types'
import { formatUSD } from '@/utils/format'
import { PricingBreakdown } from './pricing-breakdown'

function MoneyField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  invalid,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  required?: boolean
}) {
  return (
    <label className="space-y-1.5">
      <span className="block text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
      <div className="relative">
        <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-[13px] text-muted-foreground">$</span>
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.01}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange(e.target.value)}
          className={cn('tabular h-9 pl-6 text-[13px]', invalid && 'border-destructive focus-visible:ring-destructive/30')}
        />
      </div>
    </label>
  )
}

const isBadAmount = (raw: string) => raw.trim() !== '' && !(Number(raw) >= 0)

/**
 * Lets the user enter their own sourcing price, sell price and shipping for a
 * product the supplier provider could not match. Saved per browser; profit is
 * calculated live by the shared pricing engine (via useResearchData).
 */
export function CustomPricingForm({
  productId,
  pricing,
  defaultShipping,
}: {
  productId: string
  /** Pricing computed from the saved entry, or null while incomplete. */
  pricing: PricingResult | null
  defaultShipping: number
}) {
  const draft = useCustomPricingDraft(productId)
  const setPricing = useCustomResearchStore((s) => s.setPricing)
  const clearPricing = useCustomResearchStore((s) => s.clearPricing)
  const d = draft ?? { ...EMPTY_PRICING_DRAFT, updatedAt: '' }
  const update = (patch: Parameters<typeof setPricing>[1]) => setPricing(productId, patch)

  const sellInvalid = isBadAmount(d.sellPrice) || (d.sellPrice.trim() !== '' && Number(d.sellPrice) <= 0)
  const complete = parseCustomPricing(draft) != null

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-dashed bg-muted/30 p-4">
        <p className="mb-3 flex gap-2 text-[13px] text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <span>
            No supplier offer was found, so Prookup does not estimate a price. If you sourced it elsewhere (e.g.
            AliExpress), enter your own prices to see the profit. They are saved only in this browser.
          </span>
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <MoneyField
            label="Sourcing price"
            required
            value={d.sourcingCost}
            placeholder="0.00"
            invalid={isBadAmount(d.sourcingCost)}
            onChange={(v) => update({ sourcingCost: v })}
          />
          <MoneyField
            label="Sell price"
            required
            value={d.sellPrice}
            placeholder="0.00"
            invalid={sellInvalid}
            onChange={(v) => update({ sellPrice: v })}
          />
          <div className="space-y-1.5">
            <MoneyField
              label="Shipping cost"
              value={d.freeShipping ? '0' : d.shippingCost}
              placeholder={`${defaultShipping.toFixed(2)} (default)`}
              disabled={d.freeShipping}
              invalid={!d.freeShipping && isBadAmount(d.shippingCost)}
              onChange={(v) => update({ shippingCost: v })}
            />
            <label className="flex items-center gap-2 text-xs text-secondary-foreground">
              <input
                type="checkbox"
                checked={d.freeShipping}
                onChange={(e) => update({ freeShipping: e.target.checked })}
                className="size-3.5 accent-primary"
              />
              Free shipping
            </label>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {complete
              ? 'Saved. Profit updates as you type.'
              : `Enter a sourcing and sell price to calculate profit. Empty shipping uses your default (${formatUSD(defaultShipping)}).`}
          </p>
          {draft && (
            <Button variant="ghost" size="sm" onClick={() => clearPricing(productId)}>
              <Trash2 />
              Clear
            </Button>
          )}
        </div>
      </div>

      {complete && pricing && <PricingBreakdown pricing={pricing} />}
    </div>
  )
}
