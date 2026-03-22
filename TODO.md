# Dungeon Tracker

## Goal
Build and style an Owlbear Rodeo toolbar popover extension that tracks dungeon turns, wandering monster checks, and rest events, synced across players via OBR room metadata.

## Tech Stack
- React 18, Vite, ESM, JavaScript (no TypeScript)
- OBR SDK 3.x, CORS-enabled Vite dev server
- Multiverse dark theme (bg `#242629`, teal accent `#34a58e`, Source Sans Pro)

---

## Pending Issues (19)

### Bugs (4)
1. **Fragile state comparison** — `migrated !== localStateRef.current` relies on object reference identity; breaks if OBR JSON-serializes metadata
2. **Write conflicts** — No mechanism to distinguish local vs remote writes; concurrent edits from two GMs will overwrite each other
3. **Incomplete migration check** — `migrateState` doesn't handle `v: null` or `v: 0`; no upgrade path for future versions
4. **`setTimeout` hack** — `startEditing` uses `setTimeout(..., 0)` to focus input; should use `useEffect` instead

### Smells (11)
5. **Stale closure** — `commitEvent` reads `draft` from closure; fragile if called from a different code path
6. **ErrorBoundary class component** — Mixes class and function styles; should be a function with `componentDidCatch` equivalent
7. **ErrorBoundary inline styles** — Hardcoded gold/Georgia styles don't match dark theme
8. **No error recovery** — ErrorBoundary has no "Try again" button; requires page reload
9. **Unused import** — `TURNS_PER_DAY` in App.jsx (used in `ALL_TURNS` but never by name)
10. **Redundant HOURS array** — `Array.from({ length: HOURS_PER_DAY }, (_, i) => i)` is just `[0,1,2,3,4,5]`; could be simplified
11. **Font flicker** — Material Symbols loads async; icon may show as missing-glyph box on first paint
12. **Variable alignment** — `useTracker.js` has inconsistent whitespace in variable declarations
13. **Redundant variable** — `turnNum = idx + 1` could be inlined
14. **Unused React import** — `import React` not needed with React 17+ JSX transform
15. **Outdated comment** — check constants.js header for accuracy

### Design (4)
16. **Toolbar icon** — Still warm-gold SVG; doesn't match teal palette
17. **Footer legend** — Always shows both badges even for players who can't interact with them
18. **Empty state** — No CTA for players when `currentTurn === -1` and no events
19. **"Start Session" text** — Button text changes which can be jarring; could always say "Next Turn"

---

## Completed
- ✅ Created AGENTS.md, git repo, directory structure
- ✅ Extension renamed to "Dungeon Tracker"
- ✅ Multiverse dark theme UI
- ✅ Stable event IDs (`crypto.randomUUID()`)
- ✅ State versioning with migration
- ✅ Race guard (`localStateRef`) in `useTracker.js`
- ✅ `useCallback` on all TurnRow handlers
- ✅ ARIA labels on all interactive buttons
- ✅ `TURNS_PER_DAY`/`TURNS_PER_HOUR`/`HOURS_PER_DAY` in constants
- ✅ Dead code removed (`torchLitAt`/`lanternLitAt`)
- ✅ "Start Session" when `currentTurn === -1`
- ✅ Commits `f103a6d`, `3a557bb`
