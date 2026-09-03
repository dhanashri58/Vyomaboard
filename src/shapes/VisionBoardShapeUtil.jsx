import React from 'react';
import { HTMLContainer, BaseBoxShapeUtil, T } from 'tldraw';
import { Heart, Brain, BrainCircuit, Lightbulb, Target, Briefcase, Users, DollarSign, TrendingUp, Image as ImageIcon, Plus } from 'lucide-react';
import { InteractiveBlock } from '../components/InteractiveBlock';

export class VisionBoardShapeUtil extends BaseBoxShapeUtil {
  static type = 'vision-board';
  
  canEdit() {
    return true;
  }

  static props = {
    w: T.number,
    h: T.number,
    images: T.arrayOf(T.any),
    blocks: T.any
  };

  getDefaultProps() {
    return {
      w: 800,
      h: 800,
      images: [],
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
    const isEditing = this.editor.getEditingShapeId() === shape.id;
    const isSelected = this.editor.getSelectedShapeIds().includes(shape.id);
    const showUI = isEditing || isSelected;
    
    const Box = ({ id, title, icon: Icon, style }) => (
      <div style={{
        border: '2px solid #3B82F6',
        backgroundColor: '#F7F3E8',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        ...style
      }}>
        {!shape.props.blocks?.[id] && (
           <>
              <div style={{ color: '#3B82F6', fontWeight: 'bold', fontSize: '18px', padding: '12px' }}>{title}</div>
              <div style={{ position: 'absolute', bottom: '12px', right: '12px', color: '#3B82F6' }}>
                 <Icon size={24} />
              </div>
           </>
        )}
        <InteractiveBlock id={id} label={title} shape={shape} editor={this.editor} showUI={showUI} />
      </div>
    );

    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: w,
          height: h,
          backgroundColor: '#F7F3E8',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'sans-serif',
          pointerEvents: 'none',
          overflow: 'hidden',
          padding: '24px',
          gap: '12px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#3B82F6', textAlign: 'left', marginBottom: '12px' }}>
          MY VISION BOARD
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
           <Box id="health" title="Health:" icon={Heart} style={{ flex: 2 }} />
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 2 }}>
              <Box id="mental" title="Mental:" icon={Brain} style={{ flex: 1 }} />
              <Box id="beliefs" title="Beliefs:" icon={BrainCircuit} style={{ flex: 1 }} />
           </div>
           
           <Box id="things" title="Things to try:" icon={Lightbulb} style={{ flex: 1 }} />
           <Box id="goals" title="Goals:" icon={Target} style={{ flex: 1 }} />
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
           <Box id="career" title="Career:" icon={Briefcase} style={{ flex: 2 }} />
           <Box id="social" title="Social:" icon={Users} style={{ flex: 1.5 }} />
           <Box id="financial" title="Financial:" icon={DollarSign} style={{ flex: 1.5 }} />
           <Box id="personal" title="Personal Developments:" icon={TrendingUp} style={{ flex: 2 }} />
        </div>
      </HTMLContainer>
    );
  }

  indicator(shape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
