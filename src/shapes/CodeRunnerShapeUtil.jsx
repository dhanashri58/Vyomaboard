import React, { useState, useEffect, useRef } from 'react';
import { BaseBoxShapeUtil, HTMLContainer } from 'tldraw';
import { Play, Code, Loader2 } from 'lucide-react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export class CodeRunnerShapeUtil extends BaseBoxShapeUtil {
  static type = 'milanote-code-runner';

  getDefaultProps() {
    return {
      w: 600,
      h: 500,
      code: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
      language: 'c',
      input: ''
    };
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, shape.props.h, 12);
    return path;
  }

  component(shape) {
    return <CodeRunnerComponent shape={shape} editor={this.editor} />;
  }
}

function CodeRunnerComponent({ shape, editor }) {
  const { code, language } = shape.props;
  const [isRunning, setIsRunning] = useState(false);
  const terminalRef = useRef(null);
  const termInstance = useRef(null);
  const wsRef = useRef(null);

  const updateCode = (newCode) => {
    editor.updateShape({
      id: shape.id,
      type: 'milanote-code-runner',
      props: { code: newCode }
    });
  };

  const getAttachedFiles = () => {
    const files = [];
    const addedFileIds = new Set();
    const shapesToProcess = [shape.id];
    
    while (shapesToProcess.length > 0) {
      const currentId = shapesToProcess.shift();
      const bindingsToCurrent = editor.getBindingsToShape(currentId, 'arrow');
      
      bindingsToCurrent.forEach(binding => {
        const arrowId = binding.fromId;
        const arrowBindings = editor.getBindingsFromShape(arrowId, 'arrow');
        const otherBinding = arrowBindings.find(b => b.props.terminal !== binding.props.terminal);
        if (otherBinding && otherBinding.toId !== currentId) {
          const otherShape = editor.getShape(otherBinding.toId);
          if (otherShape && otherShape.type === 'milanote-file') {
            if (!addedFileIds.has(otherShape.id)) {
              addedFileIds.add(otherShape.id);
              files.push({ name: otherShape.props.name, url: otherShape.props.url, content: otherShape.props.content });
              shapesToProcess.push(otherShape.id);
            }
          }
        }
      });
    }
    return files;
  };

  const attachedFiles = getAttachedFiles();

  // Initialize Terminal
  useEffect(() => {
    if (!termInstance.current && terminalRef.current) {
      const term = new Terminal({
        theme: { background: '#000000', foreground: '#e5e5e5' },
        fontFamily: "'Fira Code', 'Courier New', Courier, monospace",
        fontSize: 13,
        cursorBlink: true
      });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      fitAddon.fit();
      termInstance.current = { term, fitAddon };
      
      const ro = new ResizeObserver(() => fitAddon.fit());
      ro.observe(terminalRef.current);

      return () => ro.disconnect();
    }
  }, []);

  const runCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    
    const term = termInstance.current?.term;
    if (!term) {
      setIsRunning(false);
      return;
    }

    term.focus();

    // Connect websocket if not connected or closed
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/terminal?boardName=board_${shape.id}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onmessage = (e) => {
        if (termInstance.current) {
           termInstance.current.term.write(e.data);
        }
      };
      
      term.onData((data) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(data);
        }
      });
      
      wsRef.current = ws;
    }

    try {
      term.writeln('\x1b[33m--- Preparing Environment ---\x1b[0m');
      
      let combinedCode = '';
      for (const f of attachedFiles) {
         let text = f.content || '';
         if (f.url && !text) {
            try {
              const res = await fetch(f.url);
              text = await res.text();
            } catch (e) {
              text = `/* Failed to load ${f.name}: ${e.message} */`;
            }
         }
         combinedCode += `\n/* --- File: ${f.name} --- */\n${text}\n`;
      }

      let processedCode = combinedCode + '\n' + code;
      
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/save-workspace-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          boardName: `board_${shape.id}`,
          filename: `runner_${shape.id}.c`,
          content: processedCode
        })
      });
      
      if (!res.ok) throw new Error('Failed to save file to workspace');
      
      term.writeln('\x1b[32m--- Compiling and Running ---\x1b[0m');
      
      const runCmd = `gcc runner_${shape.id}.c -o runner_${shape.id}.exe && .\\runner_${shape.id}.exe\r\n`;
      
      const sendCmd = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
           wsRef.current.send(runCmd);
        } else {
           setTimeout(sendCmd, 100);
        }
      };
      sendCmd();
      
    } catch (e) {
       term.writeln(`\r\n\x1b[31mError: ${e.message}\x1b[0m`);
    } finally {
       setTimeout(() => setIsRunning(false), 1000);
    }
  };

  return (
    <HTMLContainer
      id={shape.id}
      style={{
        backgroundColor: '#1e1e1e',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'none',
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
        justifyContent: 'space-between',
        padding: '12px 20px',
        backgroundColor: '#2d2d2d',
        borderBottom: '1px solid #444',
        userSelect: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Code size={20} color="#61afef" />
          <span style={{ color: '#e5e5e5', fontSize: '14px', fontWeight: '500' }}>
            Interactive C Terminal
          </span>
          {attachedFiles.length > 0 && (
            <span style={{ 
              backgroundColor: '#444', 
              color: 'var(--surface-color)', 
              fontSize: '11px', 
              padding: '2px 8px', 
              borderRadius: '12px',
              marginLeft: '8px'
            }}>
              {attachedFiles.length} file(s) linked
            </span>
          )}
        </div>
        <button
          onClick={runCode}
          disabled={isRunning}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: isRunning ? '#4caf50aa' : '#4caf50',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            pointerEvents: 'auto'
          }}
        >
          {isRunning ? <Loader2 size={16} className="spin" /> : <Play size={16} />}
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
      </div>

      {/* Editor Section */}
      <div style={{ flex: 1.5, display: 'flex', position: 'relative' }}>
        <textarea
          value={code}
          onChange={(e) => updateCode(e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          spellCheck={false}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#1e1e1e',
            color: '#d4d4d4',
            border: 'none',
            padding: '16px',
            fontFamily: "'Fira Code', 'Courier New', Courier, monospace",
            fontSize: '14px',
            lineHeight: '1.5',
            resize: 'none',
            outline: 'none',
            pointerEvents: 'auto'
          }}
        />
      </div>

      {/* Interactive Terminal Section */}
      <div style={{
        flex: 1,
        backgroundColor: '#000000',
        borderTop: '1px solid #444',
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'auto'
      }}>
        <div style={{
          padding: '6px 12px',
          backgroundColor: '#111',
          color: '#888',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          borderBottom: '1px solid #222',
          userSelect: 'none'
        }}>
          Interactive Terminal
        </div>
        <div 
          ref={terminalRef} 
          onPointerDown={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          style={{
            flex: 1,
            padding: '8px',
            overflow: 'hidden'
          }}
        />
      </div>
    </HTMLContainer>
  );
}
