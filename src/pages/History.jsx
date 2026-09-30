import { Link } from 'react-router-dom'
import { articles, getPlayer, asset } from '../data'

const TYPE_LABEL = {
  recap: { label: 'Recap', color: '#4ade80' },
  column: { label: 'Column', color: '#fbbf24' },
  weekly: { label: 'Weekly', color: '#60a5fa' },
  feature: { label: 'Feature', color: '#f472b6' },
}

export default function History() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 64px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>History</h1>
      <p style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 4, marginBottom: 24 }}>
        周报、专栏、赛后手记
      </p>

      {articles.length === 0 ? (
        <div className="surface border-subtle" style={{ borderRadius: 12, padding: '32px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
          还没有文章。
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {articles.map((a) => {
            const author = a.author ? getPlayer(a.author) : null
            const meta = TYPE_LABEL[a.type] || { label: a.type, color: 'var(--text-2)' }
            const preview = (a.paragraphs && a.paragraphs[0]) || ''

            return (
              <Link key={a.id} to={`/history/${a.id}`} style={{ textDecoration: 'none' }}>
                <article className="surface border-subtle" style={{
                  borderRadius: 12, padding: '16px 18px',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
                >
                  {/* Cover */}
                  {a.cover && (
                    <img src={asset(a.cover)} alt="" style={{
                      width: 'calc(100% + 36px)', margin: '-16px -18px 14px',
                      display: 'block', aspectRatio: '16/9', objectFit: 'cover',
                    }} />
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                      color: meta.color, textTransform: 'uppercase',
                      padding: '2px 8px', borderRadius: 4,
                      background: `${meta.color}1a`,
                    }}>{meta.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace' }}>{a.date}</span>
                  </div>

                  <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 4px', lineHeight: 1.3 }}>
                    {a.title}
                  </h2>
                  {a.subtitle && (
                    <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 8 }}>{a.subtitle}</div>
                  )}
                  {preview && (
                    <p style={{
                      fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55, margin: '8px 0 0',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>{preview}</p>
                  )}
                  {author && (
                    <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-3)' }}>
                      by <span style={{ color: 'var(--text-2)' }}>{author.displayName}</span>
                    </div>
                  )}
                </article>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
