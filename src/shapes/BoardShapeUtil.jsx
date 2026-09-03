import React from 'react';
import { BaseBoxShapeUtil, HTMLContainer } from 'tldraw';
import { Grid } from 'lucide-react';

export class BoardShapeUtil extends BaseBoxShapeUtil {
  static type = 'milanote-board';

  getDefaultProps() {
    return {
      w: 160,
      h: 120,
      name: 'New Board',
      roomId: '', // This stores the nested room ID
    };
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, shape.props.h, 8);
    return path;
  }

  onDoubleClick(shape) {
    if (shape.props.roomId) {
      window.dispatchEvent(new CustomEvent('open-board-viewer', { 
        detail: { roomId: shape.props.roomId, folderName: shape.props.name }
      }));
    }
  }

  component(shape) {
    return <BoardComponent shape={shape} editor={this.editor} />;
  }
}

export const BoardComponent = ({ shape, editor, updateShape }) => {
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
        width: '40%', height: '20%', background: 'var(--accent-yellow)', border: '3px solid var(--border-color)', borderBottom: 'none',
        borderTopLeftRadius: '8px', borderTopRightRadius: '8px', marginLeft: '12px', zIndex: 1
      }}></div>
      <div 
        style={{
          flex: 1,
          background: 'var(--accent-yellow)',
          border: '3px solid var(--border-color)',
          borderRadius: '8px',
          borderTopLeftRadius: '0px',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '4px 4px 0px var(--shadow-color)',
          cursor: 'pointer',
          transition: 'transform 0.1s',
          zIndex: 2
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translate(-2px, -2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translate(0px, 0px)'}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.borderColor = 'var(--accent-pink)';
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.transform = 'translate(0px, 0px)';
          e.currentTarget.style.borderColor = '#000';
        }}
        onDrop={(e) => {
           e.preventDefault();
           e.stopPropagation();
           e.currentTarget.style.transform = 'translate(0px, 0px)';
           e.currentTarget.style.borderColor = '#000';
           const milanoteTool = e.dataTransfer.getData('application/milanote-tool');
           const unsortedItemStr = e.dataTransfer.getData('application/unsorted-item');
           if (milanoteTool) {
             window.dispatchEvent(new CustomEvent('move-to-room', { detail: { roomId, tool: milanoteTool } }));
           } else if (unsortedItemStr) {
             try {
               window.dispatchEvent(new CustomEvent('move-to-room', { detail: { roomId, item: JSON.parse(unsortedItemStr) } }));
             } catch (err) {
               console.error('Invalid unsorted item payload', err);
             }
           }
        }}
        title="Double click to open nested board, or drop items here to nest them"
      >
        <div style={{ background: 'var(--bg-color)', padding: '8px', border: '3px solid var(--border-color)' }}>
           <Grid size={iconSize} color="#000" />
        </div>
        
        <input
          value={name}
          onChange={(e) => {
            if (updateShape) updateShape({ id: shape.id, props: { name: e.target.value } });
            else editor?.updateShape({
              id: shape.id,
              type: 'milanote-board',
              props: { name: e.target.value }
            });
          }}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            outline: 'none',
            fontSize: `${Math.max(12, Math.min(w, h) * 0.15)}px`,
            fontWeight: '800',
            color: 'var(--text-main)',
            background: 'var(--bg-color)',
            border: '2px solid var(--border-color)',
            padding: '4px 8px',
            width: '90%',
            textAlign: 'center',
            textOverflow: 'ellipsis'
          }}
        />
      </div>
    </HTMLContainer>
  );
};
