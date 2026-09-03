import React from 'react';
import { HTMLContainer, BaseBoxShapeUtil, T } from 'tldraw';

export class UserStorymapShapeUtil extends BaseBoxShapeUtil {
  static type = 'user-storymap';

  static props = {
    w: T.number,
    h: T.number
  };

  getDefaultProps() {
    return {
      w: 1600,
      h: 1200
    };
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, shape.props.h, 16);
    return path;
  }

  component(shape) {
    const { w, h } = shape.props;
    
    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: w,
          height: h,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'sans-serif',
          pointerEvents: 'none',
          backgroundColor: 'var(--surface-color)',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '4px 4px 0px #000',
          border: '3px solid #000',
          boxSizing: 'border-box',
          gap: '24px'
        }}
      >
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', textAlign: 'center' }}>User Storymap Basic</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', flex: 1 }}>
          
          {/* User Persona */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
             <div style={{ width: '150px', fontSize: '14px', color: '#374151' }}>User persona</div>
             <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#60a5fa' }} />
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#4ade80' }} />
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#facc15' }} />
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#f87171' }} />
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#f472b6' }} />
             </div>
          </div>
          
          {/* User Activities */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
             <div style={{ width: '150px', fontSize: '14px', color: '#374151' }}>User activities</div>
             <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ width: '100px', height: '100px', backgroundColor: '#93c5fd', borderRadius: '4px', boxShadow: '4px 4px 0px #000', border: '3px solid #000' }} />
                ))}
             </div>
          </div>
          
          {/* User Tasks */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
             <div style={{ width: '150px', fontSize: '14px', color: '#374151' }}>User tasks</div>
             <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} style={{ width: '100px', height: '100px', backgroundColor: '#bfdbfe', borderRadius: '4px', boxShadow: '4px 4px 0px #000', border: '3px solid #000' }} />
                ))}
             </div>
          </div>
          
          {/* Release 1 */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
             <div style={{ width: '150px', fontSize: '14px', color: '#374151' }}>User stories<br/>Release 1</div>
             <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', maxWidth: '1000px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(i => (
                  <div key={i} style={{ width: '100px', height: '100px', backgroundColor: '#fef08a', borderRadius: '4px', boxShadow: '4px 4px 0px #000', border: '3px solid #000' }} />
                ))}
             </div>
          </div>
          
          {/* Release 2 */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
             <div style={{ width: '150px', fontSize: '14px', color: '#374151' }}>Release 2</div>
             <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', maxWidth: '1000px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(i => (
                  <div key={i} style={{ width: '100px', height: '100px', backgroundColor: '#fef08a', borderRadius: '4px', boxShadow: '4px 4px 0px #000', border: '3px solid #000' }} />
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
