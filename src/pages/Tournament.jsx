import { useParams, Link } from 'react-router-dom'
import { getTournament, tournamentMatches, getSeasonStats, isPlayed, seasonPath } from '../data'
import { SectionHead, StatStrip, MatchRow } from '../components/ui'
import { useSeason, NotFound } from '../season'

const ordinal = (n) => n + (['th', 'st', 'nd', 'rd'][(n % 100 >> 3) ^ 1 && n % 10] || 'th')
const signed = (n) => (n > 0 ? `+${n}` : `${n}`)

export default function Tournament() {
  const { id } = useParams()
  const season = useSeason()
  const t = getTournament(season, id)
  if (!t) return <NotFound what="Tournament" />

  const matches = tournamentMatches(season, id)
  const filled = matches.filter(isPlayed)
  const official = t.standings?.find((r) => r.team === t.us)
  const ours = getSeasonStats(filled)

  // What's left to account for, comparing the official table with the matches filled in so far
  const left = official && {
    w: official.w - ours.w, d: official.d - ours.d, l: official.l - ours.l,
    gf: official.gf - ours.gf, ga: official.ga - ours.ga,
  }
  const allFilled = filled.length === matches.length && matches.length > 0
  const consistent = left && Object.values(left).every((v) => v === 0)

  return (
    <div className="page">
      <Link to={seasonPath(season)} className="back">← {season.label} season</Link>

      <header style={{ marginBottom: 28 }}>
        <div className="kicker" style={{ marginBottom: 10 }}>
          {t.dateLabel}{t.format && ` · ${t.format}`}{t.host && <span style={{ color: 'var(--accent)' }}> · FCG 主办</span>}
        </div>
        <h1 className="display" style={{ fontSize: 'clamp(72px, 16vw, 160px)', margin: 0, fontWeight: 800 }}>
          {t.name}
        </h1>
        {t.fullName && <div className="muted" style={{ fontSize: 18, marginTop: 10 }}>{t.fullName}</div>}
      </header>

      {official && (
        <>
          <StatStrip items={[
            { label: 'Finish', value: ordinal(official.pos), accent: true },
            { label: 'Played', value: official.p },
            { label: 'W–D–L', value: `${official.w}-${official.d}-${official.l}` },
            { label: 'Goals', value: `${official.gf}:${official.ga}` },
            { label: 'Points', value: official.pts },
          ]} />
          <div className="kicker" style={{ marginTop: 12 }}>
            {t.standings.length} teams · 数据来自{t.standingsSource ?? '官方积分表'}
          </div>
        </>
      )}

      {t.standings?.length > 0 && (
        <section className="section">
          <SectionHead title="Table" />
          <div className="table-wrap">
            <table className="standings">
              <thead>
                <tr className="kicker">
                  <th className="pos">#</th>
                  <th className="team">Team</th>
                  <th>P</th><th>W</th><th>D</th><th>L</th>
                  <th className="wide">GF</th><th className="wide">GA</th>
                  <th>GD</th><th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {t.standings.map((r) => (
                  <tr key={r.team} className={r.team === t.us ? 'us' : ''}>
                    <td className="pos">{r.pos}</td>
                    <td className="team">
                      <span className="full">{r.name}</span>
                      <span className="short">{r.shortName}</span>
                    </td>
                    <td>{r.p}</td><td>{r.w}</td><td>{r.d}</td><td>{r.l}</td>
                    <td className="wide">{r.gf}</td><td className="wide">{r.ga}</td>
                    <td>{signed(r.gf - r.ga)}</td>
                    <td className="pts">{r.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="section">
        <SectionHead title="Our matches" aside={`已补录 ${filled.length}/${matches.length}`} />

        {left && !allFilled && (
          <div className="recall">
            <div className="kicker" style={{ marginBottom: 6 }}>还没补录的 {matches.length - filled.length} 场加起来应该是</div>
            <div className="display" style={{ fontSize: 26, fontWeight: 600 }}>
              {[left.w && `${left.w} 胜`, left.d && `${left.d} 平`, left.l && `${left.l} 负`].filter(Boolean).join(' · ') || '—'}
              <span className="faint" style={{ margin: '0 12px' }}>/</span>
              进 {left.gf} 球 · 失 {left.ga} 球
            </div>
            <div className="faint" style={{ fontSize: 13, marginTop: 6 }}>按官方积分表减去已补录的比赛算出来，可以拿来帮忙回忆和核对。</div>
          </div>
        )}
        {allFilled && left && (
          <div className="recall" style={{ borderColor: consistent ? 'var(--hair)' : 'var(--accent)' }}>
            {consistent
              ? <span className="kicker">8 场全部补录，和官方积分表一致</span>
              : <span className="kicker" style={{ color: 'var(--accent)' }}>
                  补录的比分和官方积分表对不上：{[
                    ['胜', left.w], ['平', left.d], ['负', left.l], ['进球', left.gf], ['失球', left.ga],
                  ].filter(([, v]) => v).map(([k, v]) => `${k}比官方${v > 0 ? `少 ${v}` : `多 ${-v}`}`).join('，')}
                </span>}
            {!consistent && t.discrepancyNote && (
              <div className="faint" style={{ fontSize: 13, marginTop: 6 }}>{t.discrepancyNote}</div>
            )}
          </div>
        )}

        {matches.map((m) => (
          <MatchRow key={m.id} m={m} hideTournament extra={(m.matchday != null || m.kickoff) && (
            <span className="kicker tourn-meta" style={{ whiteSpace: 'nowrap' }}>
              {m.matchday != null && `G${m.matchday}`}{m.matchday != null && m.kickoff && ' · '}{m.kickoff}
            </span>
          )} />
        ))}
      </section>

      <style>{`
        .table-wrap { overflow-x: auto; margin-top: 4px; }
        .standings { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
        .standings th { text-align: right; font-weight: 600; padding: 8px 0 8px 8px; border-bottom: 1px solid var(--hair); min-width: 44px; }
        .standings th.team, .standings th.pos { min-width: 0; }
        .standings td {
          text-align: right; padding: 11px 0 11px 8px; border-bottom: 1px solid var(--hair);
          font-family: var(--display); font-weight: 500; font-size: 20px;
        }
        .standings .pos { text-align: left; width: 32px; padding-left: 0; color: var(--ink-3); }
        .standings .team { text-align: left; width: 100%; font-weight: 600; font-size: 21px; }
        .standings .pts { font-weight: 700; }
        .standings .short { display: none; }
        .standings tr.us td { color: var(--accent); font-weight: 700; }
        .standings tr.us td.pos { color: var(--accent); }
        .recall { border: 1px dashed var(--ink-3); padding: 14px 16px; margin: 14px 0 6px; }
        @media (max-width: 600px) {
          .tourn-meta { display: none; }
          .standings .wide { display: none; }
          .standings .full { display: none; }
          .standings .short { display: inline; }
          .standings td { font-size: 18px; }
          .standings th { min-width: 30px; }
        }
      `}</style>
    </div>
  )
}
