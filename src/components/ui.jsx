import { Link } from 'react-router-dom'
import { resultOf, allSeasons, seasonPath, isPlayed, getSeason, getTournament } from '../data'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

export function splitDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return { year: y, mon: MONTHS[m - 1], day: d }
}

export function longDate(iso) {
  const { year, mon, day } = splitDate(iso)
  return `${day} ${mon} ${year}`
}

export function Result({ r }) {
  return <span className={`result result-${r}`} aria-label={{ W: 'Win', D: 'Draw', L: 'Loss' }[r]}>{r}</span>
}

export function SectionHead({ title, aside }) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {aside != null && <span className="aside">{aside}</span>}
    </div>
  )
}

export function StatStrip({ items }) {
  return (
    <div className="stats" style={{ '--cols': items.length }}>
      {items.map((s) => (
        <div key={s.label} className={`stat${s.accent ? ' accent' : ''}`}>
          <div className={`v${String(s.value).length > 3 ? ' small' : ''}`}>{s.value}</div>
          <div className="l">{s.label}</div>
        </div>
      ))}
    </div>
  )
}

/** One match as a list row: date block · opponent · (extra) · score · result */
export function MatchRow({ m, extra, hideTournament }) {
  const r = resultOf(m)
  const { mon, day } = splitDate(m.date)
  const t = !hideTournament && m.tournament ? getTournament(getSeason(m.season), m.tournament) : null
  return (
    <Link to={seasonPath(m.season, `/match/${m.id}`)} className="row" style={{ gap: 20 }}>
      <div style={{ width: 40, textAlign: 'center', flexShrink: 0 }}>
        <div className="display num" style={{ fontSize: 28 }}>{day}</div>
        <div className="kicker" style={{ fontSize: 11, marginTop: 2 }}>{mon}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="display" style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.05 }}>
          <span className="faint" style={{ fontWeight: 500, marginRight: 6 }}>{m.venue === 'away' ? '@' : 'vs'}</span>
          {m.opponent.shortName}
        </div>
        <div className="faint" style={{ fontSize: 13, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {t && <span className="tag" style={{ color: 'var(--accent)', marginRight: 8 }}>{t.shortName ?? t.name}</span>}
          {m.opponent.name}
        </div>
      </div>
      {extra}
      {isPlayed(m) ? (
        <>
          <div className="display num" style={{ fontSize: 32, whiteSpace: 'nowrap' }}>
            {m.score.fcg}<span className="faint" style={{ margin: '0 4px' }}>–</span>{m.score.opponent}
          </div>
          <Result r={r} />
        </>
      ) : (
        <span className="pending">待补录</span>
      )}
    </Link>
  )
}

const STATUS = { upcoming: 'Upcoming', active: 'In progress', completed: 'Completed' }
export const statusLabel = (s) => STATUS[s.status] ?? s.status

/** Row of season links. `sub` keeps you on the same kind of page, e.g. '/squad'. */
export function SeasonSwitcher({ season, sub = '' }) {
  if (allSeasons.length < 2) return null
  return (
    <div className="season-switch" role="navigation" aria-label="Seasons">
      {allSeasons.map((s) => (
        <Link key={s.slug} to={seasonPath(s, sub)} className={s.slug === season.slug ? 'on' : ''}
          aria-current={s.slug === season.slug ? 'page' : undefined}>
          {s.label}
        </Link>
      ))}
    </div>
  )
}
