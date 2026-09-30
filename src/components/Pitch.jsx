import { Link } from 'react-router-dom'
import { getPlayer } from '../data'

const W = 320
const H = 460

function posFromFormation(formation, lineup) {
  const outfield = lineup.filter((p) => p.role !== 'GK')
  const rows = formation.split('-').map(Number)
  const positions = []

  // GK
  const gk = lineup.find((p) => p.role === 'GK')
  if (gk) positions.push({ ...gk, x: W / 2, y: H - 44 })

  const usableH = H - 100
  let idx = 0
  for (let r = 0; r < rows.length; r++) {
    const count = rows[r]
    const y = H - 90 - (usableH / rows.length) * r
    for (let c = 0; c < count; c++) {
      if (idx >= outfield.length) break
      positions.push({ ...outfield[idx], x: (W / (count + 1)) * (c + 1), y })
      idx++
    }
  }
  return positions
}

function PitchMarkings() {
  const lw = 1.5
  const s = 'rgba(255,255,255,0.15)'
  const mx = W / 2

  return (
    <g>
      {/* Outer border */}
      <rect x={16} y={12} width={W - 32} height={H - 24} rx={4} fill="none" stroke={s} strokeWidth={lw} />
      {/* Center line */}
      <line x1={16} y1={H / 2} x2={W - 16} y2={H / 2} stroke={s} strokeWidth={lw} />
      {/* Center circle */}
      <circle cx={mx} cy={H / 2} r={42} fill="none" stroke={s} strokeWidth={lw} />
      <circle cx={mx} cy={H / 2} r={2.5} fill={s} />
      {/* Top penalty area */}
      <rect x={mx - 52} y={12} width={104} height={52} fill="none" stroke={s} strokeWidth={lw} />
      {/* Top 6-yard box */}
      <rect x={mx - 26} y={12} width={52} height={24} fill="none" stroke={s} strokeWidth={lw} />
      {/* Bottom penalty area */}
      <rect x={mx - 52} y={H - 64} width={104} height={52} fill="none" stroke={s} strokeWidth={lw} />
      {/* Bottom 6-yard box */}
      <rect x={mx - 26} y={H - 36} width={52} height={24} fill="none" stroke={s} strokeWidth={lw} />
      {/* Penalty spots */}
      <circle cx={mx} cy={42} r={2} fill={s} />
      <circle cx={mx} cy={H - 42} r={2} fill={s} />
    </g>
  )
}

export default function Pitch({ formation, lineup, backState }) {
  const positions = posFromFormation(formation, lineup)

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8, textAlign: 'center', letterSpacing: '0.06em', fontWeight: 600 }}>
        {formation}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 360, display: 'block', margin: '0 auto' }}>
        {/* Grass */}
        <defs>
          <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a4a2a" />
            <stop offset="100%" stopColor="#163d22" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={W} height={H} rx={8} fill="url(#grass)" />

        {/* Grass stripes */}
        {Array.from({ length: 7 }).map((_, i) => (
          <rect key={i} x={16} y={12 + i * ((H - 24) / 7)}
            width={W - 32} height={(H - 24) / 14}
            fill="rgba(255,255,255,0.025)" />
        ))}

        <PitchMarkings />

        {/* Players */}
        {positions.map((p) => {
          const player = getPlayer(p.playerId)
          const isGK = p.role === 'GK'
          return (
            <Link key={p.playerId} to={`/player/${p.playerId}`} state={backState} style={{ cursor: 'pointer' }}>
              <g>
                {/* larger transparent hit target so the whole chip (circle + name) is tappable */}
                <rect x={p.x - 28} y={p.y - 20} width={56} height={52} fill="transparent" />
                <circle cx={p.x} cy={p.y} r={16}
                  fill={isGK ? '#1e3a5f' : '#1a1a27'}
                  stroke={isGK ? '#60a5fa' : 'rgba(255,255,255,0.4)'}
                  strokeWidth={1.5} />
                <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle"
                  fill="white" fontSize={10} fontWeight="700" style={{ pointerEvents: 'none' }}>
                  {player?.number ?? '?'}
                </text>
                <text x={p.x} y={p.y + 26} textAnchor="middle"
                  fill="rgba(255,255,255,0.8)" fontSize={9} style={{ pointerEvents: 'none' }}>
                  {player?.displayName ?? p.playerId}
                </text>
              </g>
            </Link>
          )
        })}
      </svg>
    </div>
  )
}
