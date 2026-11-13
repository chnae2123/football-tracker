import { Link } from 'react-router-dom'
import { getSeasonStats, resultOf, seasonPath, allSeasons, tournamentMatches } from '../data'
import { SectionHead, StatStrip, MatchRow, Result, SeasonSwitcher, statusLabel } from '../components/ui'
import { useSeason, NotFound } from '../season'

export default function Home() {
  const season = useSeason()
  if (!season) return <NotFound what="Season" />

  const { matches, team } = season
  const { w, d, l, gf, ga } = getSeasonStats(matches)
  const form = season.played.slice(0, 5).reverse().map(resultOf)
  const pendingCount = matches.length - season.played.length
  const previous = allSeasons.find((s) => s.slug < season.slug && s.matches.length > 0)

  return (
    <div className="page">
      <header style={{ marginBottom: 32 }}>
        <SeasonSwitcher season={season} />
        <div className="kicker" style={{ marginBottom: 10 }}>
          {team.name} · 7-a-side · <span style={{ color: season.status === 'completed' ? 'var(--ink-2)' : 'var(--accent)' }}>{statusLabel(season)}</span>
        </div>
        <h1 className="display" style={{ fontSize: 'clamp(72px, 16vw, 160px)', margin: 0, fontWeight: 800 }}>
          {season.label}
        </h1>
        {form.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            <span className="kicker" style={{ marginRight: 4 }}>Last {form.length}</span>
            {form.map((r, i) => <Result key={i} r={r} />)}
          </div>
        )}
      </header>

      {matches.length === 0 ? (
        <div className="empty" style={{ borderTop: '3px solid var(--rule)' }}>
          <div className="big">赛季还没开始</div>
          <p className="muted" style={{ margin: '10px 0 0', fontSize: 17 }}>
            {season.label} 的阵容和赛程都还没确定，第一场比赛之后这里会出现战绩、射手榜和赛果。
          </p>
          {previous && (
            <Link to={seasonPath(previous)} className="back" style={{ marginTop: 20, marginBottom: 0 }}>
              查看 {previous.label} 赛季 →
            </Link>
          )}
        </div>
      ) : (
        <>
          <StatStrip items={[
            { label: 'Played', value: season.played.length },
            { label: 'Won', value: w, accent: true },
            { label: 'Drawn', value: d },
            { label: 'Lost', value: l },
            { label: 'Points', value: w * 3 + d },
          ]} />
          <div style={{ display: 'flex', gap: 24, marginTop: 12 }} className="kicker">
            <span>Goals for <b className="num" style={{ color: 'var(--ink)' }}>{gf}</b></span>
            <span>Against <b className="num" style={{ color: 'var(--ink)' }}>{ga}</b></span>
            <span>Diff <b className="num" style={{ color: 'var(--ink)' }}>{gf - ga > 0 ? '+' : ''}{gf - ga}</b></span>
          </div>

          {season.tournaments.length > 0 && (
            <section className="section">
              <SectionHead title="Tournaments" />
              {season.tournaments.map((t) => {
                const row = t.standings?.find((r) => r.team === t.us)
                const n = tournamentMatches(season, t.id).length
                return (
                  <Link key={t.id} to={seasonPath(season, `/tournament/${t.id}`)} className="row" style={{ gap: 20 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="display" style={{ fontSize: 26, fontWeight: 700 }}>{t.name}</div>
                      <div className="faint" style={{ fontSize: 13 }}>{t.dateLabel} · {n} matches</div>
                    </div>
                    {row && (
                      <div style={{ textAlign: 'right' }}>
                        <div className="display num" style={{ fontSize: 32 }}>
                          {row.pos}<span className="faint" style={{ fontSize: 18 }}>/{t.standings.length}</span>
                        </div>
                        <div className="kicker" style={{ fontSize: 11 }}>Finish</div>
                      </div>
                    )}
                    <span className="row-arrow">→</span>
                  </Link>
                )
              })}
            </section>
          )}

          <section className="section">
            <SectionHead title="Results" aside={pendingCount ? `${matches.length} matches · ${pendingCount} 待补录` : `${matches.length} matches`} />
            {matches.map((m) => <MatchRow key={m.id} m={m} />)}
          </section>
        </>
      )}
    </div>
  )
}
