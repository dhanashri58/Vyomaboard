import { useState } from 'react';
import { BaseBoxShapeUtil, HTMLContainer, T } from 'tldraw';
import { Play, Loader2, Lightbulb, Plus, Trash2, Code } from 'lucide-react';
import { getExamAnswer, setExamAnswer } from '../lib/examSession';

export const CODE_LANGUAGES = {
  c: { label: 'C (GCC)', id: 50, template: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}' },
  cpp: { label: 'C++ (GCC)', id: 54, template: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}' },
  python: { label: 'Python 3', id: 71, template: 'print("Hello, World!")' },
  java: { label: 'Java', id: 62, template: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
  javascript: { label: 'JavaScript (Node)', id: 63, template: 'console.log("Hello, World!");' },
  csharp: { label: 'C# (Mono)', id: 51, template: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}' },
  go: { label: 'Go', id: 60, template: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}' }
};

export class QuizCodeShapeUtil extends BaseBoxShapeUtil {
  static type = 'quiz-code-shape';
  static props = {
    w: T.number,
    h: T.number,
    question: T.string,
    marks: T.number,
    mode: T.string,
    hint: T.boolean,
    hintText: T.string,
    languages: T.arrayOf(T.object({ id: T.string, template: T.string })),
    expectedOutput: T.string,
  };

  getDefaultProps() {
    return {
      w: 520,
      h: 560,
      question: '',
      marks: 5,
      mode: 'author',
      hint: false,
      hintText: '',
      languages: [{ id: 'c', template: CODE_LANGUAGES.c.template }],
      expectedOutput: '',
    };
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, shape.props.h, 0);
    return path;
  }

  component(shape) {
    return <QuizCodeComponent shape={shape} editor={this.editor} />;
  }
}

