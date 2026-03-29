# opencode.config

A local web dashboard for browsing and managing your opencode configuration at `~/.config/opencode/`.

View all 249 config items (agents, commands, skills, context files) in one place with metadata, frontmatter, and full prompt content. Enable/disable items directly from the UI.

## Features

- **Browse** — Grid view of all agents, commands, skills, and context files with search and category filtering
- **Inspect** — Click any item to open a detail modal with full frontmatter, tags, tools, dependencies, and prompt content with line numbers
- **Copy** — One-click copy button on prompt content
- **Open** — Click file path to reveal in Finder (right-click > Open With to pick any editor)
- **Enable/Disable** — Toggle items on/off. Disabling renames the file to `.md.disabled` so opencode skips it on startup
- **Last Modified** — Relative timestamps (5m ago, 2d ago) on cards and in modal
- **Dark theme** — Custom oklch-based dark UI

## Tech Stack

- Vite 8 + React 19 + TypeScript
- Tailwind CSS v4
- Express API server
- Hand-rolled UI components (no component library)

## Install

```bash
# Clone into your project or any directory
git clone https://github.com/iqzap/opencode.config.git opencode.config
cd opencode.config

# Install dependencies
npm install

# Start
npm run dev
```

Opens at http://localhost:5173. API server runs on http://localhost:3001.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start both API + web servers |
| `npm run dev:api` | Start API server only (port 3001) |
| `npm run dev:web` | Start web server only (port 5173) |
| `npm run build` | Type-check and build for production |

## Project Structure

```
opencode.config/
├── server.ts                # Express API — reads ~/.config/opencode/
├── index.html
├── package.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx              # Router
│   ├── types/index.ts       # TypeScript interfaces
│   ├── scanner/
│   │   ├── api-client.ts    # Fetch functions + toggle
│   │   └── fs-scanner.ts    # Direct filesystem scanner
│   ├── hooks/useConfig.ts   # Data loading hook
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   └── toggle.tsx
│   │   └── layout/Layout.tsx
│   └── pages/
│       ├── Overview.tsx     # Stats dashboard
│       ├── ItemList.tsx     # Card grid + modal (agents, commands, skills, context)
│       └── SearchPage.tsx   # Full-text search
└── docs/plans/              # Design documents
```
