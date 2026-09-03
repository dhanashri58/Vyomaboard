import React from 'react';
import { BaseBoxShapeUtil, HTMLContainer, T } from 'tldraw';
import { Folder } from 'lucide-react';

export class FolderShapeUtil extends BaseBoxShapeUtil {
  static type = 'milanote-folder';
  
  static props = {
    w: T.number,
    h: T.number,
    name: T.string,
    roomId: T.string,
  };

  getDefaultProps() {
    return {
      w: 160,
      h: 120,
      name: 'New Folder',
      roomId: '', // This stores the nested room ID
    };
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, shape.props.h, 8);
    return path;
  }

  component(shape) {
    const { name, w, h, roomId } = shape.props;
    const iconSize = Math.max(24, Math.min(w, h) * 0.4);
    
    return (
      <HTMLContainer
        id={shape.id}
        style={{
          backgroundColor: 'transparent',
          pointerEvents: 'none',
          overflow: 'visible',
          fontFamily: 'Inter, sans-serif',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{
          width: '40%', height: '20%', background: 'var(--accent-yellow)', border: '3px solid #000', borderBottom: 'none',
          borderTopLeftRadius: '8px', borderTopRightRadius: '8px', marginLeft: '12px', zIndex: 1
        }}></div>
        <div 
          style={{
            flex: 1,
            background: 'var(--accent-yellow)',
            border: '3px solid #000',
            borderRadius: '8px',
            borderTopLeftRadius: '0px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '4px 4px 0px #000',
            cursor: 'pointer',
            transition: 'transform 0.1s',
            zIndex: 2
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translate(-2px, -2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translate(0px, 0px)'}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (shape.id) {
              window.dispatchEvent(new CustomEvent('open-folder-manager', { detail: { id: shape.id, name: name } }));
            }
          }}
          title="Double click to open folder manager"
        >
          <div style={{ background: 'var(--surface-color)', padding: '8px', border: '3px solid #000' }}>
             <Folder size={iconSize} color="#000" />
          </div>
          
          <input
            value={name}
            onChange={(e) => {
              this.editor.updateShape({
                id: shape.id,
                type: 'milanote-folder',
                props: { name: e.target.value }
              });
            }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              outline: 'none',
              fontSize: `${Math.max(12, Math.min(w, h) * 0.15)}px`,
              fontWeight: '800',
              color: '#000',
              background: 'var(--surface-color)',
              border: '2px solid #000',
              padding: '4px 8px',
              width: '90%',
              textAlign: 'center',
              textOverflow: 'ellipsis'
            }}
          />
        </div>
      </HTMLContainer>
    );
  }
}
