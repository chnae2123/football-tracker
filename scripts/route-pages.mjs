#!/usr/bin/env node
/*
  GitHub Pages only serves files that exist, so a deep link like
  /2025-26/match/<id> used to come back as HTTP 404 (rendered via 404.html).

  After `vite build`, this copies dist/index.html to dist/<route>/index.html
  for every page the app can show, so each real URL returns 200.
  Unknown URLs still fall through to 404.html (which is also the app).
*/
import fs from 'node:fs'
import path from 'node:path'

const DIST = path.resolve('dist')
const DATA = path.resolve('data')
const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'))
const jsonIn = (dir) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_')).map((f) => read(path.join(dir, f))) : []

const shell = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
const players = read(path.join(DATA, 'players.json')).players.map((p) => p.id)
const seasonsDir = path.join(DATA, 'seasons')
const seasons = fs.readdirSync(seasonsDir).filter((d) => /^\d{4}-\d{2}$/.test(d)).sort()

const routes = new Set(['squad', 'history'])
for (const id of players) routes.add(`player/${id}`)

for (const slug of seasons) {
  routes.add(slug)
  routes.add(`${slug}/squad`)
  for (const id of players) routes.add(`${slug}/player/${id}`)
  for (const m of jsonIn(path.join(seasonsDir, slug, 'matches'))) {
    routes.add(`${slug}/match/${m.id}`)
    routes.add(`match/${m.id}`) // old un-prefixed links, redirected by the app
  }
  for (const t of jsonIn(path.join(seasonsDir, slug, 'tournaments'))) routes.add(`${slug}/tournament/${t.id}`)
}

const historyFile = path.join(DATA, 'history.json')
if (fs.existsSync(historyFile)) for (const a of read(historyFile).articles ?? []) routes.add(`history/${a.id}`)

for (const r of routes) {
  const dir = path.join(DIST, r)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), shell)
}
console.log(`route pages: wrote ${routes.size} index.html files`)
