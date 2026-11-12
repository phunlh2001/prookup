import { create } from 'zustand'
import { ApiError } from '@/services/api'
import { researchService, syncService } from '@/services/research'
import type { ResearchSnapshot, SyncStatus } from '@/types'

const POLL_MS = 2000

interface RefreshOutcome {
  ok: boolean
  message: string
}

interface ResearchState {
  snapshot: ResearchSnapshot | null
  status: SyncStatus | null
  /** True only for the first load (skeletons). */
  loading: boolean
  error: string | null
  load: () => Promise<void>
  /** Manual refresh: start a sync, wait for it, reload data. */
  refresh: () => Promise<RefreshOutcome>
  /** Lightweight status poll (sync indicator, cooldown). */
  pollStatus: () => Promise<void>
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function waitForSync(set: (s: Partial<ResearchState>) => void): Promise<SyncStatus> {
  for (;;) {
    await sleep(POLL_MS)
    const status = await syncService.getStatus()
    set({ status })
    if (status.state !== 'syncing') return status
  }
}

export const useResearchStore = create<ResearchState>((set, get) => ({
  snapshot: null,
  status: null,
  loading: true,
  error: null,

  async load() {
    try {
      const { snapshot, status } = await researchService.getSnapshot()
      set({ snapshot, status, loading: false, error: null })
    } catch (err) {
      // 503 = first research pass still running on the server: wait for it.
      if (err instanceof ApiError && err.status === 503) {
        const status = (err.data as { status?: SyncStatus })?.status ?? null
        set({ status })
        try {
          await waitForSync(set)
          return get().load()
        } catch (e) {
          set({ loading: false, error: (e as Error).message })
          return
        }
      }
      set({ loading: false, error: (err as Error).message })
    }
  },

  async refresh() {
    try {
      const started = await syncService.trigger()
      set({ status: started })
      const final = await waitForSync(set)
      if (final.state === 'error') {
        return { ok: false, message: final.lastError ?? 'Research refresh failed. Previous data was kept.' }
      }
      const { snapshot, status } = await researchService.getSnapshot()
      set({ snapshot, status, error: null })
      return {
        ok: true,
        message: status.lastError ?? 'Research data refreshed.',
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        const status = (err.data as { status?: SyncStatus })?.status
        if (status) set({ status })
      }
      return { ok: false, message: (err as Error).message }
    }
  },

  async pollStatus() {
    try {
      const status = await syncService.getStatus()
      const prev = get().status
      set({ status })
      // A scheduled sync finished in the background: pull the new snapshot.
      if (prev?.lastSuccessAt !== status.lastSuccessAt && status.state === 'success') {
        const { snapshot } = await researchService.getSnapshot()
        set({ snapshot })
      }
    } catch {
      /* status polling is best-effort */
    }
  },
}))
