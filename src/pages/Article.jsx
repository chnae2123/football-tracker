import { useParams, Link } from 'react-router-dom'
import { articles, getPlayer, matches, asset } from '../data'

const TYPE_LABEL = {
  recap: { label: 'Recap', color: '#4ade80' },
  column: { label: 'Column', color: '#fbbf24' },
  weekly: { label: 'Weekly', color: '#60a5fa' },
  feature: { label: 'Feature', color: '#f472b6' },
}

export default function Article() {
  const { id } = useParams()
  const article = articles.find((a) => a.id === id)

  if (!article) return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px' }}>
      <p style={{ color: 'var(--text-2)' }}>Article not found.</p>
      <Link to="/history" style={{ color: 'var(--blue)', fontSize: 14 }}>← History</Link>
    </div>
  )

  const author = article.author ? getPlayer(article.author) : null
  const meta = TYPE_LABEL[article.type] || { label: article.type, color: 'var(--text-2)' }
  const relatedMatch = article.matchId ? matches.find((m) => m.id === article.matchId) : null

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 64px' }}>
      <Link to="/history" style={{ color: 'var(--text-2)', fontSize: 13, textDecoration: 'none', marginBottom: 20, display: 'inline-block' }}>
        ← History
      </Link>

      {article.cover && (
        <img src={asset(article.cover)} alt="" style={{
          width: '100%', aspectRatio: '16/9', objectFit: 'cover',
          borderRadius: 12, marginBottom: 20,
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
          color: meta.color, textTransform: 'uppercase',
          padding: '3px 9px', borderRadius: 4,
          background: `${meta.color}1a`,
        }}>{meta.label}</span>
        <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'monospace' }}>{article.date}</span>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.2, margin: '0 0 6px' }}>
        {article.title}
      </h1>
      {article.subtitle && (
        <div style={{ fontSize: 16, color: 'var(--text-2)', marginBottom: 18, lineHeight: 1.4 }}>
          {article.subtitle}
        </div>
      )}

      {author && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 0',
          borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
          marginBottom: 20,
        }}>
          <Link to={`/player/${author.id}`} state={{ from: { label: 'Article' } }} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--surface-3)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: 'var(--text-1)',
            }}>
              {author.number ?? author.displayName[0]}
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 600 }}>{author.displayName}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{author.name}</div>
            </div>
          </Link>
        </div>
      )}

      <article style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--text-1)' }}>
        {(article.paragraphs ?? []).map((p, i) => (
          <p key={i} style={{ margin: '0 0 18px' }}>{p}</p>
        ))}
      </article>

      {relatedMatch && (
        <Link to={`/match/${article.matchId}`} style={{ textDecoration: 'none' }}>
          <div className="surface border-subtle" style={{
            marginTop: 28, padding: '14px 16px', borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 12,
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
          >
            <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Related match</span>
            <span style={{ flex: 1, fontSize: 14 }}>
              {relatedMatch.venue === 'home' ? 'vs' : '@'} {relatedMatch.opponent.shortName}
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700 }}>
              {relatedMatch.score.fcg}–{relatedMatch.score.opponent}
            </span>
          </div>
        </Link>
      )}
    </div>
  )
}
