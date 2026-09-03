import React from 'react';
import { BaseBoxShapeUtil, HTMLContainer } from 'tldraw';
import { MonitorUp, Monitor } from 'lucide-react';
import { useCallContext } from '../context/CallContext';

function ScreenShareUI() {
  const { isCallActive, joinCall, callUsers } = useCallContext();

  const screenFeeds = callUsers.filter(u => u.mode === 'screen');

  if (!isCallActive || screenFeeds.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px' }}>
        <div style={{ width: '64px', height: '64px', background: 'rgba(88, 101, 242, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Monitor size={32} color="#5865F2" />
        </div>
        <span style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>
          No Active Screen Share
        </span>
        <span style={{ fontSize: '12px', textAlign: 'center', color: '#666' }}>
          Click below to share your screen to the board.
        </span>
        <button 
          onPointerDown={e => { e.stopPropagation(); joinCall('screen'); }}
          style={{ background: '#5865F2', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}
        >
          Share Screen
        </button>
      </div>
    );
  }

  // Show the first active screen feed
  const activeFeed = screenFeeds[0];

  return (
    <div style={{ flex: 1, background: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {activeFeed.stream ? (
        <video 
          autoPlay 
          playsInline 
          muted={activeFeed.isLocal}
          ref={el => { if (el && activeFeed.stream && el.srcObject !== activeFeed.stream) el.srcObject = activeFeed.stream; }}
          onLoadedMetadata={e => e.target.play()}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      ) : (
        <span style={{ color: 'white' }}>Loading stream...</span>
      )}
      <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '8px', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
        {activeFeed.name}'s Screen
      </div>
    </div>
  );
}

export class ScreenShareShapeUtil extends BaseBoxShapeUtil {
  static type = 'milanote-screen-share';

  getDefaultProps() {
    return {
      w: 500,
      h: 350,
    };
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, shape.props.h, 12);
    return path;
  }

  component(shape) {
    return (
      <HTMLContainer
        style={{
          width: '100%',
          height: '100%',
          background: 'var(--color-panel, #fff)',
          border: '3px solid #000',
          borderRadius: '12px',
          boxShadow: '4px 4px 0px #000',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div style={{
          background: '#5865F2',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '3px solid #000',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MonitorUp size={16} color="white" />
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'white', textTransform: 'uppercase' }}>Screen Share Feed</span>
          </div>
          <button 
            onPointerDown={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('open-screen-share')); }}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Full Screen
          </button>
        </div>
        <ScreenShareUI />
      </HTMLContainer>
    );
  }
}
