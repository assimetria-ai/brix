import { useState, useEffect, useCallback } from 'react'
import {
  ShoppingCart,
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  XCircle,
  BarChart2,
  ChevronDown,
} from 'lucide-react'
import { Header } from '../../../components/@system/Header/Header'
import { PageLayout } from '../../../components/@system/layout/PageLayout'
import { api } from '../../../lib/@system/api'

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded'

interface Order {
  id: number
  order_number: string
  status: OrderStatus
  customer_email: string
  customer_name: string | null
  line_items: Array<{ name: string; qty: number; price_cents: number }>
  subtotal_cents: number
  discount_cents: number
  total_cents: number
  currency: string
  discount_code: string | null
  notes: string | null
  fulfilled_at: string | null
  created_at: string
}

interface OrderStats {
  pending_orders: number
  orders_today: number
  total_revenue_cents: number
  fulfilled_orders: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <Clock className="h-3 w-3" /> },
  paid: { label: 'Paid', cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: <CheckCircle className="h-3 w-3" /> },
  fulfilled: { label: 'Fulfilled', cls: 'bg-green-50 text-green-700 border-green-200', icon: <Package className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-500 border-gray-200', icon: <XCircle className="h-3 w-3" /> },
  refunded: { label: 'Refunded', cls: 'bg-red-50 text-red-600 border-red-200', icon: <XCircle className="h-3 w-3" /> },
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const c = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${c.cls}`}>
      {c.icon}
      {c.label}
    </span>
  )
}

function StatusSelector({ orderId, current, onUpdate }: { orderId: number; current: OrderStatus; onUpdate: () => void }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const transitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
    pending: ['paid', 'cancelled'],
    paid: ['fulfilled', 'refunded'],
    fulfilled: ['refunded'],
  }
  const options = transitions[current] ?? []

  const handleSelect = async (newStatus: OrderStatus) => {
    setSaving(true)
    setOpen(false)
    try {
      await api.patch(`/orders/${orderId}`, { status: newStatus })
      onUpdate()
    } finally {
      setSaving(false)
    }
  }

  if (options.length === 0) return <StatusBadge status={current} />

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium hover:bg-muted/60 transition-colors"
        disabled={saving}
      >
        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : STATUS_CONFIG[current].icon}
        {STATUS_CONFIG[current].label}
        <ChevronDown className="h-3 w-3 ml-0.5" />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-10 bg-background border border-border rounded-lg shadow-md py-1 min-w-28">
          {options.map(s => (
            <button
              key={s}
              onClick={() => handleSelect(s)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors text-left"
            >
              {STATUS_CONFIG[s].icon}
              Mark as {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filter !== 'all') params.set('status', filter)
      const [ordRes, statsRes] = await Promise.all([
        api.get<{ orders: Order[] }>(`/orders?${params}`),
        api.get<OrderStats>('/orders/stats'),
      ])
      setOrders(ordRes.orders)
      setStats(statsRes)
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [search, filter])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <PageLayout>
      <Header />

      <main className="container py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            Orders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track orders, update fulfillment status, and manage refunds.
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Pending Orders', value: stats.pending_orders, icon: <Clock className="h-4 w-4" />, warn: stats.pending_orders > 0 },
              { label: 'Orders Today', value: stats.orders_today, icon: <ShoppingCart className="h-4 w-4" /> },
              { label: 'Total Revenue', value: formatPrice(stats.total_revenue_cents), icon: <BarChart2 className="h-4 w-4" /> },
              { label: 'Fulfilled', value: stats.fulfilled_orders, icon: <Package className="h-4 w-4" /> },
            ].map(stat => (
              <div key={stat.label} className={`rounded-xl border p-5 flex items-start gap-4 shadow-sm ${stat.warn ? 'border-yellow-200 bg-yellow-50' : 'border-border bg-card'}`}>
                <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${stat.warn ? 'bg-yellow-100 text-yellow-600' : 'bg-primary/10 text-primary'}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Search by email, name, or order #..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {(['all', 'pending', 'paid', 'fulfilled', 'cancelled'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors capitalize ${filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {s}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <ShoppingCart className="h-10 w-10 opacity-40" />
              <p className="text-sm font-medium">No orders yet</p>
              <p className="text-xs">Orders will appear here when customers purchase from your storefront.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Order</th>
                  <th className="px-5 py-3 text-left hidden sm:table-cell">Customer</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-right hidden md:table-cell">Total</th>
                  <th className="px-5 py-3 text-right hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-mono font-medium text-foreground text-xs">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {order.line_items.length} item{order.line_items.length !== 1 ? 's' : ''}
                        {order.discount_code && <span className="ml-1.5 text-green-600">· {order.discount_code}</span>}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <p className="text-foreground">{order.customer_name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusSelector orderId={order.id} current={order.status} onUpdate={fetchData} />
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-foreground hidden md:table-cell">
                      {formatPrice(order.total_cents)}
                      {order.discount_cents > 0 && (
                        <p className="text-xs text-green-600">-{formatPrice(order.discount_cents)}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right text-muted-foreground text-xs hidden md:table-cell">
                      {timeAgo(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </PageLayout>
  )
}
