import { Link } from 'react-router-dom'
import { getPlayer, seasonPath } from '../data'

const W = 340
const H = 480
const M = 14 // outer margin to touch line

function posFromFormation(formation, lineup) {
  const outfield = lineup.filter((p) => p.role !== 'GK')
  const rows = formation.split('-').map(Number)
  const positions = []

  const gk = lineup.find((p) => p.role === 'GK')
  if (gk) positions.push({ ...gk, x: W / 2, y: H - 52 })

  const top = 70
  const bottom = H - 140
  for (let r = 0, idx = 0; r < rows.length; r++) {
    const count = rows[r]
    const y = rows.length === 1 ? (top + bottom) / 2 : bottom - ((bottom - top) / (rows.length - 1)) * r
    for (let c = 0; c < count && idx < outfield.length; c++, idx++) {
      positions.push({ ...outfield[idx], x: (W / (count + 1)) * (c + 1), y })
    }
  }
  return positions
}

const ROW_ROLES = { 1: ['MID'], 2: ['DEF', 'FW'], 3: ['DEF', 'MID', 'FW'], 4: ['DEF', 'MID', 'MID', 'FW'] }
export const DEFAULT_FORMATION = '2-3-1'

/**
 * Seven slots for a formation, filled with whoever is known.
 * Unknown slots come back as { playerId: null, role } so the pitch and lists can draw placeholders.
 */
export function fillLineup(formation, lineup = []) {
  const rows = (formation || DEFAULT_FORMATION).split('-').map(Number)
  const rowRoles = ROW_ROLES[rows.length] ?? rows.map(() => 'MID')
  const roles = ['GK', ...rows.flatMap((n, i) => Array(n).fill(rowRoles[i]))]
  const left = [...lineup]
  const slots = roles.map((role) => {
    const i = left.findIndex((p) => p.role === role)
    return i >= 0 ? left.splice(i, 1)[0] : { playerId: null, role }
  })
  // Anyone whose role didn't match a slot takes the first empty outfield slot
  for (const p of left) {
    const i = slots.findIndex((s) => !s.playerId && s.role !== 'GK')
    if (i >= 0) slots[i] = { ...p, role: slots[i].role }
  }
  return slots
}

// Shirt silhouette centred on (0,0), ~42 wide × 34 tall
const SHIRT = 'M-9 -17 L-19 -12 L-24 -2 L-16 2 L-14 -4 L-14 17 L14 17 L14 -4 L16 2 L24 -2 L19 -12 L9 -17 Q0 -10 -9 -17 Z'

function Markings() {
  const s = 'var(--pitch-line)'
  const mx = W / 2
  const box = { w: 150, h: 64 }
  const six = { w: 70, h: 26 }
  return (
    <g fill="none" stroke={s} strokeWidth={1.5}>
      <rect x={M} y={M} width={W - 2 * M} height={H - 2 * M} />
      <line x1={M} y1={H / 2} x2={W - M} y2={H / 2} />
      <circle cx={mx} cy={H / 2} r={44} />
      <circle cx={mx} cy={H / 2} r={2.5} fill={s} stroke="none" />
      <rect x={mx - box.w / 2} y={M} width={box.w} height={box.h} />
      <rect x={mx - six.w / 2} y={M} width={six.w} height={six.h} />
      <rect x={mx - box.w / 2} y={H - M - box.h} width={box.w} height={box.h} />
      <rect x={mx - six.w / 2} y={H - M - six.h} width={six.w} height={six.h} />
      <path d={`M ${mx - 30} ${M + box.h} A 36 36 0 0 0 ${mx + 30} ${M + box.h}`} />
      <path d={`M ${mx - 30} ${H - M - box.h} A 36 36 0 0 1 ${mx + 30} ${H - M - box.h}`} />
    </g>
  )
}

export default function Pitch({ season, formation, lineup, backState, highlight = [] }) {
  const positions = posFromFormation(formation, lineup)
  const stripes = 10

  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }} role="img"
        aria-label={`Formation ${formation}`}>
        <rect x={0} y={0} width={W} height={H} fill="var(--pitch)" />
        {Array.from({ length: stripes }).map((_, i) => i % 2 === 0 && (
          <rect key={i} x={0} y={(H / stripes) * i} width={W} height={H / stripes} fill="var(--pitch-stripe)" />
        ))}
        <Markings />

        {positions.map((p, i) => {
          if (!p.playerId) {
            return (
              <g key={`empty-${i}`} transform={`translate(${p.x} ${p.y})`} aria-label="未记录">
                <path d={SHIRT} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.55)" strokeWidth={1.2} strokeDasharray="3 3" />
              </g>
            )
          }
          const player = getPlayer(p.playerId, season)
          const isGK = p.role === 'GK'
          const scored = highlight.includes(p.playerId)
          return (
            <Link key={p.playerId} to={seasonPath(season, `/player/${p.playerId}`)} state={backState} className="pitch-player">
              <g transform={`translate(${p.x} ${p.y})`}>
                <rect x={-34} y={-22} width={68} height={62} fill="transparent" />
                <path d={SHIRT} fill={isGK ? 'var(--kit-2)' : 'var(--kit)'} stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
                <text y={4} textAnchor="middle" dominantBaseline="middle"
                  fill="var(--kit-ink)" style={{ font: '700 15px var(--display)', pointerEvents: 'none' }}>
                  {player?.number ?? ''}
                </text>
                <text y={33} textAnchor="middle" fill="#fff"
                  style={{ font: '600 13px var(--display)', letterSpacing: '0.03em', pointerEvents: 'none' }}>
                  {player?.displayName ?? p.playerId}
                </text>
                {scored && <circle cx={18} cy={-15} r={4.5} fill="#fff" stroke="var(--pitch)" strokeWidth={1.5} />}
              </g>
            </Link>
          )
        })}
      </svg>
      <style>{`
        .pitch-player { cursor: pointer; }
        .pitch-player:hover path { stroke: #fff; stroke-width: 2; }
      `}</style>
    </figure>
  )
}
