import playersData from '../data/players.json'
import historyData from '../data/history.json'

// All seasons: eager-glob both season.json and matches
const seasonMetaModules = import.meta.glob('../data/seasons/*/season.json', { eager: true })
const matchModules = import.meta.glob('../data/seasons/*/matches/*.json', { eager: true })

// Build seasons map: { "2025-26": { meta, matches } }
const seasons = {}
for (const [path, mod] of Object.entries(seasonMetaModules)) {
  const slug = path.match(/\/seasons\/([^/]+)\//)[1]
  seasons[slug] = { slug, meta: mod.default, matches: [] }
}
for (const [path, mod] of Object.entries(matchModules)) {
  const slug = path.match(/\/seasons\/([^/]+)\//)[1]
  if (!seasons[slug]) continue
  if (mod.default.id?.startsWith('_')) continue
  seasons[slug].matches.push(mod.default)
}
for (const s of Object.values(seasons)) {
  s.matches.sort((a, b) => b.date.localeCompare(a.date))
}

export const allSeasons = Object.values(seasons).sort((a, b) => b.slug.localeCompare(a.slug))

// Default / current season = most recent
export const currentSeasonSlug = allSeasons[0]?.slug
const current = seasons[currentSeasonSlug]

// Exports for current season (most of the app uses these)
export const team = current.meta.team
export const coaches = current.meta.coaches
export const matches = current.matches
export const squad = current.meta.squad

// Stable player database (all-time)
export const allPlayers = playersData.players

// Per-season "player view" = stable identity + this season's squad record
// This is what most of the UI uses, backwards-compatible with the old roster shape.
export const players = squad.map((s) => {
  const base = allPlayers.find((p) => p.id === s.playerId)
  return {
    ...base,
    number: s.number,
    position: s.position,
    captain: s.captain,
    joined: s.joined,
    left: s.left,
  }
}).filter((p) => p.id)

// Articles (cross-season)
export const articles = [...historyData.articles].sort((a, b) => b.date.localeCompare(a.date))

export function getPlayer(id) {
  // Prefer current-season view (has number/position), fallback to all-time record
  return players.find((p) => p.id === id)
    ?? allPlayers.find((p) => p.id === id)
    ?? null
}

export function playerInMatch(m, playerId) {
  if (m.lineup.some((p) => p.playerId === playerId)) return 'start'
  if ((m.substitutes ?? []).includes(playerId)) return 'sub'
  return null
}

export function getPlayerStats(playerId, { matchList = matches } = {}) {
  let apps = 0, starts = 0, subs = 0, goals = 0, assists = 0, wins = 0, draws = 0, losses = 0

  for (const m of matchList) {
    const status = playerInMatch(m, playerId)
    if (!status) continue
    apps++
    if (status === 'start') starts++
    else subs++

    if (m.score.fcg > m.score.opponent) wins++
    else if (m.score.fcg === m.score.opponent) draws++
    else losses++

    for (const g of m.goals) {
      if (g.team !== 'fcg') continue
      if (g.scorerId === playerId) goals++
      if (g.assistId === playerId) assists++
    }
  }

  return { apps, starts, subs, goals, assists, wins, draws, losses }
}

export function getSeasonStats({ matchList = matches } = {}) {
  let w = 0, d = 0, l = 0, gf = 0, ga = 0
  const scorers = {}, assisters = {}

  for (const m of matchList) {
    gf += m.score.fcg
    ga += m.score.opponent
    if (m.score.fcg > m.score.opponent) w++
    else if (m.score.fcg === m.score.opponent) d++
    else l++

    for (const g of m.goals) {
      if (g.team !== 'fcg') continue
      if (g.scorerId) scorers[g.scorerId] = (scorers[g.scorerId] || 0) + 1
      if (g.assistId) assisters[g.assistId] = (assisters[g.assistId] || 0) + 1
    }
  }

  const topScorers = Object.entries(scorers).sort((a, b) => b[1] - a[1])
  const topAssisters = Object.entries(assisters).sort((a, b) => b[1] - a[1])
  return { w, d, l, gf, ga, topScorers, topAssisters }
}

// Media paths in JSON are written site-relative ("/gallery/..."); prefix the deploy base.
export const asset = (src) =>
  src?.startsWith('/') ? import.meta.env.BASE_URL + src.slice(1) : src

export const resultOf = (m) =>
  m.score.fcg > m.score.opponent ? 'W' : m.score.fcg < m.score.opponent ? 'L' : 'D'

export const resultColor = (r) =>
  r === 'W' ? 'var(--green)' : r === 'L' ? 'var(--red)' : 'var(--yellow)'
