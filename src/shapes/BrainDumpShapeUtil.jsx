import React from 'react';
import { HTMLContainer, BaseBoxShapeUtil, T } from 'tldraw';

export class BrainDumpShapeUtil extends BaseBoxShapeUtil {
  static type = 'brain-dump';

  static props = {
    w: T.number,
    h: T.number,
  };

  getDefaultProps() {
    return {
      w: 1200,
      h: 800,
    };
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, shape.props.h, 8);
    return path;
  }

  component(shape) {
    const { w, h } = shape.props;
    
    const Section = ({ title, color, bg = 'rgba(255,255,255,0.5)', style }) => (
       <div style={{ display: 'flex', flexDirection: 'column', ...style }}>
          <div style={{ background: color, padding: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', letterSpacing: '1px' }}>
             {title}
          </div>
          <div style={{ background: bg, flex: 1, padding: '16px' }}></div>
       </div>
    );

    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: w,
          height: h,
          backgroundColor: '#F7F3E8',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'sans-serif',
          color: '#333',
          pointerEvents: 'none',
          overflow: 'hidden',
          padding: '32px',
          gap: '24px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ fontSize: '64px', fontWeight: '900', color: '#5C4A3D' }}>
          BRAIN DUMP
        </div>
        
        <div style={{ display: 'flex', gap: '24px', flex: 1 }}>
           
           {/* LEFT COLUMN (Thoughts, Ideas) */}
           <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Section title="THOUGHTS" color="#D8B4E2" style={{ flex: 1.5 }} />
              <Section title="IDEAS" color="#E5E7EB" style={{ flex: 1 }} />
           </div>
           
           {/* MIDDLE COLUMN (To Try, To Buy, To Eat) */}
           <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Section title="TO TRY" color="#D1FAE5" style={{ flex: 1 }} />
              <Section title="TO BUY" color="#FEF3C7" style={{ flex: 1 }} />
              <Section title="TO EAT" color="#FFEDD5" style={{ flex: 1 }} />
           </div>
           
           {/* RIGHT COLUMN (To Do List) */}
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: '#DBEAFE', padding: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                 TO DO LIST
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column' }}>
                 {[...Array(12)].map((_, i) => (
                    <div key={i} style={{ borderBottom: '1px solid #E5E7EB', flex: 1, display: 'flex', alignItems: 'center' }}>
                       <div style={{ width: '40px', borderRight: '1px solid #E5E7EB', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid #9CA3AF' }}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
           
        </div>
      </HTMLContainer>
    );
  }

  indicator(shape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
