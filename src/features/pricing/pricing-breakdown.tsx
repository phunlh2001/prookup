import { Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/misc'
import { cn } from '@/lib/utils'
import type { PricingResult } from '@/types'
import { formatRatio, formatUSD } from '@/utils/format'

function Row({
  label,
  value,
  sign,
  note,
  total,
  sub,
}: {
  label: React.ReactNode
  value: number
  sign?: '−' | '='
  note?: React.ReactNode
  total?: boolean
  sub?: string
}) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-3 py-2 text-[13px]',
        total && 'mt-1 border-t border-dashed pt-2.5 font-semibold text-foreground',
      )}
    >
      <span className={cn('flex items-center gap-1.5', !total && 'text-secondary-foreground')}>
        {label}
        {note}
      </span>
      <span className="tabular flex items-baseline gap-2">
        {sub && <span className="text-xs font-medium text-muted-foreground">{sub}</span>}
        <span>
          {sign === '−' ? '− ' : ''}
          {formatUSD(value)}
        </span>
      </span>
    </div>
  )
}

/** Transparent unit-economics waterfall: price → gross profit → net profit. */
export function PricingBreakdown({ pricing: p }: { pricing: PricingResult }) {
  const a = p.assumptions
  return (
    <div>
      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Sourcing price', formatUSD(p.sourcingCost)],
          ['Recommended price', formatUSD(p.recommendedPrice)],
          ['Gross profit', `${formatUSD(p.grossProfit)}`],
          ['Est. net profit', `${formatUSD(p.netProfit)}`],
        ].map(([k, v], i) => (
          <div key={k} className={cn('rounded-lg px-3 py-2.5', i === 1 ? 'bg-primary-soft' : 'bg-muted/70')}>
            <div className="text-[11px] text-muted-foreground">{k}</div>
            <div className={cn('tabular text-lg font-semibold', i === 1 && 'text-accent-foreground')}>{v}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border px-4 py-1">
        <Row label="Recommended selling price" value={p.recommendedPrice} />
        <Row label="Sourcing cost" value={p.sourcingCost} sign="−" />
        <Row
          label="Shipping to US"
          value={p.shippingCost}
          sign="−"
          note={
            p.shippingEstimated && (
              <Tooltip content="Supplier did not report shipping; using your default shipping assumption.">
                <Badge variant="neutral" className="cursor-help">estimated</Badge>
              </Tooltip>
            )
          }
        />
        <Row label="Gross profit" value={p.grossProfit} total sub={`${formatRatio(p.grossMargin)} gross margin`} />
        <Row
          label="Payment fees"
          value={p.paymentFees}
          sign="−"
          note={<span className="text-xs text-muted-foreground">({formatRatio(a.paymentFeePct)} + {formatUSD(a.paymentFeeFixed)})</span>}
        />
        <Row label="Advertising cost per order" value={p.adCost} sign="−" note={<span className="text-xs text-muted-foreground">(assumed CPA)</span>} />
        <Row label="Estimated net profit" value={p.netProfit} total sub={`${formatRatio(p.netMargin)} net margin`} />
      </div>

      <p className="mt-3 flex gap-2 text-xs text-muted-foreground">
        <Info className="mt-px size-3.5 shrink-0" />
        <span>
          {p.priceDriver === 'target-margin' ? (
            <>
              Price set to reach your {formatRatio(a.targetNetMargin, 0)} target net margin: (landed cost{' '}
              {formatUSD(p.landedCost)} + ads {formatUSD(a.adCostPerOrder)} + fixed fee {formatUSD(a.paymentFeeFixed)}) ÷ (1 −{' '}
              {formatRatio(a.paymentFeePct)} − {formatRatio(a.targetNetMargin, 0)})
            </>
          ) : (
            <>
              Price set by the {a.minLandedMultiple}× landed-cost floor ({formatUSD(p.landedCost)} × {a.minLandedMultiple}), which is
              higher than the target-margin price
            </>
          )}
          {a.charmPricing ? ', rounded up to .99.' : '.'} Gross = price − sourcing − shipping. Net = gross − payment fees − ad
          cost. All values are estimates.
        </span>
      </p>
    </div>
  )
}
