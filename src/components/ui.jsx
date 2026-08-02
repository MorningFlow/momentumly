// Shared modal primitives — overlay + card

export function Modal({ onClose, children, width = '520px' }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{
        width, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto',
        background: 'rgba(18,22,28,0.98)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '20px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        padding: '32px',
        position: 'relative',
      }}>
        {children}
      </div>
    </div>
  )
}

export function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: 'Inter', fontSize: '20px', fontWeight: 700, color: '#e0e2e8', letterSpacing: '-0.02em' }}>
            {title}
          </h2>
          {subtitle && <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'rgba(203,195,215,0.6)' }}>{subtitle}</p>}
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'rgba(203,195,215,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          marginLeft: '16px',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
        </button>
      </div>
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginTop: '20px' }} />
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(203,195,215,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', padding: '10px 14px',
  color: '#e0e2e8', fontSize: '14px', fontFamily: 'Inter',
  outline: 'none', transition: 'border-color 0.2s',
}

export function PrimaryBtn({ children, onClick, disabled, type = 'button' }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      fontSize: '14px', fontWeight: 600, color: '#fff',
      background: 'linear-gradient(135deg, #6d3bd7, #2DD4BF)',
      border: 'none', borderRadius: '10px', padding: '12px 24px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'opacity 0.2s',
    }}>
      {children}
    </button>
  )
}

export function GhostBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      fontSize: '13px', fontWeight: 500, color: 'rgba(203,195,215,0.7)',
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px', padding: '10px 20px', cursor: 'pointer',
    }}>
      {children}
    </button>
  )
}
