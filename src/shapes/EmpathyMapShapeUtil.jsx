import React from 'react';
import { HTMLContainer, BaseBoxShapeUtil, T } from 'tldraw';
import { InteractiveBlock } from '../components/InteractiveBlock';

export class EmpathyMapShapeUtil extends BaseBoxShapeUtil {
  static type = 'empathy-map';

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
    
    const StepCard = ({ num, title, time, text }) => (
       <div style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
             <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Step {num}</div>
             <div style={{ fontSize: '12px', color: '#888' }}>{time}</div>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>{title}</div>
          <div style={{ fontSize: '11px', color: '#666', lineHeight: 1.4 }}>{text}</div>
       </div>
    );

    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: w,
          height: h,
          backgroundColor: '#F3F4F6',
          display: 'flex',
          fontFamily: 'sans-serif',
          color: '#333',
          pointerEvents: 'none',
          overflow: 'hidden',
          padding: '24px',
          gap: '24px',
          boxSizing: 'border-box'
        }}
      >
        {/* LEFT STEPS */}
        <div style={{ width: '250px', display: 'flex', flexDirection: 'column' }}>
           <StepCard num="1" title="Set the stage" time="5 min" text="Explain that the group's task for the next hour is to immerse themselves in the target persona." />
           <StepCard num="2" title="Demonstrate by doing" time="5 min" text="Before you break into sub-groups, ensure the team have detached themselves from their biases." />
           <StepCard num="3" title="Fill in the empathy maps" time="15 min" text="Divide the group into pairs or trios. Work out which sub-group tackles which persona." />
        </div>
        
        {/* CENTER */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
           
           {/* BIG BLUE EMPATHY MAP */}
           <div style={{ 
              flex: 1, 
              background: '#4361EE', 
              borderRadius: '24px', 
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              color: 'white',
              overflow: 'hidden'
           }}>
              <div style={{ display: 'flex', flex: 1, borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ flex: 1, borderRight: '2px solid rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column' }}>
                     <div style={{ padding: '16px', fontWeight: 'bold' }}>Think and feel?</div>
                     <InteractiveBlock id="q1" label="" shape={shape} editor={this.editor} showUI={showUI} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                     <div style={{ padding: '16px', fontWeight: 'bold' }}>Say and do?</div>
                     <InteractiveBlock id="q2" label="" shape={shape} editor={this.editor} showUI={showUI} />
                  </div>
              </div>
              <div style={{ display: 'flex', flex: 1 }}>
                  <div style={{ flex: 1, borderRight: '2px solid rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column' }}>
                     <div style={{ padding: '16px', fontWeight: 'bold' }}>Hear?</div>
                     <InteractiveBlock id="q3" label="" shape={shape} editor={this.editor} showUI={showUI} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                     <div style={{ padding: '16px', fontWeight: 'bold' }}>See?</div>
                     <InteractiveBlock id="q4" label="" shape={shape} editor={this.editor} showUI={showUI} />
                  </div>
              </div>
           </div>
           
           {/* BOTTOM ROW: PAIN, GAIN, THOUGHTS */}
           <div style={{ display: 'flex', gap: '24px', height: '200px' }}>
              <div style={{ flex: 1, background: '#FCA5A5', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                 <div style={{ padding: '16px', fontWeight: 'bold' }}>Pain</div>
                 <InteractiveBlock id="pain" label="" shape={shape} editor={this.editor} showUI={showUI} />
              </div>
              <div style={{ flex: 1, background: '#FDE047', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                 <div style={{ padding: '16px', fontWeight: 'bold' }}>Gain</div>
                 <InteractiveBlock id="gain" label="" shape={shape} editor={this.editor} showUI={showUI} />
              </div>
              <div style={{ flex: 1, background: 'white', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                 <div style={{ padding: '16px', fontWeight: 'bold' }}>Thoughts, comments, actions</div>
                 <InteractiveBlock id="thoughts" label="" shape={shape} editor={this.editor} showUI={showUI} />
              </div>
           </div>
           
        </div>
        
        {/* RIGHT STEPS */}
        <div style={{ width: '250px', display: 'flex', flexDirection: 'column' }}>
           <StepCard num="4" title="Present the empathy maps" time="10 min" text="As each sub-group presents their map, encourage the full group to raise questions." />
           <StepCard num="5" title="Determine next steps" time="15 min" text="Did you stumble on questions that need to be answered before moving ahead?" />
        </div>
      </HTMLContainer>
    );
  }

  indicator(shape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
