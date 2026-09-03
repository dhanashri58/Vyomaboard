import React from 'react';
import { HTMLContainer, BaseBoxShapeUtil, T, createShapeId } from 'tldraw';
import { Plus } from 'lucide-react';
import { InteractiveBlock } from '../components/InteractiveBlock';

export class BusinessModelCanvasShapeUtil extends BaseBoxShapeUtil {
  static type = 'business-model-canvas';

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
    path.roundRect(0, 0, shape.props.w, shape.props.h, 16);
    return path;
  }

  component(shape) {
    const { w, h } = shape.props;
    const showUI = this.editor.getEditingShapeId() === shape.id || this.editor.getSelectedShapeIds().includes(shape.id);

    const Section = ({ id, title, desc, style }) => (
       <div style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          backgroundColor: 'transparent',
          borderRadius: '8px',
          overflow: 'hidden',
          ...style
       }}>
          <div style={{ padding: '16px 16px 0 16px' }}>
             <div style={{ fontSize: '18px', marginBottom: '4px', color: '#111827' }}>{title}</div>
             <div style={{ fontSize: '12px', color: '#9ca3af', lineHeight: 1.2 }}>{desc}</div>
          </div>
          
          <div style={{ flex: 1, display: 'flex', minHeight: '100px' }}>
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
          border: 'none',
          borderRadius: '16px',
          boxShadow: 'none',
          boxSizing: 'border-box',
          gap: '16px'
        }}
      >
         {/* No huge title like before, just clean grid */}
         {/* TOP ROW */}
         <div style={{ display: 'flex', flex: 2, gap: '16px' }}>
            <Section id="kp" title="Key partners" desc="What are your key partners to get competitive advantage?" style={{ flex: 1 }} />
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
               <Section id="ka" title="Key activities" desc="What are the key steps to move ahead to your customers?" style={{ flex: 1 }} />
               <Section id="kr" title="Key resources" desc="What resources do you need to make your idea work?" style={{ flex: 1 }} />
            </div>
            
            <Section id="vp" title="Key propositions" desc="How will you make your customers' life happier?" style={{ flex: 1 }} />
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
               <Section id="cr" title="Customer relationships" desc="How often will you interact with your customers?" style={{ flex: 1 }} />
               <Section id="ch" title="Channels" desc="How are you going to reach your customers?" style={{ flex: 1 }} />
            </div>
            
            <Section id="cs" title="Customer segments" desc="Who are your customers? Describe your target audience in a couple of words." style={{ flex: 1 }} />
         </div>
         
         {/* BOTTOM ROW */}
         <div style={{ display: 'flex', flex: 1, gap: '16px' }}>
            <Section id="cs_str" title="Cost Structure" desc="How much are you planning to spend on the product development and marketing for a certain period?" style={{ flex: 1 }} />
            <Section id="rs" title="Revenue Streams" desc="How much are you planning to earn in a certain period? Compare your costs and revenues." style={{ flex: 1 }} />
         </div>
         
      </HTMLContainer>
    );
  }

  indicator(shape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
