import React from 'react';
import { HTMLContainer, BaseBoxShapeUtil, T, createShapeId } from 'tldraw';

export class MindMapNodeShapeUtil extends BaseBoxShapeUtil {
  static type = 'mind-map-node';
  
  canEdit() {
    return true;
  }

  static props = {
    w: T.number,
    h: T.number,
    text: T.string,
    color: T.string,
    nodeShape: T.any // 'rectangle', 'rounded', 'circle', 'oval', 'trapezium', 'rhombus', 'dotted'
  };

  getDefaultProps() {
    return {
      w: 200,
      h: 100,
      text: 'Central Idea',
      color: '#F97316', // Orange
      nodeShape: 'rounded'
    };
  }

  static spawnNodeAtAngle(editor, parentShape, angleDegrees, distance = 300) {
    const childId = createShapeId();
    const arrowId = createShapeId();
    
    // Calculate child position based on angle
    const angleRad = (angleDegrees * Math.PI) / 180;
    const dX = Math.cos(angleRad) * distance;
    const dY = Math.sin(angleRad) * distance;
    
    // Use the same color or random
    const colors = ['#F97316', '#EAB308', '#3B82F6', '#EC4899', '#8B5CF6', '#10B981'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    editor.createShapes([
       {
          id: childId,
          type: 'mind-map-node',
          x: parentShape.x + dX,
          y: parentShape.y + dY,
          props: {
             color: randomColor,
             text: 'New Node',
             nodeShape: parentShape.props.nodeShape || 'rounded',
             w: parentShape.props.w,
             h: parentShape.props.h
          }
       },
       {
          id: arrowId,
          type: 'arrow',
          x: parentShape.x + parentShape.props.w/2,
          y: parentShape.y + parentShape.props.h/2,
          props: {
             start: { x: 0, y: 0 },
             end: { x: dX, y: dY },
             arrowheadStart: 'none',
             arrowheadEnd: 'arrow'
          }
       }
    ]);
    
    editor.createBinding({
       type: 'arrow',
       fromId: arrowId,
       toId: parentShape.id,
       props: { terminal: 'start', normalizedAnchor: { x: 0.5, y: 0.5 }, isExact: false }
    });
    
    editor.createBinding({
       type: 'arrow',
       fromId: arrowId,
       toId: childId,
       props: { terminal: 'end', normalizedAnchor: { x: 0.5, y: 0.5 }, isExact: false }
    });
    
    editor.select(childId);
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    const { w, h, nodeShape } = shape.props;
    
    if (nodeShape === 'rectangle') {
      path.rect(0, 0, w, h);
    } else if (nodeShape === 'circle' || nodeShape === 'oval' || nodeShape === 'dotted') {
      path.ellipse(w/2, h/2, w/2, h/2, 0, 0, Math.PI * 2);
    } else if (nodeShape === 'rhombus') {
      path.moveTo(w/2, 0);
      path.lineTo(w, h/2);
      path.lineTo(w/2, h);
      path.lineTo(0, h/2);
      path.closePath();
    } else if (nodeShape === 'trapezium') {
      path.moveTo(w * 0.2, 0);
      path.lineTo(w * 0.8, 0);
      path.lineTo(w, h);
      path.lineTo(0, h);
      path.closePath();
    } else {
      // default: rounded
      path.roundRect(0, 0, w, h, 16);
    }
    
    return path;
  }

  component(shape) {
    const { w, h, text, color, nodeShape } = shape.props;
    
    let borderRadius = '0';
    let clipPath = 'none';
    let borderStyle = 'none';
    let borderWidth = '0';
    let borderColor = 'transparent';
    let backgroundColor = color;

    if (nodeShape === 'rounded') {
       borderRadius = '16px';
    } else if (nodeShape === 'circle' || nodeShape === 'oval') {
       borderRadius = '50%';
    } else if (nodeShape === 'dotted') {
       borderRadius = '50%';
       borderStyle = 'dashed';
       borderWidth = '4px';
       borderColor = color;
       backgroundColor = 'transparent';
    } else if (nodeShape === 'rhombus') {
       clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
    } else if (nodeShape === 'trapezium') {
       clipPath = 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)';
    }

    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: w,
          height: h,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          pointerEvents: 'none',
          backgroundColor,
          color: nodeShape === 'dotted' ? color : 'white',
          borderRadius,
          clipPath,
          borderStyle,
          borderWidth,
          borderColor,
          boxShadow: nodeShape === 'dotted' ? 'none' : '0 10px 30px rgba(0,0,0,0.15)',
          fontSize: '20px',
          fontWeight: 'bold',
          position: 'relative'
        }}
      >
         <div 
            style={{ width: '80%', height: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
            onDoubleClick={(e) => {
               e.stopPropagation();
               const newText = prompt('Edit text:', text);
               if (newText !== null && newText !== undefined) {
                  this.editor.updateShape({ id: shape.id, type: shape.type, props: { text: newText } });
               }
            }}
         >
            {text}
         </div>
      </HTMLContainer>
    );
  }

}
