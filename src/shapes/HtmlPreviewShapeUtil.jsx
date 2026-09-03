import React from 'react';
import { BaseBoxShapeUtil, HTMLContainer, T } from 'tldraw';
import { MonitorPlay } from 'lucide-react';

export class HtmlPreviewShapeUtil extends BaseBoxShapeUtil {
  static type = 'milanote-html-preview';

  static props = {
    w: T.number,
    h: T.number,
    name: T.string,
    content: T.string,
  };

  getDefaultProps() {
    return {
      w: 800,
      h: 600,
      name: 'index.html',
      content: '',
    };
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, shape.props.h, 12);
    return path;
  }

  component(shape) {
    const { name, content } = shape.props;

    return (
      <HTMLContainer
        id={shape.id}
        style={{
          backgroundColor: 'var(--surface-color)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'all',
          overflow: 'hidden',
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
          backgroundColor: '#1a1a1c',
          borderBottom: '1px solid #2a2a2e',
          userSelect: 'none'
        }}>
          <MonitorPlay size={20} color="#61afef" />
          <span style={{ color: '#e5e5e5', fontSize: '14px', fontWeight: '500', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Live Preview: {name}
          </span>
        </div>

        {/* Browser Content */}
        <div style={{
          flex: 1,
          backgroundColor: 'var(--surface-color)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {content ? (
            <iframe
              title={`Preview of ${name}`}
              srcDoc={content}
              sandbox="allow-scripts allow-modals allow-popups allow-forms allow-same-origin"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: 'transparent',
              }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
              No HTML content to display.
            </div>
          )}
        </div>
      </HTMLContainer>
    );
  }
}
