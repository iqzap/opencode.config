import { NavLink, Outlet } from "react-router-dom"
import {
  LayoutDashboard,
  Bot,
  Terminal,
  Zap,
  BookOpen,
  Search,
  type LucideIcon,
} from "lucide-react"
import type { ConfigStats } from "@/types"
import { cn } from "@/lib/utils"

interface SidebarLink {
  to: string
  label: string
  icon: LucideIcon
  count?: number
}

export function Layout({ stats }: { stats: ConfigStats }) {
  const links: SidebarLink[] = [
    { to: "/", label: "Overview", icon: LayoutDashboard },
    { to: "/agents", label: "Agents", icon: Bot, count: stats.agents },
    { to: "/commands", label: "Commands", icon: Terminal, count: stats.commands },
    { to: "/skills", label: "Skills", icon: Zap, count: stats.skills },
    { to: "/context", label: "Context", icon: BookOpen, count: stats.contextFiles },
    { to: "/search", label: "Search", icon: Search },
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-60 flex-shrink-0 border-r border-sidebar-border bg-sidebar-bg flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">
            Opencode
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Config Explorer
          </p>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )
              }
            >
              <link.icon className="h-4 w-4" />
              <span className="flex-1">{link.label}</span>
              {link.count !== undefined && (
                <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                  {link.count}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border text-xs text-muted-foreground">
          {stats.totalFiles} files &middot;{" "}
          {(stats.totalTokens / 1000).toFixed(1)}k tokens
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
