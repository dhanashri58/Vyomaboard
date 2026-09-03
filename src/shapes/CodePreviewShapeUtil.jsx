import React, { useEffect, useState } from 'react';
import { BaseBoxShapeUtil, HTMLContainer } from 'tldraw';
import { FileCode, Loader2 } from 'lucide-react';

export class CodePreviewShapeUtil extends BaseBoxShapeUtil {
  static type = 'milanote-code-preview';

  getDefaultProps() {
    return {
      w: 800,
      h: 800,
      name: 'code.txt',
      url: '',
    };
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, shape.props.h, 12);
    return path;
  }

  component(shape) {
    return <CodePreviewComponent shape={shape} />;
  }
}

function CodePreviewComponent({ shape }) {
  const { name, url } = shape.props;
  const [code, setCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) return;
    
    const fetchCode = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network error');
        const text = await response.text();
        setCode(text);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(true);
        setLoading(false);
      }
    };

    fetchCode();
  }, [url]);

  return (
    <HTMLContainer
      id={shape.id}
      style={{
        backgroundColor: '#1e1e1e', // Dark theme for code
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'none', // Allows interacting if needed, but they can draw over it!
        overflow: 'hidden', // Hide overflow so drawings align with visible text bounds
        fontFamily: 'Inter, sans-serif',
        border: '1px solid #333',
        width: '100%',
        height: '100%',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 20px',
        backgroundColor: '#2d2d2d',
        borderBottom: '1px solid #444',
        userSelect: 'none'
      }}>
        <FileCode size={20} color="#61afef" />
        <span style={{ color: '#e5e5e5', fontSize: '14px', fontWeight: '500', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </span>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflow: 'hidden', // Keep hidden to ensure pen drawings align strictly with the shape bounds
        color: '#d4d4d4',
        fontSize: '14px',
        lineHeight: '1.6',
        fontFamily: "'Fira Code', 'Courier New', Courier, monospace",
      }}>
        {loading && (
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#888' }}>
             <Loader2 size={16} className="spin" /> Loading source...
           </div>
        )}
        {error && <div style={{ color: '#f44336' }}>Failed to load source code.</div>}
        {!loading && !error && code && (
          <pre style={{ margin: 0, padding: 0, overflow: 'hidden', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            <code>{code}</code>
          </pre>
        )}
      </div>
    </HTMLContainer>
  );
}
