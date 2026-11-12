import { AlertTriangle, CheckCircle2, Clock, RefreshCw } from 'lucide-react'
import { syncAnimation } from '@/assets/lottie/animations'
import { Lottie } from '@/components/lottie'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/misc'
import { useNow } from '@/hooks/use-now'
import { useRefresh } from '@/hooks/use-refresh'
import { useResearchStore } from '@/stores/research-store'
import { formatDateTime, formatRelative } from '@/utils/format'

/** Last sync timestamp, sync state, and the manual refresh button. */
export function SyncIndicator() {
  const status = useResearchStore((s) => s.status)
  const { refresh, pending } = useRefresh()
  const now = useNow()

  const syncing = pending || status?.state === 'syncing'
  const cooldownUntil = status?.manualCooldownUntil ? new Date(status.manualCooldownUntil).getTime() : 0
  const coolingDown = cooldownUntil > now

  const details = status && (
    <div className="space-y-0.5">
      <div>Last successful sync: {status.lastSuccessAt ? formatDateTime(status.lastSuccessAt) : 'never'}</div>
      {status.nextScheduledAt && <div>Next automatic refresh: {formatDateTime(status.nextScheduledAt)}</div>}
      {status.lastError && <div className="text-orange-200">{status.lastError}</div>}
    </div>
  )

  return (
    <div className="flex items-center gap-2">
      <Tooltip content={details ?? 'Loading sync status…'}>
        <div className="flex h-9 cursor-default items-center gap-2 rounded-lg border bg-card px-3 text-[13px] shadow-card">
          {syncing ? (
            <>
              <Lottie animationData={syncAnimation} className="size-5" />
              <span className="font-medium text-primary">Syncing…</span>
            </>
          ) : status?.state === 'error' ? (
            <>
              <AlertTriangle className="size-4 text-warning" />
              <span className="text-muted-foreground">
                Refresh failed · data from{' '}
                <span className="font-medium text-foreground">
                  {status.lastSuccessAt ? formatRelative(status.lastSuccessAt, now) : '—'}
                </span>
              </span>
            </>
          ) : status?.lastSuccessAt ? (
            <>
              <CheckCircle2 className="size-4 text-success" />
              <span className="text-muted-foreground">
                Synced <span className="font-medium text-foreground">{formatRelative(status.lastSuccessAt, now)}</span>
              </span>
            </>
          ) : (
            <>
              <Clock className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">{status ? 'Not synced yet' : 'Checking sync…'}</span>
            </>
          )}
        </div>
      </Tooltip>
      <Tooltip
        content={
          coolingDown
            ? `Manual refresh available at ${new Date(cooldownUntil).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} (protects API quotas).`
            : 'Re-run research now. Cached provider responses are reused when still fresh.'
        }
      >
        {/* span wrapper keeps the tooltip working while the button is disabled */}
        <span tabIndex={coolingDown ? 0 : -1}>
          <Button onClick={refresh} disabled={syncing || coolingDown} variant="outline">
            <RefreshCw className={syncing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </span>
      </Tooltip>
    </div>
  )
}
