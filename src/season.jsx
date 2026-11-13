import { useParams, useLocation, Navigate, Link } from 'react-router-dom'
import { currentSeason, getSeason, isSeasonSlug, findMatch, seasonPath } from './data'

/** Season from the URL (/2025-26/...), or the newest season on un-prefixed routes. null if the slug is unknown. */
export function useSeason() {
  const { season } = useParams()
  if (!season) return currentSeason
  return isSeasonSlug(season) ? getSeason(season) : null
}

/** Season slug from any pathname — for components outside <Routes> like the nav */
export function useSeasonSlugFromPath() {
  const { pathname } = useLocation()
  const seg = pathname.split('/').filter(Boolean)[0]
  return isSeasonSlug(seg) && getSeason(seg) ? seg : currentSeason.slug
}

/** Old links like /match/<id> → /<season>/match/<id> */
export function LegacyMatchRedirect() {
  const { id } = useParams()
  const m = findMatch(id)
  return <Navigate to={m ? seasonPath(m.season, `/match/${id}`) : '/'} replace />
}

export function NotFound({ what = 'Page' }) {
  return (
    <div className="page page-narrow">
      <Link to="/" className="back">← Home</Link>
      <h1 className="display" style={{ fontSize: 64, margin: 0 }}>Not found</h1>
      <p className="muted">{what} not found.</p>
    </div>
  )
}
