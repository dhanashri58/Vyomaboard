import React from 'react';
import { BaseBoxShapeUtil, HTMLContainer } from 'tldraw';
import { Video, Phone, MicOff, Users } from 'lucide-react';
import { useCallContext } from '../context/CallContext';

function VideoCallUI() {
  const { isCallActive, joinCall, callUsers, isVideoOff } = useCallContext();

  if (!isCallActive) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px' }}>
        <div style={{ width: '64px', height: '64px', background: 'rgba(35, 165, 89, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Phone size={32} color="#23a559" />
        </div>
        <span style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>
          Voice & Video Call Channel
        </span>
        <button 
          onPointerDown={e => { e.stopPropagation(); joinCall('video'); }}
          style={{ background: '#23a559', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}
        >
          Join Call
        </button>
      </div>
    );
  }

  // Filter video feeds (exclude screen feeds)
  const videoFeeds = callUsers.filter(u => u.mode !== 'screen');

  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: videoFeeds.length > 1 ? '1fr 1fr' : '1fr', gap: '4px', padding: '8px', background: '#1e1f22', overflowY: 'auto' }}>
      {videoFeeds.map(user => (
        <div key={user.id} style={{ background: '#2b2d31', borderRadius: '8px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px' }}>
          {user.stream && (user.isLocal ? !isVideoOff : true) ? (
            <video 
              autoPlay 
              playsInline 
              muted={user.isLocal}
              ref={el => { if (el && user.stream && el.srcObject !== user.stream) el.srcObject = user.stream; }}
              onLoadedMetadata={e => e.target.play()}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: user.isLocal ? 'scaleX(-1)' : 'none' }}
            />
          ) : (
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: user.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
              {user.name[0]}
            </div>
          )}
          <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px', color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {user.name} {user.isLocal && '(You)'}
          </div>
        </div>
      ))}
    </div>
  );
}

export class VideoCallShapeUtil extends BaseBoxShapeUtil {
  static type = 'milanote-video-call';

  getDefaultProps() {
    return {
      w: 400,
      h: 300,
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
          background: '#23a559',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '3px solid #000',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Video size={16} color="white" />
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'white', textTransform: 'uppercase' }}>Video Call Room</span>
          </div>
          <button 
            onPointerDown={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('open-video-call')); }}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Full Screen
          </button>
        </div>
        <VideoCallUI />
      </HTMLContainer>
    );
  }
}
