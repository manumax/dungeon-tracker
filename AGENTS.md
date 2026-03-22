# Agent Guidelines for Dungeon Tracker

**Official OBR Documentation**: https://docs.owlbear.rodeo/extensions/getting-started — use this to look up API details, SDK patterns, and extension best practices.

## Project Overview

Dungeon Tracker is an Owlbear Rodeo extension that tracks dungeon turns for OSE-like games. Development follows an iterative approach: start with a basic skeleton, then slowly add features.

**Tech Stack**: React 18, Vite, ESM modules, JavaScript (no TypeScript)
**Type**: OBR Toolbar Popover Extension

## Build Commands

```bash
npm install      # Install dependencies
npm run dev      # Start dev server (localhost:5173)
npm run build    # Build to dist/
npm run preview  # Preview production build
```

**Testing**: No test framework configured. Do not add testing libraries unprompted.

**Linting**: No linter configured. Do not add ESLint/Prettier unprompted.

## Owlbear Rodeo Extension Guidelines

### Manifest Requirements
- `manifest_version: 1` is REQUIRED
- `popover` field must be a URL string (e.g., `"/"`), NOT an object
- Toolbar icon via `icon` field in manifest — **must use absolute path** with leading `/` (e.g., `"/icon.svg"`) for OBR to display it correctly

### OBR API Patterns
- `OBR.onReady()` returns **void** (SDK v3.x) — no cleanup needed
- `OBR.room.onMetadataChange()` returns an **unsubscribe function**
- State persistence uses `OBR.room.getMetadata()` and `OBR.room.setMetadata()`
- **Always use namespaced keys** for metadata: `io.manumax.dungeon-tracker/state`
- `OBR.player.getRole()` returns `"GM"` or `"PLAYER"` — GM sees full controls, players see read-only view

### State Sync Pattern
```javascript
// Load initial state
const meta = await OBR.room.getMetadata();
if (meta[METADATA_KEY]) _setState(meta[METADATA_KEY]);

// Subscribe to changes
const unsubMeta = OBR.room.onMetadataChange((meta) => {
  if (meta[METADATA_KEY]) _setState(meta[METADATA_KEY]);
});

// Persist on change
OBR.room.setMetadata({ [METADATA_KEY]: nextState }).catch(console.error);
```

## OSE-like Turn Rules

| Turn in Hour | Position (0-indexed) | Flags | Meaning |
|--------------|----------------------|-------|---------|
| 1st | 0 | — | Normal turn |
| 2nd | 1 | W | Wandering monster check |
| 3rd | 2 | — | Normal turn |
| 4th | 3 | W | Wandering monster check |
| 5th | 4 | — | Normal turn |
| 6th | 5 | W + R | Wandering monster check + party must rest |

**Light source durations**:
- Torch: 6 turns (1 hour)
- Lantern: 24 turns (4 hours)

**Constants** (in `constants.js`):
- `TURNS_PER_DAY = 36` (6 hours × 6 turns)
- `TURNS_PER_HOUR = 6`
- `TORCH_DURATION = 6`
- `LANTERN_DURATION = 24`
- `METADATA_KEY = "io.manumax.dungeon-tracker/state"`

## Code Style Guidelines

### File Naming
- `.jsx` — React components
- `.js` — utilities, hooks, constants
- Component files: PascalCase (e.g., `TurnRow.jsx`)
- Utility files: camelCase (e.g., `useTracker.js`, `constants.js`)

### Imports
```javascript
// React core
import React, { useCallback, useState, useEffect } from "react";

// OBR SDK
import OBR from "@owlbear-rodeo/sdk";

// Local modules — include .js/.jsx extension in imports
import { TurnRow } from "./TurnRow.jsx";
import { useTracker } from "./useTracker.js";
import { TURNS_PER_DAY } from "./constants.js";
```

### Component Structure
Use section dividers for organization:
```javascript
// ── Props & State ───────────────────────────────────────────────────────────
// ── Navigation ─────────────────────────────────────────────────────────────
// ── Light Sources ───────────────────────────────────────────────────────────
// ── Events ──────────────────────────────────────────────────────────────────
// ── Render ─────────────────────────────────────────────────────────────────
```

### Naming Conventions
- **Components**: PascalCase
- **Variables/functions**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE for exported values, camelCase for functions
- **CSS classes**: BEM-style with double underscore for elements, double dash for modifiers
  - Block: `app-header`, `turn-list`, `toolbar`
  - Element: `app-header__title`, `turn-row__gutter`, `tb-btn--primary`
  - Modifier: `is-current`, `is-lit`, `is-past`

### React Patterns
- Use `useCallback` for all handlers passed as props
- Use `useState` for local component state
- Use `useEffect` for OBR subscriptions with proper cleanup
- Never mutate state directly; use spread operator or functional updates

### Error Handling
- Wrap async OBR calls in try/catch
- Use `.catch(console.error)` for fire-and-forget operations like `setMetadata`
- Return errors to user via UI, not console

### JSDoc Comments
Document exported functions and hooks:
```javascript
/**
 * useTracker
 *
 * Manages tracker state synced to OBR room metadata.
 * SDK v3.x: OBR.onReady() returns void.
 */
export function useTracker() { ... }

/**
 * getTurnMeta
 * @param {number} globalIdx - 0-based global turn index
 * @returns {{ isWander: boolean, isRest: boolean, hour: number, posInHour: number }}
 */
export function getTurnMeta(globalIdx) { ... }
```

## File Structure

```
manifest.json        ← OBR extension manifest
public/
  icon.svg           ← toolbar icon (48x48)
index.html           ← HTML entry point
vite.config.js       ← Vite + React config
src/
  lib/
    constants.js     ← turn rules, METADATA_KEY
    useTracker.js    ← OBR metadata sync hook
  view/
    main.jsx         ← React entry point
    App.jsx          ← root component, GM toolbar, hour groups
    TurnRow.jsx      ← single turn list row
    index.css        ← all styles
```

## Development Workflow

1. Run `npm install` then `npm run dev`
2. In OBR: Profile → Add Extension → Enter `http://localhost:5173/manifest.json`
3. Create/open a room and enable the extension
4. Iterate on features, test in OBR
5. Run `npm run build` for production build
6. Host `dist/` folder and point OBR to `https://your-domain.com/manifest.json`

## Deployment Workflow

1. Develop on `develop` branch
2. Merge `develop` into `main` to trigger Netlify deployment:
   ```bash
   git checkout main
   git merge develop
   git push
   ```
3. Netlify automatically builds and deploys from `main` branch
4. Extension URL: `https://dungeon-tracker-obr.netlify.app/manifest.json`
