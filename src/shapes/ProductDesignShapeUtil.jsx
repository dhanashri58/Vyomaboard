import React from 'react';
import { HTMLContainer, BaseBoxShapeUtil, T } from 'tldraw';

export class ProductDesignShapeUtil extends BaseBoxShapeUtil {
  static type = 'product-design';

  static props = {
    w: T.number,
    h: T.number
  };

  getDefaultProps() {
    return {
      w: 1800,
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
    
    const rows = [
      { name: 'Product Design', color: '#facc15' }, // yellow
      { name: 'Product Development', color: '#c084fc' }, // purple
      { name: 'Marketing', color: '#60a5fa' }, // blue
      { name: 'Sales', color: '#4ade80' }, // green
      { name: 'Other', color: '#f87171' }  // red
    ];
    
    const cols = ['1 Q', '2 Q', '3 Q', '4 Q', '5 Q', '6 Q', 'P Q'];

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
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
          boxSizing: 'border-box',
          gap: '24px'
        }}
      >
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', textTransform: 'uppercase', letterSpacing: '1px' }}>Product Design Planner</div>
        
        <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
          
          {/* Header Row */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '16px' }}>
            <div style={{ display: 'flex', borderBottom: '2px solid #E5E7EB', paddingBottom: '8px' }}>
              <div style={{ width: '250px', fontWeight: 'bold', color: '#6B7280' }}>Teams</div>
              {cols.map((col, idx) => (
                <div key={col} style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#6B7280', borderLeft: idx > 0 ? '1px solid #F3F4F6' : 'none' }}>
                  {col}
                </div>
              ))}
            </div>
            
            {/* Rows */}
            {rows.map((row, rIdx) => (
              <div key={row.name} style={{ display: 'flex', flex: 1, borderBottom: rIdx < rows.length - 1 ? '1px dashed #E5E7EB' : 'none', paddingTop: '16px', paddingBottom: '16px' }}>
                <div style={{ width: '250px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>{row.name}</div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>Team members & tasks...</div>
                </div>
                {cols.map((col, cIdx) => (
                  <div key={`${row.name}-${col}`} style={{ flex: 1, borderLeft: cIdx > 0 ? '1px solid #F3F4F6' : 'none', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: '16px', right: '16px', height: '4px', backgroundColor: row.color, opacity: 0.5, borderRadius: '2px' }} />
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Launch Line overlay */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, right: `${(1 / cols.length) * 100}%`, width: '2px', backgroundColor: '#ef4444', zIndex: 10 }}>
            <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ef4444', color: 'var(--surface-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              Publish / Launch
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
