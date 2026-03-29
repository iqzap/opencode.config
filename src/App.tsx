import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { OverviewPage } from "@/pages/Overview"
import { ItemListPage } from "@/pages/ItemList"
import { SearchPage } from "@/pages/SearchPage"
import { useConfig } from "@/hooks/useConfig"

function App() {
  const { agents, commands, skills, contextFiles, allItems, stats, loading, error } =
    useConfig()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Scanning opencode config...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-destructive">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm font-medium">Failed to load config</p>
          <p className="text-xs">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout stats={stats} />}>
          <Route
            index
            element={<OverviewPage items={allItems} stats={stats} />}
          />
          <Route
            path="agents"
            element={<ItemListPage items={agents} title="Agents" itemType="agent" />}
          />
          <Route
            path="commands"
            element={<ItemListPage items={commands} title="Commands" itemType="command" />}
          />
          <Route
            path="skills"
            element={<ItemListPage items={skills} title="Skills" itemType="skill" />}
          />
          <Route
            path="context"
            element={<ItemListPage items={contextFiles} title="Context Files" itemType="context" />}
          />
          <Route
            path="search"
            element={<SearchPage items={allItems} />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
