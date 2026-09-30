# FCG Football Tracker — project context for Claude Code

## What this is

A static web app documenting the 2025-26 season of Fettes College Guangzhou's 7-a-side football team. Built by Changqi Chen (Messi, #19, FW/MID) as a **digital scrapbook**, not a live tracker. Part of a school exhibition "距离的测量" (The Measurement of Distance) scheduled for June 2026 around the World Cup opening.

The exhibition's thesis: how the *medium* of football memory has shifted across generations — from handmade scrapbooks (1980s, Changqi's father) to physical archives (2002, China's only World Cup) to code-generated records (2026, this project).

This tracker is the 2026 artifact in that three-part story. Design intent:
- Archival, slow-paced — not a real-time dashboard
- Public-facing — will be displayed at the school exhibition and accessible via QR code
- Simplified Sofascore aesthetic for match pages (formation pitch, lineup, goal events) but with "剪贴簿 language" in presentation (no minute-by-minute timestamps, scorer + assister only)

## Tech stack (target)

- **Frontend**: React + Vite + Tailwind CSS
- **Data**: JSON files in `data/` (no backend, no database)
- **Hosting**: GitHub Pages — https://chnae2123.github.io/football-tracker/ (auto-deployed from `main` by `.github/workflows/deploy.yml`)
- **Cumulative stats**: computed at runtime from match files, never stored

## Current state

See `README.md` for the full data schema (multi-season layout).

- `data/players.json` — all-time player DB (16 players); `data/seasons/2025-26/season.json` — squad numbers/positions, captain, 2 coaches
- `data/seasons/2025-26/matches/` — 2 of 13 matches entered; the rest to be backfilled from Changqi's memory
- `data/history.json` — cross-season articles (History tab)
- UI built: Overview, Match (Events / Lineup / Gallery tabs), Squad, Player, History, Article
- Media lives in `public/gallery/<date>/`; JSON paths are site-relative (`/gallery/...`) and get the deploy base prefixed via `asset()` in `src/data.js`

## Pages to build (priority order)

1. **Home** — main exhibition surface. Needs: one-sentence narrative framing, season W-D-L, total goals, top scorers + assists leaderboard, timeline grid of all matches
2. **Match detail** — formation pitch (SVG, 2-3-1 etc.), lineup list with jersey numbers, goal events (scorer + assister, no minutes needed)
3. **About** — positions this work as an STS artifact, connects to the wider exhibition (three generations of football memory, three different media). Needs a scanned image of the 1986 scrapbook as a visual anchor.
4. **Squad** (optional, time permitting) — player cards with cumulative stats

## Design rules

- Dark mode friendly
- Flat, minimal — no gradients, no neon, no heavy drop shadows
- Pitch rendering is SVG, player positions derived from formation string + role
- `playerId` (slug) is the stable key across seasons; jersey numbers are display-only and may change

## Data entry workflow

Changqi is the sole data maintainer. He'll paste in match memories conversationally; Claude Code should help convert to valid JSON matching the schema and drop it in `data/seasons/<slug>/matches/`.

Validation rules (enforce when adding matches):
- All `playerId` values must exist in `data/players.json` (and in the season's `squad[]`)
- `lineup` length must be 7
- `fcg` team goals must have a non-null `scorerId`
- File name must match the `id` field

## What NOT to do

- Don't add a backend or database — static only
- Don't add authentication — public read-only site
- Don't add real-time features (live scores, websockets, etc.)
- Don't use player photos of minors without Changqi's explicit confirmation for each person
- Don't add analytics/tracking — privacy-respecting by default
