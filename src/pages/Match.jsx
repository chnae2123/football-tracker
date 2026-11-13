import { useParams, Link } from 'react-router-dom'
import { getPlayer, resultOf, asset, seasonPath, isPlayed, getTournament } from '../data'
import Pitch, { fillLineup } from '../components/Pitch'
import { SectionHead, longDate } from '../components/ui'
import { useSeason, NotFound } from '../season'

const COMP = { regular: 'Regular', league: 'League', cup: 'Cup', friendly: 'Friendly', tournament: 'Tournament' }
const VENUE = { home: 'Home', away: 'Away', neutral: 'Neutral' }
const RESULT_WORD = { W: 'Win', D: 'Draw', L: 'Loss' }

export default function Match() {
  const { id } = useParams()
  const season = useSeason()
  const match = season?.matches.find((m) => m.id === id)
  if (!match) return <NotFound what="Match" />
  const team = season.team

  const r = resultOf(match)
  const played = isPlayed(match)
  const hasLineup = match.lineup?.length > 0
  const slots = fillLineup(match.formation, match.lineup)
  const unknownSlots = slots.filter((s) => !s.playerId).length
  const tourn = match.tournament ? getTournament(season, match.tournament) : null
  const back = { from: { label: `vs ${match.opponent.shortName}` } }
  const scorers = match.goals.filter((g) => g.team === 'fcg' && g.scorerId).map((g) => g.scorerId)

  return (
    <div className="page">
      <Link to={seasonPath(season)} className="back">← {season.label} season</Link>

      {/* Scoreboard */}
      <header style={{ paddingBottom: 8 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 0' }}>
          <span className="tag">{longDate(match.date)}</span>
          {tourn
            ? <Link to={seasonPath(season, `/tournament/${tourn.id}`)} className="tag" style={{ color: 'var(--accent)' }}>{tourn.name}</Link>
            : match.competition && <span className="tag">{COMP[match.competition] ?? match.competition}</span>}
          {match.matchday != null && tourn && <span className="tag">Game {match.matchday}</span>}
          {match.kickoff && <span className="tag">{match.kickoff}</span>}
          {match.venue && <span className="tag">{VENUE[match.venue]}</span>}
          {match.pitch && <span className="tag">{match.pitch}</span>}
        </div>

        <div className="scoreboard">
          <div className="team">
            <div className="display team-name">{team.shortName}</div>
            <div className="faint team-full">{team.name}</div>
          </div>
          <div className="display num score">
            {played ? match.score.fcg : '?'}<span className="dash">–</span>{played ? match.score.opponent : '?'}
          </div>
          <div className="team right">
            <div className="display team-name">{match.opponent.shortName}</div>
            <div className="faint team-full">{match.opponent.name}</div>
          </div>
        </div>

        <div className="display" style={{
          fontSize: 22, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          textAlign: 'center', color: r === 'W' ? 'var(--accent)' : 'var(--ink-2)',
        }}>
          {played ? RESULT_WORD[r] : '待补录'}
        </div>
      </header>

      {!played && !hasLineup && (
        <div className="empty">
          <div className="big">比赛细节还没补录</div>
          <p className="muted" style={{ margin: '10px 0 0', fontSize: 17 }}>
            比分、阵容和进球想起来之后再补上。这场比赛暂时不计入任何统计。
          </p>
          {match.notes && <p className="muted" style={{ margin: '10px 0 0', fontSize: 15 }}>{match.notes}</p>}
        </div>
      )}

      {(played || hasLineup) && <div className="match-grid">
        {/* Left: pitch */}
        <section className="section" style={{ marginTop: 40 }}>
          <SectionHead title="Line-up" aside={match.formation ?? '阵型未记录'} />
          <div style={{ marginTop: 12 }}>
            <Pitch season={season} formation={match.formation ?? '2-3-1'} lineup={slots} backState={back} highlight={scorers} />
          </div>
          {unknownSlots > 0 && (
            <p className="faint" style={{ margin: '10px 0 0', fontSize: 13 }}>
              虚线球衣是没记录的首发位置{!match.formation && '，阵型按球队常用的 2-3-1 示意'}。
            </p>
          )}
        </section>

        {/* Right: goals, notes, subs */}
        <div>
          <section className="section" style={{ marginTop: 40 }}>
            <SectionHead title="Goals" aside={played ? `${match.score.fcg + match.score.opponent}` : null} />
            <Goals match={match} season={season} />
            {played && match.goals.length < match.score.fcg + match.score.opponent && (
              <p className="faint" style={{ margin: '14px 0 0' }}>
                {match.goals.length === 0 ? '进球细节待补录。' : `还有 ${match.score.fcg + match.score.opponent - match.goals.length} 个进球没记录。`}
              </p>
            )}
          </section>

          {match.notes && (
            <blockquote style={{
              margin: '32px 0 0', padding: '4px 0 4px 18px',
              borderLeft: '3px solid var(--accent)',
              fontSize: 18, lineHeight: 1.6,
            }}>
              {match.notes}
            </blockquote>
          )}

          <section className="section" style={{ marginTop: 40 }}>
            <SectionHead title="Starters" aside={unknownSlots ? `${7 - unknownSlots}/7 已记录` : null} />
            <PlayerList slots={slots} back={back} season={season} />
          </section>

          {match.appeared?.length > 0 && (
            <section className="section" style={{ marginTop: 40 }}>
              <SectionHead title="Also played" aside={match.appeared.length} />
              <p className="faint" style={{ margin: '8px 0 0', fontSize: 13 }}>这些人都上场了，但没记录是首发还是替补。</p>
              <PlayerList slots={match.appeared.map((id) => ({ playerId: id }))} back={back} season={season} />
            </section>
          )}

          {match.substitutes?.length > 0 && (
            <section className="section" style={{ marginTop: 40 }}>
              <SectionHead title="Bench" aside={match.substitutes.length} />
              <PlayerList slots={match.substitutes.map((id) => ({ playerId: id }))} back={back} season={season} dim />
            </section>
          )}
        </div>
      </div>}

      {match.gallery?.length > 0 && (
        <section className="section">
          <SectionHead title="Photos" aside={match.gallery.length} />
          <div style={{ display: 'grid', gap: 24, marginTop: 16 }}>
            {match.gallery.map((item, i) => <GalleryItem key={i} item={item} season={season} />)}
          </div>
        </section>
      )}

      <style>{`
        .scoreboard {
          display: grid;
          grid-template-columns: minmax(0,1fr) auto minmax(0,1fr);
          align-items: center;
          gap: 16px;
          margin: 28px 0 12px;
        }
        .scoreboard .team-name { font-size: clamp(32px, 6vw, 56px); font-weight: 700; }
        .scoreboard .team-full { font-size: 14px; margin-top: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .scoreboard .right { text-align: right; }
        .scoreboard .score { font-size: clamp(88px, 18vw, 168px); font-weight: 800; line-height: 0.85; white-space: nowrap; }
        .scoreboard .dash { color: var(--ink-3); margin: 0 0.06em; font-weight: 500; }
        .match-grid {
          display: grid;
          grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
          gap: 0 48px;
          align-items: start;
        }
        @media (max-width: 760px) {
          .match-grid { grid-template-columns: 1fr; }
          .scoreboard { gap: 8px; }
          .scoreboard .team-full { display: none; }
          .scoreboard .score { font-size: clamp(64px, 22vw, 120px); }
          .scoreboard .team-name { font-size: 28px; }
        }
      `}</style>
    </div>
  )
}

function Goals({ match, season }) {
  let us = 0, them = 0
  const ordered = match.goalOrder !== 'unknown'
  return (
    <div>
      {!ordered && match.goals.length > 0 && <p className="faint" style={{ margin: '10px 0 4px', fontSize: 13 }}>进球顺序不确定，只列出进球人。</p>}
      {match.goals.map((g, i) => {
        const ours = g.team === 'fcg'
        if (ours) us++; else them++
        const scorer = ours && g.scorerId ? getPlayer(g.scorerId, season) : null
        const assister = ours && g.assistId ? getPlayer(g.assistId, season) : null
        return (
          <div key={i} className="row" style={{ gap: 18, opacity: ours ? 1 : 0.6 }}>
            <span className="display num" style={{ width: 44, fontSize: 22, color: ours ? 'var(--accent)' : 'var(--ink-3)' }}>
              {ordered ? `${us}–${them}` : '•'}
            </span>
            {ours ? (
              <span style={{ flex: 1, minWidth: 0 }}>
                <Link to={seasonPath(season, `/player/${g.scorerId}`)} className="display" style={{ fontSize: 22, fontWeight: 600 }}>
                  {scorer?.displayName ?? g.scorerId}
                </Link>
                {assister && (
                  <span className="muted" style={{ fontSize: 14, marginLeft: 10 }}>
                    assist <Link to={seasonPath(season, `/player/${g.assistId}`)} style={{ color: 'var(--ink)' }}>{assister.displayName}</Link>
                  </span>
                )}
              </span>
            ) : (
              <span className="display muted" style={{ flex: 1, fontSize: 20, fontWeight: 500 }}>
                {match.opponent.shortName}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function PlayerList({ slots, back, dim, season }) {
  return (
    <div>
      {slots.map((slot, i) => {
        const pid = slot.playerId
        if (!pid) {
          return (
            <div key={`empty-${i}`} className="row" style={{ gap: 14, padding: '10px 0' }}>
              <span className="display num faint" style={{ width: 30, fontSize: 22 }}>–</span>
              <span className="display faint" style={{ flex: 1, fontSize: 20, fontWeight: 500 }}>未记录</span>
              {slot.role && <span className="tag" style={{ color: 'var(--ink-3)' }}>{slot.role}</span>}
            </div>
          )
        }
        const p = getPlayer(pid, season)
        const role = slot.role ?? (p?.position ?? [])[0]
        return (
          <Link key={pid} to={seasonPath(season, `/player/${pid}`)} state={back} className="row" style={{ gap: 14, padding: '10px 0' }}>
            <span className="display num" style={{ width: 30, fontSize: 22, color: dim ? 'var(--ink-3)' : 'var(--ink-2)' }}>
              {p?.number ?? '–'}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="display" style={{ fontSize: 20, fontWeight: 600, color: dim ? 'var(--ink-2)' : undefined }}>
                {p?.displayName ?? pid}
              </span>
              {p?.name && <span className="faint" style={{ fontSize: 13, marginLeft: 8 }}>{p.name}</span>}
            </span>
            {role && <span className="tag">{role}</span>}
          </Link>
        )
      })}
    </div>
  )
}

function GalleryItem({ item, season }) {
  if (item.type === 'quote') {
    const author = item.author ? getPlayer(item.author, season) : null
    return (
      <figure style={{ margin: 0, borderLeft: '3px solid var(--accent)', paddingLeft: 18 }}>
        <blockquote className="display" style={{ margin: 0, fontSize: 28, fontWeight: 600, lineHeight: 1.15 }}>
          “{item.text}”
        </blockquote>
        {author && (
          <figcaption className="kicker" style={{ marginTop: 10 }}>
            {author.displayName} <span className="faint">{author.name}</span>
          </figcaption>
        )}
      </figure>
    )
  }
  if (item.type === 'photo' || item.type === 'video') {
    return (
      <figure style={{ margin: 0 }}>
        {item.type === 'photo'
          ? <img src={asset(item.src)} alt={item.caption ?? ''} style={{ width: '100%', display: 'block' }} />
          : <video src={asset(item.src)} controls style={{ width: '100%', display: 'block' }} />}
        {item.caption && (
          <figcaption className="muted" style={{ fontSize: 14, padding: '10px 0', borderBottom: '1px solid var(--hair)' }}>
            {item.caption}
          </figcaption>
        )}
      </figure>
    )
  }
  return null
}
