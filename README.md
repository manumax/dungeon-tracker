# Dungeon Tracker — Owlbear Rodeo Extension

An Owlbear Rodeo extension that tracks dungeon turns for OSE-like games.

## Features

- 36-turn (6-hour) dungeon day, split into hourly groups
- Automatic **W** (wandering monster) and **R** (rest) flags per OSE-like rules
- Torch 🕯 and Lantern 🏮 timers with automatic **T**/**L** expiry markers
- Custom events on any turn (spells, conditions, effects)
- Real-time sync across all players via OBR room metadata
- GM-only controls; players see a read-only view

## OSE-like Turn Rules

| Position in hour | Flags |
|---|---|
| Turn 2 (pos 1) | W — wandering monster check |
| Turn 4 (pos 3) | W — wandering monster check |
| Turn 6 (pos 5) | W + R — wandering monster check **and** mandatory rest |

Light source durations:
- Torch: **6 turns** (1 hour)
- Lantern: **24 turns** (4 hours)

## Development

```bash
npm install
npm run dev
```

Then in Owlbear Rodeo:
1. Open your profile → **Add Extension**
2. Enter `http://localhost:5173/manifest.json`
3. Create or open a room and enable the extension

## Deployment

```bash
npm run build
```

Host the `dist/` folder anywhere (Netlify, Vercel, GitHub Pages).  
Point OBR to `https://your-domain.com/manifest.json`.

## File structure

```
public/
  manifest.json   ← OBR extension manifest
  icon.svg        ← toolbar icon
src/
  main.jsx        ← React entry
  App.jsx         ← root component, state actions
  TurnRow.jsx     ← single turn list row
  useTracker.js   ← OBR metadata sync hook
  constants.js    ← turn rules, METADATA_KEY
  index.css       ← all styles
```
