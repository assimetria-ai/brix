// @system — shared API utilities (fetch wrapper, auth headers, error handling)
// Do not modify this file. Override or extend in @custom/

const IS_TUNNEL = !window.location.origin.includes('localhost')
const API_BASE = IS_TUNNEL ? `${window.location.origin}/api` : '/api'

function getAuthHeaders(): Record<string, string> {
  try {
    const raw = localStorage.getItem('auth')
    if (!raw) return {}
    const auth = JSON.parse(raw) as { bearerToken?: string; id?: number }
    const headers: Record<string, string> = {}
    if (auth.bearerToken) {
      headers['Authorization'] = `Bearer ${auth.bearerToken}`
    }
    if (auth.id) {
      headers['X-User-ID'] = String(auth.id)
    }
    return headers
  } catch {
    return {}
  }
}

export interface ApiResponse<T = unknown> {
  status: number
  data?: T
  message?: string
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const isFormData = options.body instanceof FormData
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string>),
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      ...options,
      headers,
    })
    const json = await res.json().catch(() => ({}))

    if (!res.ok) {
      return {
        status: res.status,
        message: json?.message ?? res.statusText,
      }
    }
    return { status: res.status, data: json?.data ?? json, message: json?.message }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error'
    return { status: 0, message }
  }
}

export const apiRequest = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  postForm: <T>(path: string, form: FormData) =>
    request<T>(path, { method: 'POST', body: form }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
