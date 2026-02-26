// @system — Stripe checkout + billing portal API calls
import { api } from '../../lib/@system/api'

export interface StripePlan {
  priceId: string
  productId: string
  name: string
  description: string | null
  amount: number
  currency: string
  interval: 'month' | 'year' | 'week' | 'day' | 'one_time'
  intervalCount: number
  trialDays: number | null
  metadata: Record<string, string>
}

export interface StripeSubscription {
  id: number
  user_id: number
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  stripe_price_id: string | null
  status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'inactive'
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

// Fetch available pricing plans from Stripe
export async function getPlans(): Promise<{ plans: StripePlan[] }> {
  return api.get<{ plans: StripePlan[] }>('/subscriptions/plans')
}

// Get current user's active subscription
export async function getMySubscription(): Promise<{ subscription: StripeSubscription | null }> {
  return api.get<{ subscription: StripeSubscription | null }>('/subscriptions/me')
}

// Redirect to Stripe Checkout for a given priceId
export async function createCheckoutSession(priceId: string, trialDays?: number): Promise<void> {
  const body: Record<string, unknown> = { priceId }
  if (trialDays) body.trialDays = trialDays

  const { url } = await api.post<{ url: string }>('/stripe/create-checkout-session', body)
  if (url) window.location.href = url
}

// Redirect to Stripe Customer Portal for subscription management
export async function createPortalSession(): Promise<void> {
  const { url } = await api.post<{ url: string }>('/stripe/create-portal-session', {})
  if (url) window.location.href = url
}

// Cancel subscription at period end
export async function cancelSubscription(): Promise<{ cancel_at_period_end: boolean }> {
  return api.post<{ cancel_at_period_end: boolean }>('/stripe/cancel-subscription', {})
}

// Reverse a scheduled cancellation
export async function uncancelSubscription(): Promise<{ cancel_at_period_end: boolean }> {
  return api.post<{ cancel_at_period_end: boolean }>('/stripe/uncancel-subscription', {})
}

// Format a Stripe amount (cents) to a human-readable string
export function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: amount % 100 === 0 ? 0 : 2,
  }).format(amount / 100)
}

// Format billing interval to human-readable label (e.g. "/month", "/year")
export function formatInterval(interval: string, intervalCount: number): string {
  if (interval === 'one_time') return 'one-time'
  const label = intervalCount === 1 ? interval : `${intervalCount} ${interval}s`
  return `/${label}`
}
