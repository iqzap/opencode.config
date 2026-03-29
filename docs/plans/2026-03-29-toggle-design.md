# Enable/Disable Toggle Design

**Date:** 2026-03-29
**Status:** Approved

## Overview

Add enable/disable toggle for agents, skills, commands, and context files in the Opencode Config Explorer dashboard. Disabling an item prevents opencode from loading it.

## Mechanism

Rename files on disk:

- Enable: `agent/backend-architect.md`
- Disable: `agent/backend-architect.md.disabled`

Opencode only loads `*.md` files, so renamed files are ignored. Instant toggle, no confirmation dialog.

## Data Flow

### Server

- Scan functions glob both `**/*.md` and `**/*.md.disabled`
- `ParsedFile` gains `enabled: boolean` (true if `.md`, false if `.md.disabled`)
- `relativePath` always strips `.disabled` suffix for clean display
- `filePath` keeps real filesystem path for toggle and raw endpoints

New endpoint:

```
POST /api/toggle
Body: { relativePath: string }
Response: { enabled: boolean, relativePath: string }
```

Logic:
1. Check if `path.md` or `path.md.disabled` exists on disk
2. Rename to opposite
3. Return new state

Requires `app.use(express.json())` for POST body parsing.

### Frontend

- `ConfigItem` inherits `enabled: boolean`
- API client gets `toggleItem(relativePath)` function
- Toggle is optimistic: UI flips immediately, reverts on API error

## UI

### Toggle location

Both card and modal.

### Card (disabled state)

- `opacity-50` on the entire card
- `Disabled` badge (red/muted) in the top-right corner (replaces the mode badge position or alongside it)
- Toggle switch in card — click area in the top-right or bottom area
- Card remains clickable to open modal

### Modal

- Toggle switch in the header area (next to badges)
- When disabled, modal shows a subtle banner: "This item is disabled"

### Filter

No separate enabled/disabled filter chip. Disabled items are visually dimmed in the grid, easy to spot. Keeps the UI simple.

### Visual spec

```
Enabled card:  Normal appearance, toggle ON
Disabled card: opacity-50, "Disabled" badge, toggle OFF
```

Toggle switch: minimal, no external library. CSS `data-state="on|off"` with smooth transition.

## Files to change

1. `server.ts` — glob `*.md.disabled`, add `enabled` field, `POST /api/toggle`
2. `src/types/index.ts` — add `enabled: boolean` to `ParsedFile`
3. `src/scanner/api-client.ts` — add `toggleItem()` fetch
4. `src/scanner/fs-scanner.ts` — add `enabled` field to match server
5. `src/pages/ItemList.tsx` — toggle switch on card + modal, dimming, badge
6. `src/components/ui/toggle.tsx` — new toggle switch component
