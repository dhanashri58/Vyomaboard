import React from 'react';
import { BaseBoxShapeUtil, HTMLContainer, T } from 'tldraw';
import { ClipboardList } from 'lucide-react';

export class ExamFileShapeUtil extends BaseBoxShapeUtil {
  static type = 'exam-file';

  static props = {
    w: T.number,
    h: T.number,
    name: T.string,
  };

  getDefaultProps() {
    return {
      w: 170,
      h: 130,
      name: 'New_Test.test',
    };
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, shape.props.h, 8);
    return path;
  }

  component(shape) {
    const { name, w, h } = shape.props;
    const iconSize = Math.max(26, Math.min(w, h) * 0.4);

    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--accent-green)',
          borderRadius: '10px',
          boxShadow: '4px 4px 0 #000',
          border: '3px solid #000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          overflow: 'hidden',
          fontFamily: 'Inter, sans-serif',
          padding: '8px',
          textAlign: 'center',
          transition: 'transform 0.1s, box-shadow 0.1s'
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          height: '100%'
        }}>
          <div
            style={{
              background: 'var(--surface-color)',
              padding: `${iconSize * 0.25}px`,
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              pointerEvents: 'all',
              border: '2px solid #000',
              boxShadow: '2px 2px 0 #000'
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent('open-exam-window', {
                detail: { shapeId: shape.id, name }
              }));
            }}
            title={`Open ${name}`}
          >
            <ClipboardList size={iconSize} color="#000" />
          </div>

          <span className="neo-badge" style={{ background: 'var(--surface-color)', fontSize: '9px', padding: '2px 6px' }}>.test</span>

          <div style={{
            fontSize: `${Math.max(10, Math.min(w, h) * 0.1)}px`,
            fontWeight: '700',
            color: '#000',
            width: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            background: 'var(--surface-color)',
            border: '2px solid #000',
            padding: '2px 6px',
            boxSizing: 'border-box'
          }}>
            {name}
          </div>
        </div>
      </HTMLContainer>
    );
  }
}
