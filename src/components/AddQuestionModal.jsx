import React, { useState } from 'react';
import { createShapeId } from 'tldraw';
import { X, Plus, Trash2, Lightbulb, Code, ClipboardList, FileText } from 'lucide-react';
import { CODE_LANGUAGES } from '../shapes/QuizCodeShapeUtil';

const QTYPE = [
  { id: 'mcq', label: 'MCQ', icon: ClipboardList },
  { id: 'written', label: 'Text', icon: FileText },
  { id: 'code', label: 'Code', icon: Code },
];

export default function AddQuestionModal({ editor, onClose }) {
  const [qtype, setQtype] = useState('mcq');
  const [question, setQuestion] = useState('');
  const [marks, setMarks] = useState(1);
  const [hintOn, setHintOn] = useState(false);
  const [hintText, setHintText] = useState('');

  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState(1);

  const [expectedLines, setExpectedLines] = useState(5);
  const [expectedAnswer, setExpectedAnswer] = useState('');

  const [languages, setLanguages] = useState([{ id: 'c', template: CODE_LANGUAGES.c.template }]);
  const [expectedOutput, setExpectedOutput] = useState('');

  const placeShape = (type, props, w, h) => {
    if (!editor) return;
    const center = editor.getViewportPageBounds().center;
    const existing = editor.getCurrentPageShapes().filter(s => s.type.startsWith('quiz-'));
    const lastY = existing.length ? Math.max(...existing.map(s => s.y + s.props.h)) : center.y - h / 2;
    editor.createShape({
      id: createShapeId(),
      type,
      x: center.x - w / 2,
      y: lastY + 40,
      props,
    });
    editor.selectNone();
  };

  const createQuestion = () => {
    if (!question.trim()) return alert('Please enter the question text.');
    if (qtype === 'mcq' && options.some(o => !o.trim())) return alert('Please fill in all 4 options.');
    if (qtype === 'code' && !expectedOutput.trim()) return alert('Please set the Expected Output — it is the answer key used to auto-grade.');

    const common = { question: question.trim(), marks, hint: hintOn, hintText: hintText.trim() };
    if (qtype === 'mcq') {
      placeShape('quiz-mcq-shape', { ...common, option1: options[0], option2: options[1], option3: options[2], option4: options[3], correctOption, mode: 'author' }, 400, 320);
    } else if (qtype === 'written') {
      placeShape('quiz-written-shape', { ...common, expectedLines, expectedAnswer: expectedAnswer.trim(), mode: 'author' }, 400, 300);
    } else {
      placeShape('quiz-code-shape', { ...common, languages, expectedOutput: expectedOutput.trim(), mode: 'author' }, 520, 560);
    }
    onClose();
  };

  const input = (placeholder, value, onChange, extra = {}) => (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={extra.rows || 2}
      style={{
        width: '100%', border: '3px solid #000', padding: '8px', fontFamily: 'Inter', fontSize: '13px',
        resize: 'vertical', ...(extra.style || {})
      }}
    />
  );

  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000 }}>
      <div className="neo-window" onClick={e => e.stopPropagation()} style={{ width: '640px', maxHeight: '92vh', overflowY: 'auto' }}>
        <div className="neo-window-header" style={{ background: 'var(--accent-green)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '900', textTransform: 'uppercase' }}>✏️ Add Question</span>
          <button onClick={onClose} style={{ background: 'var(--surface-color)', border: '2px solid #000', cursor: 'pointer', padding: '2px' }}><X size={16} /></button>
        </div>

        <div className="neo-window-content" style={{ padding: '20px', background: 'var(--surface-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Question type */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: '900', marginBottom: '6px' }}>QUESTION TYPE</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {QTYPE.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setQtype(t.id); if (t.id === 'written') setMarks(5); }}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px',
                    border: '3px solid #000', background: qtype === t.id ? 'var(--accent-yellow)' : 'var(--surface-color)', cursor: 'pointer', fontWeight: '900', fontSize: '12px'
                  }}
                >
                  <t.icon size={18} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question text */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: '900', marginBottom: '6px' }}>QUESTION TEXT</div>
            {input('Type the question here...', question, setQuestion)}
          </div>

          {/* Marks */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '900' }}>MARKS:</span>
            <input
              type="number"
              value={marks}
              min={0}
              onChange={(e) => setMarks(parseInt(e.target.value) || 0)}
              style={{ width: '70px', border: '3px solid #000', padding: '6px', fontWeight: 'bold' }}
            />
          </div>

          {/* Hint toggle */}
          <div className="neo-card" style={{ background: '#FFF8E1', padding: '12px', border: '3px solid #B8860B' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: '900', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><Lightbulb size={15} color="#B8860B" /> ADD A HINT</span>
              <button
                onClick={() => setHintOn(!hintOn)}
                style={{
                  border: '3px solid #000', padding: '4px 12px', fontWeight: '900', fontSize: '12px', cursor: 'pointer',
                  background: hintOn ? 'var(--accent-green)' : 'var(--surface-color)'
                }}
              >
                {hintOn ? 'YES' : 'NO'}
              </button>
            </div>
            {hintOn && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#B8860B' }}>
                  Hint text (appears as golden text when students press the Hint button):
                </div>
                {input('Type the hint here...', hintText, setHintText, { rows: 1 })}
              </div>
            )}
          </div>

          {/* MCQ options */}
          {qtype === 'mcq' && (
            <div>
              <div style={{ fontSize: '13px', fontWeight: '900', marginBottom: '6px' }}>OPTIONS — select the correct answer</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {options.map((o, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '13px' }}>
                      <input
                        type="radio"
                        name="correct"
                        checked={correctOption === i + 1}
                        onChange={() => setCorrectOption(i + 1)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-pink)' }}
                      />
                      {['A', 'B', 'C', 'D'][i]}
                    </label>
                    <input
                      type="text"
                      placeholder={`Option ${i + 1}`}
                      value={o}
                      onChange={(e) => setOptions(options.map((x, j) => j === i ? e.target.value : x))}
                      style={{ flex: 1, border: '3px solid #000', padding: '8px', fontFamily: 'Inter', fontSize: '13px' }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#555', marginTop: '6px' }}>
                The radio selects which option is marked correct.
              </div>
            </div>
          )}

          {/* Written options */}
          {qtype === 'written' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '900', marginBottom: '6px' }}>EXPECTED ANSWER LINES</div>
                <input
                  type="number"
                  value={expectedLines}
                  min={1}
                  onChange={(e) => setExpectedLines(parseInt(e.target.value) || 1)}
                  style={{ width: '70px', border: '3px solid #000', padding: '6px', fontWeight: 'bold' }}
                />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '900', marginBottom: '6px' }}>EXPECTED ANSWER (for grading, optional)</div>
                {input('Optional: the answer you grade against...', expectedAnswer, setExpectedAnswer)}
              </div>
            </div>
          )}

          {/* Code options */}
          {qtype === 'code' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '900', marginBottom: '6px' }}>CODING LANGUAGES (add as many as needed)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {languages.map((l, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px', border: '3px solid #000', padding: '8px', background: '#FAFAFA' }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <select
                          value={l.id}
                          onChange={(e) => setLanguages(languages.map((x, j) => j === i ? { ...x, id: e.target.value, template: x.template || CODE_LANGUAGES[e.target.value].template } : x))}
                          style={{ border: '3px solid #000', padding: '5px', fontWeight: '700', fontSize: '12px', background: 'var(--surface-color)' }}
                        >
                          {Object.entries(CODE_LANGUAGES).map(([key, v]) => (
                            <option key={key} value={key}>{v.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => setLanguages(languages.filter((_, j) => j !== i))}
                          style={{ border: '3px solid #000', background: 'var(--surface-color)', cursor: 'pointer', padding: '3px 7px' }}
                          title="Remove language"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <textarea
                        placeholder="Starter code / pseudo-code template (e.g. #include <stdio.h> and main(){})..."
                        value={l.template}
                        onChange={(e) => setLanguages(languages.map((x, j) => j === i ? { ...x, template: e.target.value } : x))}
                        rows={4}
                        style={{ fontFamily: "'Fira Code', 'Courier New', Courier, monospace", fontSize: '12px', border: '3px solid #000', padding: '8px', resize: 'vertical' }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const nextId = Object.keys(CODE_LANGUAGES).find(k => !languages.some(l => l.id === k));
                      if (!nextId) return alert('All languages already added.');
                      setLanguages([...languages, { id: nextId, template: CODE_LANGUAGES[nextId].template }]);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', border: '3px solid #000', background: 'var(--accent-yellow)', cursor: 'pointer', padding: '8px', fontWeight: '900', fontSize: '13px' }}
                  >
                    <Plus size={15} /> Add Language
                  </button>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '900', marginBottom: '6px' }}>
                  EXPECTED OUTPUT <span style={{ fontWeight: '700', color: '#555' }}>(answer key — a PASS is when the compiled output matches this exactly)</span>
                </div>
                {input('e.g. Hello, World!', expectedOutput, setExpectedOutput, { rows: 2, style: { fontFamily: "'Fira Code', monospace" } })}
              </div>
            </div>
          )}

          <button className="neo-btn" onClick={createQuestion} style={{ background: 'var(--accent-green)', padding: '14px', fontSize: '16px' }}>
            ➕ Add Question to Exam
          </button>
        </div>
      </div>
    </div>
  );
}
