import React, { useEffect, useState } from 'react';
import { useEditor, DefaultColorStyle, DefaultSizeStyle, DefaultDashStyle } from 'tldraw';
import { PenTool, Pencil, Brush, Baseline, Zap, Feather, GripHorizontal } from 'lucide-react';

export default function PenStylePanel() {
  const editor = useEditor();
  const [activeTool, setActiveTool] = useState(editor.getCurrentToolId());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handleChange = () => {
      setActiveTool(editor.getCurrentToolId());
      setTick(t => t + 1);
    };
    // Tldraw v2 uses editor.store.listen to track changes to the internal store
    const unsubscribe = editor.store.listen(handleChange, { scope: 'session' });
    return () => unsubscribe();
  }, [editor]);

  const isDrawingTool = activeTool === 'draw' || activeTool === 'highlight' || activeTool === 'laser';

  if (!isDrawingTool) return null;

  // Retrieve current styles properly using Tldraw v2 SharedStyles
  const sharedStyles = editor.getSharedStyles();
  const currentDash = sharedStyles.getAsKnownValue(DefaultDashStyle) || 'draw';
  const currentSize = sharedStyles.getAsKnownValue(DefaultSizeStyle) || 'm';

  const setPenStyle = (tool, size, dash) => {
    editor.setCurrentTool(tool);
    if (size) {
      editor.setStyleForSelectedShapes(DefaultSizeStyle, size);
      editor.setStyleForNextShapes(DefaultSizeStyle, size);
    }
    if (dash) {
      editor.setStyleForSelectedShapes(DefaultDashStyle, dash);
      editor.setStyleForNextShapes(DefaultDashStyle, dash);
    }
  };

  const penTypes = [
    { id: 'pen', name: 'Pen', icon: PenTool, onClick: () => setPenStyle('draw', 'm', 'draw'), isActive: activeTool === 'draw' && currentSize === 'm' && currentDash === 'draw' },
    { id: 'pencil', name: 'Pencil', icon: Pencil, onClick: () => setPenStyle('draw', 's', 'solid'), isActive: activeTool === 'draw' && currentSize === 's' && currentDash === 'solid' },
    { id: 'chalk', name: 'Chalk', icon: GripHorizontal, onClick: () => setPenStyle('draw', 'l', 'dashed'), isActive: activeTool === 'draw' && currentSize === 'l' && currentDash === 'dashed' },
    { id: 'marker', name: 'Marker', icon: Brush, onClick: () => setPenStyle('draw', 'xl', 'solid'), isActive: activeTool === 'draw' && currentSize === 'xl' && currentDash === 'solid' },
    { id: 'calligraphy', name: 'Calligraphy', icon: Feather, onClick: () => setPenStyle('draw', 'xl', 'draw'), isActive: activeTool === 'draw' && currentSize === 'xl' && currentDash === 'draw' },
    { id: 'highlight', name: 'Highlight', icon: Baseline, onClick: () => setPenStyle('highlight', null, null), isActive: activeTool === 'highlight' },
    { id: 'laser', name: 'Laser (Glow)', icon: Zap, onClick: () => setPenStyle('laser', null, null), isActive: activeTool === 'laser' },
  ];

  return (
    <div style={{
      position: 'absolute',
      right: '12px', /* Position on the right side below Tldraw's native StylePanel */
      top: '112px',
      background: 'var(--color-panel)',
      border: '1px solid var(--color-divider)',
      borderRadius: '12px',
      padding: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      zIndex: 500,
      backdropFilter: 'none',
      color: 'var(--color-text)',
      pointerEvents: 'all',
    }}>
      <div style={{ fontSize: '11px', fontWeight: 600, padding: '4px 8px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Pen Styles
      </div>
      {penTypes.map(pen => (
        <button
          key={pen.id}
          onClick={pen.onClick}
          title={pen.name}
          className={`pen-style-btn ${pen.isActive ? 'active' : ''}`}
          style={{
            background: pen.isActive ? 'var(--accent)' : 'transparent',
            color: pen.isActive ? 'white' : 'var(--color-text)',
            border: 'none',
            borderRadius: '8px',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <pen.icon size={20} />
        </button>
      ))}
    </div>
  );
}
