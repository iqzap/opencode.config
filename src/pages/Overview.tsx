import {
  Bot,
  Terminal,
  Zap,
  BookOpen,
  FileText,
  TrendingUp,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ConfigItem, ConfigStats } from "@/types"

export function OverviewPage({
  items,
  stats,
}: {
  items: ConfigItem[]
  stats: ConfigStats
}) {
  const summaryCards = [
    {
      label: "Agents",
      count: stats.agents,
      icon: Bot,
      color: "text-agent",
      badge: "agent" as const,
    },
    {
      label: "Commands",
      count: stats.commands,
      icon: Terminal,
      color: "text-command",
      badge: "command" as const,
    },
    {
      label: "Skills",
      count: stats.skills,
      icon: Zap,
      color: "text-skill",
      badge: "skill" as const,
    },
    {
      label: "Context Files",
      count: stats.contextFiles,
      icon: BookOpen,
      color: "text-context",
      badge: "context" as const,
    },
  ]

  const topCategories = Object.entries(stats.categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)

  const largestFiles = [...items]
    .sort((a, b) => b.estimatedTokens - a.estimatedTokens)
    .slice(0, 8)

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">
          Your opencode configuration at a glance
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Top Categories</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topCategories.map(([cat, count]) => (
                <div
                  key={cat}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground font-mono text-xs">
                    {cat}
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
              {topCategories.length === 0 && (
                <p className="text-sm text-muted-foreground">No categories found</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Largest Files (by tokens)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {largestFiles.map((item) => (
                <div
                  key={item.relativePath}
                  className="flex items-center justify-between text-sm gap-3"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Badge variant={item.itemType}>
                      {item.itemType}
                    </Badge>
                    <span className="font-mono text-xs text-muted-foreground truncate">
                      {item.relativePath}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {item.estimatedTokens.toLocaleString()} tok
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
