import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { C } from '../colors'
import logo from '../assets/logo.png' 

const navItems = [
  { path: '/dashboard', label: 'Dashboard',   icon: <i className="bi bi-speedometer"></i>, color: C.orange },
  { path: '/trends',    label: 'Trends & ML', icon: <i className="bi bi-bar-chart-line-fill"></i>, color: C.teal   },
  { path: '/reports',   label: 'Reports',     icon: <i className="bi bi-file-earmark-fill"></i>, color: C.purple },
  { path: '/insights',  label: 'Insights',    icon: <i className="bi bi-lightbulb-fill"></i>, color: C.yellow },
]

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { seller, logout } = useAuth()

  const go = (path) => {
    navigate(path)
    if (onClose) onClose()
  }

  return (
    <div className={`sidebar ${open ? 'open' : ''}`}>

      {/* Top rainbow bar */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #58A6FF, #BC8CFF, #39D5D5)', flexShrink: 0 }} />

      {/* Logo */}
      <div style={{ padding: '18px 18px 14px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#2c0404', fontSize: 14 }}>
            <img src={logo} alt="Agratas" style={{ height:100 }} />
          </div>
          <div>
            <span style={{ fontSize: 25, fontWeight: 800, color: 'linear-gradient(135deg,#077A7D,#7AE2CF)',fontFamily:'cursive'}}>AgratasAi</span>
          </div>
        </div>
      </div>

      {/* Seller info */}
      <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#077A7D,#7AE2CF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#6d4444', fontSize: 13, flexShrink: 0 }}>
            <i className="bi bi-person" style={{fontSize:20,color:'#ffffff'}}></i>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: C.white, fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{seller?.brand_name || 'My Brand'}</div>
            <div style={{ color: C.muted, fontSize: 10 }}>{seller?.name || 'User'}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px' }}>
        {navItems.map(item => {
          const active = location.pathname === item.path
          return (
            <button key={item.path} onClick={() => go(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 10px', marginBottom: 2,
                border: 'none', borderRadius: 8, cursor: 'pointer',
                fontSize: 13, textAlign: 'left', transition: 'all 0.15s',
                background: active ? 'rgba(88,166,255,0.1)' : 'transparent',
                color: active ? C.orange : C.muted,
                fontWeight: active ? 600 : 400
              }}>
              <span style={{ fontSize: 15, color: active ? item.color : C.subtle }}>{item.icon}</span>
              {item.label}
              {active && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: item.color }} />}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{  padding: '10px 10px', position: 'fixed' ,bottom: 0,left: 0,right: 0, background: C.bg }}>  
        <button onClick={() => { logout(); navigate('/login') }}
          style={{ width: '100%', padding: '9px 10px', border: 'none', borderRadius: 8, background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: 12, textAlign: 'left' }}>
          ← Sign Out
        </button>
      </div>
    </div>
  )
}