import { useState, useEffect, useCallback } from 'react'
import {
  Package,
  Plus,
  Search,
  Edit2,
  Archive,
  BarChart2,
  AlertTriangle,
  CheckCircle,
  Loader2,
  X,
} from 'lucide-react'
import { Header } from '../../../components/@system/Header/Header'
import { PageLayout } from '../../../components/@system/layout/PageLayout'
import { Button } from '../../../components/@system/ui/button'
import { api } from '../../../lib/@system/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: number
  name: string
  slug: string
  description: string | null
  status: 'active' | 'draft' | 'archived'
  price_cents: number
  compare_price_cents: number | null
  sku: string | null
  inventory_qty: number
  track_inventory: boolean
  low_stock_alert: number
  variant_count: number
  created_at: string
}

interface CatalogStats {
  total_products: number
  active_products: number
  low_stock_count: number
  total_inventory: number
}

interface ProductFormData {
  name: string
  description: string
  price: string
  sku: string
  inventory_qty: string
  status: 'active' | 'draft'
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function StatusBadge({ status }: { status: Product['status'] }) {
  const map = {
    active: 'bg-green-50 text-green-700 border-green-200',
    draft: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    archived: 'bg-gray-100 text-gray-500 border-gray-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${map[status]}`}>
      {status === 'active' && <CheckCircle className="h-3 w-3" />}
      {status === 'draft' && <Edit2 className="h-3 w-3" />}
      {status === 'archived' && <Archive className="h-3 w-3" />}
      {status}
    </span>
  )
}

// ─── Product Form Modal ───────────────────────────────────────────────────────

function ProductFormModal({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (data: ProductFormData) => Promise<void>
}) {
  const [form, setForm] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    sku: '',
    inventory_qty: '0',
    status: 'draft',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Product name is required'); return }
    const price = parseFloat(form.price)
    if (isNaN(price) || price < 0) { setError('Enter a valid price'); return }
    setSaving(true)
    setError(null)
    try {
      await onSave(form)
      onClose()
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">New Product</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Product Name *</label>
            <input
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Premium Hoodie"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</label>
            <textarea
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Short product description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Price (USD) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">SKU</label>
              <input
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={form.sku}
                onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                placeholder="SKU-001"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Inventory Qty</label>
              <input
                type="number"
                min="0"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={form.inventory_qty}
                onChange={e => setForm(f => ({ ...f, inventory_qty: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
              <select
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'draft' }))}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Create Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ProductCatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<CatalogStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filter !== 'all') params.set('status', filter)
      const [prodRes, statsRes] = await Promise.all([
        api.get<{ products: Product[] }>(`/catalog/products?${params}`),
        api.get<CatalogStats>('/catalog/stats'),
      ])
      setProducts(prodRes.products)
      setStats(statsRes)
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [search, filter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreate = async (form: ProductFormData) => {
    const price_cents = Math.round(parseFloat(form.price) * 100)
    await api.post('/catalog/products', {
      name: form.name,
      description: form.description || null,
      price_cents,
      sku: form.sku || null,
      inventory_qty: parseInt(form.inventory_qty) || 0,
      status: form.status,
    })
    await fetchData()
  }

  const handleArchive = async (id: number) => {
    if (!confirm('Archive this product?')) return
    await api.delete(`/catalog/products/${id}`)
    await fetchData()
  }

  return (
    <PageLayout>
      <Header />
      {showForm && <ProductFormModal onClose={() => setShowForm(false)} onSave={handleCreate} />}

      <main className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              Product Catalog
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your products, variants, and inventory.
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Products', value: stats.total_products, icon: <Package className="h-4 w-4" /> },
              { label: 'Active', value: stats.active_products, icon: <CheckCircle className="h-4 w-4" /> },
              { label: 'Low Stock', value: stats.low_stock_count, icon: <AlertTriangle className="h-4 w-4" />, warn: stats.low_stock_count > 0 },
              { label: 'Total Units', value: stats.total_inventory.toLocaleString(), icon: <BarChart2 className="h-4 w-4" /> },
            ].map(stat => (
              <div key={stat.label} className={`rounded-xl border p-5 flex items-start gap-4 shadow-sm ${stat.warn ? 'border-orange-200 bg-orange-50' : 'border-border bg-card'}`}>
                <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${stat.warn ? 'bg-orange-100 text-orange-600' : 'bg-primary/10 text-primary'}`}>
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
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {(['all', 'active', 'draft', 'archived'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors capitalize ${filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Error */}
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
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Package className="h-10 w-10 opacity-40" />
              <p className="text-sm font-medium">No products yet</p>
              <p className="text-xs">Click "Add Product" to create your first product.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Product</th>
                  <th className="px-5 py-3 text-left hidden sm:table-cell">Status</th>
                  <th className="px-5 py-3 text-right hidden md:table-cell">Price</th>
                  <th className="px-5 py-3 text-right hidden md:table-cell">Stock</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {product.sku ? `SKU: ${product.sku}` : `/${product.slug}`}
                        {product.variant_count > 0 && ` · ${product.variant_count} variants`}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-foreground hidden md:table-cell">
                      {formatPrice(product.price_cents)}
                      {product.compare_price_cents && (
                        <span className="text-xs line-through text-muted-foreground ml-1">{formatPrice(product.compare_price_cents)}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right hidden md:table-cell">
                      <span className={`text-sm font-medium ${product.inventory_qty <= product.low_stock_alert && product.track_inventory ? 'text-orange-600' : 'text-foreground'}`}>
                        {product.inventory_qty}
                      </span>
                      {product.inventory_qty <= product.low_stock_alert && product.track_inventory && (
                        <span className="ml-1.5 text-xs text-orange-500">low</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleArchive(product.id)}
                          className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted transition-colors flex items-center gap-1"
                          title="Archive product"
                        >
                          <Archive className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Archive</span>
                        </button>
                      </div>
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
