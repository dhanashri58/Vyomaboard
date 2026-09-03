import React from 'react';
import { HTMLContainer, BaseBoxShapeUtil, T, createShapeId } from 'tldraw';
import { Plus } from 'lucide-react';
import { InteractiveBlock } from '../components/InteractiveBlock';

export class EisenhowerMatrixShapeUtil extends BaseBoxShapeUtil {
  static type = 'eisenhower-matrix';

  static props = {
    w: T.number,
    h: T.number,
    blocks: T.any
  };

  getDefaultProps() {
    return {
      w: 1200,
      h: 800,
      blocks: {}
    };
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, shape.props.h, 8);
    return path;
  }

  component(shape) {
    const { w, h } = shape.props;
    const showUI = this.editor.getEditingShapeId() === shape.id || this.editor.getSelectedShapeIds().includes(shape.id);
    
    const quadW = (w - 100) / 2;
    const quadH = (h - 100) / 2;

    const Quadrant = ({ id, title, color, bg, border, x, y, width, height }) => (
       <div style={{
          position: 'absolute',
          left: x, top: y, width, height,
          background: bg,
          border: `2px solid ${border}`,
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
       }}>
          <div style={{ flex: 1, display: 'flex' }}>
             <InteractiveBlock id={id} label={title} shape={shape} editor={this.editor} showUI={showUI} />
          </div>
       </div>
    );

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
          padding: '24px',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
          position: 'relative',
          boxSizing: 'border-box'
        }}
      >
         
         {/* ARROWS */}
         {/* Up */}
         <div style={{ position: 'absolute', top: 30, left: w/2 - 5, width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '10px solid #333' }}></div>
         {/* Down */}
         <div style={{ position: 'absolute', bottom: 30, left: w/2 - 5, width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '10px solid #333' }}></div>
         {/* Right */}
         <div style={{ position: 'absolute', right: 30, top: h/2 - 5, width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '10px solid #333' }}></div>
         {/* Left */}
         <div style={{ position: 'absolute', left: 30, top: h/2 - 5, width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: '10px solid #333' }}></div>
         
         {/* LABELS */}
         <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold', color: '#666' }}>Important</div>
         <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold', color: '#666' }}>Not important</div>
         <div style={{ position: 'absolute', left: -10, top: '50%', transform: 'translateY(-50%) rotate(-90deg)', fontWeight: 'bold', color: '#666' }}>Not urgent</div>
         <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%) rotate(90deg)', fontWeight: 'bold', color: '#666' }}>Urgent</div>
         
         {/* QUADRANTS */}
         <Quadrant title="Important but not urgent" color="purple" bg="#EBE5FE" border="#A78BFA" x={40} y={40} width={quadW - 20} height={quadH - 20} />
         <Quadrant title="Important and urgent" color="yellow" bg="#FEF3C7" border="#FBBF24" x={w/2 + 20} y={40} width={quadW - 20} height={quadH - 20} />
         <Quadrant title="Not Important and not urgent" color="pink" bg="#FCE7F3" border="#F472B6" x={40} y={h/2 + 20} width={quadW - 20} height={quadH - 20} />
         <Quadrant title="Not Important but urgent" color="blue" bg="#DBEAFE" border="#60A5FA" x={w/2 + 20} y={h/2 + 20} width={quadW - 20} height={quadH - 20} />
         
      </HTMLContainer>
    );
  }

  indicator(shape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
