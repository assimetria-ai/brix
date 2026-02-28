import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layout,
  Zap,
  ShoppingBag,
  Star,
  Search,
  Filter,
  Eye,
  Plus,
  ArrowRight,
  BarChart2,
  Globe,
  FileText,
  Layers,
  Heart,
  Package,
} from 'lucide-react'
import { Header } from '../../../components/@system/Header/Header'
import { PageLayout } from '../../../components/@system/layout/PageLayout'
import { Button } from '../../../components/@system/ui/button'

// ─── Templates Data ───────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Landing', 'E-commerce', 'Coming Soon', 'Portfolio', 'Other']

const TEMPLATES = [
  {
    id: 'product-landing',
    name: 'Product Landing',
    category: 'Landing',
    description: 'High-converting single-product page with hero, benefits and CTA sections.',
    uses: 1_842,
    rating: 4.9,
    badge: 'Popular',
    badgeColor: 'bg-primary text-primary-foreground',
    icon: ShoppingBag,
    iconColor: 'text-primary',
    preview: [
      { label: 'Hero Section', h: 'h-8' },
      { label: 'Features', h: 'h-6' },
      { label: 'Testimonials', h: 'h-5' },
      { label: 'CTA', h: 'h-4' },
    ],
  },
  {
    id: 'coming-soon',
    name: 'Coming Soon',
    category: 'Coming Soon',
    description: 'Build hype before launch with an email capture and countdown timer.',
    uses: 934,
    rating: 4.7,
    badge: 'New',
    badgeColor: 'bg-green-500 text-white',
    icon: Zap,
    iconColor: 'text-yellow-500',
    preview: [
      { label: 'Countdown', h: 'h-10' },
      { label: 'Email Capture', h: 'h-5' },
    ],
  },
  {
    id: 'collection-page',
    name: 'Collection Page',
    category: 'E-commerce',
    description: 'Showcase a full product catalogue with filters and responsive grid layout.',
    uses: 721,
    rating: 4.6,
    badge: null,
    icon: Package,
    iconColor: 'text-blue-500',
    preview: [
      { label: 'Filter Bar', h: 'h-4' },
      { label: 'Product Grid', h: 'h-12' },
      { label: 'Pagination', h: 'h-3' },
    ],
  },
  {
    id: 'flash-sale',
    name: 'Flash Sale',
    category: 'E-commerce',
    description: 'Urgency-driven layout with countdown timer and bulk discount blocks.',
    uses: 583,
    rating: 4.8,
    badge: 'Hot',
    badgeColor: 'bg-red-500 text-white',
    icon: Zap,
    iconColor: 'text-red-500',
    preview: [
      { label: 'Timer Banner', h: 'h-5' },
      { label: 'Products', h: 'h-10' },
      { label: 'CTA', h: 'h-4' },
    ],
  },
  {
    id: 'brand-story',
    name: 'Brand Story',
    category: 'Landing',
    description: 'Long-form storytelling page to build trust and brand loyalty.',
    uses: 412,
    rating: 4.5,
    badge: null,
    icon: FileText,
    iconColor: 'text-purple-500',
    preview: [
      { label: 'Hero', h: 'h-8' },
      { label: 'Story', h: 'h-14' },
      { label: 'Team', h: 'h-6' },
    ],
  },
  {
    id: 'bundle-builder',
    name: 'Bundle Builder',
    category: 'E-commerce',
    description: 'Interactive bundle page to upsell complementary products.',
    uses: 389,
    rating: 4.6,
    badge: null,
    icon: Layers,
    iconColor: 'text-green-500',
    preview: [
      { label: 'Bundle Picker', h: 'h-10' },
      { label: 'Summary', h: 'h-6' },
      { label: 'CTA', h: 'h-4' },
    ],
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    category: 'Portfolio',
    description: 'Clean portfolio showcase with project cards, skills, and contact section.',
    uses: 267,
    rating: 4.7,
    badge: null,
    icon: Globe,
    iconColor: 'text-indigo-500',
    preview: [
      { label: 'Bio', h: 'h-6' },
      { label: 'Projects', h: 'h-12' },
      { label: 'Contact', h: 'h-5' },
    ],
  },
  {
    id: 'event-page',
    name: 'Event Page',
    category: 'Landing',
    description: 'Drive registrations with a compelling event page and ticketing CTA.',
    uses: 198,
    rating: 4.4,
    badge: null,
    icon: BarChart2,
    iconColor: 'text-orange-500',
    preview: [
      { label: 'Event Banner', h: 'h-8' },
      { label: 'Agenda', h: 'h-8' },
      { label: 'Register CTA', h: 'h-5' },
    ],
  },
  {
    id: 'affiliate',
    name: 'Affiliate / Review',
    category: 'Other',
    description: 'Comparison and review page optimised for affiliate conversions.',
    uses: 156,
    rating: 4.3,
    badge: null,
    icon: Star,
    iconColor: 'text-amber-500',
    preview: [
      { label: 'Comparison Table', h: 'h-12' },
      { label: 'Review Cards', h: 'h-8' },
      { label: 'CTA', h: 'h-4' },
    ],
  },
]

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({ template, onUse }) {
  const [hovered, setHovered] = useState(false)
  const Icon = template.icon

  return (
    <div
      className="group relative rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-md transition-all"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Preview Area */}
      <div className="relative bg-muted/30 border-b border-border p-4 h-36 overflow-hidden">
        {template.badge && (
          <span className={`absolute top-2 right-2 z-10 rounded-full px-2 py-0.5 text-xs font-semibold ${template.badgeColor}`}>
            {template.badge}
          </span>
        )}
        {/* Wireframe preview */}
        <div className="space-y-1.5">
          {template.preview.map((section, i) => (
            <div key={i} className={`${section.h} w-full rounded bg-muted/70 border border-border/50 flex items-center px-2`}>
              <span className="text-[9px] text-muted-foreground font-mono">{section.label}</span>
            </div>
          ))}
        </div>
        {/* Hover overlay */}
        {hovered && (
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center gap-2 backdrop-blur-[1px]">
            <button className="flex items-center gap-1.5 rounded-lg bg-white border border-border px-3 py-2 text-xs font-medium shadow hover:bg-muted transition-colors">
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
            <button
              onClick={() => onUse(template.id)}
              className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-medium shadow hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Use
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className={`h-4 w-4 ${template.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate">{template.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{template.description}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              {template.rating}
            </span>
            <span>{template.uses.toLocaleString()} uses</span>
          </div>
          <button
            onClick={() => onUse(template.id)}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline transition-colors"
          >
            Use <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function TemplatesPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [favorites, setFavorites] = useState(new Set(['product-landing', 'coming-soon']))

  const filtered = TEMPLATES.filter(t => {
    const matchQuery = !query || t.name.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase())
    const matchCategory = category === 'All' || t.category === category
    return matchQuery && matchCategory
  })

  function handleUse(templateId) {
    navigate(`/app/editor/new?template=${templateId}`)
  }

  function toggleFavorite(id) {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <PageLayout>
      <Header />
      <main className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Layout className="h-6 w-6 text-primary" />
              Templates
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Start from a conversion-optimised layout and customise it in minutes.
            </p>
          </div>
          <Button onClick={() => navigate('/app/editor/new')} className="flex items-center gap-2 font-semibold">
            <Plus className="h-4 w-4" />
            Blank Page
          </Button>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground transition-all"
              placeholder="Search templates..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  category === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Favorites (if any) */}
        {favorites.size > 0 && category === 'All' && !query && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-red-400" />
              Favourites
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {TEMPLATES.filter(t => favorites.has(t.id)).map(t => (
                <div key={t.id} className="relative">
                  <TemplateCard template={t} onUse={handleUse} />
                  <button
                    onClick={() => toggleFavorite(t.id)}
                    className="absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 backdrop-blur text-red-400 hover:text-red-500 transition-colors shadow-sm"
                  >
                    <Heart className="h-3.5 w-3.5 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Templates */}
        <section>
          {(category !== 'All' || query || favorites.size === 0) && (
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {query ? `Results for "${query}"` : category !== 'All' ? category : 'All Templates'}
              <span className="ml-1.5 text-xs font-normal normal-case">({filtered.length})</span>
            </h2>
          )}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <Search className="h-10 w-10 opacity-30" />
              <p className="text-sm font-medium">No templates found</p>
              <p className="text-xs">Try a different search term or category.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map(t => (
                <div key={t.id} className="relative">
                  <TemplateCard template={t} onUse={handleUse} />
                  <button
                    onClick={() => toggleFavorite(t.id)}
                    className={`absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full backdrop-blur transition-colors shadow-sm ${
                      favorites.has(t.id)
                        ? 'bg-white/80 text-red-400 hover:text-red-500'
                        : 'bg-white/60 text-muted-foreground/60 hover:text-red-400 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${favorites.has(t.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </PageLayout>
  )
}
