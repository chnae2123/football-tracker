import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { getPlayer, getPlayerStats, playerInMatch, playerSeasons, seasonPath } from '../data'
import { SectionHead, StatStrip, MatchRow } from '../components/ui'
import { useSeason, NotFound } from '../season'

const POS_NAME = { GK: 'Goalkeeper', DEF: 'Defender', MID: 'Midfielder', FW: 'Forward' }

export default function Player() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const season = useSeason()
  const player = season && getPlayer(id, season)
  if (!player) return <NotFound what="Player" />

  const from = location.state?.from
  const backLabel = from?.label ?? 'Squad'
  const goBack = (e) => {
    e.preventDefault()
    if (from) navigate(-1)
    else navigate(seasonPath(season, '/squad'))
  }

  const inSquad = season.players.some((p) => p.id === id)
  const stats = getPlayerStats(id, season.matches)
  const playerMatches = season.matches.filter((m) => playerInMatch(m, id))
  const career = playerSeasons(id)

  return (
    <div className="page page-narrow">
      <a href="#" onClick={goBack} className="back">← {backLabel}</a>

      <header style={{ display: 'flex', alignItems: 'flex-end', gap: 24, borderBottom: '3px solid var(--rule)', paddingBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="kicker" style={{ marginBottom: 8 }}>
            {season.label}
            {inSquad && <> · {(player.position ?? []).map((p) => POS_NAME[p] ?? p).join(' / ') || 'Position TBD'}</>}
            {player.captain && <span style={{ color: 'var(--accent)', marginLeft: 10 }}>Captain</span>}
          </div>
          <h1 className="display" style={{ fontSize: 'clamp(56px, 12vw, 104px)', margin: 0, fontWeight: 800 }}>
            {player.displayName}
          </h1>
          <div className="muted" style={{ fontSize: 18, marginTop: 10 }}>{player.name}</div>
        </div>
        {inSquad && player.number != null && (
          <div className="display num" aria-label="Shirt number" style={{
            fontSize: 'clamp(96px, 22vw, 200px)', fontWeight: 800, lineHeight: 0.8,
            color: 'var(--accent)', flexShrink: 0,
          }}>
            {player.number}
          </div>
        )}
      </header>

      {!inSquad && playerMatches.length === 0 ? (
        <div className="empty">
          <div className="big">不在 {season.label} 赛季名单里</div>
          <p className="muted" style={{ margin: '10px 0 0', fontSize: 17 }}>这个赛季的阵容还没确定，或者这名球员没有参加这个赛季。</p>
        </div>
      ) : (
        <>
          <StatStrip items={[
            { label: 'Played', value: stats.apps },
            { label: 'Goals', value: stats.goals, accent: stats.goals > 0 },
            { label: 'Assists', value: stats.assists, accent: stats.assists > 0 },
            { label: 'W–D–L', value: `${stats.wins}-${stats.draws}-${stats.losses}` },
          ]} />
          {stats.apps > 0 && (
            <div className="kicker" style={{ marginTop: 12 }}>
              {stats.starts} starts · {stats.subs} from bench{stats.apps - stats.starts - stats.subs > 0 && ` · ${stats.apps - stats.starts - stats.subs} 首发/替补未记录`}
            </div>
          )}
        </>
      )}

      {playerMatches.length > 0 && (
        <section className="section">
          <SectionHead title="Matches" aside={playerMatches.length} />
          {playerMatches.map((m) => {
            const g = m.goals.filter((x) => x.team === 'fcg' && x.scorerId === id).length
            const a = m.goals.filter((x) => x.team === 'fcg' && x.assistId === id).length
            const sub = playerInMatch(m, id) === 'sub'
            const bits = [g && `${g}G`, a && `${a}A`, sub && 'Sub'].filter(Boolean)
            return (
              <MatchRow key={m.id} m={m} extra={bits.length > 0 && (
                <span className="display" style={{ fontSize: 16, fontWeight: 600, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                  {bits.map((b, i) => (
                    <span key={b} style={{ marginLeft: i ? 8 : 0, color: b === 'Sub' ? 'var(--ink-3)' : 'var(--accent)' }}>{b}</span>
                  ))}
                </span>
              )} />
            )
          })}
        </section>
      )}

      {career.length > 0 && (
        <section className="section">
          <SectionHead title="By season" />
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 48px 48px 48px 48px', padding: '6px 0', borderBottom: '1px solid var(--hair)' }} className="kicker">
            <span>Season</span>
            <span style={{ textAlign: 'right' }}>No.</span>
            <span style={{ textAlign: 'right' }}>MP</span>
            <span style={{ textAlign: 'right' }}>G</span>
            <span style={{ textAlign: 'right' }}>A</span>
          </div>
          {career.map((s) => {
            const st = getPlayerStats(id, s.matches)
            const num = s.players.find((p) => p.id === id)?.number
            const on = s.slug === season.slug
            const cell = (v) => <span className="display num" style={{ textAlign: 'right', fontSize: 22 }}>{v ?? '–'}</span>
            return (
              <Link key={s.slug} to={seasonPath(s, `/player/${id}`)} replace className="row"
                style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 48px 48px 48px 48px', gap: 0 }}>
                <span className="display" style={{ fontSize: 22, fontWeight: 600, color: on ? 'var(--accent)' : undefined }}>{s.label}</span>
                {cell(num)}{cell(st.apps)}{cell(st.goals)}{cell(st.assists)}
              </Link>
            )
          })}
        </section>
      )}
    </div>
  )
}
