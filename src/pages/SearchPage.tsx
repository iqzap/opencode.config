import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/ui/input"
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ConfigItem } from "@/types"
import { useState as useReactState } from "react"

export function SearchPage({ items }: { items: ConfigItem[] }) {
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    return items.filter(
      (i) =>
        i.displayName.toLowerCase().includes(q) ||
        i.displayDescription.toLowerCase().includes(q) ||
        i.content.toLowerCase().includes(q) ||
        i.relativePath.toLowerCase().includes(q) ||
        i.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [items, search])

  const copyPath = async (path: string) => {
    await navigator.clipboard.writeText(path)
    setCopied(path)
    setTimeout(() => setCopied(null), 2000)
  }

  const highlightMatch = (text: string) => {
    if (!search.trim()) return text
    const q = search.trim()
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-primary/20 text-foreground rounded px-0.5">
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    )
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground mt-1">
          Search across all agents, commands, skills, and context files
        </p>
      </div>

      <SearchInput
        placeholder="Type to search across all config items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6"
      />

      {search.trim() && (
        <p className="text-sm text-muted-foreground mb-4">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
        </p>
      )}

      <div className="space-y-3">
        {filtered.map((item) => {
          const isExpanded = expanded === item.relativePath
          return (
            <Card key={item.relativePath}>
              <button
                onClick={() =>
                  setExpanded(isExpanded ? null : item.relativePath)
                }
                className="w-full text-left"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={item.itemType}>
                          {item.itemType}
                        </Badge>
                        <CardTitle className="text-sm truncate">
                          {highlightMatch(item.displayName)}
                        </CardTitle>
                      </div>
                      <p className="font-mono text-xs text-muted-foreground mt-1">
                        {item.relativePath}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </button>
              {isExpanded && (
                <CardContent>
                  <CardDescription className="mb-3">
                    {item.displayDescription}
                  </CardDescription>
                  <div className="flex gap-1.5 mb-3">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {item.lineCount} lines &middot; {item.estimatedTokens} tokens
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        copyPath(item.filePath)
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                      {copied === item.filePath ? (
                        <>
                          <Check className="h-3 w-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copy path
                        </>
                      )}
                    </button>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {!search.trim() && (
        <div className="text-center py-16 text-muted-foreground">
          <p>Start typing to search</p>
          <p className="text-sm mt-1">Searches names, descriptions, tags, and content</p>
        </div>
      )}

      {search.trim() && filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p>No results found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  )
}
