// @system — admin API calls (owner-only)
// Do not modify this file. Add product-specific admin calls in @custom/

import { apiRequest } from './utils'

export const getAdminUsersStats = (params?: { startDate?: string; endDate?: string }) => {
  const qs = new URLSearchParams()
  if (params?.startDate && params?.endDate) {
    qs.set('dateWindow', 'custom')
    qs.set('startDate', params.startDate)
    qs.set('endDate', params.endDate)
  } else {
    qs.set('dateWindow', 'today')
  }
  return apiRequest.get(`/admin/users/stats?${qs}`)
}

export const getAdminUsers = (params?: {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  country?: string
  status?: string
  startDate?: string
  endDate?: string
}) => {
  const qs = new URLSearchParams()
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  if (params?.search) qs.set('search', params.search)
  if (params?.sortBy) qs.set('sortBy', params.sortBy)
  if (params?.sortOrder) qs.set('sortOrder', params.sortOrder)
  if (params?.country) qs.set('country', params.country)
  if (params?.status) qs.set('status', params.status)
  if (params?.startDate) qs.set('startDate', params.startDate)
  if (params?.endDate) qs.set('endDate', params.endDate)
  return apiRequest.get(`/admin/users?${qs}`)
}

export const getAdminUserDetails = (userId: string | number) =>
  apiRequest.get(`/admin/users/${userId}`)

export const getAdminSubscriptions = (params?: {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
}) => {
  const qs = new URLSearchParams()
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  if (params?.startDate) qs.set('startDate', params.startDate)
  if (params?.endDate) qs.set('endDate', params.endDate)
  return apiRequest.get(`/admin/subscriptions?${qs}`)
}

export const getAdminCancellations = (params?: {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
}) => {
  const qs = new URLSearchParams()
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  if (params?.startDate) qs.set('startDate', params.startDate)
  if (params?.endDate) qs.set('endDate', params.endDate)
  return apiRequest.get(`/admin/cancellations?${qs}`)
}

export const getAdminFinancials = (params?: { startDate?: string; endDate?: string }) => {
  const qs = new URLSearchParams()
  if (params?.startDate) qs.set('startDate', params.startDate)
  if (params?.endDate) qs.set('endDate', params.endDate)
  return apiRequest.get(`/admin/financials?${qs}`)
}

export const getAdminPerformance = (params?: { window?: number }) => {
  const qs = params?.window ? `?window=${params.window}` : ''
  return apiRequest.get(`/admin/performance${qs}`)
}
