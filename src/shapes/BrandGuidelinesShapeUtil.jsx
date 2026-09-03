import React from 'react';
import { HTMLContainer, BaseBoxShapeUtil, T } from 'tldraw';
import { InteractiveBlock } from '../components/InteractiveBlock';

export class BrandGuidelinesShapeUtil extends BaseBoxShapeUtil {
  static type = 'brand-guidelines';
  
  canEdit() {
    return true;
  }

  static props = {
    w: T.number,
    h: T.number,
    colors: T.any,
    blocks: T.any
  };

  getDefaultProps() {
    return {
      w: 800,
      h: 1200,
      colors: ['#FF5733', '#33FF57'],
      blocks: {}
    };
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, shape.props.h, 8);
    return path;
  }

  component(shape) {
    const isEditing = this.editor.getEditingShapeId() === shape.id;
    const isSelected = this.editor.getSelectedShapeIds().includes(shape.id);
    const showUI = isEditing || isSelected;
    const { colors, w, h } = shape.props;
    
    // Safety check for older schemas
    const safeColors = colors || [];
    
    const handleAddColor = (e) => {
       e.stopPropagation();
       const newColor = e.target.value;
       if (newColor && /^#[0-9A-F]{6}$/i.test(newColor)) {
          this.editor.updateShape({
             id: shape.id,
             type: shape.type,
             props: { colors: [...safeColors, newColor] }
          });
       }
    };
    
    const handleRemoveColor = (index, e) => {
       e.stopPropagation();
       const newColors = [...safeColors];
       newColors.splice(index, 1);
       this.editor.updateShape({
          id: shape.id,
          type: shape.type,
          props: { colors: newColors }
       });
    };

    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: w,
          height: h,
          backgroundColor: '#F7F3E8',
          border: '2px solid #E24A29',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'sans-serif',
          color: '#E24A29',
          fontWeight: 'bold',
          pointerEvents: 'none',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* ROW 1: LOGO */}
        <div style={{ flex: '0 0 150px', borderBottom: '2px solid #E24A29', display: 'flex' }}>
           <InteractiveBlock id="logo1" label="LOGO" shape={shape} editor={this.editor} showUI={showUI} />
        </div>
        
        {/* ROW 2: STICKER, LOGO, ICON */}
        <div style={{ flex: '0 0 200px', borderBottom: '2px solid #E24A29', display: 'flex' }}>
           <div style={{ flex: 1, borderRight: '2px solid #E24A29', display: 'flex' }}>
              <InteractiveBlock id="sticker1" label="STICKER" shape={shape} editor={this.editor} showUI={showUI} />
           </div>
           <div style={{ flex: 1, borderRight: '2px solid #E24A29', display: 'flex' }}>
              <InteractiveBlock id="logo2" label="LOGO" shape={shape} editor={this.editor} showUI={showUI} />
           </div>
           <div style={{ flex: 1, display: 'flex' }}>
              <InteractiveBlock id="icon1" label="ICON" shape={shape} editor={this.editor} showUI={showUI} />
           </div>
        </div>
        
        {/* ROW 3: COLOR (Interactive) */}
        <div style={{ flex: '0 0 250px', borderBottom: '2px solid #E24A29', display: 'flex', flexDirection: 'column', padding: '20px' }}>
           <div style={{ fontSize: '32px', textAlign: 'center', marginBottom: '20px' }}>COLOR</div>
           
           <div style={{ display: 'flex', flex: 1, gap: '16px', alignItems: 'stretch' }}>
              {safeColors.map((c, i) => (
                 <div key={i} style={{ 
                    flex: 1, 
                    backgroundColor: c, 
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    border: '2px solid rgba(0,0,0,0.1)',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                 }}>
                    <div style={{ background: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '14px', color: '#333' }}>
                       {c}
                    </div>
                    {showUI && (
                       <button 
                         onPointerDown={(e) => handleRemoveColor(i, e)}
                         style={{ position: 'absolute', top: -10, right: -10, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', zIndex: 10 }}
                       >
                         ×
                       </button>
                    )}
                 </div>
              ))}
              
              <div style={{ position: 'relative', flex: 'none', width: '60px' }}>
                <input 
                  type="color" 
                  onBlur={handleAddColor}
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 5 }}
                />
                <button 
                   style={{ 
                      width: '100%', 
                      height: '100%',
                      background: 'transparent', 
                      border: '2px dashed #E24A29', 
                      borderRadius: '16px',
                      color: '#E24A29',
                      fontSize: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none'
                   }}
                >
                   +
                </button>
              </div>
           </div>
        </div>
        
        {/* ROW 4: MOCKUP | PATTERN & FONTS */}
        <div style={{ flex: '0 0 300px', borderBottom: '2px solid #E24A29', display: 'flex' }}>
           <div style={{ flex: 1, borderRight: '2px solid #E24A29', display: 'flex' }}>
              <InteractiveBlock id="mockup1" label="MOCKUP" shape={shape} editor={this.editor} showUI={showUI} />
           </div>
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, borderBottom: '2px solid #E24A29', display: 'flex' }}>
                 <InteractiveBlock id="pattern1" label="PATTERN" shape={shape} editor={this.editor} showUI={showUI} />
              </div>
              <div style={{ flex: 1, display: 'flex' }}>
                 <InteractiveBlock id="fonts1" label="FONTS" shape={shape} editor={this.editor} showUI={showUI} />
              </div>
           </div>
        </div>
        
        {/* ROW 5: MOCKUP | MOCKUP */}
        <div style={{ flex: 1, display: 'flex' }}>
           <div style={{ flex: 1, borderRight: '2px solid #E24A29', display: 'flex' }}>
              <InteractiveBlock id="mockup2" label="MOCKUP" shape={shape} editor={this.editor} showUI={showUI} />
           </div>
           <div style={{ flex: 1, display: 'flex' }}>
              <InteractiveBlock id="mockup3" label="MOCKUP" shape={shape} editor={this.editor} showUI={showUI} />
           </div>
        </div>
      </HTMLContainer>
    );
  }
}
