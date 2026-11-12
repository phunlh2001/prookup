import type { OpportunityScore } from '@/types'

/** How each factor contributes to the opportunity score. */
export function ScoreBreakdown({ score }: { score: OpportunityScore }) {
  return (
    <div className="space-y-2.5">
      {score.factors.map((f) => (
        <div key={f.key} className="text-[13px]">
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <span className={f.available ? 'text-secondary-foreground' : 'text-muted-foreground'}>{f.label}</span>
            <span className="tabular text-xs text-muted-foreground">
              {f.available ? (
                <>
                  <span className="font-semibold text-foreground">{f.value}</span> × {Math.round(f.weight * 100)}%
                </>
              ) : (
                'no reliable data · excluded'
              )}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            {f.available && <div className="h-full rounded-full bg-primary/80" style={{ width: `${f.value}%` }} />}
          </div>
        </div>
      ))}
      <p className="pt-1 text-xs text-muted-foreground">
        Score = Σ factor × weight. Weights of unavailable factors are redistributed. Scores are research estimates, not
        guaranteed business outcomes.
      </p>
    </div>
  )
}
