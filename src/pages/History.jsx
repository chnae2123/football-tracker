import { Link } from 'react-router-dom'
import { articles, getPlayer, asset } from '../data'
import { longDate } from '../components/ui'

export const TYPE_LABEL = { recap: 'Match report', column: 'Column', weekly: 'Weekly', feature: 'Feature' }

export default function History() {
  return (
    <div className="page page-narrow">
      <header style={{ borderBottom: '3px solid var(--rule)', paddingBottom: 20, marginBottom: 8 }}>
        <div className="kicker" style={{ marginBottom: 10 }}>周报 · 专栏 · 赛后手记</div>
        <h1 className="display" style={{ fontSize: 'clamp(64px, 12vw, 112px)', margin: 0, fontWeight: 800 }}>Stories</h1>
      </header>

      {articles.length === 0 && <p className="faint" style={{ padding: '32px 0' }}>还没有文章。</p>}

      {articles.map((a) => {
        const author = a.author ? getPlayer(a.author) : null
        const preview = a.paragraphs?.[0] ?? ''
        return (
          <Link key={a.id} to={`/history/${a.id}`} className="story">
            <article style={{ padding: '28px 0', borderBottom: '1px solid var(--hair)' }}>
              {a.cover && (
                <img src={asset(a.cover)} alt="" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block', marginBottom: 18 }} />
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                <span className="tag" style={{ color: 'var(--accent)' }}>{TYPE_LABEL[a.type] ?? a.type}</span>
                <span className="tag">{longDate(a.date)}</span>
              </div>
              <h2 className="story-title" style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.2, margin: '10px 0 6px' }}>
                {a.title}
              </h2>
              {a.subtitle && <div className="muted" style={{ fontSize: 17 }}>{a.subtitle}</div>}
              {preview && (
                <p className="muted" style={{
                  fontSize: 15, lineHeight: 1.7, margin: '12px 0 0',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>{preview}</p>
              )}
              {author && <div className="kicker" style={{ marginTop: 14 }}>By {author.displayName}</div>}
            </article>
          </Link>
        )
      })}
      <style>{`
        .story:hover .story-title { color: var(--accent); }
      `}</style>
    </div>
  )
}
