import React from 'react';
import { BaseBoxShapeUtil, HTMLContainer, T } from 'tldraw';
import { FileArchive, FileCode, FileText, File, Download, FileSpreadsheet, Presentation, Eye } from 'lucide-react';

const getFileIcon = (filename, iconSize) => {
  const ext = (filename || '').split('.').pop().toLowerCase();
  
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return <FileArchive size={iconSize} color="#f59e0b" />;
  }
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'html', 'css', 'json', 'cpp', 'c', 'java', 'go', 'rs'].includes(ext)) {
    return <FileCode size={iconSize} color="#3b82f6" />;
  }
  if (['doc', 'docx'].includes(ext)) {
    return <FileText size={iconSize} color="#2b579a" />;
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return <FileSpreadsheet size={iconSize} color="#217346" />;
  }
  if (['ppt', 'pptx'].includes(ext)) {
    return <Presentation size={iconSize} color="#6b7280" />;
  }
  if (['txt', 'md'].includes(ext)) {
    return <FileText size={iconSize} color="#6b7280" />;
  }
  
  return <File size={iconSize} color="#6b7280" />;
};

export class FileShapeUtil extends BaseBoxShapeUtil {
  static type = 'milanote-file';
  
  static props = {
    w: T.number,
    h: T.number,
    fileId: T.string,
    name: T.string,
    url: T.string,
    pages: T.arrayOf(T.string),
    isCloudFile: T.boolean,
    content: T.string,
    spreadsheetDiffs: T.any,
  };

  getDefaultProps() {
    return {
      w: 160,
      h: 120,
      fileId: '',
      name: 'Unknown File',
      url: '',
      pages: [], // Added pages array for Office docs/PDFs
      isCloudFile: false,
      content: '',
      spreadsheetDiffs: {},
    };
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, shape.props.h, 8);
    return path;
  }

  component(shape) {
    const { fileId, name, url, pages, w, h } = shape.props;
    const iconSize = Math.max(24, Math.min(w, h) * 0.4);
    
    return (
      <HTMLContainer
        id={shape.id}
        style={{
          backgroundColor: 'var(--surface-color)',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          overflow: 'hidden',
          fontFamily: 'Inter, sans-serif',
          border: '1px solid #eaeaea',
          padding: '8px',
          textAlign: 'center',
          transition: 'transform 0.1s, box-shadow 0.1s',
          width: '100%',
          height: '100%'
        }}
      >
        <div style={{
           display: 'flex', 
           flexDirection: 'column', 
           alignItems: 'center',
           justifyContent: 'center',
           gap: '8px',
           width: '100%',
           height: '100%'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div 
              style={{ 
                background: '#f5f5f5', 
                padding: `${iconSize * 0.3}px`, 
                borderRadius: '12px', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                pointerEvents: 'all'
              }}
              onPointerDown={(e) => {
                const ext = (name || '').split('.').pop().toLowerCase();
                e.preventDefault(); 
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent('spawn-preview', {
                  detail: { 
                    fileId, url, name, ext, pages: [], originShapeId: shape.id,
                    isCloudFile: shape.props.isCloudFile, content: shape.props.content
                  }
                }));
              }}
              title={`View ${name}`}
            >
              {getFileIcon(name, iconSize)}
            </div>
            
            {/* HTML preview button */}
            {name.toLowerCase().endsWith('.html') && (
              <div 
                style={{ 
                  background: '#e0f2fe', 
                  padding: `${iconSize * 0.3}px`, 
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  pointerEvents: 'all'
                }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.dispatchEvent(new CustomEvent('spawn-html-preview-card', {
                    detail: { originShapeId: shape.id, content: shape.props.content, name }
                  }));
                }}
                title={`Spawn Live Preview for ${name}`}
              >
                <Eye size={iconSize} color="#0284c7" />
              </div>
            )}
          </div>
          
          <div style={{
            fontSize: `${Math.max(10, Math.min(w, h) * 0.1)}px`,
            fontWeight: '500',
            color: '#333',
            width: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {name}
          </div>
        </div>
      </HTMLContainer>
    );
  }
}
