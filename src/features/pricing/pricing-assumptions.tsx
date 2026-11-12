import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isDefaultAssumptions, usePricingStore } from '@/stores/pricing-store'
import type { PricingAssumptions } from '@/types'

type NumericKey = Exclude<keyof PricingAssumptions, 'charmPricing'>

const FIELDS: { key: NumericKey; label: string; unit: '$' | '%' | '×'; step: number; min: number; max: number }[] = [
  { key: 'adCostPerOrder', label: 'Ad cost per order (CPA)', unit: '$', step: 0.5, min: 0, max: 100 },
  { key: 'targetNetMargin', label: 'Target net margin', unit: '%', step: 1, min: 0, max: 70 },
  { key: 'defaultShippingCost', label: 'Default shipping (if unknown)', unit: '$', step: 0.25, min: 0, max: 50 },
  { key: 'paymentFeePct', label: 'Payment fee', unit: '%', step: 0.1, min: 0, max: 15 },
  { key: 'paymentFeeFixed', label: 'Payment fixed fee', unit: '$', step: 0.05, min: 0, max: 5 },
  { key: 'minLandedMultiple', label: 'Min. price ÷ landed cost', unit: '×', step: 0.1, min: 1, max: 6 },
]

/** Pricing assumptions: global, so every price in the app updates. */
export function PricingAssumptionsPanel() {
  const { assumptions, setAssumption, reset } = usePricingStore()

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map((f) => {
          const raw = assumptions[f.key]
          const shown = f.unit === '%' ? Math.round(raw * 1000) / 10 : raw
          return (
            <label key={f.key} className="space-y-1.5">
              <span className="block text-xs font-medium text-muted-foreground">{f.label}</span>
              <div className="relative">
                {f.unit === '$' && <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-[13px] text-muted-foreground">$</span>}
                <Input
                  type="number"
                  inputMode="decimal"
                  value={shown}
                  step={f.step}
                  min={f.min}
                  max={f.max}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    if (!Number.isFinite(v)) return
                    const clamped = Math.min(f.max, Math.max(f.min, v))
                    setAssumption(f.key, f.unit === '%' ? clamped / 100 : clamped)
                  }}
                  className={`tabular h-8 text-[13px] ${f.unit === '$' ? 'pl-6' : ''} ${f.unit !== '$' ? 'pr-7' : ''}`}
                />
                {f.unit !== '$' && (
                  <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[13px] text-muted-foreground">{f.unit}</span>
                )}
              </div>
            </label>
          )
        })}
      </div>
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-[13px] text-secondary-foreground">
          <input
            type="checkbox"
            checked={assumptions.charmPricing}
            onChange={(e) => setAssumption('charmPricing', e.target.checked)}
            className="size-4 rounded accent-[var(--primary)]"
          />
          Round prices to .99
        </label>
        <Button variant="ghost" size="sm" onClick={reset} disabled={isDefaultAssumptions(assumptions)}>
          <RotateCcw />
          Defaults
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Applies to every price, profit and score in Prookup and is saved in this browser.
      </p>
    </div>
  )
}
