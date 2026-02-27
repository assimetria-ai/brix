// @custom API calls — product-specific API functions
import { api } from '../../lib/@system/api'

// ─── Brand types ─────────────────────────────────────────────────────────────

export interface Brand {
  id: number
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  website_url: string | null
  primary_color: string | null
  secondary_color: string | null
  status: 'active' | 'inactive' | 'archived'
  settings: Record<string, unknown> | null
  user_id: number | null
  created_at: string
  updated_at: string
}

// ─── Brand API ────────────────────────────────────────────────────────────────

export const getBrands = () =>
  api.get<{ brands: Brand[] }>('/brands')

export const getBrand = (id: number) =>
  api.get<{ brand: Brand }>(`/brands/${id}`)

export const createBrand = (data: {
  name: string
  description?: string
  website_url?: string
  primary_color?: string
  secondary_color?: string
}) => api.post<{ brand: Brand }>('/brands', data)

export const updateBrand = (id: number, data: {
  name?: string
  description?: string
  website_url?: string
  primary_color?: string | null
  secondary_color?: string | null
  status?: 'active' | 'inactive' | 'archived'
}) => api.patch<{ brand: Brand }>(`/brands/${id}`, data)

export const uploadBrandLogo = (id: number, logo: string) =>
  api.post<{ brand: Brand }>(`/brands/${id}/logo`, { logo })

export const deleteBrandLogo = (id: number) =>
  api.delete<{ brand: Brand }>(`/brands/${id}/logo`)

export const deleteBrand = (id: number) =>
  api.delete<{ message: string }>(`/brands/${id}`)
