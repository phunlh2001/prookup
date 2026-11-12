import type { ResearchSnapshot, SyncStatus } from '@/types'
import { api } from './api'

export interface SnapshotResponse {
  snapshot: ResearchSnapshot
  status: SyncStatus
}

export const researchService = {
  async getSnapshot() {
    const { data } = await api.get<SnapshotResponse>('/research/snapshot')
    return data
  },
}

export const syncService = {
  async getStatus() {
    const { data } = await api.get<SyncStatus>('/sync/status')
    return data
  },
  /** Starts a manual refresh; resolves with the status (state = "syncing"). */
  async trigger() {
    const { data } = await api.post<SyncStatus>('/sync')
    return data
  },
}
