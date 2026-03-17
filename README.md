# OUTPOST II: Divided Destiny — Modern Remake

A browser-based modern remake of the classic 1997 RTS/strategy game by Dynamix/Sierra.

## Features

- **Authentic story** — mission briefings, chapter narratives, and objectives extracted directly from the original game files (`b_e01.rtf` → `b_e12.rtf`, `b_p01.rtf` → `b_p12.rtf`, story chapters `s_e01–s_e13`, `s_p01–s_p13`)
- **Authentic tech tree** — full research data from `edentek.txt`, `multitek.txt`, `ply_tek.txt` (92 shared + 76 Eden + 78 Plymouth technologies)
- **Authentic terrain tiles** — pixel-art terrain rendered from the original `well*.bmp` tileset files (tile types: ground, sand, rock, lava, ore, rare ore, blight)
- **Procedural map** — New Terra generated each playthrough with terrain variety matching original game aesthetics
- **Both factions** — Eden (Axen Moon) and Plymouth (Emma Burke) with unique stats, tech costs, and story arcs
- **12 missions per faction** — full campaign progression with authentic briefings
- **Procedural events** — 12+ random events including storms, epidemics, Savant signals, and more
- **Living Blight** — advances across the map in real time, consuming buildings
- **HUD** — dark steel + amber readout aesthetic matching original game UI style

## How to Play

Open `index.html` in a browser (or serve with any static web server). No build step required.

```bash
# Simple Python server
python3 -m http.server 8080
# Then open http://localhost:8080
```

## File Structure

```
outpost3/
├── index.html          # Main game entry point
├── style.css           # UI styles (HUD, modals, map)
├── src/
│   └── game.js         # Game engine, map, renderer, state machine
└── data/
    ├── tiles.json      # Terrain tile images (base64 PNG, from original BMPs)
    ├── story.json      # Mission briefings + story chapters (from original RTFs)
    └── techs.json      # Tech tree (from original TXT files)
```

## Data Sources

All game data extracted from original Outpost 2: Divided Destiny installation files:

| File | Source | Contents |
|------|--------|----------|
| `data/tiles.json` | `OPU/base/tilesets/well*.bmp` | 36 terrain tiles, 8 types |
| `data/story.json` | `OPU/base/story/b_*.rtf`, `s_*.rtf` | 24 briefings + 26 story chapters |
| `data/techs.json` | `OPU/base/techs/*.txt` | 246 technologies across all factions |

## Credits

- Original game: **Outpost 2: Divided Destiny** (1997) by Dynamix / Sierra On-Line
- OPU Unofficial Update 1.4.x by the Outpost Universe community
- This remake is a fan project. Outpost 2 © Activision Publishing, Inc.

## Objectives

**Win:** Complete the starship (reach 100% ship progress) before the Blight consumes the colony.

**Lose by Blight:** The Blight front reaches the colony core.

**Lose by Collapse:** Colony morale drops to zero.

## Victory Conditions (authentic from original game)

**Eden Mission 12:** Launch Phoenix Module, Stasis Systems, Sensor Package, Fueling Systems. Evacuate 200 colonists + 10,000 Common Metals + 10,000 Rare Metals.

**Plymouth Mission 12:** Launch Phoenix Module, Stasis Systems. Evacuate 200 colonists.
