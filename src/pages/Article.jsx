import { useParams, Link } from 'react-router-dom'
import { articles, getPlayer, findMatch, getSeason, seasonPath, asset } from '../data'
import { MatchRow, SectionHead, longDate } from '../components/ui'
import { TYPE_LABEL } from './History'

export default function Article() {
  const { id } = useParams()
  const article = articles.find((a) => a.id === id)

  if (!article) return (
    <div className="page page-narrow">
      <Link to="/history" className="back">← Stories</Link>
      <p className="muted">Article not found.</p>
    </div>
  )

  const relatedMatch = article.matchId ? findMatch(article.matchId) : null
  const season = relatedMatch ? getSeason(relatedMatch.season) : undefined
  const author = article.author ? getPlayer(article.author, season) : null

  return (
    <div className="page" style={{ maxWidth: 680 }}>
      <Link to="/history" className="back">← Stories</Link>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <span className="tag" style={{ color: 'var(--accent)' }}>{TYPE_LABEL[article.type] ?? article.type}</span>
        <span className="tag">{longDate(article.date)}</span>
      </div>

      <h1 style={{ fontSize: 'clamp(32px, 6vw, 44px)', fontWeight: 700, lineHeight: 1.15, margin: '14px 0 10px', letterSpacing: '-0.01em' }}>
        {article.title}
      </h1>
      {article.subtitle && <div className="muted" style={{ fontSize: 20, lineHeight: 1.4 }}>{article.subtitle}</div>}

      {author && (
        <Link to={season ? seasonPath(season, `/player/${author.id}`) : `/player/${author.id}`} state={{ from: { label: 'Story' } }}
          style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '24px 0 32px', padding: '12px 0', borderTop: '1px solid var(--hair)', borderBottom: '1px solid var(--hair)' }}>
          <span className="kicker">By</span>
          <span className="display" style={{ fontSize: 20, fontWeight: 600 }}>{author.displayName}</span>
          <span className="faint" style={{ fontSize: 13 }}>{author.name}</span>
          {author.number != null && <span className="display num" style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: 20 }}>#{author.number}</span>}
        </Link>
      )}

      {article.cover && (
        <img src={asset(article.cover)} alt="" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block', marginBottom: 32 }} />
      )}

      <article style={{ fontSize: 18, lineHeight: 1.85 }}>
        {(article.paragraphs ?? []).map((p, i) => (
          <p key={i} style={{ margin: '0 0 1.2em' }}>{p}</p>
        ))}
      </article>

      {relatedMatch && (
        <section className="section" style={{ marginTop: 48 }}>
          <SectionHead title="The match" />
          <MatchRow m={relatedMatch} />
        </section>
      )}
    </div>
  )
}
