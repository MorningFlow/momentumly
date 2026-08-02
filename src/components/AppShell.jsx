import { Outlet, NavLink } from 'react-router-dom'
import { useApp } from '../store/appStore'

const NAV_LINKS = [
  { path: '/', icon: 'dashboard', label: 'Dashboard' },
  { path: '/analytics', icon: 'bar_chart', label: 'Analytics' },
  { path: '/prospects', icon: 'groups', label: 'Prospects' },
  { path: '/settings', icon: 'settings', label: 'Settings' },
]

export default function AppShell() {
  const { todaysCompletionPct } = useApp()

  return (
    <div className="mobile-col app-container" style={{ 
      display: 'flex',
      background: 'linear-gradient(135deg, #051417 0%, #0b2229 50%, #04090b 100%)', 
      color: '#f0f4f8', fontFamily: 'Inter', position: 'relative' 
    }}>
      
      {/* Ambient Glows (Much stronger so glassmorphism catches them) */}
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '70vw', height: '70vw', background: 'radial-gradient(circle, rgba(30, 110, 100, 0.3) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '70vw', height: '70vw', background: 'radial-gradient(circle, rgba(50, 140, 100, 0.25) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '30%', left: '40%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(20, 70, 120, 0.2) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Sidebar Rail (Desktop) */}
      <nav className="desktop-sidebar" style={{ width: '72px', background: 'rgba(6, 13, 19, 0.4)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: '24px', zIndex: 10 }}>
        {/* Brand Icon */}
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          <img src="/logo.png" alt="Momentumly Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', padding: '0 12px', flex: 1 }}>
          {NAV_LINKS.map(link => (
            <NavLink key={link.path} to={link.path} style={({ isActive }) => ({
              width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s ease',
              color: isActive ? '#fff' : 'rgba(180, 200, 200, 0.5)',
              background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
              boxShadow: isActive ? 'inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
              textDecoration: 'none'
            })} title={link.label}>
              {({ isActive }) => (
                <span className={`material-symbols-outlined ${isActive ? 'icon-filled' : ''}`} style={{ fontSize: '22px' }}>
                  {link.icon}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Logout */}
        <div style={{ padding: '0 12px', width: '100%' }}>
          <button onClick={useApp().logout} style={{
            width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s ease',
            color: '#ffb4ab', background: 'transparent', border: 'none',
          }} title="Sign Out" className="glass-panel-hover">
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden', zIndex: 1, position: 'relative' }}>
        
        {/* Top Header */}
        <header className="mobile-header" style={{ height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#f0f4f8', letterSpacing: '0.01em' }}>Momentumly</span>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <span className="mobile-hide" style={{ fontSize: '13px', color: 'rgba(180, 200, 200, 0.6)' }}>V1</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: '999px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#52b788' }}>task_alt</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#f0f4f8' }}>{todaysCompletionPct}% Today</span>
            </div>
          </div>
        </header>

        {/* Page Outlet */}
        <div className="mobile-p-16" style={{ flex: 1, padding: '40px' }}>
          <Outlet />
        </div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="mobile-bottom-nav">
        {NAV_LINKS.map(link => (
          <NavLink key={link.path} to={link.path} style={({ isActive }) => ({
            width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '12px', color: isActive ? '#fff' : 'rgba(180, 200, 200, 0.5)',
            background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent', textDecoration: 'none'
          })}>
            {({ isActive }) => (
              <span className={`material-symbols-outlined ${isActive ? 'icon-filled' : ''}`} style={{ fontSize: '24px' }}>
                {link.icon}
              </span>
            )}
          </NavLink>
        ))}
        <button onClick={useApp().logout} style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', color: '#ffb4ab', background: 'transparent', border: 'none' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>logout</span>
        </button>
      </nav>
    </div>
  )
}
