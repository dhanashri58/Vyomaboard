import React from 'react';
import { HTMLContainer, BaseBoxShapeUtil, T } from 'tldraw';

export class CustomerJourneyMapShapeUtil extends BaseBoxShapeUtil {
  static type = 'customer-journey';

  static props = {
    w: T.number,
    h: T.number
  };

  getDefaultProps() {
    return {
      w: 1600,
      h: 800
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
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          
          {/* Timeline Axis */}
          <div style={{ position: 'absolute', top: '50%', left: '40px', right: '40px', height: '2px', backgroundColor: '#374151' }} />
          <div style={{ position: 'absolute', top: 'calc(50% - 4px)', right: '36px', width: '0', height: '0', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '10px solid #374151' }} />
          
          {/* Nodes */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((node, i) => (
             <div key={i} style={{ position: 'absolute', top: 'calc(50% - 6px)', left: `${10 + (i * 8.5)}%`, width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#374151' }} />
          ))}

          {/* Lines */}
          <div style={{ position: 'absolute', top: '25%', left: '18.5%', width: '1px', height: '25%', borderLeft: '1px dashed #9ca3af' }} />
          <div style={{ position: 'absolute', top: '50%', left: '35.5%', width: '1px', height: '20%', borderLeft: '1px dashed #9ca3af' }} />
          
          {/* Stages */}
          <div style={{ position: 'absolute', top: '20px', left: '10%', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#374151', color: 'var(--surface-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>1</div>
            <div style={{ fontSize: '18px', color: '#4b5563' }}>Stage</div>
          </div>
          
          <div style={{ position: 'absolute', top: '20px', left: '60%', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#374151', color: 'var(--surface-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>2</div>
            <div style={{ fontSize: '18px', color: '#4b5563' }}>Stage</div>
          </div>
          
          {/* Touchpoints */}
          <div style={{ position: 'absolute', top: '35%', left: '14%', width: '120px', height: '50px', borderRadius: '25px', backgroundColor: '#374151', color: 'var(--surface-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>Touchpoint</div>
          <div style={{ position: 'absolute', top: '20%', left: '22%', width: '120px', height: '50px', borderRadius: '25px', backgroundColor: '#374151', color: 'var(--surface-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>Touchpoint</div>
          <div style={{ position: 'absolute', top: '38%', left: '31%', width: '120px', height: '50px', borderRadius: '25px', backgroundColor: '#374151', color: 'var(--surface-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>Touchpoint</div>
          
          <div style={{ position: 'absolute', top: '35%', left: '60%', width: '120px', height: '50px', borderRadius: '25px', backgroundColor: '#facc15', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>Touchpoint</div>
          <div style={{ position: 'absolute', top: '42%', left: '69%', width: '120px', height: '50px', borderRadius: '25px', backgroundColor: '#facc15', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>Touchpoint</div>

          {/* Gain/Pain points */}
          <div style={{ position: 'absolute', top: '53%', left: '18.5%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '4px' }}>
             <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#facc15' }} />
             <span style={{ fontSize: '10px', color: '#6b7280' }}>Gain point</span>
          </div>
          <div style={{ position: 'absolute', top: '58%', left: '18.5%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '4px' }}>
             <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#c084fc' }} />
             <span style={{ fontSize: '10px', color: '#6b7280' }}>Pain point</span>
          </div>

        </div>
      </HTMLContainer>
    );
  }

  indicator(shape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
