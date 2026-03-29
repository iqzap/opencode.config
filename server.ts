import matter from "gray-matter"
import { glob } from "fs/promises"
import { readFile, stat, rename } from "fs/promises"
import path from "path"
import { existsSync } from "fs"
import { exec } from "child_process"

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

interface ParsedFile {
  filePath: string
  relativePath: string
  fileName: string
  directory: string
  frontmatter: Record<string, unknown>
  content: string
  lineCount: number
  estimatedTokens: number
  lastModified: string
  enabled: boolean
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
      frontmatter: (data ?? {}) as Record<string, unknown>,
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
  const pattern = path.join(OPENCODE_DIR, subDir)
  const [mdFiles, disabledFiles] = await Promise.all([
    globToArray(path.join(pattern, "**/*.md")),
    globToArray(path.join(pattern, "**/*.md.disabled")),
  ])
  const files = [...mdFiles, ...disabledFiles]
  const results = await Promise.all(files.map(parseMarkdownFile))
  return results
    .filter((f): f is ParsedFile => f !== null)
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath))
}

async function scanSkills(): Promise<ParsedFile[]> {
  const skillDir = path.join(OPENCODE_DIR, "skill")
  const [mdFiles, disabledFiles] = await Promise.all([
    globToArray(path.join(skillDir, "**/SKILL.md")),
    globToArray(path.join(skillDir, "**/SKILL.md.disabled")),
  ])
  const files = [...mdFiles, ...disabledFiles]
  const results = await Promise.all(files.map(parseMarkdownFile))
  return results
    .filter((f): f is ParsedFile => f !== null)
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath))
}

export default async function startApi(port: number) {
  const { default: express } = await import("express")
  const { default: cors } = await import("cors")

  const app = express()
  app.use(cors())
  app.use(express.json())

  app.get("/api/agents", async (_req, res) => {
    res.json(await scanDir("agent"))
  })

  app.get("/api/commands", async (_req, res) => {
    res.json(await scanDir("command"))
  })

  app.get("/api/skills", async (_req, res) => {
    res.json(await scanSkills())
  })

  app.get("/api/context", async (_req, res) => {
    res.json(await scanDir("context"))
  })

  app.get("/api/all", async (_req, res) => {
    const [agents, commands, skills, contextFiles] = await Promise.all([
      scanDir("agent"),
      scanDir("command"),
      scanSkills(),
      scanDir("context"),
    ])
    res.json({ agents, commands, skills, contextFiles })
  })

  app.get("/api/raw", async (req, res) => {
    const relPath = req.query.path as string
    if (!relPath) {
      res.status(400).send("Missing path query parameter")
      return
    }
    const fullPath = path.resolve(OPENCODE_DIR, relPath)
    if (!fullPath.startsWith(OPENCODE_DIR)) {
      res.status(403).send("Forbidden")
      return
    }
    // Try both enabled and disabled variants
    const paths = [fullPath, fullPath + ".disabled"]
    for (const p of paths) {
      if (existsSync(p)) {
        const contents = await readFile(p, "utf-8")
        res.setHeader("Content-Type", "text/plain; charset=utf-8")
        res.send(contents)
        return
      }
    }
    res.status(404).send("File not found")
  })

  app.post("/api/toggle", async (req, res) => {
    const { relativePath } = req.body
    if (!relativePath || typeof relativePath !== "string") {
      res.status(400).json({ error: "Missing relativePath" })
      return
    }

    const cleanPath = relativePath.replace(/\.disabled$/, "")
    const enabledPath = path.resolve(OPENCODE_DIR, cleanPath)
    const disabledPath = enabledPath + ".disabled"

    if (!enabledPath.startsWith(OPENCODE_DIR)) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    const wasEnabled = existsSync(enabledPath)
    const wasDisabled = existsSync(disabledPath)

    if (wasEnabled) {
      await rename(enabledPath, disabledPath)
      res.json({ enabled: false, relativePath: cleanPath })
    } else if (wasDisabled) {
      await rename(disabledPath, enabledPath)
      res.json({ enabled: true, relativePath: cleanPath })
    } else {
      res.status(404).json({ error: "File not found" })
    }
  })

  app.post("/api/open", (req, res) => {
    const { relativePath } = req.body
    if (!relativePath || typeof relativePath !== "string") {
      res.status(400).json({ error: "Missing relativePath" })
      return
    }

    const cleanPath = relativePath.replace(/\.disabled$/, "")
    const enabledPath = path.resolve(OPENCODE_DIR, cleanPath)
    const disabledPath = enabledPath + ".disabled"

    if (!enabledPath.startsWith(OPENCODE_DIR)) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    const realPath = existsSync(disabledPath) ? disabledPath : existsSync(enabledPath) ? enabledPath : null
    if (!realPath) {
      res.status(404).json({ error: "File not found" })
      return
    }

    exec(`open -R "${realPath}"`, (err) => {
      if (err) {
        res.status(500).json({ error: "Failed to open" })
        return
      }
      res.json({ success: true })
    })
  })

  app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`)
  })
}

const port = parseInt(process.env.API_PORT || "3001", 10)
startApi(port)
