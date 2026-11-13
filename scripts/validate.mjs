#!/usr/bin/env node
/*
  Data validator for the FCG tracker.

    npm run check                 check ./data (and ./public for media)
    node scripts/validate.mjs --data <dir> --public <dir>

  Errors make the process exit 1, which also stops `npm run build`
  (and therefore the GitHub Pages deploy). Warnings are printed but don't block.
*/
import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const argVal = (flag, fallback) => {
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : fallback
}
const DATA = path.resolve(argVal('--data', 'data'))
const PUBLIC = path.resolve(argVal('--public', 'public'))

const errors = []
const warnings = []
const rel = (f) => path.relative(path.dirname(DATA), f)
const err = (file, msg) => errors.push(`${rel(file)}: ${msg}`)
const warn = (file, msg) => warnings.push(`${rel(file)}: ${msg}`)

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    err(file, `not valid JSON (${e.message})`)
    return null
  }
}
const listJson = (dir) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_')).sort() : []

const isInt = (n) => Number.isInteger(n) && n >= 0
const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s))

const ROLES = ['GK', 'DEF', 'MID', 'FW']
const COMPETITIONS = ['regular', 'tournament', 'league', 'cup', 'friendly']
const VENUES = ['home', 'away', 'neutral', null, undefined]
const STATUSES = ['upcoming', 'active', 'completed', undefined]

// ---------------------------------------------------------------- players
const playersFile = path.join(DATA, 'players.json')
const playersDoc = readJson(playersFile)
const players = new Map()
for (const p of playersDoc?.players ?? []) {
  if (!/^[a-z0-9-]+$/.test(p.id ?? '')) err(playersFile, `player id "${p.id}" must be a lowercase slug`)
  if (players.has(p.id)) err(playersFile, `duplicate player id "${p.id}"`)
  if (!p.displayName) err(playersFile, `player "${p.id}" has no displayName`)
  players.set(p.id, p)
}

// ---------------------------------------------------------------- seasons
const seasonsDir = path.join(DATA, 'seasons')
const seasonSlugs = fs.existsSync(seasonsDir)
  ? fs.readdirSync(seasonsDir).filter((d) => fs.statSync(path.join(seasonsDir, d)).isDirectory()).sort()
  : []
if (seasonSlugs.length === 0) err(seasonsDir, 'no seasons found')

const allMatchIds = new Map() // id -> file
const allMatches = [] // { season, match, file }

