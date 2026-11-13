import { Link, useLocation } from 'react-router-dom'
import { seasonPath, isSeasonSlug } from '../data'
import { useSeasonSlugFromPath } from '../season'

export default function Nav() {
  const slug = useSeasonSlugFromPath()
  const { pathname } = useLocation()
  const parts = pathname.split('/').filter(Boolean)
  const rest = isSeasonSlug(parts[0]) ? parts.slice(1) : parts

  const section =
    rest[0] === 'history' ? 'stories'
    : rest[0] === 'squad' || rest[0] === 'player' ? 'squad'
    : 'season'

  const links = [
    { key: 'season', to: seasonPath(slug), label: 'Season' },
    { key: 'squad', to: seasonPath(slug, '/squad'), label: 'Squad' },
    { key: 'stories', to: '/history', label: 'Stories' },
  ]

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--paper)',
      borderBottom: '1px solid var(--rule)',
    }}>
      <div style={{
        maxWidth: 960, margin: '0 auto', padding: '0 20px',
        height: 56, display: 'flex', alignItems: 'center', gap: 28,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginRight: 'auto' }}>
          <span className="display" style={{ fontSize: 26, fontWeight: 800, letterSpacing: '0.02em' }}>FCG</span>
          <span className="kicker nav-sub" style={{ fontSize: 12 }}>Football</span>
        </Link>
        {links.map((l) => (
          <Link key={l.key} to={l.to} className={`nav-link${section === l.key ? ' active' : ''}`}
            aria-current={section === l.key ? 'page' : undefined}>
            {l.label}
          </Link>
        ))}
      </div>
      <style>{`
        .nav-link {
          font-family: var(--display);
          font-weight: 600;
          font-size: 16px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--ink-2);
          height: 56px;
          display: flex;
          align-items: center;
          border-bottom: 3px solid transparent;
          margin-bottom: -1px;
          padding-top: 3px;
        }
        .nav-link:hover { color: var(--ink); }
        .nav-link.active { color: var(--ink); border-bottom-color: var(--accent); }
        @media (max-width: 420px) {
          .nav-sub { display: none; }
        }
      `}</style>
    </nav>
  )
}
