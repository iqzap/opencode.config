import matter from "gray-matter"
import { glob } from "fs/promises"
import { readFile, stat } from "fs/promises"
import path from "path"
import type { ParsedFile, FrontmatterData } from "@/types"

const OPENCODE_DIR = path.resolve(
  process.env.HOME || "/",
  ".config/opencode"
)

function estimateTokens(content: string): number {
  return Math.ceil(content.length / 4)
}

async function globToArray(pattern: string): Promise<string[]> {
  try {
    const result = await glob(pattern)
    if (Array.isArray(result)) return result
    const items: string[] = []
    for await (const item of result as unknown as AsyncIterable<string>) {
      items.push(item)
    }
    return items
  } catch {
    return []
  }
}

async function parseMarkdownFile(
  filePath: string
): Promise<ParsedFile | null> {
  try {
    const raw = await readFile(filePath, "utf-8")
    const { data, content } = matter(raw)
    const stats = await stat(filePath)
    const isDisabled = filePath.endsWith(".md.disabled")

    return {
      filePath,
      relativePath: path.relative(OPENCODE_DIR, filePath).replace(/\.disabled$/, ""),
      fileName: path.basename(filePath, isDisabled ? ".md.disabled" : ".md"),
      directory: path.relative(OPENCODE_DIR, path.dirname(filePath)),
      frontmatter: (data ?? {}) as FrontmatterData,
      content,
      lineCount: raw.split("\n").length,
      estimatedTokens: estimateTokens(raw),
      lastModified: stats.mtime.toISOString(),
      enabled: !isDisabled,
    }
  } catch {
    return null
  }
}

async function scanDir(subDir: string): Promise<ParsedFile[]> {
  const patternEnabled = path.join(OPENCODE_DIR, subDir, "**/*.md")
  const patternDisabled = path.join(OPENCODE_DIR, subDir, "**/*.md.disabled")
  const [enabledFiles, disabledFiles] = await Promise.all([
    globToArray(patternEnabled),
    globToArray(patternDisabled),
  ])
  const allFiles = [...enabledFiles, ...disabledFiles]
  const results = await Promise.all(allFiles.map(parseMarkdownFile))
  return results
    .filter((f): f is ParsedFile => f !== null)
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath))
}

export async function scanMarkdownFiles(
  subDir: string
): Promise<ParsedFile[]> {
  return scanDir(subDir)
}

export async function scanAgents(): Promise<ParsedFile[]> {
  return scanDir("agent")
}

export async function scanCommands(): Promise<ParsedFile[]> {
  return scanDir("command")
}

export async function scanSkills(): Promise<ParsedFile[]> {
  const patternEnabled = path.join(OPENCODE_DIR, "skill", "**/SKILL.md")
  const patternDisabled = path.join(OPENCODE_DIR, "skill", "**/SKILL.md.disabled")
  const [enabledFiles, disabledFiles] = await Promise.all([
    globToArray(patternEnabled),
    globToArray(patternDisabled),
  ])
  const allFiles = [...enabledFiles, ...disabledFiles]
  const results = await Promise.all(allFiles.map(parseMarkdownFile))
  return results
    .filter((f): f is ParsedFile => f !== null)
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath))
}

export async function scanContext(): Promise<ParsedFile[]> {
  return scanDir("context")
}
