export interface FrontmatterData {
  id?: string
  name?: string
  description?: string
  mode?: string
  category?: string
  type?: string
  version?: string
  author?: string
  temperature?: number
  tags?: string[]
  tools?: Record<string, boolean>
  permissions?: Record<string, string>
  dependencies?: string[]
  argumentHint?: string
  [key: string]: unknown
}

export interface ParsedFile {
  filePath: string
  relativePath: string
  fileName: string
  directory: string
  frontmatter: FrontmatterData
  content: string
  lineCount: number
  estimatedTokens: number
  lastModified: string
  enabled: boolean
}

export type ConfigItemType = "agent" | "command" | "skill" | "context"

export interface ConfigItem extends ParsedFile {
  itemType: ConfigItemType
  displayName: string
  displayDescription: string
  category: string
  tags: string[]
  mode: string
}

export interface ConfigStats {
  agents: number
  commands: number
  skills: number
  contextFiles: number
  totalFiles: number
  totalTokens: number
  categories: Record<string, number>
}