for (const slug of seasonSlugs) {
  const dir = path.join(seasonsDir, slug)
  const seasonFile = path.join(dir, 'season.json')

  if (!/^\d{4}-\d{2}$/.test(slug)) {
    err(dir, `season folder must be named like 2025-26`)
    continue
  }
  const [y1, y2] = slug.split('-').map(Number)
  if ((y1 + 1) % 100 !== y2) err(dir, `season "${slug}" years don't follow on (expected ${y1}-${String((y1 + 1) % 100).padStart(2, '0')})`)

  if (!fs.existsSync(seasonFile)) {
    err(dir, 'missing season.json')
    continue
  }
  const season = readJson(seasonFile)
  if (!season) continue

  if (!STATUSES.includes(season.status)) err(seasonFile, `status "${season.status}" must be upcoming / active / completed`)
  if (season.team?.season !== slug) err(seasonFile, `team.season is "${season.team?.season}", folder is "${slug}"`)

  const squad = new Set()
  const numbers = new Map()
  for (const row of season.squad ?? []) {
    if (!players.has(row.playerId)) err(seasonFile, `squad player "${row.playerId}" is not in players.json`)
    if (squad.has(row.playerId)) err(seasonFile, `"${row.playerId}" is in the squad twice`)
    squad.add(row.playerId)
    if (row.number != null) {
      if (!isInt(row.number)) err(seasonFile, `"${row.playerId}" has an invalid number ${row.number}`)
      if (numbers.has(row.number)) err(seasonFile, `shirt #${row.number} used by both "${numbers.get(row.number)}" and "${row.playerId}"`)
      numbers.set(row.number, row.playerId)
    }
    for (const pos of row.position ?? []) {
      if (!ROLES.includes(pos)) err(seasonFile, `"${row.playerId}" has unknown position "${pos}"`)
    }
  }
  const captains = (season.squad ?? []).filter((r) => r.captain)
  if (captains.length > 1) warn(seasonFile, `${captains.length} captains: ${captains.map((c) => c.playerId).join(', ')}`)

  // Season window: 1 Aug of the first year to 31 Jul of the second
  const seasonStart = `${y1}-08-01`
  const seasonEnd = `${y1 + 1}-07-31`

  // ------------------------------------------------------------ tournaments
  const tournaments = new Map()
  const tournamentsDir = path.join(dir, 'tournaments')
  for (const f of listJson(tournamentsDir)) {
    const file = path.join(tournamentsDir, f)
    const t = readJson(file)
    if (!t) continue
    if (`${t.id}.json` !== f) err(file, `id "${t.id}" doesn't match file name`)
    if (!isDate(t.startDate)) err(file, `startDate "${t.startDate}" is not YYYY-MM-DD`)
    if (t.endDate != null && !isDate(t.endDate)) err(file, `endDate "${t.endDate}" is not YYYY-MM-DD`)
    if (t.standings?.length) {
      for (const r of t.standings) {
        if (r.w + r.d + r.l !== r.p) err(file, `standings: ${r.team} W+D+L (${r.w + r.d + r.l}) ≠ played (${r.p})`)
        if (r.w * 3 + r.d !== r.pts) err(file, `standings: ${r.team} points ${r.pts} ≠ 3×W + D (${r.w * 3 + r.d})`)
      }
      const gf = t.standings.reduce((n, r) => n + r.gf, 0)
      const ga = t.standings.reduce((n, r) => n + r.ga, 0)
      if (gf !== ga) err(file, `standings: total goals for (${gf}) ≠ total goals against (${ga})`)
      const pos = t.standings.map((r) => r.pos)
      if (pos.some((p, i) => p !== i + 1)) warn(file, 'standings positions are not 1, 2, 3… in order')
      if (t.us && !t.standings.some((r) => r.team === t.us)) err(file, `"us": "${t.us}" is not a team in the standings`)
    }
    tournaments.set(t.id, { t, file, matches: [] })
  }

  // ---------------------------------------------------------------- matches
  const matchesDir = path.join(dir, 'matches')
  for (const f of listJson(matchesDir)) {
    const file = path.join(matchesDir, f)
    const m = readJson(file)
    if (!m) continue
    allMatches.push({ season: slug, match: m, file })

    // identity
    if (`${m.id}.json` !== f) err(file, `id "${m.id}" doesn't match file name`)
    if (allMatchIds.has(m.id)) err(file, `match id "${m.id}" also used in ${rel(allMatchIds.get(m.id))}`)
    allMatchIds.set(m.id, file)
    if (!isDate(m.date)) err(file, `date "${m.date}" is not YYYY-MM-DD`)
    else {
      if (!m.id?.startsWith(m.date)) warn(file, `id doesn't start with the date ${m.date}`)
      if (m.date < seasonStart || m.date > seasonEnd) err(file, `date ${m.date} is outside the ${slug} season (${seasonStart} – ${seasonEnd})`)
    }
    if (m.kickoff != null && !/^([01]\d|2[0-3]):[0-5]\d$/.test(m.kickoff)) err(file, `kickoff "${m.kickoff}" should be HH:MM`)

    // context
    if (!COMPETITIONS.includes(m.competition)) err(file, `competition "${m.competition}" must be one of ${COMPETITIONS.join(' / ')}`)
    if (m.competition === 'tournament' && !m.tournament) err(file, 'competition is "tournament" but no "tournament" id is set')
    if (m.tournament) {
      const t = tournaments.get(m.tournament)
      if (!t) err(file, `tournament "${m.tournament}" not found in ${slug}/tournaments/`)
      else t.matches.push(m)
      if (m.competition !== 'tournament') err(file, `has a tournament but competition is "${m.competition}"`)
    }
    if (!VENUES.includes(m.venue)) err(file, `venue "${m.venue}" must be home / away / neutral`)
    if (!m.opponent?.shortName) err(file, 'opponent.shortName is missing')

    // score
    const played = m.score != null
    if (played && (!isInt(m.score.fcg) || !isInt(m.score.opponent))) err(file, `score must be two whole numbers, got ${JSON.stringify(m.score)}`)

    // people
    const inSquad = (id, where) => {
      if (!players.has(id)) err(file, `${where}: "${id}" is not in players.json`)
      else if (!squad.has(id)) err(file, `${where}: "${id}" is not in the ${slug} squad`)
    }
    const lineup = m.lineup ?? []
    const subs = m.substitutes ?? []
    const appeared = m.appeared ?? []
    if (lineup.length > 7) err(file, `lineup has ${lineup.length} players (max 7)`)
    if (lineup.length === 7 && lineup.filter((p) => p.role === 'GK').length !== 1) err(file, 'a full lineup needs exactly one GK')
    for (const p of lineup) {
      inSquad(p.playerId, 'lineup')
      if (!ROLES.includes(p.role)) err(file, `lineup: "${p.playerId}" has unknown role "${p.role}"`)
    }
    subs.forEach((id) => inSquad(id, 'substitutes'))
    appeared.forEach((id) => inSquad(id, 'appeared'))
    const seen = new Map()
    for (const [list, ids] of [['lineup', lineup.map((p) => p.playerId)], ['substitutes', subs], ['appeared', appeared]]) {
      for (const id of ids) {
        if (seen.has(id)) err(file, seen.get(id) === list ? `"${id}" is listed twice in ${list}` : `"${id}" is listed in both ${seen.get(id)} and ${list}`)
        else seen.set(id, list)
      }
    }
    if (lineup.length > 0 && lineup.length < 7) warn(file, `lineup is partial (${lineup.length}/7)`)
    if (lineup.length === 0 && played) warn(file, 'no starting lineup recorded')

    if (m.formation != null) {
      if (!/^\d(-\d)+$/.test(m.formation)) err(file, `formation "${m.formation}" should look like 2-3-1`)
      else {
        const outfield = m.formation.split('-').map(Number).reduce((a, b) => a + b, 0)
        if (outfield !== 6) err(file, `formation ${m.formation} has ${outfield} outfield players (7-a-side needs 6)`)
      }
    }

    // goals
    const goals = m.goals ?? []
    if (!played && goals.length) err(file, 'has goals but no score')
    if (m.goalOrder != null && m.goalOrder !== 'unknown') err(file, `goalOrder "${m.goalOrder}" — only "unknown" is allowed`)
    let ours = 0, theirs = 0
    for (const [i, g] of goals.entries()) {
      const where = `goal ${i + 1}`
      if (g.team === 'fcg') {
        ours++
        if (!g.scorerId) err(file, `${where}: FCG goal has no scorerId`)
        else {
          inSquad(g.scorerId, `${where} scorer`)
          if (lineup.length === 7 && !seen.has(g.scorerId)) err(file, `${where}: scorer "${g.scorerId}" isn't in the lineup, substitutes or appeared`)
        }
        if (g.assistId) {
          inSquad(g.assistId, `${where} assist`)
          if (g.assistId === g.scorerId) err(file, `${where}: "${g.assistId}" can't assist their own goal`)
          if (lineup.length === 7 && !seen.has(g.assistId)) err(file, `${where}: assister "${g.assistId}" isn't in the lineup, substitutes or appeared`)
        }
      } else if (g.team === 'opponent') {
        theirs++
        if (g.scorerId || g.assistId) err(file, `${where}: opponent goals shouldn't have FCG scorer/assist ids`)
      } else {
        err(file, `${where}: team must be "fcg" or "opponent", got "${g.team}"`)
      }
    }
    if (played && isInt(m.score.fcg) && isInt(m.score.opponent)) {
      if (ours > m.score.fcg) err(file, `${ours} FCG goals listed but the score says ${m.score.fcg}`)
      if (theirs > m.score.opponent) err(file, `${theirs} opponent goals listed but the score says ${m.score.opponent}`)
      if (ours < m.score.fcg) warn(file, `${m.score.fcg - ours} FCG goal(s) have no scorer recorded`)
    }

    // media
    for (const item of m.gallery ?? []) {
      if (!['photo', 'video', 'quote'].includes(item.type)) err(file, `gallery item has unknown type "${item.type}"`)
      if ((item.type === 'photo' || item.type === 'video') && item.src?.startsWith('/')) {
        if (!fs.existsSync(path.join(PUBLIC, item.src))) err(file, `gallery file ${item.src} not found in public/`)
      }
      if (item.type === 'quote' && item.author && !players.has(item.author)) err(file, `gallery quote author "${item.author}" is not in players.json`)
    }
  }

  // Tournament totals vs the official table
  for (const { t, file, matches } of tournaments.values()) {
    if (matches.length === 0) warn(file, 'no matches are linked to this tournament')
    const official = t.standings?.find((r) => r.team === t.us)
    if (!official) continue
    if (matches.length !== official.p) err(file, `${matches.length} matches linked, official table says FCG played ${official.p}`)
    const done = matches.filter((m) => m.score)
    if (done.length !== matches.length) continue
    const sum = { w: 0, d: 0, l: 0, gf: 0, ga: 0 }
    for (const m of done) {
      sum.gf += m.score.fcg
      sum.ga += m.score.opponent
      if (m.score.fcg > m.score.opponent) sum.w++
      else if (m.score.fcg === m.score.opponent) sum.d++
      else sum.l++
    }
    const diffs = Object.keys(sum).filter((k) => sum[k] !== official[k]).map((k) => `${k} ${sum[k]} vs ${official[k]}`)
    if (diffs.length) {
      // A known, explained difference is a warning; an unexplained one is an error.
      const msg = `match scores don't add up to the official table (${diffs.join(', ')})`
      if (t.discrepancyNote) warn(file, `${msg} — known: ${t.discrepancyNote}`)
      else err(file, `${msg}. If this is expected, explain it in "discrepancyNote".`)
    }
  }
}

