import axios, { AxiosError } from 'axios'

/** Normalised API error: every service call rejects with this shape. */
export class ApiError extends Error {
  readonly status: number | null
  readonly data: unknown
  constructor(message: string, status: number | null, data?: unknown) {
    super(message)
    this.status = status
    this.data = data
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 20_000,
  headers: { Accept: 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ error?: string }>) => {
    if (error.response) {
      const msg = error.response.data?.error ?? `Request failed (${error.response.status})`
      return Promise.reject(new ApiError(msg, error.response.status, error.response.data))
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new ApiError('The research API took too long to respond.', null))
    }
    return Promise.reject(new ApiError('Cannot reach the research API. Is the server running?', null))
  },
)
