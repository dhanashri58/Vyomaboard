import React, { useState } from 'react';
import {
  MousePointer2, Hand, Pen, Square, LayoutTemplate, 
  Trash2, Circle, Triangle, Diamond, Hexagon,
  ArrowRight, ArrowUp, ArrowDown, ArrowLeft,
  PieChart, Cloud, Heart, ArrowUpRight, Minus, Box, CheckSquare, Type
} from 'lucide-react';
import '../index.css';

export default function BottomToolbar({ activeTool, setActiveTool, addShape }) {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu, e) => {
    if (e) e.stopPropagation();
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleToolClick = (tool, e) => {
    if (e) e.stopPropagation();
    setActiveTool(tool);
    setOpenMenu(null);
  };

  const handleAction = (action, e) => {
    if (e) e.stopPropagation();
    setOpenMenu(null);
    if (action === 'delete') {
      alert(`Please use the Delete or Backspace key to delete shapes.`);
    } else if (action === 'Highlight') {
      setActiveTool('highlight');
    } else if (action === 'Laser') {
      setActiveTool('laser');
    } else if (action === 'Eraser') {
      setActiveTool('eraser');
    } else if (['Triangle', 'Diamond', 'Hexagon', 'Cloud', 'Heart', 'Arrow', 'Line', 'Frame'].includes(action)) {
      setActiveTool(action.toLowerCase());
    } else if (action.startsWith('Arrow ')) {
      setActiveTool('arrow');
    } else if (action === 'Cards Menu') {
      addShape('milanote-card');
    } else if (action === 'Charts Menu') {
      addShape('milanote-chart');
    }
  };

  const btnStyle = (isActive) => ({
    width: '40px',
    height: '40px',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: isActive ? 'var(--accent-yellow)' : 'var(--sidebar-bg, #fff)',
    border: '3px solid var(--border-color)',
    color: '#000',
    borderRadius: '0',
    cursor: 'pointer',
    boxShadow: isActive ? '0px 0px 0px var(--shadow-color)' : '3px 3px 0px var(--shadow-color)',
    transform: isActive ? 'translate(3px, 3px)' : 'none',
    transition: 'all 0.1s'
  });

  const menuStyle = {
    position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '16px',
    background: 'var(--sidebar-bg)', backdropFilter: 'none', padding: '8px', borderRadius: '0', 
    border: '4px solid var(--border-color)', boxShadow: '6px 6px 0px var(--shadow-color)',
    display: 'flex', gap: '8px'
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '8px',
      background: 'var(--sidebar-bg)',
      backdropFilter: 'none',
      padding: '8px 12px',
      borderRadius: '0',
      border: '4px solid var(--border-color)',
      boxShadow: '6px 6px 0px var(--shadow-color)',
      zIndex: 1000,
      pointerEvents: 'all'
    }}>
      
      {/* Primary Tools */}
      <button style={btnStyle(activeTool === 'select')} onPointerDown={(e) => handleToolClick('select', e)} title="Select">
        <MousePointer2 size={20} />
      </button>
      <button style={btnStyle(activeTool === 'hand')} onPointerDown={(e) => handleToolClick('hand', e)} title="Hand">
        <Hand size={20} />
      </button>

      <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

      {/* Draw Tools with Menu */}
      <div style={{ position: 'relative' }}>
        <button style={btnStyle(['draw', 'highlight', 'laser', 'eraser'].includes(activeTool))} onPointerDown={(e) => toggleMenu('draw', e)} title="Draw">
          {activeTool === 'highlight' ? <span style={{fontWeight: 800, fontSize: 12}}>HL</span> :
           activeTool === 'laser' ? <span style={{fontWeight: 800, fontSize: 12}}>LS</span> :
           activeTool === 'eraser' ? <span style={{fontWeight: 800, fontSize: 12}}>ER</span> :
           <Pen size={20} />}
        </button>
        {openMenu === 'draw' && (
          <div style={menuStyle}>
            <button style={btnStyle(activeTool === 'draw')} onPointerDown={(e) => handleToolClick('draw', e)}><Pen size={20} /></button>
            <button style={btnStyle(activeTool === 'highlight')} onPointerDown={(e) => handleAction('Highlight', e)}><span style={{fontWeight: 800, fontSize: 12}}>HL</span></button>
            <button style={btnStyle(activeTool === 'laser')} onPointerDown={(e) => handleAction('Laser', e)}><span style={{fontWeight: 800, fontSize: 12}}>LS</span></button>
            <button style={btnStyle(activeTool === 'eraser')} onPointerDown={(e) => handleAction('Eraser', e)}><span style={{fontWeight: 800, fontSize: 12}}>ER</span></button>
          </div>
        )}
      </div>

      {/* Shapes with Menu */}
      <div style={{ position: 'relative' }}>
        <button style={btnStyle(['rectangle', 'ellipse', 'triangle', 'diamond', 'hexagon', 'cloud', 'heart'].includes(activeTool))} onPointerDown={(e) => toggleMenu('shapes', e)} title="Shapes">
          {activeTool === 'ellipse' ? <Circle size={20} /> :
           activeTool === 'triangle' ? <Triangle size={20} /> :
           activeTool === 'diamond' ? <Diamond size={20} /> :
           activeTool === 'hexagon' ? <Hexagon size={20} /> :
           activeTool === 'cloud' ? <Cloud size={20} /> :
           activeTool === 'heart' ? <Heart size={20} /> :
           <Square size={20} />}
        </button>
        {openMenu === 'shapes' && (
          <div style={{...menuStyle, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', width: '200px'}}>
            <button style={btnStyle(activeTool === 'rectangle')} onPointerDown={(e) => handleToolClick('rectangle', e)}><Square size={20} /></button>
            <button style={btnStyle(activeTool === 'ellipse')} onPointerDown={(e) => handleToolClick('ellipse', e)}><Circle size={20} /></button>
            <button style={btnStyle(activeTool === 'triangle')} onPointerDown={(e) => handleAction('Triangle', e)}><Triangle size={20} /></button>
            <button style={btnStyle(activeTool === 'diamond')} onPointerDown={(e) => handleAction('Diamond', e)}><Diamond size={20} /></button>
            <button style={btnStyle(activeTool === 'hexagon')} onPointerDown={(e) => handleAction('Hexagon', e)}><Hexagon size={20} /></button>
            <button style={btnStyle(activeTool === 'cloud')} onPointerDown={(e) => handleAction('Cloud', e)}><Cloud size={20} /></button>
            <button style={btnStyle(activeTool === 'heart')} onPointerDown={(e) => handleAction('Heart', e)}><Heart size={20} /></button>
          </div>
        )}
      </div>

      {/* Arrows Menu */}
      <div style={{ position: 'relative' }}>
        <button style={btnStyle(activeTool === 'arrow')} onPointerDown={(e) => handleToolClick('arrow', e)} title="Arrow">
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Text Tool */}
      <button style={btnStyle(activeTool === 'text')} onPointerDown={(e) => handleToolClick('text', e)} title="Text">
        <Type size={20} />
      </button>

    </div>
  );
}

