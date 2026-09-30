import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { players, matches, getPlayer, getPlayerStats, resultOf, resultColor, playerInMatch } from '../data'

const POS_COLOR = {
  GK:  { bg: '#1e3a5f', text: '#60a5fa' },
  DEF: { bg: '#1a3a1a', text: '#4ade80' },
  MID: { bg: '#3a2e1a', text: '#fbbf24' },
  FW:  { bg: '#3a1a1a', text: '#f87171' },
}

function PosBadge({ pos }) {
  const c = POS_COLOR[pos] || { bg: 'var(--surface-3)', text: 'var(--text-2)' }
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 5, letterSpacing: '0.04em' }}>
      {pos}
    </span>
  )
}

function StatCard({ value, label }) {
  return (
    <div className="surface-2" style={{ borderRadius: 10, padding: '16px 12px', textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  )
}

export default function Player() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const player = getPlayer(id)

  // Label/target for the back link depends on where the user came from.
  // If they arrived via a Link that passed `state.from`, respect it; otherwise
  // default to Squad.
  const from = location.state?.from
  const backLabel = from?.label ?? 'Squad'
  const goBack = (e) => {
    e.preventDefault()
    if (from) navigate(-1)
    else navigate('/squad')
  }

  if (!player) return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px' }}>
      <p style={{ color: 'var(--text-2)' }}>Player not found.</p>
      <a href="#" onClick={goBack} style={{ color: 'var(--blue)', fontSize: 14 }}>← {backLabel}</a>
    </div>
  )

  const stats = getPlayerStats(id)
  const playerMatches = matches.filter((m) => playerInMatch(m, id))

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 64px' }}>

      <a href="#" onClick={goBack} style={{ color: 'var(--text-2)', fontSize: 13, textDecoration: 'none', marginBottom: 20, display: 'inline-block' }}>
        ← {backLabel}
      </a>

      {/* Player header */}
      <div className="surface border-subtle" style={{ borderRadius: 14, padding: '24px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Number circle */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--surface-3)',
          border: '2px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 800, color: 'var(--text-1)',
          flexShrink: 0,
        }}>
          {player.number ?? '—'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{player.displayName}</h1>
            {player.captain && (
              <span style={{ fontSize: 11, color: 'var(--yellow)', fontWeight: 700, border: '1px solid var(--yellow)', padding: '2px 7px', borderRadius: 4, opacity: 0.85 }}>
                CAPTAIN
              </span>
            )}
          </div>
          <div style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 4 }}>{player.name}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {(player.position ?? []).map((pos) => <PosBadge key={pos} pos={pos} />)}
            {!player.position && <span style={{ color: 'var(--text-3)', fontSize: 12 }}>Position TBD</span>}
          </div>
        </div>
      </div>

      {/* Season stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
        <StatCard value={stats.apps} label="Played" />
        <StatCard value={stats.goals} label="Goals" />
        <StatCard value={stats.assists} label="Assists" />
        <StatCard value={`${stats.wins}W ${stats.draws}D ${stats.losses}L`} label="Record" />
      </div>

      {/* Match history */}
      {playerMatches.length > 0 && (
        <div className="surface border-subtle" style={{ borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Match History
          </div>
          {playerMatches.map((m, i) => {
            const r = resultOf(m)
            const rColor = resultColor(r)
            const status = playerInMatch(m, id)
            const playerGoals = m.goals.filter((g) => g.team === 'fcg' && g.scorerId === id).length
            const playerAssists = m.goals.filter((g) => g.team === 'fcg' && g.assistId === id).length
            return (
              <Link key={m.id} to={`/match/${m.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '11px 16px',
                  borderBottom: i < playerMatches.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 12,
                  borderLeft: `3px solid ${rColor}`,
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: rColor, width: 14 }}>{r}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-2)', width: 86 }}>{m.date}</span>
                  <span style={{ fontSize: 13, flex: 1, whiteSpace: 'nowrap' }}>vs {m.opponent.shortName}</span>
                  {status === 'sub' && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)', border: '1px solid var(--border)', padding: '1px 5px', borderRadius: 3, letterSpacing: '0.04em' }}>SUB</span>
                  )}
                  <div style={{ display: 'flex', gap: 10 }}>
                    {playerGoals > 0 && (
                      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
                        ⚽ {playerGoals > 1 ? `×${playerGoals}` : ''}
                      </span>
                    )}
                    {playerAssists > 0 && (
                      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
                        🅰️ {playerAssists > 1 ? `×${playerAssists}` : ''}
                      </span>
                    )}
                  </div>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {m.score.fcg}–{m.score.opponent}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
