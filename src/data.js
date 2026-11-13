import playersData from '../data/players.json'
import historyData from '../data/history.json'

/*
  Every season lives in its own folder:
    data/seasons/<slug>/season.json      team, squad, coaches, status
    data/seasons/<slug>/matches/*.json   one file per match
  Adding a new folder adds a new season — nothing else to change.
  Stats are always computed per season from that season's match files.
*/

const seasonMetaModules = import.meta.glob('../data/seasons/*/season.json', { eager: true })
const matchModules = import.meta.glob('../data/seasons/*/matches/*.json', { eager: true })
const tournamentModules = import.meta.glob('../data/seasons/*/tournaments/*.json', { eager: true })

const slugOf = (path) => path.match(/\/seasons\/([^/]+)\//)[1]

// Stable player identities (all-time)
export const allPlayers = playersData.players
const basePlayer = (id) => allPlayers.find((p) => p.id === id) ?? null

const seasons = {}
for (const [path, mod] of Object.entries(seasonMetaModules)) {
  const slug = slugOf(path)
  const meta = mod.default
  seasons[slug] = {
    slug,
    label: slug.replace('-', '–'),
    status: meta.status ?? 'active', // upcoming | active | completed
    team: meta.team,
    coaches: meta.coaches ?? [],
    squad: meta.squad ?? [],
    matches: [],
    tournaments: [],
  }
}
for (const [path, mod] of Object.entries(tournamentModules)) {
  const slug = slugOf(path)
  if (seasons[slug]) seasons[slug].tournaments.push({ ...mod.default, season: slug })
}
for (const [path, mod] of Object.entries(matchModules)) {
  const slug = slugOf(path)
  if (!seasons[slug] || mod.default.id?.startsWith('_')) continue
  seasons[slug].matches.push({ ...mod.default, season: slug })
}
for (const s of Object.values(seasons)) {
  s.matches.sort((a, b) => b.date.localeCompare(a.date) || (b.kickoff ?? '').localeCompare(a.kickoff ?? '') || a.id.localeCompare(b.id))
  s.played = s.matches.filter(isPlayed)
  s.tournaments.sort((a, b) => b.startDate.localeCompare(a.startDate))
  // Season view of each player = stable identity + that season's number/position
  s.players = s.squad
    .map((row) => {
      const base = basePlayer(row.playerId)
      return base && { ...base, number: row.number, position: row.position, captain: row.captain, joined: row.joined, left: row.left }
    })
    .filter(Boolean)
}

/** Newest first */
export const allSeasons = Object.values(seasons).sort((a, b) => b.slug.localeCompare(a.slug))
export const currentSeason = allSeasons[0]

export const isSeasonSlug = (s) => /^\d{4}-\d{2}$/.test(s ?? '')
export const getSeason = (slug) => seasons[slug] ?? null

/** Build a link inside a season, e.g. seasonPath(s, '/match/x') → '/2025-26/match/x' */
export const seasonPath = (season, path = '') => `/${typeof season === 'string' ? season : season.slug}${path}`

/** Player as they were in a given season (number/position), falling back to the stable record */
export function getPlayer(id, season = currentSeason) {
  return season?.players.find((p) => p.id === id) ?? basePlayer(id)
}

export const getTournament = (season, id) => season?.tournaments.find((t) => t.id === id) ?? null
/** Tournament matches in the order they were played */
export const tournamentMatches = (season, id) => season.matches.filter((m) => m.tournament === id).reverse()

export function findMatch(id) {
  for (const s of allSeasons) {
    const m = s.matches.find((x) => x.id === id)
    if (m) return m
  }
  return null
}

/** 'start' | 'sub' | 'played' (known to have played, but not whether they started) | null */
export function playerInMatch(m, playerId) {
  if (m.lineup.some((p) => p.playerId === playerId)) return 'start'
  if ((m.substitutes ?? []).includes(playerId)) return 'sub'
  if ((m.appeared ?? []).includes(playerId)) return 'played'
  if (m.goals.some((g) => g.team === 'fcg' && (g.scorerId === playerId || g.assistId === playerId))) return 'played'
  return null
}

export function getPlayerStats(playerId, matchList) {
  matchList = matchList.filter(isPlayed)
  let apps = 0, starts = 0, subs = 0, goals = 0, assists = 0, wins = 0, draws = 0, losses = 0
  for (const m of matchList) {
    const status = playerInMatch(m, playerId)
    if (!status) continue
    apps++
    if (status === 'start') starts++
    else if (status === 'sub') subs++
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

export function getSeasonStats(matchList) {
  matchList = matchList.filter(isPlayed)
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
  const sort = (o) => Object.entries(o).sort((a, b) => b[1] - a[1])
  return { w, d, l, gf, ga, topScorers: sort(scorers), topAssisters: sort(assisters) }
}

/** Seasons a player was in the squad or played in, newest first */
export function playerSeasons(playerId) {
  return allSeasons.filter((s) =>
    s.squad.some((r) => r.playerId === playerId) || s.matches.some((m) => playerInMatch(m, playerId)))
}

// Articles (cross-season)
export const articles = [...historyData.articles].sort((a, b) => b.date.localeCompare(a.date))

// Media paths in JSON are written site-relative ("/gallery/..."); prefix the deploy base.
export const asset = (src) =>
  src?.startsWith('/') ? import.meta.env.BASE_URL + src.slice(1) : src

/** A match whose score has been filled in. Pending matches (score: null) are listed but never counted. */
export function isPlayed(m) {
  return m.score != null && m.score.fcg != null && m.score.opponent != null
}

export const resultOf = (m) =>
  !isPlayed(m) ? null
  : m.score.fcg > m.score.opponent ? 'W' : m.score.fcg < m.score.opponent ? 'L' : 'D'
