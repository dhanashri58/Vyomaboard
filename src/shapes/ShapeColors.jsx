import React from 'react';

export const NOTE_COLORS = {
  yellow: { bg: '#fef3c7', headerBg: '#fde68a', text: '#92400e', placeholder: '#b45309' },
  orange: { bg: '#ffedd5', headerBg: '#fed7aa', text: '#9a3412', placeholder: '#c2410c' },
  red: { bg: '#fee2e2', headerBg: '#fecaca', text: '#991b1b', placeholder: '#b91c1c' },
  'light-red': { bg: '#fff1f2', headerBg: '#ffe4e6', text: '#9f1239', placeholder: '#be123c' },
  green: { bg: '#dcfce7', headerBg: '#bbf7d0', text: '#14532d', placeholder: '#15803d' },
  'light-green': { bg: '#ecfccb', headerBg: '#d9f99d', text: '#3f6212', placeholder: '#4d7c0f' },
  blue: { bg: '#dbeafe', headerBg: '#bfdbfe', text: '#1e3a8a', placeholder: '#1d4ed8' },
  'light-blue': { bg: '#e0f2fe', headerBg: '#bae6fd', text: '#075985', placeholder: '#0369a1' },
  violet: { bg: '#f3e8ff', headerBg: '#e9d5ff', text: '#581c87', placeholder: '#6b21a8' },
  'light-violet': { bg: '#fae8ff', headerBg: '#f5d0fe', text: '#86198f', placeholder: '#a21caf' },
  grey: { bg: '#f3f4f6', headerBg: '#e5e7eb', text: '#374151', placeholder: '#4b5563' },
  black: { bg: '#e5e7eb', headerBg: '#d1d5db', text: '#111827', placeholder: '#374151' },
  white: { bg: 'var(--surface-color)', headerBg: '#f3f4f6', text: '#374151', placeholder: '#6b7280' }
};

export const ColorPicker = ({ selectedColor, onSelect }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      padding: '8px',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'none',
      borderRadius: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      position: 'absolute',
      bottom: '-45px',
      left: '50%',
      transform: 'translateX(-50%)',
      pointerEvents: 'none',
      transition: 'opacity 0.2s',
      zIndex: 100,
    }}>
      {Object.keys(NOTE_COLORS).map(colorKey => (
        <button
          key={colorKey}
          onClick={(e) => { e.stopPropagation(); onSelect(colorKey); }}
          onPointerDown={(e) => e.stopPropagation()}
          title={colorKey}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: NOTE_COLORS[colorKey].bg,
            border: selectedColor === colorKey ? `2px solid ${NOTE_COLORS[colorKey].text}` : '1px solid rgba(0,0,0,0.1)',
            cursor: 'pointer',
            padding: 0,
          }}
        />
      ))}
    </div>
  );
};
