import { NavLink } from 'react-router-dom'

export default function Nav() {
  const linkStyle = ({ isActive }) => ({
    color: isActive ? '#f0f0f2' : '#9191a4',
    fontWeight: isActive ? '600' : '400',
    textDecoration: 'none',
    fontSize: '14px',
    paddingBottom: '2px',
    borderBottom: isActive ? '2px solid #60a5fa' : '2px solid transparent',
    transition: 'color 0.15s',
  })

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: '#17171f',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      height: '56px',
      display: 'flex', alignItems: 'center',
      padding: '0 20px',
      gap: '24px',
    }}>
      <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.3px', marginRight: '8px' }}>
        FCG
      </span>
      <NavLink to="/" end style={linkStyle}>Overview</NavLink>
      <NavLink to="/squad" style={linkStyle}>Squad</NavLink>
      <NavLink to="/history" style={linkStyle}>History</NavLink>
    </nav>
  )
}
