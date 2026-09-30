import { Link } from 'react-router-dom'
import { players, coaches, getPlayerStats } from '../data'

const POS_ORDER = ['GK', 'DEF', 'MID', 'FW', null]
const POS_LABEL = { GK: 'Goalkeepers', DEF: 'Defenders', MID: 'Midfielders', FW: 'Forwards', null: 'Squad' }

const POS_COLOR = {
  GK:  { bg: '#1e3a5f', text: '#60a5fa' },
  DEF: { bg: '#1a3a1a', text: '#4ade80' },
  MID: { bg: '#3a2e1a', text: '#fbbf24' },
  FW:  { bg: '#3a1a1a', text: '#f87171' },
}

function posPrimary(p) {
  if (!p.position) return null
  return p.position[0]
}

function PosBadge({ pos }) {
  if (!pos) return null
  const c = POS_COLOR[pos] || { bg: 'var(--surface-3)', text: 'var(--text-2)' }
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, letterSpacing: '0.04em' }}>
      {pos}
    </span>
  )
}

export default function Squad() {
  // Group players by primary position
  const groups = {}
  for (const p of players) {
    const key = String(posPrimary(p))
    if (!groups[key]) groups[key] = []
    groups[key].push(p)
  }

  const orderedKeys = POS_ORDER.map(String).filter((k) => groups[k]?.length)

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 64px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Squad</h1>
      <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 24 }}>2025–26 season · {players.length} players</p>

      {orderedKeys.map((key) => (
        <div key={key} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            {POS_LABEL[key === 'null' ? null : key]}
          </div>
          <div className="surface border-subtle" style={{ borderRadius: 12, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '36px 1fr 32px 32px 32px',
              padding: '8px 16px', borderBottom: '1px solid var(--border)',
              fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              <span>#</span>
              <span>Name</span>
              <span style={{ textAlign: 'center' }}>MP</span>
              <span style={{ textAlign: 'center' }}>G</span>
              <span style={{ textAlign: 'center' }}>A</span>
            </div>
            {groups[key].map((p, i) => {
              const stats = getPlayerStats(p.id)
              return (
                <Link key={p.id} to={`/player/${p.id}`} state={{ from: { label: 'Squad' } }} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '36px 1fr 32px 32px 32px',
                    padding: '10px 16px',
                    borderBottom: i < groups[key].length - 1 ? '1px solid var(--border)' : 'none',
                    alignItems: 'center', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>
                      {p.number ?? '—'}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, color: 'var(--text-1)' }}>{p.displayName}</span>
                        {p.captain && <span style={{ fontSize: 10, color: 'var(--yellow)', fontWeight: 700 }}>(C)</span>}
                        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{p.name}</span>
                        {(p.position ?? []).map((pos) => <PosBadge key={pos} pos={pos} />)}
                      </div>
                    </div>
                    <span style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-2)' }}>{stats.apps || '—'}</span>
                    <span style={{ textAlign: 'center', fontSize: 13, fontWeight: stats.goals ? 700 : 400, color: stats.goals ? 'var(--text-1)' : 'var(--text-3)' }}>{stats.goals || '—'}</span>
                    <span style={{ textAlign: 'center', fontSize: 13, fontWeight: stats.assists ? 700 : 400, color: stats.assists ? 'var(--text-1)' : 'var(--text-3)' }}>{stats.assists || '—'}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ))}

      {/* Coaches */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Coaching Staff
        </div>
        <div className="surface border-subtle" style={{ borderRadius: 12, overflow: 'hidden' }}>
          {coaches.map((c, i) => (
            <div key={c.name} style={{
              padding: '12px 16px',
              borderBottom: i < coaches.length - 1 ? '1px solid var(--border)' : 'none',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 14 }}>{c.displayName}</span>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
