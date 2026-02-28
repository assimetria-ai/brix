import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Type,
  Image,
  Square,
  Minus,
  Video,
  AlignLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Save,
  ChevronLeft,
  Settings,
  Grip,
} from 'lucide-react'
import { Header } from '../../../components/@system/Header/Header'
import { Button } from '../../../components/@system/ui/button'

// ─── Block Types ──────────────────────────────────────────────────────────────

const BLOCK_TYPES = [
  { type: 'heading', label: 'Heading', icon: Type, defaultContent: { text: 'Your Heading Here', level: 1 } },
  { type: 'text', label: 'Text', icon: AlignLeft, defaultContent: { text: 'Add your text content here. Click to edit.' } },
  { type: 'image', label: 'Image', icon: Image, defaultContent: { src: '', alt: 'Image placeholder', caption: '' } },
  { type: 'button', label: 'Button', icon: Square, defaultContent: { text: 'Click me', url: '#', variant: 'primary' } },
  { type: 'divider', label: 'Divider', icon: Minus, defaultContent: {} },
  { type: 'video', label: 'Video', icon: Video, defaultContent: { url: '', caption: '' } },
]

// ─── Seed blocks ─────────────────────────────────────────────────────────────

const SEED_BLOCKS = [
  { id: 'b1', type: 'heading', content: { text: 'Welcome to Your Page', level: 1 } },
  { id: 'b2', type: 'text', content: { text: 'This is a sample paragraph. Click any block to edit its content. Use the toolbar on the left to add new blocks.' } },
  { id: 'b3', type: 'button', content: { text: 'Get Started', url: '#', variant: 'primary' } },
]

// ─── Block Renderers ──────────────────────────────────────────────────────────

function HeadingBlock({ content, selected, onUpdate }) {
  const Tag = `h${content.level || 1}`
  const sizes = { 1: 'text-4xl', 2: 'text-3xl', 3: 'text-2xl' }
  return (
    <div className="py-2">
      {selected ? (
        <div className="space-y-2">
          <div className="flex gap-2 mb-2">
            {[1, 2, 3].map(l => (
              <button
                key={l}
                onClick={() => onUpdate({ ...content, level: l })}
                className={`px-2 py-1 text-xs rounded font-mono border transition-colors ${
                  content.level === l ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'
                }`}
              >
                H{l}
              </button>
            ))}
          </div>
          <input
            className="w-full bg-transparent border-0 outline-none font-bold text-foreground resize-none"
            style={{ fontSize: content.level === 1 ? '2.25rem' : content.level === 2 ? '1.875rem' : '1.5rem' }}
            value={content.text}
            onChange={e => onUpdate({ ...content, text: e.target.value })}
            autoFocus
          />
        </div>
      ) : (
        <Tag className={`${sizes[content.level || 1]} font-bold text-foreground`}>{content.text}</Tag>
      )}
    </div>
  )
}

function TextBlock({ content, selected, onUpdate }) {
  return (
    <div className="py-2">
      {selected ? (
        <textarea
          className="w-full bg-transparent border-0 outline-none text-foreground text-base leading-relaxed resize-none min-h-[80px]"
          value={content.text}
          onChange={e => onUpdate({ ...content, text: e.target.value })}
          autoFocus
        />
      ) : (
        <p className="text-base text-foreground leading-relaxed">{content.text}</p>
      )}
    </div>
  )
}

