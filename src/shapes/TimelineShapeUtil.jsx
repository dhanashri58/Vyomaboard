import React from 'react';
import { HTMLContainer, BaseBoxShapeUtil, T } from 'tldraw';
import { Plus } from 'lucide-react';

export class TimelineShapeUtil extends BaseBoxShapeUtil {
  static type = 'timeline';

  static props = {
    w: T.number,
    h: T.number,
    milestones: T.arrayOf(T.any)
  };

  getDefaultProps() {
    return {
      w: 1200,
      h: 600,
      milestones: [
         { id: 1, title: 'Conduct user interviews', phase: 'Q1', color: '#F97316', direction: 'up', offset: 50 },
         { id: 2, title: 'Concept Testing', phase: 'Q2', color: '#EAB308', direction: 'down', offset: 50 }
      ]
    };
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, shape.props.h, 8);
    return path;
  }

  component(shape) {
    const { w, h, milestones } = shape.props;
    const isEditing = this.editor.getEditingShapeId() === shape.id;
    
    const handleAddMilestone = (e) => {
       e.stopPropagation();
       const title = prompt('Milestone Title:');
       if (!title) return;
       const phase = prompt('Phase (Q1, Q2, Q3, Q4):', 'Q1');
       if (!phase) return;
       
       const colors = ['#F97316', '#EAB308', '#8B5CF6', '#3B82F6', '#EC4899'];
       const randomColor = colors[Math.floor(Math.random() * colors.length)];
       const direction = milestones.length % 2 === 0 ? 'up' : 'down';
       
       const newMilestone = {
          id: Date.now(),
          title,
          phase,
          color: randomColor,
          direction,
          offset: Math.floor(Math.random() * 100) + 20
       };
       
       this.editor.updateShape({
          id: shape.id,
          type: shape.type,
          props: { milestones: [...milestones, newMilestone] }
       });
    };

    const handleRemove = (id, e) => {
       e.stopPropagation();
       this.editor.updateShape({
          id: shape.id,
          type: shape.type,
          props: { milestones: milestones.filter(m => m.id !== id) }
       });
    };

    // Calculate positions based on phase
    const phaseMap = { 'Q1': 0.125, 'Q2': 0.375, 'Q3': 0.625, 'Q4': 0.875 };

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
          position: 'relative',
          boxSizing: 'border-box'
        }}
      >
         <div style={{ fontSize: '32px', fontWeight: 'bold', padding: '24px' }}>Timeline template</div>
         
         <button
            onPointerDown={handleAddMilestone}
            style={{
               position: 'absolute', top: '24px', right: '24px',
               padding: '8px 16px', background: '#3B82F6', color: 'white',
               border: 'none', borderRadius: '8px', fontWeight: 'bold',
               display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
            }}
         >
            <Plus size={16} /> Add Milestone
         </button>
         
         {/* THE AXIS */}
         <div style={{ position: 'absolute', top: h/2, left: 100, right: 100, height: 2, background: '#333' }}>
            {/* Arrow end */}
            <div style={{ position: 'absolute', right: -2, top: -4, width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '10px solid #333' }}></div>
            {/* Arrow start */}
            <div style={{ position: 'absolute', left: -2, top: -4, width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '10px solid #333' }}></div>
            
            {/* Phase Markers */}
            {['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => (
               <div key={q} style={{ position: 'absolute', left: `${(i * 25) + 12.5}%`, top: '-30px', transform: 'translateX(-50%)', fontWeight: 'bold', fontSize: '20px' }}>
                  {q}
               </div>
            ))}
            
            {/* Milestones */}
            {milestones.map((m) => {
               const leftPos = `${(phaseMap[m.phase] || 0.5) * 100}%`;
               // We add some random jitter based on ID so they don't exactly overlap if in same phase
               const jitter = (m.id % 20) - 10; 
               const isUp = m.direction === 'up';
               
               return (
                  <div key={m.id} style={{ position: 'absolute', left: `calc(${leftPos} + ${jitter}px)`, top: 0 }}>
                     {/* The line connecting to axis */}
                     <div style={{ 
                        position: 'absolute', left: 0, width: 1, background: '#999',
                        height: m.offset + 20, 
                        top: isUp ? -(m.offset + 20) : 0 
                     }}></div>
                     
                     {/* The dot on the axis */}
                     <div style={{ position: 'absolute', left: -4, top: -4, width: 8, height: 8, borderRadius: '50%', background: '#333' }}></div>
                     
                     {/* The Card */}
                     <div style={{
                        position: 'absolute', 
                        left: '50%', transform: 'translateX(-50%)',
                        top: isUp ? -(m.offset + 60) : (m.offset + 20),
                        background: m.color,
                        padding: '12px 16px',
                        borderRadius: '8px',
                        color: 'white',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                     }}>
                        {m.title}
                        {isEditing && (
                           <button onPointerDown={(e) => handleRemove(m.id, e)} style={{ position: 'absolute', top: -8, right: -8, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer' }}>×</button>
                        )}
                     </div>
                  </div>
               );
            })}
            
            {/* Bottom Color Bar (Research, Concept, etc) */}
            <div style={{ position: 'absolute', top: '100px', left: 0, right: 0, display: 'flex', gap: '8px' }}>
               <div style={{ flex: 1, background: '#FDBA74', padding: '8px', borderRadius: '4px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>Research</div>
               <div style={{ flex: 2, background: '#FDE047', padding: '8px', borderRadius: '4px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>Concept and Design</div>
               <div style={{ flex: 1.5, background: '#A78BFA', padding: '8px', borderRadius: '4px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: 'white' }}>Marketing</div>
               <div style={{ flex: 1, background: '#93C5FD', padding: '8px', borderRadius: '4px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>Launch Preparation</div>
            </div>
         </div>
      </HTMLContainer>
    );
  }

  indicator(shape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
