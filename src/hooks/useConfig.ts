import { useState, useEffect, useMemo } from "react"
import { fetchAll } from "@/scanner/api-client"
import type { ConfigItem, ConfigStats } from "@/types"

export function useConfig() {
  const [agents, setAgents] = useState<ConfigItem[]>([])
  const [commands, setCommands] = useState<ConfigItem[]>([])
  const [skills, setSkills] = useState<ConfigItem[]>([])
  const [contextFiles, setContextFiles] = useState<ConfigItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAll()
        setAgents(data.agents)
        setCommands(data.commands)
        setSkills(data.skills)
        setContextFiles(data.contextFiles)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch config")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const allItems = useMemo(
    () => [...agents, ...commands, ...skills, ...contextFiles],
    [agents, commands, skills, contextFiles]
  )

  const stats: ConfigStats = useMemo(() => {
    const categories: Record<string, number> = {}
    const countCategory = (items: ConfigItem[]) => {
      for (const item of items) {
        categories[item.category] = (categories[item.category] || 0) + 1
      }
    }
    countCategory(agents)
    countCategory(commands)
    countCategory(skills)

    return {
      agents: agents.length,
      commands: commands.length,
      skills: skills.length,
      contextFiles: contextFiles.length,
      totalFiles: allItems.length,
      totalTokens: allItems.reduce((sum, i) => sum + i.estimatedTokens, 0),
      categories,
    }
  }, [agents, commands, skills, contextFiles, allItems])

  return { agents, commands, skills, contextFiles, allItems, stats, loading, error }
}
