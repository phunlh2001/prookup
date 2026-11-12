import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useResearchStore } from '@/stores/research-store'

/** Manual research refresh with toast feedback. */
export function useRefresh() {
  const refresh = useResearchStore((s) => s.refresh)
  const [pending, setPending] = useState(false)

  const run = useCallback(async () => {
    setPending(true)
    const id = toast.loading('Refreshing research data…', { description: 'Collecting trends, search and supplier data.' })
    const result = await refresh()
    setPending(false)
    if (result.ok) toast.success('Research updated', { id, description: result.message })
    else toast.error('Refresh failed', { id, description: result.message })
  }, [refresh])

  return { refresh: run, pending }
}
