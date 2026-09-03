import React from 'react';
import { HTMLContainer, BaseBoxShapeUtil, T } from 'tldraw';

export class RetrospectiveShapeUtil extends BaseBoxShapeUtil {
  static type = 'retrospective';

  static props = {
    w: T.number,
    h: T.number
  };

  getDefaultProps() {
    return {
      w: 1600,
      h: 1600
    };
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, shape.props.h, 16);
    return path;
  }

  component(shape) {
    const { w, h } = shape.props;
    
    const quadrants = [
      { id: 'continue', title: 'Continue ⏩', desc: 'What helped us move forward?', color: '#bbf7d0' }, // light green
      { id: 'stop', title: 'Stop 🛑', desc: 'What held us back?', color: '#fecdd3' }, // light rose
      { id: 'invent', title: 'Invent 💡', desc: 'How could we do things differently?', color: '#fef08a' }, // light yellow
      { id: 'act', title: 'Act 💪', desc: 'What should we do next?', color: '#e5e7eb' } // light gray
    ];
    
    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: w,
          height: h,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '32px',
          fontFamily: 'sans-serif',
          pointerEvents: 'none',
          backgroundColor: 'transparent',
          boxSizing: 'border-box'
        }}
      >
        {quadrants.map(q => (
          <div key={q.id} style={{
            backgroundColor: q.color,
            borderRadius: '64px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '48px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
            position: 'relative'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '20px', color: '#374151', marginBottom: '8px' }}>{q.title}</div>
            <div style={{ fontSize: '16px', color: '#4b5563', textAlign: 'center' }}>{q.desc}</div>
            
            {/* Decorative sticky note stack */}
            <div style={{ position: 'absolute', top: '100px', left: '80px', width: '80px', height: '80px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '4px', transform: 'rotate(-5deg)', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)' }} />
            <div style={{ position: 'absolute', top: '110px', left: '90px', width: '80px', height: '80px', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '4px', transform: 'rotate(-2deg)', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)' }} />
            <div style={{ position: 'absolute', top: '120px', left: '100px', width: '80px', height: '80px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '4px', transform: 'rotate(0deg)', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#374151' }}>
              {q.id}
            </div>
          </div>
        ))}
      </HTMLContainer>
    );
  }

  indicator(shape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
