import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { matches, getPlayer, resultOf, resultColor, asset } from '../data'
import Pitch from '../components/Pitch'

const COMP = { league: 'League', cup: 'Cup', friendly: 'Friendly' }

function PosPill({ role }) {
  const colors = {
    GK: { bg: '#1e3a5f', text: '#60a5fa' },
    DEF: { bg: '#1a3a1a', text: '#4ade80' },
    MID: { bg: '#3a2e1a', text: '#fbbf24' },
    FW: { bg: '#3a1a1a', text: '#f87171' },
  }
  const c = colors[role] || { bg: 'var(--surface-3)', text: 'var(--text-2)' }
  return (
    <span style={{
      background: c.bg, color: c.text,
      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
      letterSpacing: '0.04em',
    }}>{role}</span>
  )
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 4, padding: 4,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      marginBottom: 14,
    }}>
      {tabs.map((t) => (
        <button key={t.key} onClick={() => onChange(t.key)}
          style={{
            flex: 1, border: 'none', padding: '9px 8px',
            borderRadius: 7,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: active === t.key ? 'var(--surface-3)' : 'transparent',
            color: active === t.key ? 'var(--text-1)' : 'var(--text-2)',
            transition: 'all 0.15s',
          }}>
          {t.label}
          {t.count != null && t.count > 0 && (
            <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--text-3)' }}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}

export default function Match() {
  const { id } = useParams()
  const match = matches.find((m) => m.id === id)
  const [tab, setTab] = useState('events')

  if (!match) return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px' }}>
      <p style={{ color: 'var(--text-2)' }}>Match not found.</p>
      <Link to="/" style={{ color: 'var(--blue)', fontSize: 14 }}>← Back</Link>
    </div>
  )

  const r = resultOf(match)
  const rColor = resultColor(r)
  const galleryCount = match.gallery?.length ?? 0

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 64px' }}>

      <Link to="/" style={{ color: 'var(--text-2)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        ← All matches
      </Link>

      {/* Header card */}
      <div className="surface border-subtle" style={{ borderRadius: 14, padding: '24px 20px', marginBottom: 16, borderTop: `3px solid ${rColor}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{match.date}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 11, background: 'var(--surface-2)', padding: '3px 8px', borderRadius: 5, color: 'var(--text-2)' }}>
              {COMP[match.competition]}
            </span>
            <span style={{ fontSize: 11, background: 'var(--surface-2)', padding: '3px 8px', borderRadius: 5, color: 'var(--text-2)' }}>
              {match.venue === 'home' ? 'Home' : match.venue === 'away' ? 'Away' : 'Neutral'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ textAlign: 'right', flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 700 }}>FCG</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>Fettes College GZ</div>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0, padding: '0 12px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 32, fontWeight: 800, letterSpacing: 1, color: 'var(--text-1)', whiteSpace: 'nowrap' }}>
              {match.score.fcg} – {match.score.opponent}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: rColor, marginTop: 4, letterSpacing: '0.08em' }}>{r === 'W' ? 'WIN' : r === 'L' ? 'LOSS' : 'DRAW'}</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{match.opponent.shortName}</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{match.opponent.name}</div>
          </div>
        </div>
      </div>

      {/* Pitch */}
      <div style={{ marginBottom: 16 }}>
        <Pitch formation={match.formation} lineup={match.lineup}
          backState={{ from: { label: `vs ${match.opponent.shortName}` } }} />
      </div>

      {/* Tabs */}
      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { key: 'events', label: 'Events' },
          { key: 'lineup', label: 'Lineup' },
          { key: 'gallery', label: 'Gallery', count: galleryCount },
        ]}
      />

      {tab === 'events' && <EventsTab match={match} />}
      {tab === 'lineup' && <LineupTab match={match} backState={{ from: { label: `vs ${match.opponent.shortName}` } }} />}
      {tab === 'gallery' && <GalleryTab match={match} />}
    </div>
  )
}

function EventsTab({ match }) {
  let fcgG = 0, oppG = 0
  return (
    <>
      <div className="surface border-subtle" style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Goals
        </div>
        {match.goals.map((g, i) => {
          if (g.team === 'fcg') fcgG++; else oppG++
          const scorer = g.team === 'fcg' && g.scorerId ? getPlayer(g.scorerId) : null
          const assister = g.team === 'fcg' && g.assistId ? getPlayer(g.assistId) : null
          const isFCG = g.team === 'fcg'
          return (
            <div key={i} style={{
              padding: '11px 16px',
              borderBottom: i < match.goals.length - 1 ? '1px solid var(--border)' : 'none',
              display: 'flex', alignItems: 'center', gap: 12,
              background: isFCG ? 'transparent' : 'rgba(248,113,113,0.04)',
            }}>
              <span style={{
                fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                color: 'var(--text-3)', width: 36, flexShrink: 0,
              }}>
                {fcgG}–{oppG}
              </span>
              <span style={{ fontSize: 13 }}>
                {isFCG ? (
                  <>
                    <span style={{ fontWeight: 600 }}>{scorer?.displayName ?? g.scorerId}</span>
                    {assister && (
                      <span style={{ color: 'var(--text-2)', marginLeft: 6, fontSize: 12 }}>
                        assist {assister.displayName}
                      </span>
                    )}
                  </>
                ) : (
                  <span style={{ color: 'var(--text-2)' }}>{match.opponent.shortName}</span>
                )}
              </span>
            </div>
          )
        })}
      </div>

      {match.notes && (
        <div style={{
          borderRadius: 12, padding: '14px 18px',
          background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)',
          fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6,
          fontStyle: 'italic',
        }}>
          {match.notes}
        </div>
      )}
    </>
  )
}

function LineupTab({ match, backState }) {
  return (
    <>
      <div className="surface border-subtle" style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Starting XI
        </div>
        {match.lineup.map((p, i) => {
          const player = getPlayer(p.playerId)
          return (
            <Link key={p.playerId} to={`/player/${p.playerId}`} state={backState} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '11px 16px',
                borderBottom: i < match.lineup.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ width: 26, textAlign: 'center', fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>
                  {player?.number ?? '—'}
                </span>
                <span style={{ flex: 1, fontSize: 14 }}>{player?.displayName ?? p.playerId}</span>
                <PosPill role={p.role} />
              </div>
            </Link>
          )
        })}
      </div>

      {match.substitutes && match.substitutes.length > 0 && (
        <div className="surface border-subtle" style={{ borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Substitutes
          </div>
          {match.substitutes.map((subId, i) => {
            const player = getPlayer(subId)
            return (
              <Link key={subId} to={`/player/${subId}`} state={backState} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '11px 16px',
                  borderBottom: i < match.substitutes.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 12,
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ width: 26, textAlign: 'center', fontWeight: 700, fontSize: 13, color: 'var(--text-3)' }}>
                    {player?.number ?? '—'}
                  </span>
                  <span style={{ flex: 1, fontSize: 14, color: 'var(--text-2)' }}>{player?.displayName ?? subId}</span>
                  {(player?.position ?? []).slice(0, 2).map((pos) => <PosPill key={pos} role={pos} />)}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}

function GalleryTab({ match }) {
  if (!match.gallery || match.gallery.length === 0) {
    return (
      <div className="surface border-subtle" style={{ borderRadius: 14, padding: '40px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
        还没有照片、视频或球员感想。
      </div>
    )
  }
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {match.gallery.map((item, i) => <GalleryItem key={i} item={item} />)}
    </div>
  )
}

function GalleryItem({ item }) {
  if (item.type === 'quote') {
    const author = item.author ? getPlayer(item.author) : null
    return (
      <div className="surface border-subtle" style={{
        borderRadius: 12, padding: '14px 16px',
        borderLeft: '3px solid var(--blue)',
      }}>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-1)', marginBottom: 6 }}>
          "{item.text}"
        </div>
        {author && (
          <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
            — {author.displayName} <span style={{ color: 'var(--text-3)' }}>{author.name}</span>
          </div>
        )}
      </div>
    )
  }
  if (item.type === 'photo') {
    return (
      <figure style={{ margin: 0, borderRadius: 12, overflow: 'hidden', background: 'var(--surface)' }}>
        <img src={asset(item.src)} alt={item.caption ?? ''} style={{ width: '100%', display: 'block' }} />
        {item.caption && (
          <figcaption style={{ fontSize: 12, color: 'var(--text-2)', padding: '10px 14px' }}>
            {item.caption}
          </figcaption>
        )}
      </figure>
    )
  }
  if (item.type === 'video') {
    return (
      <figure style={{ margin: 0, borderRadius: 12, overflow: 'hidden', background: 'var(--surface)' }}>
        <video src={asset(item.src)} controls style={{ width: '100%', display: 'block' }} />
        {item.caption && (
          <figcaption style={{ fontSize: 12, color: 'var(--text-2)', padding: '10px 14px' }}>
            {item.caption}
          </figcaption>
        )}
      </figure>
    )
  }
  return null
}
