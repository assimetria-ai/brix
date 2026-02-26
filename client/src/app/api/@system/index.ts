// @system — core API calls (auth, user, subscriptions, sessions)
// Do not modify this file. Add product-specific calls in @custom/

import { apiRequest } from './utils'

// ─── Auth / User ────────────────────────────────────────────────────────────

export const register = (data: { name: string; email: string; password: string }) =>
  apiRequest.post('/users/register', data)

export const login = (data: { email: string; password: string }) =>
  apiRequest.post<{ bearerToken: string; id: number }>('/users/login', data)

export const auth = () =>
  apiRequest.post('/users/auth')

export const requestResetPassword = (data: { email: string }) =>
  apiRequest.post('/users/password/request', data)

export const resetPassword = (data: { token: string; password: string }) =>
  apiRequest.post('/users/password/reset', data)

export const editUser = (data: { email?: string; name?: string }) =>
  apiRequest.post('/users/edit', data)

// ─── Sessions ────────────────────────────────────────────────────────────────

export const startSession = (data: Record<string, unknown>) =>
  apiRequest.post('/sessions/start', data)

export const endSession = (data: { sessionId: string }) =>
  apiRequest.post('/sessions/end', data)

// ─── Subscriptions ───────────────────────────────────────────────────────────

export const getSubscriptions = () =>
  apiRequest.get('/subscriptions')

export const getAvailablePlans = (params?: { showYearly?: boolean }) => {
  const qs = params?.showYearly ? '?showYearly=true' : ''
  return apiRequest.get(`/subscriptions/plans${qs}`)
}

export const handleSubscriptionCancellation = (data: {
  subscriptionId: string
  type: string
  reason?: string
  selectedPlan?: string
}) => apiRequest.post('/subscriptions/cancellation-flow', data)

export const upgradeSubscription = (data: { subscriptionId: string; newPriceId: string }) =>
  apiRequest.post('/subscriptions/upgrade', data)

export const uncancelSubscription = (data: { subscriptionId: string }) =>
  apiRequest.post('/subscriptions/uncancel', data)