const QuizCodeComponent = ({ shape, editor }) => {
  const { question, marks, mode, hint, hintText, languages, expectedOutput } = shape.props;
  const isExam = mode === 'exam';

  const initial = getExamAnswer(shape.id);
  const [localState, setLocalState] = useState(() => ({
    activeLang: (initial && initial.value && initial.value.activeLang) || languages[0].id,
    langs: (initial && initial.value && initial.value.langs) || {},
    output: (initial && initial.value && initial.value.output) || '',
    running: false,
    showHint: false,
  }));

  const updateField = (field, value) => {
    editor.updateShape({ id: shape.id, type: 'quiz-code-shape', props: { [field]: value } });
  };

  const persistExam = (next) => {
    setLocalState(prev => ({ ...prev, ...next }));
    const merged = { ...localState, ...next };
    setExamAnswer(shape.id, {
      type: 'code',
      value: {
        activeLang: merged.activeLang,
        langs: merged.langs,
        output: merged.output,
        code: merged.langs[merged.activeLang],
        language: merged.activeLang,
      }
    });
  };

  const currentCode = isExam
    ? (localState.langs[localState.activeLang] ?? (languages.find(l => l.id === localState.activeLang) || languages[0]).template)
    : (languages.find(l => l.id === localState.activeLang) || languages[0]).template;

  const runCode = async (code, langId) => {
    setLocalState(prev => ({ ...prev, running: true, output: 'Compiling and running...' }));
    try {
      const lang = CODE_LANGUAGES[langId] || CODE_LANGUAGES.c;
      const res = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_code: code, language_id: lang.id })
      });
      if (!res.ok) throw new Error('API Error: ' + res.statusText);
      const data = await res.json();
      let out = '';
      let hasError = false;
      if (data.compile_output) { out += data.compile_output; if (data.compile_output.trim()) hasError = true; }
      if (data.stderr) { if (out) out += '\n'; out += data.stderr; hasError = true; }
      else if (data.status && data.status.id > 3) { if (out) out += '\n'; out += `Error: ${data.status.description}`; hasError = true; }
      if (data.stdout) { if (out) out += '\n'; out += data.stdout; }
      const result = out || '(No output)';
      const next = { output: result, running: false };
      setLocalState(prev => ({ ...prev, output: result, running: false }));
      if (isExam) persistExam(next);
    } catch (err) {
      const result = 'Failed to connect to the online compiler: ' + err.message;
      setLocalState(prev => ({ ...prev, output: result, running: false }));
    }
  };

  const hintTextEl = (
    <div style={{
      marginBottom: '12px', padding: '10px', border: '3px solid #B8860B', borderRadius: '8px',
      background: 'linear-gradient(90deg,#FFF8E1,#FFE9A8)', color: '#B8860B',
      fontStyle: 'italic', fontWeight: '700', fontSize: '13px', pointerEvents: 'auto'
    }}>
      💡 {hintText || 'Hint'}
    </div>
  );

  return (
    <HTMLContainer
      id={shape.id}
      className="neo-card"
      style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        pointerEvents: 'none', background: 'var(--surface-color)', padding: '16px', overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '3px solid #000', paddingBottom: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Code size={18} /> {isExam ? 'Coding Question' : 'Code Question'}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: '800' }}>Marks:</span>
          <input
            type="number"
            value={marks}
            disabled={isExam}
            onChange={(e) => updateField('marks', parseInt(e.target.value) || 0)}
            onPointerDown={(e) => e.stopPropagation()}
            style={{ width: '50px', border: '3px solid #000', padding: '4px', fontWeight: 'bold', opacity: isExam ? 0.6 : 1, pointerEvents: 'auto' }}
          />
        </div>
      </div>

      <textarea
        placeholder="Enter the coding question here..."
        value={question}
        readOnly={isExam}
        onChange={(e) => updateField('question', e.target.value)}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          width: '100%', minHeight: '48px', border: '3px solid #000', padding: '8px',
          marginBottom: '10px', fontFamily: 'Inter', fontSize: '14px', resize: 'none', pointerEvents: 'auto'
        }}
      />

      {isExam && hint && (
        <div style={{ marginBottom: '10px' }}>
          <button
            onClick={() => setLocalState(prev => ({ ...prev, showHint: !prev.showHint }))}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', border: '3px solid #B8860B', padding: '4px 10px',
              fontWeight: '900', fontSize: '12px', cursor: 'pointer', background: localState.showHint ? 'var(--accent-yellow)' : 'var(--surface-color)', color: '#B8860B', pointerEvents: 'auto'
            }}
          >
            <Lightbulb size={14} /> {localState.showHint ? 'Hide Hint' : 'Hint'}
          </button>
          {localState.showHint && <div style={{ marginTop: '8px' }}>{hintTextEl}</div>}
        </div>
      )}

      {!isExam && hint && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', pointerEvents: 'auto' }}>
          <button
            onClick={() => updateField('hint', !hint)}
            onPointerDown={(e) => e.stopPropagation()}
            style={{ border: '3px solid #B8860B', padding: '4px 10px', fontWeight: '900', fontSize: '12px', cursor: 'pointer', background: hint ? 'var(--accent-yellow)' : 'var(--surface-color)', color: '#B8860B' }}
          >
            <Lightbulb size={14} style={{ verticalAlign: 'middle' }} /> {hint ? 'Hint On' : 'Add Hint'}
          </button>
          {hint && (
            <textarea
              placeholder="Type the hint text here (shown to students as golden text)..."
              value={hintText}
              onChange={(e) => updateField('hintText', e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
              style={{ flex: 1, border: '3px solid #B8860B', padding: '6px', fontFamily: 'Inter', fontSize: '12px', resize: 'none', minHeight: '32px', background: '#FFF8E1' }}
            />
          )}
        </div>
      )}

      {/* Language tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap', pointerEvents: 'auto' }}>
        {languages.map(l => (
          <button
            key={l.id}
            onClick={() => isExam ? setLocalState(prev => ({ ...prev, activeLang: l.id })) : setLocalState(prev => ({ ...prev, activeLang: l.id }))}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              border: '3px solid #000', padding: '4px 10px', fontWeight: '900', fontSize: '11px', cursor: 'pointer',
              background: localState.activeLang === l.id ? 'var(--accent-blue)' : 'var(--surface-color)'
            }}
          >
            {(CODE_LANGUAGES[l.id] || {}).label || l.id}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1.6, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <textarea
            value={currentCode}
            spellCheck={false}
            onChange={(e) => {
              if (isExam) {
                const next = { langs: { ...localState.langs, [localState.activeLang]: e.target.value } };
                persistExam(next);
              } else {
                updateField('languages', languages.map(l => l.id === localState.activeLang ? { ...l, template: e.target.value } : l));
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              flex: 1, width: '100%', backgroundColor: '#1e1e1e', color: '#d4d4d4', border: '3px solid #000', borderRadius: '6px',
              padding: '10px', fontFamily: "'Fira Code', 'Courier New', Courier, monospace", fontSize: '12px', lineHeight: '1.5',
              resize: 'none', outline: 'none', pointerEvents: 'auto'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <button
              onClick={() => runCode(currentCode, localState.activeLang)}
              disabled={localState.running}
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', background: localState.running ? '#4caf50aa' : '#4caf50', color: 'var(--surface-color)',
                border: '3px solid #000', padding: '6px 12px', borderRadius: '6px', cursor: localState.running ? 'not-allowed' : 'pointer', fontWeight: '800', fontSize: '12px', pointerEvents: 'auto'
              }}
            >
              {localState.running ? <Loader2 size={14} className="spin" /> : <Play size={14} />}
              {localState.running ? 'Running...' : 'Run Code'}
            </button>
            {!isExam && expectedOutput.trim() && localState.output && localState.output.trim() !== '(No output)' && (
              <span className="neo-badge" style={{ background: localState.output.trim() === expectedOutput.trim() ? 'var(--accent-green)' : 'var(--accent-pink)', fontSize: '11px' }}>
                {localState.output.trim() === expectedOutput.trim() ? 'PASS ✓' : 'FAIL ✗'}
              </span>
            )}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ padding: '4px 8px', background: '#111', color: '#888', fontSize: '10px', textTransform: 'uppercase', fontWeight: '800', border: '3px solid #000', borderBottom: 'none', borderRadius: '6px 6px 0 0' }}>
            Terminal Output
          </div>
          <div style={{
            flex: 1, backgroundColor: '#000', color: '#a6e22e', border: '3px solid #000', borderRadius: '0 0 6px 6px',
            padding: '8px', overflowY: 'auto', fontFamily: "'Fira Code', 'Courier New', Courier, monospace", fontSize: '11px',
            whiteSpace: 'pre-wrap', wordBreak: 'break-all'
          }}>
            {localState.output || <span style={{ color: '#444' }}>Output will appear here...</span>}
          </div>
        </div>
      </div>

      {!isExam && (
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', pointerEvents: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '900' }}>Expected Output (answer key):</span>
          </div>
          <textarea
            placeholder="Type the exact output the program must print for a PASS..."
            value={expectedOutput}
            onChange={(e) => updateField('expectedOutput', e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            style={{ width: '100%', minHeight: '34px', border: '3px solid #000', padding: '6px', fontFamily: "'Fira Code', monospace", fontSize: '12px', resize: 'none', background: '#FAFAFA' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {languages.map(l => (
              <div key={l.id} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <select
                  value={l.id}
                  onChange={(e) => {
                    const newId = e.target.value;
                    updateField('languages', languages.map(x => x.id === l.id ? { ...x, id: newId, template: x.template || CODE_LANGUAGES[newId].template } : x));
                    setLocalState(prev => ({ ...prev, activeLang: newId }));
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{ border: '3px solid #000', padding: '4px', fontWeight: '700', fontSize: '11px', background: 'var(--surface-color)' }}
                >
                  {Object.entries(CODE_LANGUAGES).map(([key, v]) => (
                    <option key={key} value={key}>{v.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => updateField('languages', languages.filter(x => x.id !== l.id))}
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{ border: '3px solid #000', background: 'var(--surface-color)', cursor: 'pointer', padding: '2px 6px' }}
                  title="Remove language"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const nextId = Object.keys(CODE_LANGUAGES).find(k => !languages.some(l => l.id === k));
                if (!nextId) return alert('All languages already added.');
                updateField('languages', [...languages, { id: nextId, template: CODE_LANGUAGES[nextId].template }]);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '3px solid #000', background: 'var(--accent-yellow)', cursor: 'pointer', padding: '3px 8px', fontWeight: '800', fontSize: '11px' }}
            >
              <Plus size={13} /> Add Language
            </button>
          </div>
        </div>
      )}
    </HTMLContainer>
  );
};
