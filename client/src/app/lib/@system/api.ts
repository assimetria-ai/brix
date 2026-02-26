const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

// Prevent concurrent refresh attempts: if one is in-flight, queue the rest.
let refreshPromise: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise
  refreshPromise = fetch(`${BASE_URL}/sessions/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => { refreshPromise = null })
  return refreshPromise
}

async function request<T>(path: string, options?: RequestInit, _retry = true): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  })

  // On 401, attempt a single token refresh then replay the original request.
  if (res.status === 401 && _retry && path !== '/sessions/refresh') {
    const refreshed = await tryRefresh()
    if (refreshed) {
      return request<T>(path, options, false)
    }
    // Refresh also failed — clear state and throw so callers can redirect to login.
    const err = await res.json().catch(() => ({ message: 'Unauthorized' }))
    throw new Error(err.message ?? 'Unauthorized')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message ?? 'API error')
  }
  return res.json()
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
