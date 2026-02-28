import { useEffect, useState } from 'react'
import {
  BarChart2,
  Eye,
  Users,
  TrendingUp,
  TrendingDown,
  Globe,
  MousePointer,
  Clock,
  ChevronDown,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react'
import { Header } from '../../../components/@system/Header/Header'
import { PageLayout } from '../../../components/@system/layout/PageLayout'
import { api } from '../../../lib/@system/api'

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_OVERVIEW = {
  total_visitors: 12_483,
  visitors_change: 12.4,
  pageviews: 34_721,
  pageviews_change: 8.7,
  avg_session: '2m 34s',
  session_change: -3.1,
  bounce_rate: 41.2,
  bounce_change: -2.8,
}

const SEED_PAGES = [
  { id: 1, name: 'Summer Collection', slug: 'summer-collection', visitors: 4_821, pageviews: 12_943, bounce_rate: 38.1, avg_time: '3m 12s', conversions: 234 },
  { id: 2, name: 'New Arrivals', slug: 'new-arrivals', visitors: 3_102, pageviews: 8_431, bounce_rate: 42.7, avg_time: '2m 45s', conversions: 178 },
  { id: 3, name: 'About Us', slug: 'about-us', visitors: 2_418, pageviews: 5_921, bounce_rate: 51.2, avg_time: '1m 58s', conversions: 12 },
  { id: 4, name: 'Flash Sale', slug: 'flash-sale', visitors: 1_387, pageviews: 4_102, bounce_rate: 33.4, avg_time: '4m 01s', conversions: 421 },
  { id: 5, name: 'Bundle Builder', slug: 'bundle-builder', visitors: 755, pageviews: 3_324, bounce_rate: 28.9, avg_time: '5m 23s', conversions: 187 },
]

const SEED_REFERRERS = [
  { source: 'google.com', visitors: 5_421, pct: 43.4 },
  { source: 'instagram.com', visitors: 2_108, pct: 16.9 },
  { source: 'facebook.com', visitors: 1_842, pct: 14.8 },
  { source: 'direct', visitors: 1_509, pct: 12.1 },
  { source: 'tiktok.com', visitors: 843, pct: 6.7 },
  { source: 'other', visitors: 760, pct: 6.1 },
]

const SEED_CHART = Array.from({ length: 14 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (13 - i))
  return {
    date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    visitors: Math.floor(500 + Math.random() * 1200),
    pageviews: Math.floor(1000 + Math.random() * 3000),
  }
})

const RANGES = ['Last 7 days', 'Last 14 days', 'Last 30 days', 'Last 90 days']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ChangeIndicator({ value }) {
  const positive = value >= 0
  const Icon = positive ? TrendingUp : TrendingDown
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
      <Icon className="h-3 w-3" />
      {Math.abs(value)}%
    </span>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, change, icon }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex items-start gap-4 shadow-sm">
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-foreground truncate">{value}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-sm text-muted-foreground">{label}</p>
          <ChangeIndicator value={change} />
        </div>
      </div>
    </div>
  )
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────

function MiniBarChart({ data, metric }) {
  const max = Math.max(...data.map(d => d[metric]))
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d, i) => {
        const pct = max ? (d[metric] / max) * 100 : 0
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1" title={`${d.date}: ${d[metric].toLocaleString()}`}>
            <div
              className="w-full rounded-t-sm bg-primary/70 hover:bg-primary transition-colors"
              style={{ height: `${pct}%` }}
            />
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const [range, setRange] = useState(RANGES[1])
  const [overview, setOverview] = useState(SEED_OVERVIEW)
  const [pages, setPages] = useState(SEED_PAGES)
  const [referrers, setReferrers] = useState(SEED_REFERRERS)
  const [chart, setChart] = useState(SEED_CHART)
  const [loading, setLoading] = useState(true)
  const [chartMetric, setChartMetric] = useState('visitors')
  const [rangeOpen, setRangeOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setLoading(true)
      try {
        const res = await api.get('/brix/analytics')
        if (!cancelled && res) {
          if (res.overview) setOverview(res.overview)
          if (res.pages) setPages(res.pages)
          if (res.referrers) setReferrers(res.referrers)
          if (res.chart) setChart(res.chart)
        }
      } catch {
        // Keep seed data
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [range])

  return (
    <PageLayout>
      <Header />
      <main className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart2 className="h-6 w-6 text-primary" />
              Analytics
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track visitor behaviour and conversions across all your pages.
            </p>
          </div>
          {/* Range Picker */}
          <div className="relative">
            <button
              onClick={() => setRangeOpen(!rangeOpen)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-sm"
            >
              {range}
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            {rangeOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 rounded-lg border border-border bg-card shadow-lg py-1 min-w-[160px]">
                {RANGES.map(r => (
                  <button
                    key={r}
                    onClick={() => { setRange(r); setRangeOpen(false) }}
                    className={`w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors ${r === range ? 'text-primary font-medium' : 'text-foreground'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Visitors"
            value={overview.total_visitors.toLocaleString()}
            change={overview.visitors_change}
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            label="Page Views"
            value={overview.pageviews.toLocaleString()}
            change={overview.pageviews_change}
            icon={<Eye className="h-4 w-4" />}
          />
          <StatCard
            label="Avg Session"
            value={overview.avg_session}
            change={overview.session_change}
            icon={<Clock className="h-4 w-4" />}
          />
          <StatCard
            label="Bounce Rate"
            value={`${overview.bounce_rate}%`}
            change={overview.bounce_change}
            icon={<MousePointer className="h-4 w-4" />}
          />
        </div>

        {/* Chart */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Traffic Over Time</h2>
            <div className="flex gap-2">
              {['visitors', 'pageviews'].map(m => (
                <button
                  key={m}
                  onClick={() => setChartMetric(m)}
                  className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                    chartMetric === m ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          {/* X-axis labels */}
          <div className="flex gap-1 mb-1">
            {chart.map((d, i) => (
              <div key={i} className="flex-1 text-center text-[8px] text-muted-foreground truncate">{d.date}</div>
            ))}
          </div>
          <MiniBarChart data={chart} metric={chartMetric} />
          <div className="mt-2 flex gap-1">
            {chart.map((d, i) => (
              <div key={i} className="flex-1 text-center text-[8px] text-muted-foreground font-mono">
                {d[chartMetric] > 999 ? `${(d[chartMetric]/1000).toFixed(1)}k` : d[chartMetric]}
              </div>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Pages */}
          <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Top Pages
              </h2>
              <span className="text-xs text-muted-foreground">by visitors</span>
            </div>
            <div className="divide-y divide-border">
              {pages.map((page, i) => (
                <div key={page.id} className="px-6 py-3 flex items-center gap-4 hover:bg-muted/20 transition-colors">
                  <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{page.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">/{page.slug}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-foreground">{page.visitors.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{page.bounce_rate}% bounce</p>
                  </div>
                  <button className="text-muted-foreground hover:text-primary transition-colors shrink-0">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Traffic Sources */}
          <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-primary" />
                Traffic Sources
              </h2>
              <span className="text-xs text-muted-foreground">by visits</span>
            </div>
            <div className="p-6 space-y-4">
              {referrers.map((ref) => (
                <div key={ref.source}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground capitalize">{ref.source}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground">{ref.visitors.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground w-10 text-right">{ref.pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/70 transition-all"
                      style={{ width: `${ref.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </PageLayout>
  )
}