// ---------------------------------------------------------------- articles
const historyFile = path.join(DATA, 'history.json')
if (fs.existsSync(historyFile)) {
  const history = readJson(historyFile)
  const ids = new Set()
  for (const a of history?.articles ?? []) {
    if (ids.has(a.id)) err(historyFile, `duplicate article id "${a.id}"`)
    ids.add(a.id)
    if (!isDate(a.date)) err(historyFile, `article "${a.id}" date "${a.date}" is not YYYY-MM-DD`)
    if (a.author && !players.has(a.author)) err(historyFile, `article "${a.id}" author "${a.author}" is not in players.json`)
    if (a.matchId && !allMatchIds.has(a.matchId)) err(historyFile, `article "${a.id}" links to unknown match "${a.matchId}"`)
    if (a.cover?.startsWith('/') && !fs.existsSync(path.join(PUBLIC, a.cover))) err(historyFile, `article "${a.id}" cover ${a.cover} not found in public/`)
  }
}

// ---------------------------------------------------------------- report
// Same warning on many files → one line
const grouped = new Map()
for (const w of warnings) {
  const i = w.indexOf(': ')
  const file = w.slice(0, i), msg = w.slice(i + 2)
  if (!grouped.has(msg)) grouped.set(msg, [])
  grouped.get(msg).push(file)
}
if (!args.includes('--quiet')) {
  for (const [msg, files] of grouped) {
    if (files.length === 1) console.log(`  warn   ${files[0]}: ${msg}`)
    else console.log(`  warn   ${msg} — ${files.length} files:\n           ${files.map((f) => path.basename(f, '.json')).join(', ')}`)
  }
}
for (const e of errors) console.log(`  ERROR  ${e}`)
console.log(
  `\n${errors.length ? '✗' : '✓'} ${seasonSlugs.length} seasons, ${allMatches.length} matches, ${players.size} players — ` +
  `${errors.length} error${errors.length === 1 ? '' : 's'}, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}`,
)
process.exit(errors.length ? 1 : 0)
