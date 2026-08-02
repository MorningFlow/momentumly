import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export function CustomSelect({ value, onChange, options, style = {}, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const dropdownRef = useRef(null);
  const [coords, setCoords] = useState({ left: 0, top: 0, width: 0 });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target) && 
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCoords({
        left: rect.left,
        top: rect.bottom + window.scrollY + 8,
        width: rect.width
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = (e) => { 
      // Don't close if they are scrolling the dropdown itself
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
      if (isOpen) setIsOpen(false); 
    };
    window.addEventListener('scroll', handleScroll, true); 
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isOpen]);

  const selectedOption = options.find(o => o.value === value) || { label: value, value };

  const menu = isOpen ? createPortal(
    <div 
      ref={dropdownRef}
      onClick={(e) => e.stopPropagation()} 
      style={{
        position: 'absolute', top: coords.top, left: coords.left, minWidth: coords.width,
        background: 'rgba(6, 13, 19, 0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.5)', zIndex: 99999,
        maxHeight: '240px', overflowY: 'auto', padding: '6px',
        display: 'flex', flexDirection: 'column', gap: '2px'
      }}
    >
      {options.map(opt => (
        <div 
          key={opt.value}
          onClick={(e) => { e.stopPropagation(); onChange(opt.value); setIsOpen(false); }}
          style={{
            padding: '8px 12px', cursor: 'pointer', borderRadius: '8px',
            color: value === opt.value ? '#52b788' : '#f0f4f8',
            background: value === opt.value ? 'rgba(82, 183, 136, 0.15)' : 'transparent',
            fontSize: '13px', transition: 'all 0.2s',
            whiteSpace: 'nowrap', userSelect: 'none'
          }}
          onMouseEnter={(e) => {
            if (value !== opt.value) e.target.style.background = 'rgba(255,255,255,0.05)';
          }}
          onMouseLeave={(e) => {
            if (value !== opt.value) e.target.style.background = 'transparent';
          }}
        >
          {opt.label}
        </div>
      ))}
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div ref={ref} style={{ position: 'relative', cursor: 'pointer', ...style }} className={className} onClick={() => setIsOpen(!isOpen)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%', userSelect: 'none', gap: '8px' }}>
          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>{selectedOption.label}</span>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', opacity: 0.6, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>expand_more</span>
        </div>
      </div>
      {menu}
    </>
  );
}