function ImageBlock({ content, selected, onUpdate }) {
  return (
    <div className="py-2">
      {selected ? (
        <div className="space-y-2">
          <input
            className="w-full rounded border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            placeholder="Image URL (https://...)"
            value={content.src}
            onChange={e => onUpdate({ ...content, src: e.target.value })}
          />
          <input
            className="w-full rounded border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            placeholder="Alt text"
            value={content.alt}
            onChange={e => onUpdate({ ...content, alt: e.target.value })}
          />
          <input
            className="w-full rounded border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            placeholder="Caption (optional)"
            value={content.caption}
            onChange={e => onUpdate({ ...content, caption: e.target.value })}
          />
        </div>
      ) : null}
      {content.src ? (
        <figure className="space-y-2">
          <img src={content.src} alt={content.alt} className="w-full rounded-lg object-cover max-h-80" />
          {content.caption && <figcaption className="text-xs text-muted-foreground text-center">{content.caption}</figcaption>}
        </figure>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/40 py-12 text-muted-foreground gap-2">
          <Image className="h-8 w-8 opacity-40" />
          <p className="text-sm">Click to add image URL</p>
        </div>
      )}
    </div>
  )
}

function ButtonBlock({ content, selected, onUpdate }) {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-border hover:bg-muted',
  }
  return (
    <div className="py-2 flex flex-col items-start gap-2">
      {selected ? (
        <div className="space-y-2 w-full">
          <input
            className="w-full rounded border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            placeholder="Button text"
            value={content.text}
            onChange={e => onUpdate({ ...content, text: e.target.value })}
          />
          <input
            className="w-full rounded border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            placeholder="URL (https://...)"
            value={content.url}
            onChange={e => onUpdate({ ...content, url: e.target.value })}
          />
          <div className="flex gap-2">
            {Object.keys(variants).map(v => (
              <button
                key={v}
                onClick={() => onUpdate({ ...content, variant: v })}
                className={`px-3 py-1.5 text-xs rounded capitalize border transition-colors ${
                  content.variant === v ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <a
        href={content.url}
        className={`inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${variants[content.variant] || variants.primary}`}
        onClick={e => e.preventDefault()}
      >
        {content.text}
      </a>
    </div>
  )
}

function DividerBlock() {
  return <hr className="my-4 border-border" />
}

function VideoBlock({ content, selected, onUpdate }) {
  return (
    <div className="py-2">
      {selected ? (
        <div className="space-y-2">
          <input
            className="w-full rounded border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            placeholder="YouTube or Vimeo URL"
            value={content.url}
            onChange={e => onUpdate({ ...content, url: e.target.value })}
          />
          <input
            className="w-full rounded border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            placeholder="Caption (optional)"
            value={content.caption}
            onChange={e => onUpdate({ ...content, caption: e.target.value })}
          />
        </div>
      ) : null}
      {content.url ? (
        <div className="aspect-video rounded-lg overflow-hidden bg-black">
          <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
            <Video className="h-8 w-8 opacity-40" />
            <span className="text-sm">Video: {content.url}</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/40 py-12 text-muted-foreground gap-2">
          <Video className="h-8 w-8 opacity-40" />
          <p className="text-sm">Click to add video URL</p>
        </div>
      )}
    </div>
  )
}

function renderBlock(block, selected, onUpdate) {
  const props = { content: block.content, selected, onUpdate }
  switch (block.type) {
    case 'heading': return <HeadingBlock {...props} />
    case 'text': return <TextBlock {...props} />
    case 'image': return <ImageBlock {...props} />
    case 'button': return <ButtonBlock {...props} />
    case 'divider': return <DividerBlock />
    case 'video': return <VideoBlock {...props} />
    default: return <div className="text-muted-foreground text-sm">Unknown block: {block.type}</div>
  }
}

// ─── Block Wrapper ────────────────────────────────────────────────────────────

function BlockWrapper({ block, index, total, selected, onSelect, onUpdate, onDelete, onMove }) {
  return (
    <div
      className={`group relative rounded-lg border p-4 transition-all cursor-pointer ${
        selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-transparent hover:border-border hover:bg-muted/20'
      }`}
      onClick={() => onSelect(block.id)}
    >
      {/* Drag handle */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity">
        <Grip className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Block content */}
      <div className="ml-2">
        {renderBlock(block, selected, (newContent) => onUpdate(block.id, newContent))}
      </div>

      {/* Action toolbar (visible on hover/select) */}
      {(selected || true) && (
        <div className={`absolute right-2 top-2 flex gap-1 transition-opacity ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button
            onClick={e => { e.stopPropagation(); onMove(index, -1) }}
            disabled={index === 0}
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onMove(index, 1) }}
            disabled={index === total - 1}
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(block.id) }}
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function PageEditorPage() {
  const { pageId } = useParams()
  const navigate = useNavigate()
  const [blocks, setBlocks] = useState(SEED_BLOCKS)
  const [selectedId, setSelectedId] = useState(null)
  const [pageName, setPageName] = useState(pageId ? `Page ${pageId}` : 'Untitled Page')
  const [saved, setSaved] = useState(false)
  const [preview, setPreview] = useState(false)

  function addBlock(type) {
    const def = BLOCK_TYPES.find(b => b.type === type)
    const newBlock = {
      id: `b${Date.now()}`,
      type,
      content: { ...def.defaultContent },
    }
    setBlocks(prev => [...prev, newBlock])
    setSelectedId(newBlock.id)
  }

  function updateBlock(id, newContent) {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content: newContent } : b))
  }

  function deleteBlock(id) {
    setBlocks(prev => prev.filter(b => b.id !== id))
    setSelectedId(null)
  }

  function moveBlock(index, dir) {
    const newIndex = index + dir
    if (newIndex < 0 || newIndex >= blocks.length) return
    const newBlocks = [...blocks]
    const [removed] = newBlocks.splice(index, 1)
    newBlocks.splice(newIndex, 0, removed)
    setBlocks(newBlocks)
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Header />

      {/* Editor Toolbar */}
      <div className="border-b border-border bg-card px-4 py-2.5 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => navigate('/app/pages')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Pages
        </button>
        <div className="h-4 w-px bg-border" />
        <input
          className="flex-1 min-w-[120px] bg-transparent text-sm font-medium text-foreground border-0 outline-none focus:ring-0"
          value={pageName}
          onChange={e => setPageName(e.target.value)}
        />
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              preview ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted text-foreground'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            {preview ? 'Editing' : 'Preview'}
          </button>
          <Button size="sm" onClick={handleSave} className="flex items-center gap-1.5">
            <Save className="h-3.5 w-3.5" />
            {saved ? 'Saved!' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Block Picker */}
        {!preview && (
          <aside className="w-56 border-r border-border bg-card flex flex-col overflow-y-auto shrink-0">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="h-3.5 w-3.5" />
                Add Block
              </h3>
            </div>
            <div className="p-3 space-y-1">
              {BLOCK_TYPES.map(bt => (
                <button
                  key={bt.type}
                  onClick={() => addBlock(bt.type)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left"
                >
                  <bt.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {bt.label}
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* Center: Canvas */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-8 py-10">
            {preview ? (
              /* Preview mode */
              <article className="space-y-2">
                {blocks.map(block => (
                  <div key={block.id}>
                    {renderBlock(block, false, () => {})}
                  </div>
                ))}
              </article>
            ) : (
              /* Edit mode */
              <div
                className="space-y-1"
                onClick={() => setSelectedId(null)}
              >
                {blocks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                    <Plus className="h-10 w-10 opacity-30" />
                    <p className="text-sm font-medium">No blocks yet</p>
                    <p className="text-xs">Click a block type on the left to add content.</p>
                  </div>
                )}
                {blocks.map((block, index) => (
                  <BlockWrapper
                    key={block.id}
                    block={block}
                    index={index}
                    total={blocks.length}
                    selected={selectedId === block.id}
                    onSelect={id => { setSelectedId(id === selectedId ? null : id) }}
                    onUpdate={updateBlock}
                    onDelete={deleteBlock}
                    onMove={moveBlock}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
