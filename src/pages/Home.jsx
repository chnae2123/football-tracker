import { Link } from 'react-router-dom'
import { matches, team, getPlayer, getSeasonStats, resultOf, resultColor } from '../data'

function FormDot({ result }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 24, height: 24, borderRadius: '50%',
      background: resultColor(result),
      color: '#000', fontSize: 11, fontWeight: 700,
    }}>{result}</span>
  )
}

function StatBox({ value, label, color }) {
  return (
    <div style={{ textAlign: 'center', padding: '16px 8px' }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || 'var(--text-1)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  )
}

export default function Home() {
  const { w, d, l, gf, ga, topScorers, topAssisters } = getSeasonStats()
  const recentForm = [...matches].slice(0, 5).reverse().map(resultOf)

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 64px' }}>

      {/* Team header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px' }}>{team.name}</h1>
        <div style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 4 }}>
          {team.season} · 7-a-side
        </div>
      </div>

      {/* Stats bar */}
      <div className="surface border-subtle" style={{
        borderRadius: 12, display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        marginBottom: 12,
      }}>
        <StatBox value={matches.length} label="Played" />
        <StatBox value={w} label="Won" color="var(--green)" />
        <StatBox value={d} label="Drawn" color="var(--yellow)" />
        <StatBox value={l} label="Lost" color="var(--red)" />
        <StatBox value={`${gf}:${ga}`} label="Goals" />
      </div>

      {/* Form */}
      <div className="surface border-subtle" style={{
        borderRadius: 12, padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 24,
      }}>
        <span style={{ fontSize: 12, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4 }}>Form</span>
        {recentForm.length === 0
          ? <span style={{ color: 'var(--text-3)', fontSize: 13 }}>No matches yet</span>
          : recentForm.map((r, i) => <FormDot key={i} result={r} />)
        }
      </div>

      {/* Leaderboards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {[
          { title: 'Top Scorers', data: topScorers },
          { title: 'Top Assists', data: topAssisters },
        ].map(({ title, data }) => (
          <div key={title} className="surface border-subtle" style={{ borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</div>
            {data.length === 0
              ? <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-3)' }}>—</div>
              : data.slice(0, 5).map(([id, count], i) => {
                const p = getPlayer(id)
                return (
                  <Link key={id} to={`/player/${id}`} state={{ from: { label: 'Overview' } }} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 16px',
                      borderBottom: i < Math.min(data.length, 5) - 1 ? '1px solid var(--border)' : 'none',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ width: 18, fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>{i + 1}</span>
                      <span style={{ fontSize: 14, color: 'var(--text-1)', flex: 1 }}>{p?.displayName ?? id}</span>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>{count}</span>
                    </div>
                  </Link>
                )
              })
            }
          </div>
        ))}
      </div>

      {/* Matches */}
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
        Matches
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {matches.map((m) => {
          const r = resultOf(m)
          const color = resultColor(r)
          return (
            <Link key={m.id} to={`/match/${m.id}`} style={{ textDecoration: 'none' }}>
              <div className="surface border-subtle" style={{
                borderRadius: 10, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 14,
                borderLeft: `3px solid ${color}`,
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color, width: 14 }}>{r}</span>
                <span style={{ fontSize: 12, color: 'var(--text-2)', width: 86 }}>{m.date}</span>
                <span style={{ fontSize: 13, flex: 1 }}>
                  {m.venue === 'home' ? 'vs ' : '@ '}{m.opponent.shortName}
                </span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15 }}>
                  {m.score.fcg} – {m.score.opponent}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
