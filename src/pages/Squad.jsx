import { Link } from 'react-router-dom'
import { getPlayerStats, seasonPath } from '../data'
import { SectionHead, SeasonSwitcher } from '../components/ui'
import { useSeason, NotFound } from '../season'

const POS_ORDER = ['GK', 'DEF', 'MID', 'FW', 'null']
const POS_LABEL = { GK: 'Goalkeepers', DEF: 'Defenders', MID: 'Midfielders', FW: 'Forwards', null: 'Others' }

const COLS = '44px minmax(0,1fr) 40px 40px 40px'

export default function Squad() {
  const season = useSeason()
  if (!season) return <NotFound what="Season" />
  const { players, coaches } = season

  // How complete the goal records are: FCG goals scored vs goals with a known scorer / assist
  const fcgGoals = season.played.reduce((n, m) => n + m.score.fcg, 0)
  const ourGoals = season.played.flatMap((m) => m.goals.filter((g) => g.team === 'fcg'))
  const withScorer = ourGoals.filter((g) => g.scorerId).length
  const withAssist = ourGoals.filter((g) => g.assistId).length

  const groups = {}
  for (const p of players) {
    const key = String(p.position?.[0] ?? null)
    ;(groups[key] ??= []).push(p)
  }
  for (const g of Object.values(groups)) g.sort((a, b) => (a.number ?? 999) - (b.number ?? 999))

  return (
    <div className="page page-narrow">
      <header style={{ marginBottom: 8 }}>
        <SeasonSwitcher season={season} sub="/squad" />
        <div className="kicker" style={{ marginBottom: 10 }}>{season.label} season</div>
        <h1 className="display" style={{ fontSize: 'clamp(64px, 12vw, 112px)', margin: 0, fontWeight: 800 }}>Squad</h1>
        <div className="muted" style={{ marginTop: 10 }}>
          {players.length ? `${players.length} players · ${coaches.length} coaches` : '阵容待定'}
        </div>
      </header>

      {fcgGoals > 0 && (withScorer < fcgGoals || withAssist < fcgGoals) && (
        <p className="faint" style={{ fontSize: 13, margin: '14px 0 0' }}>
          本赛季共进 {fcgGoals} 球，已记录进球人 {withScorer} 个、助攻 {withAssist} 个，下面的 G / A 只统计已记录的部分。
        </p>
      )}

      {players.length === 0 && (
        <div className="empty" style={{ borderTop: '3px solid var(--rule)', marginTop: 32 }}>
          <div className="big">阵容还没确定</div>
          <p className="muted" style={{ margin: '10px 0 0', fontSize: 17 }}>赛季开始后，球员名单和号码会出现在这里。</p>
        </div>
      )}

      {POS_ORDER.filter((k) => groups[k]?.length).map((key) => (
        <section key={key} className="section" style={{ marginTop: 44 }}>
          <SectionHead title={POS_LABEL[key]} aside={groups[key].length} />
          <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '6px 0', borderBottom: '1px solid var(--hair)' }} className="kicker">
            <span>No.</span><span>Player</span>
            <span style={{ textAlign: 'right' }}>MP</span>
            <span style={{ textAlign: 'right' }}>G</span>
            <span style={{ textAlign: 'right' }}>A</span>
          </div>
          {groups[key].map((p) => {
            const s = getPlayerStats(p.id, season.matches)
            const cell = (v) => (
              <span className="display num" style={{ textAlign: 'right', fontSize: 22, color: v ? 'var(--ink)' : 'var(--ink-3)' }}>
                {v || '–'}
              </span>
            )
            return (
              <Link key={p.id} to={seasonPath(season, `/player/${p.id}`)} state={{ from: { label: 'Squad' } }} className="row"
                style={{ display: 'grid', gridTemplateColumns: COLS, gap: 0, padding: '12px 0' }}>
                <span className="display num" style={{ fontSize: 26, color: 'var(--accent)' }}>{p.number ?? '–'}</span>
                <span style={{ minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  <span className="display" style={{ fontSize: 22, fontWeight: 600 }}>{p.displayName}</span>
                  {p.captain && <span className="display" style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', marginLeft: 6 }}>C</span>}
                  <span className="faint" style={{ fontSize: 13, marginLeft: 8 }}>{p.name}</span>
                  {p.position?.length > 1 && (
                    <span className="tag" style={{ marginLeft: 8, fontSize: 11 }}>{p.position.slice(1).join(' · ')}</span>
                  )}
                </span>
                {cell(s.apps)}{cell(s.goals)}{cell(s.assists)}
              </Link>
            )
          })}
        </section>
      ))}

      {coaches.length > 0 && <section className="section" style={{ marginTop: 44 }}>
        <SectionHead title="Coaches" />
        {coaches.map((c) => (
          <div key={c.name} className="row">
            <span className="display" style={{ fontSize: 22, fontWeight: 600 }}>{c.displayName}</span>
            <span className="faint" style={{ fontSize: 13 }}>{c.name}</span>
          </div>
        ))}
      </section>}
    </div>
  )
}
