import React from 'react';
import { HTMLContainer, BaseBoxShapeUtil, T } from 'tldraw';
import { InteractiveBlock } from '../components/InteractiveBlock';

export class WeeklyPlannerShapeUtil extends BaseBoxShapeUtil {
  static type = 'weekly-planner';

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
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    
    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: w,
          height: h,
          backgroundColor: '#EBDDD4', // Beige background
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'sans-serif',
          color: '#C63025', // Red text
          pointerEvents: 'none',
          overflow: 'hidden',
          padding: '32px',
          gap: '16px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ fontSize: '72px', fontWeight: '900', letterSpacing: '-2px' }}>
          OUR WEEK
        </div>
        
        {/* DAYS ROW */}
        <div style={{ display: 'flex', borderTop: '2px solid #C63025', borderBottom: '2px solid #C63025', height: '250px' }}>
           {days.map((day, i) => (
              <div key={day} style={{ flex: 1, borderRight: i < days.length - 1 ? '1px solid #C63025' : 'none', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ fontSize: '12px', fontWeight: 'bold', padding: '8px', borderBottom: '1px solid #C63025', textAlign: 'center' }}>
                    {day}
                 </div>
                 <div style={{ flex: 1, display: 'flex' }}>
                    <InteractiveBlock id={`day_${i}`} label="" shape={shape} editor={this.editor} showUI={showUI} />
                 </div>
              </div>
           ))}
        </div>
        
        {/* BOTTOM SECTION */}
        <div style={{ display: 'flex', flex: 1, gap: '24px' }}>
           
           {/* CHORES */}
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px', lineHeight: 1 }}>CHORES<br/>& TO-DOS</div>
              <div style={{ flex: 1, display: 'flex', border: '1px solid rgba(198, 48, 37, 0.3)', borderRadius: '8px', overflow: 'hidden' }}>
                 <InteractiveBlock id="chores" label="" shape={shape} editor={this.editor} showUI={showUI} />
              </div>
           </div>
           
           {/* MIDDLE (Mantra, Grateful, etc) */}
           <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {['WEEKLY MANTRA', 'GRATEFUL FOR', 'NIGHT OUT', 'REACH OUT TO'].map((title, i) => (
                 <div key={title} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>• {title}</div>
                    <div style={{ flex: 1, border: '1px solid #C63025', marginTop: '4px', display: 'flex', overflow: 'hidden' }}>
                       <InteractiveBlock id={`middle_${i}`} label="" shape={shape} editor={this.editor} showUI={showUI} />
                    </div>
                 </div>
              ))}
           </div>
           
           {/* GROCERIES & HABIT TRACKER */}
           <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                 <div style={{ fontSize: '20px', fontWeight: '900', marginBottom: '12px' }}>GROCERIES</div>
                 <div style={{ flex: 1, display: 'flex', border: '1px solid rgba(198, 48, 37, 0.3)', borderRadius: '8px', overflow: 'hidden' }}>
                    <InteractiveBlock id="groceries" label="" shape={shape} editor={this.editor} showUI={showUI} />
                 </div>
              </div>
           </div>
           
           {/* MENU */}
           <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: '#C63025', color: '#EBDDD4', fontSize: '24px', fontWeight: '900', padding: '4px', textAlign: 'center' }}>MENU</div>
              <div style={{ flex: 1, border: '2px solid #C63025', borderTop: 'none', display: 'flex' }}>
                 <InteractiveBlock id="menu" label="" shape={shape} editor={this.editor} showUI={showUI} />
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
