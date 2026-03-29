import { useState, useMemo, useCallback } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"
import { Copy, Check, ExternalLink, Clock } from "lucide-react"
import { toggleItem } from "@/scanner/api-client"
import type { ConfigItem, FrontmatterData } from "@/types"

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHrs === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60))
      return diffMins <= 1 ? "just now" : `${diffMins}m ago`
    }
    return `${diffHrs}h ago`
  }
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function ToolsBadges({ tools }: { tools?: Record<string, boolean> }) {
  if (!tools || typeof tools !== "object") return null
  const entries = Object.entries(tools)
  return (
    <div className="flex flex-wrap gap-1">
      {entries.map(([key, val]) => (
        <Badge key={key} variant={val ? "secondary" : "default"} className="text-[10px]">
          {key}: {val ? "on" : "off"}
        </Badge>
      ))}
    </div>
  )
}

function DetailModal({
  item,
  open,
  onClose,
  onToggle,
}: {
  item: ConfigItem | null
  open: boolean
  onClose: () => void
  onToggle: () => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!item) return
    await navigator.clipboard.writeText(item.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [item])

  if (!item || !open) return null

  const fm = item.frontmatter as FrontmatterData
  const lines = item.content.split("\n")
  const lineNumWidth = String(lines.length).length

  return (
    <Modal open={open} onClose={onClose}>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={item.itemType}>{item.itemType}</Badge>
          <Badge variant="secondary">{item.mode}</Badge>
          {fm.version && (
            <Badge variant="secondary">v{fm.version}</Badge>
          )}
          {!item.enabled && (
            <Badge className="bg-destructive/15 text-destructive border-destructive/30">Disabled</Badge>
          )}
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold tracking-tight">{item.displayName}</h2>
            <button
              onClick={(e) => {
                e.stopPropagation()
                fetch("http://localhost:3001/api/open", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ relativePath: item.relativePath }),
                })
              }}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground mt-1 hover:text-foreground transition-colors"
            >
              {item.relativePath}
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
          <Toggle checked={item.enabled} onChange={onToggle} size="md" />
        </div>
      </div>

      {/* Disabled banner */}
      {!item.enabled && (
        <div className="mb-5 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive">
          This item is disabled. Opencode will not load it on startup.
        </div>
      )}

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-5">
        {item.displayDescription}
      </p>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-5 text-sm">
        {fm.author && (
          <div>
            <span className="text-muted-foreground text-xs">Author</span>
            <p className="font-medium">{fm.author}</p>
          </div>
        )}
        {fm.temperature !== undefined && (
          <div>
            <span className="text-muted-foreground text-xs">Temperature</span>
            <p className="font-medium">{fm.temperature}</p>
          </div>
        )}
        <div>
          <span className="text-muted-foreground text-xs">Lines</span>
          <p className="font-medium">{item.lineCount}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Est. Tokens</span>
          <p className="font-medium">{item.estimatedTokens.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Category</span>
          <p className="font-mono text-xs font-medium">{item.category}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Last Modified</span>
          <p className="font-medium" title={new Date(item.lastModified).toLocaleString()}>
            {formatDate(item.lastModified)}
          </p>
        </div>
      </div>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="mb-5">
          <span className="text-xs text-muted-foreground mb-2 block">Tags</span>
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Tools */}
      {fm.tools && typeof fm.tools === "object" && (
        <div className="mb-5">
          <span className="text-xs text-muted-foreground mb-2 block">Tools</span>
          <ToolsBadges tools={fm.tools} />
        </div>
      )}

      {/* Dependencies */}
      {fm.dependencies && fm.dependencies.length > 0 && (
        <div className="mb-5">
          <span className="text-xs text-muted-foreground mb-2 block">Dependencies</span>
          <div className="flex flex-wrap gap-1.5">
            {fm.dependencies.map((dep) => (
              <Badge key={dep} variant="secondary" className="font-mono text-[10px]">
                {dep}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Full content with line numbers */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Prompt Content</span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </button>
        </div>
        <div className="bg-secondary/40 rounded-md border border-border overflow-hidden">
          <div className="overflow-y-auto max-h-[60vh]">
            <pre className="text-xs font-mono leading-relaxed py-3">
              {lines.map((line, i) => (
                <div key={i} className="flex hover:bg-secondary/60 px-3">
                  <span
                    className="inline-block text-right pr-4 text-muted-foreground/30 select-none flex-shrink-0"
                    style={{ minWidth: `${lineNumWidth + 1}ch` }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-foreground/80 whitespace-pre-wrap break-all flex-1 min-w-0">
                    {line}
                  </span>
                </div>
              ))}
            </pre>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          {lines.length} lines &middot; {item.estimatedTokens.toLocaleString()} tokens
        </p>
      </div>
    </Modal>
  )
}

export function ItemListPage({
  items,
  title,
  itemType,
}: {
  items: ConfigItem[]
  title: string
  itemType: ConfigItem["itemType"]
}) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<ConfigItem | null>(null)
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [localItems, setLocalItems] = useState<Record<string, ConfigItem>>({})

  const categories = useMemo(() => {
    const cats = new Set(items.map((i) => i.category))
    return [...cats].sort()
  }, [items])

  const resolvedItems = useMemo(() => {
    return items.map((item) => localItems[item.relativePath] ?? item)
  }, [items, localItems])

  const filtered = useMemo(() => {
    let result = resolvedItems
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (i) =>
          i.displayName.toLowerCase().includes(q) ||
          i.displayDescription.toLowerCase().includes(q) ||
          i.relativePath.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    if (selectedCategory) {
      result = result.filter((i) => i.category === selectedCategory)
    }
    return result
  }, [resolvedItems, search, selectedCategory])

  const handleToggle = useCallback(
    async (item: ConfigItem) => {
      const existing = localItems[item.relativePath] ?? item
      // Optimistic: flip immediately
      setLocalItems((prev) => ({
        ...prev,
        [item.relativePath]: { ...existing, enabled: !existing.enabled },
      }))
      try {
        const result = await toggleItem(item.relativePath)
        setLocalItems((prev) => ({
          ...prev,
          [item.relativePath]: { ...existing, enabled: result.enabled },
        }))
      } catch {
        // Revert on error
        setLocalItems((prev) => {
          const next = { ...prev }
          delete next[item.relativePath]
          return next
        })
      }
    },
    [localItems]
  )

  const resolvedSelectedItem = selectedItem
    ? (localItems[selectedItem.relativePath] ?? selectedItem)
    : null

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">
          {items.length} {itemType}{items.length !== 1 ? "s" : ""} in your configuration
        </p>
      </div>

      <div className="mb-6 space-y-3">
        <SearchInput
          placeholder={`Search ${title.toLowerCase()}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
        {categories.length > 0 && (
          <div className="relative">
            <div
              className={cn(
                "flex gap-1.5 flex-wrap",
                !showAllCategories && "max-h-[3.625rem] overflow-hidden"
              )}
            >
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border",
                  selectedCategory === null
                    ? "bg-secondary text-foreground border-border"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                )}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === cat ? null : cat)
                  }
                  className={cn(
                    "px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border font-mono",
                    selectedCategory === cat
                      ? "bg-secondary text-foreground border-border"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            {categories.length > 8 && (
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="mt-1.5 px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary"
              >
                {showAllCategories ? "Show less" : `Show all (${categories.length})`}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <Card
            key={item.relativePath}
            className={cn(
              "hover:border-ring/30 transition-all cursor-pointer relative",
              !item.enabled && "opacity-50"
            )}
            onClick={() => setSelectedItem(item)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <CardTitle className="text-base truncate">
                      {item.displayName}
                    </CardTitle>
                    {!item.enabled && (
                      <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[9px] px-1.5 py-0">
                        Disabled
                      </Badge>
                    )}
                  </div>
                  <p className="font-mono text-xs text-muted-foreground mt-1 truncate">
                    {item.relativePath}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="line-clamp-2 mb-3">
                {item.displayDescription}
              </CardDescription>
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5 flex-wrap">
                  {item.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{item.tags.length - 3}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">
                  {item.lineCount}L &middot; {item.estimatedTokens}tok
                </span>
              </div>
              <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border/50">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(item.lastModified)}</span>
                </div>
                <Toggle
                  checked={item.enabled}
                  onChange={() => handleToggle(item)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No {title.toLowerCase()} found matching your criteria
        </div>
      )}

      <DetailModal
        item={resolvedSelectedItem}
        open={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        onToggle={() => {
          if (resolvedSelectedItem) handleToggle(resolvedSelectedItem)
        }}
      />
    </div>
  )
}
