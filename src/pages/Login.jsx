import { signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../firebase/config'
import { GlowCard } from '../components/ui/spotlight-card'

const ALLOWED_EMAIL = 'morningflow10@gmail.com'

export default function Login() {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      if (result.user.email !== ALLOWED_EMAIL) {
        alert(`Access Denied. ${result.user.email} is not authorized for this workspace.`)
        await signOut(auth)
      }
    } catch (error) {
      console.error("Login failed", error)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #051417 0%, #0b2229 50%, #04090b 100%)', color: '#f0f4f8', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      
      {/* Ambient Glows */}
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '70vw', height: '70vw', background: 'radial-gradient(circle, rgba(30, 110, 100, 0.3) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '70vw', height: '70vw', background: 'radial-gradient(circle, rgba(50, 140, 100, 0.25) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '30%', left: '40%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(20, 70, 120, 0.2) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none', zIndex: 0 }} />

      <GlowCard glowColor="teal" className="mobile-modal-content" style={{ 
        width: '400px', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 10,
        background: 'rgba(6, 13, 19, 0.6)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', 
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)'
      }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          <img src="/logo.png" alt="Momentumly Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0', color: '#f0f4f8' }}>Welcome to Momentumly</h1>
        <p style={{ fontSize: '14px', color: 'rgba(180, 200, 200, 0.6)', margin: '0 0 32px 0' }}>Sign in to access your dashboard.</p>
        
        <button onClick={handleLogin} style={{ 
          display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
          padding: '12px 24px', borderRadius: '12px', color: '#f0f4f8', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', width: '100%', justifyContent: 'center'
        }} className="glass-panel-hover">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
          Sign in with Google
        </button>
      </GlowCard>
    </div>
  )
}
