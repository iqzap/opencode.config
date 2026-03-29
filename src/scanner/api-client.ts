import type { ParsedFile, ConfigItem, ConfigItemType, ConfigStats } from "@/types"

const API_BASE = "http://localhost:3001"

function toConfigItem(
  file: ParsedFile,
  itemType: ConfigItemType
): ConfigItem {
  const fm = file.frontmatter
  return {
    ...file,
    itemType,
    displayName:
      (fm.name as string) ||
      (fm.id as string) ||
      file.fileName,
    displayDescription:
      (fm.description as string) ||
      file.content.slice(0, 120).replace(/\n/g, " ").trim() + "...",
    category: (fm.category as string) || file.directory,
    tags: (fm.tags as string[]) || [],
    mode: (fm.mode as string) || "unknown",
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function fetchAgents(): Promise<ConfigItem[]> {
  const files = await fetchJson<ParsedFile[]>(`${API_BASE}/api/agents`)
  return files.map((f) => toConfigItem(f, "agent"))
}

export async function fetchCommands(): Promise<ConfigItem[]> {
  const files = await fetchJson<ParsedFile[]>(`${API_BASE}/api/commands`)
  return files.map((f) => toConfigItem(f, "command"))
}

export async function fetchSkills(): Promise<ConfigItem[]> {
  const files = await fetchJson<ParsedFile[]>(`${API_BASE}/api/skills`)
  return files.map((f) => toConfigItem(f, "skill"))
}

export async function fetchContext(): Promise<ConfigItem[]> {
  const files = await fetchJson<ParsedFile[]>(`${API_BASE}/api/context`)
  return files.map((f) => toConfigItem(f, "context"))
}

export async function fetchAll() {
  const [agents, commands, skills, contextFiles] = await Promise.all([
    fetchAgents(),
    fetchCommands(),
    fetchSkills(),
    fetchContext(),
  ])
  return { agents, commands, skills, contextFiles }
}

export async function toggleItem(relativePath: string): Promise<{ enabled: boolean; relativePath: string }> {
  const res = await fetch(`${API_BASE}/api/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ relativePath }),
  })
  if (!res.ok) throw new Error(`Toggle failed: ${res.status}`)
  return res.json()
}
