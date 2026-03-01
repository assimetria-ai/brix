import { useState, useEffect, useCallback } from 'react'
import { Tag, Plus, Loader2, AlertTriangle, CheckCircle, X, Trash2 } from 'lucide-react'
import { Header } from '../../../components/@system/Header/Header'
import { PageLayout } from '../../../components/@system/layout/PageLayout'
import { Button } from '../../../components/@system/ui/button'
import { api } from '../../../lib/@system/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiscountCode {
  id: number
  code: string
  type: 'percentage' | 'fixed'
  value: string
  min_order_cents: number
  max_uses: number | null
  uses_count: number
  expires_at: string | null
  active: boolean
  created_at: string
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

function NewDiscountModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    max_uses: '',
    expires_at: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code.trim()) { setError('Code is required'); return }
    if (!form.value || parseFloat(form.value) <= 0) { setError('Value must be > 0'); return }
    setSaving(true)
    setError(null)
    try {
      await api.post('/discounts', {
        code: form.code.toUpperCase().trim(),
        type: form.type,
        value: parseFloat(form.value),
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        expires_at: form.expires_at || null,
      })
      onSave()
      onClose()
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create discount code')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold">New Discount Code</h2>
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
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Code *</label>
            <input
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="SUMMER20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type</label>
              <select
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as 'percentage' | 'fixed' }))}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Value {form.type === 'percentage' ? '(%)' : '($)'} *
              </label>
              <input
                type="number"
                min="0.01"
                max={form.type === 'percentage' ? '100' : undefined}
                step="0.01"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                placeholder={form.type === 'percentage' ? '20' : '10.00'}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Max Uses</label>
              <input
                type="number"
                min="1"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={form.max_uses}
                onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                placeholder="Unlimited"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Expires</label>
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={form.expires_at}
                onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Create Code
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function DiscountsPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCodes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<{ codes: DiscountCode[] }>('/discounts')
      setCodes(res.codes)
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load discount codes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCodes() }, [fetchCodes])

  const handleToggle = async (id: number, active: boolean) => {
    await api.patch(`/discounts/${id}`, { active })
    await fetchCodes()
  }

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Delete discount code "${code}"?`)) return
    await api.delete(`/discounts/${id}`)
    await fetchCodes()
  }

  return (
    <PageLayout>
      <Header />
      {showForm && <NewDiscountModal onClose={() => setShowForm(false)} onSave={fetchCodes} />}

      <main className="container py-8 space-y-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Tag className="h-6 w-6 text-primary" />
              Discount Codes
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create percentage-based or fixed-amount discount codes for promotions.
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Code
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="rounded-xl border border-border overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading discount codes...
            </div>
          ) : codes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Tag className="h-10 w-10 opacity-40" />
              <p className="text-sm font-medium">No discount codes yet</p>
              <p className="text-xs">Create your first discount to boost conversions.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Code</th>
                  <th className="px-5 py-3 text-left hidden sm:table-cell">Discount</th>
                  <th className="px-5 py-3 text-left hidden md:table-cell">Uses</th>
                  <th className="px-5 py-3 text-left hidden md:table-cell">Expires</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {codes.map(disc => (
                  <tr key={disc.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-mono font-semibold text-foreground">{disc.code}</p>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell text-foreground">
                      {disc.type === 'percentage' ? `${disc.value}% off` : `$${disc.value} off`}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-muted-foreground">
                      {disc.uses_count}{disc.max_uses ? ` / ${disc.max_uses}` : ' / ∞'}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-muted-foreground text-xs">
                      {disc.expires_at ? new Date(disc.expires_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(disc.id, !disc.active)}
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors ${disc.active ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}
                        >
                          {disc.active ? <CheckCircle className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          {disc.active ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          onClick={() => handleDelete(disc.id, disc.code)}
                          className="rounded-md border border-border p-1.5 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
