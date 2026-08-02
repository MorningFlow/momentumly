import React, { useRef, useState } from 'react';

const colorMap = {
  blue: '#3b82f6',
  purple: '#8b5cf6',
  green: '#10b981',
  red: '#ef4444',
  orange: '#e0a96d',
  teal: '#52b788'
};

export function GlowCard({ 
  children, 
  className = '', 
  glowColor = 'teal',
  style = {}
}) {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  // Use mapped hex, or fallback to whatever string is provided (so hex values can be passed directly)
  const glowHex = colorMap[glowColor] || glowColor;

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        ...style,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Surface Spotlight overlay */}
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          opacity: opacity,
          transition: 'opacity 0.4s ease',
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${glowHex}1A, transparent 50%)`, // 1A is ~10% opacity
          zIndex: 1
        }}
      />
      
      {/* Border Spotlight overlay */}
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          opacity: opacity,
          transition: 'opacity 0.4s ease',
          padding: '1px',
          borderRadius: 'inherit',
          background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, ${glowHex}66, transparent 50%)`, // 66 is ~40% opacity
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          zIndex: 2
        }}
      />

      {/* Content wrapper */}
      <div style={{ position: 'relative', zIndex: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}
