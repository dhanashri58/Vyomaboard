import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useEditor, useValue } from 'tldraw';

// Figma-style cursor SVG
const FigmaCursorSvg = ({ color }) => (
  <svg 
    width="22" 
    height="29" 
    viewBox="-4 -4 32 42" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ 
      filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))',
      transform: 'rotate(-15deg)',
      transformOrigin: '26% 13%'
    }}
  >
    <path 
      d="M5.65376 2.00015L2.30232 28.5303C2.10058 30.1268 4.0203 31.0267 5.1611 29.8722L11.4589 23.4984C11.8396 23.1132 12.3867 22.9366 12.9234 23.0255L21.6705 24.475C23.2384 24.7348 24.1207 22.9515 23.1362 21.5097L8.68369 0.354714C7.79468 -0.947265 5.81177 -0.252062 5.65376 2.00015Z" 
      fill={color}
    />
    <path 
      d="M5.65376 2.00015L2.30232 28.5303C2.10058 30.1268 4.0203 31.0267 5.1611 29.8722L11.4589 23.4984C11.8396 23.1132 12.3867 22.9366 12.9234 23.0255L21.6705 24.475C23.2384 24.7348 24.1207 22.9515 23.1362 21.5097L8.68369 0.354714C7.79468 -0.947265 5.81177 -0.252062 5.65376 2.00015Z" 
      stroke="white" 
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const PeerCursor = ({ editor, peerId }) => {
  const [screenPos, setScreenPos] = useState({ x: -100, y: -100 });

  // Make presence reactive
  const presence = useValue(`presence:${peerId}`, () => {
    return editor.store.get(peerId);
  }, [editor, peerId]);

  useEffect(() => {
    if (!presence || !presence.cursor) return;
    
    // Subscribe to camera updates to smoothly update screen coordinates when panning/zooming
    const updatePosition = () => {
      const p = editor.store.get(peerId);
      if (p && p.cursor) {
        setScreenPos(editor.pageToScreen(p.cursor));
      }
    };
    
    updatePosition();
    
    const unsubscribeCamera = editor.store.listen((entry) => {
      if (entry.changes.updated['camera:page:page']) {
        updatePosition();
      }
    });

    return () => {
      unsubscribeCamera();
    };
  }, [editor, presence?.cursor?.x, presence?.cursor?.y, presence?.cursor?.z, peerId]);

  if (!presence || !presence.cursor) return null;

  // Read actual color and name from meta if overridden to hide default cursor
  const color = presence.meta?.realColor || presence.color || '#5865F2';
  const name = presence.meta?.realName || presence.userName || 'User';
  const chatMessage = presence.chatMessage || '';

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        transform: `translate(${screenPos.x}px, ${screenPos.y}px)`,
        pointerEvents: 'none',
        zIndex: 99999,
        transition: 'transform 0.05s linear',
      }}
    >
      <div style={{ position: 'relative', left: '-6px', top: '-6px' }}>
        <FigmaCursorSvg color={color} />
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-start',
          position: 'absolute',
          top: '28px',
          left: '18px',
          gap: '4px'
        }}>
          {chatMessage && (
            <div style={{
              background: color,
              color: 'white',
              padding: '8px 12px',
              borderRadius: '12px',
              borderTopLeftRadius: '0',
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              whiteSpace: 'pre-wrap',
              maxWidth: '200px',
              wordBreak: 'break-word',
            }}>
              {chatMessage}
            </div>
          )}
          
          <div style={{
            background: color,
            color: 'white',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}>
            {name}
          </div>
        </div>
      </div>
    </div>
  );
};

const LocalCursor = ({ editor }) => {
  const [chatMessage, setChatMessage] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [screenPos, setScreenPos] = useState({ x: -100, y: -100 });
  const [isOverCanvas, setIsOverCanvas] = useState(true);
  const inputRef = React.useRef(null);
  
  // Track system cursor visibility
  useEffect(() => {
    // Only hide the default cursor on the whiteboard canvas
    const style = document.createElement('style');
    style.innerHTML = `
      .tl-canvas, .tl-canvas * {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.target !== inputRef.current) return;
      }
      
      if (e.key === '/' && !isActive) {
        e.preventDefault();
        e.stopPropagation();
        setIsActive(true);
      } else if (e.key === 'Escape' && isActive) {
        setIsActive(false);
        setChatMessage('');
        editor.updateInstanceState({ chatMessage: '' });
      } else if (e.key === 'Enter' && isActive) {
        if (!e.shiftKey) {
          if (chatMessage.endsWith('\n') || chatMessage.trim() === '') {
            e.preventDefault();
            setIsActive(false);
            setChatMessage('');
            editor.updateInstanceState({ chatMessage: '' });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isActive, editor]);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setScreenPos({ x: e.clientX, y: e.clientY });
      
      // Check if hovering over canvas
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const overCanvas = el && el.closest('.tl-canvas') !== null;
      setIsOverCanvas(overCanvas);
    };
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleChange = (e) => {
    const msg = e.target.value;
    setChatMessage(msg);
    editor.updateInstanceState({ chatMessage: msg });
    
    const lines = chatMessage.split('\n');
    const maxLineLength = Math.max(0, ...lines.map(l => l.length));
    
    // Auto-clear after 10 seconds of inactivity (extended for multi-line)
    if (window.chatTimeout) clearTimeout(window.chatTimeout);
    window.chatTimeout = setTimeout(() => {
      setIsActive(false);
      setChatMessage('');
      editor.updateInstanceState({ chatMessage: '' });
    }, 10000);
  };

  const color = editor.user.getUserPreferences().color || '#5865F2';
  
  const lines = chatMessage.split('\n');
  const maxLineLength = Math.max(0, ...lines.map(l => l.length));

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        transform: `translate(${screenPos.x}px, ${screenPos.y}px)`,
        pointerEvents: 'none',
        zIndex: 999999,
      }}
    >
      <div style={{ position: 'relative', left: '-6px', top: '-6px' }}>
        {isOverCanvas && <FigmaCursorSvg color={color} />}
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-start',
          position: 'absolute',
          top: '28px',
          left: '18px',
          gap: '4px'
        }}>
          {isActive && (
            <textarea
              ref={inputRef}
              value={chatMessage}
              onChange={handleChange}
              placeholder="Say..."
              cols={Math.max(4, maxLineLength + 3)}
              rows={Math.max(1, lines.length)}
              style={{
                background: color,
                color: 'white',
                padding: '8px 12px',
                borderRadius: '12px',
                borderTopLeftRadius: '0',
                fontSize: '14px',
                fontWeight: 500,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: 'none',
                outline: 'none',
                maxWidth: '350px',
                pointerEvents: 'auto',
                resize: 'none',
                overflow: 'hidden',
                lineHeight: '1.4',
                fontFamily: 'inherit'
              }}
            />
          )}

          <div style={{
            background: color,
            color: 'white',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}>
            {editor.user.getUserPreferences().name || 'You'}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CustomMultiplayerCursors = () => {
  const editor = useEditor();
  const peerIds = useValue('peerIds', () => editor.store.query.records('instance_presence').get().map(p => p.userId).filter(id => id !== editor.user.getId()), [editor]);

  return (
    createPortal(
      <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0, zIndex: 99999, overflow: 'hidden' }}>
        <LocalCursor editor={editor} />
        {peerIds.map(id => (
          <PeerCursor key={id} editor={editor} peerId={id} />
        ))}
      </div>,
      document.body
    )
  );
};

export default CustomMultiplayerCursors;
