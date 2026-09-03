import { useState } from 'react';
import { BaseBoxShapeUtil, HTMLContainer, T } from 'tldraw';
import { Lightbulb } from 'lucide-react';
import { getExamAnswer, setExamAnswer } from '../lib/examSession';

export class QuizWrittenShapeUtil extends BaseBoxShapeUtil {
  static type = 'quiz-written-shape';
  static props = {
    w: T.number,
    h: T.number,
    question: T.string,
    marks: T.number,
    expectedLines: T.number,
    mode: T.string,
    answer: T.string,
    expectedAnswer: T.string,
    hint: T.boolean,
    hintText: T.string,
  };

  getDefaultProps() {
    return {
      w: 400,
      h: 250,
      question: '',
      marks: 5,
      expectedLines: 5,
      mode: 'author',
      answer: '',
      expectedAnswer: '',
      hint: false,
      hintText: '',
    };
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, shape.props.h, 0);
    return path;
  }

  component(shape) {
    return <QuizWrittenComponent shape={shape} editor={this.editor} />;
  }
}

const QuizWrittenComponent = ({ shape, editor }) => {
  const { question, marks, expectedLines, mode, expectedAnswer, hint, hintText } = shape.props;
  const isExam = mode === 'exam';

  // In exam mode the student's answer lives in the isolated per-tab store,
  // never in the shared Yjs document.
  const [localAns, setLocalAns] = useState(() => (getExamAnswer(shape.id) && getExamAnswer(shape.id).value) || '');
  const [showHint, setShowHint] = useState(false);

  const updateField = (field, value) => {
    editor.updateShape({ id: shape.id, type: 'quiz-written-shape', props: { [field]: value } });
  };

  return (
    <HTMLContainer
      id={shape.id}
      className="neo-card"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'none',
        background: 'var(--surface-color)',
        padding: '16px',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '3px solid #000', paddingBottom: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', textTransform: 'uppercase' }}>
          {isExam ? 'Written Answer' : 'Written Question'}
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
        placeholder="Enter your written question here..."
        value={question}
        readOnly={isExam}
        onChange={(e) => updateField('question', e.target.value)}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          width: '100%', minHeight: '60px', border: '3px solid #000', padding: '8px',
          marginBottom: '16px', fontFamily: 'Inter', fontSize: '14px', resize: 'none', pointerEvents: 'auto'
        }}
      />

      {isExam && hint && (
        <div style={{ marginBottom: '12px' }}>
          <button
            onClick={() => setShowHint(!showHint)}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', border: '3px solid #B8860B', padding: '4px 10px',
              fontWeight: '900', fontSize: '12px', cursor: 'pointer', background: showHint ? 'var(--accent-yellow)' : 'var(--surface-color)', color: '#B8860B', pointerEvents: 'auto'
            }}
          >
            <Lightbulb size={14} /> {showHint ? 'Hide Hint' : 'Hint'}
          </button>
          {showHint && (
            <div style={{
              marginTop: '8px', padding: '10px', border: '3px solid #B8860B', borderRadius: '8px',
              background: 'linear-gradient(90deg,#FFF8E1,#FFE9A8)', color: '#B8860B', fontStyle: 'italic', fontWeight: '700', fontSize: '13px'
            }}>
              {hintText || 'Hint'}
            </div>
          )}
        </div>
      )}

      {!isExam && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', pointerEvents: 'auto' }}>
          <button
            onClick={() => updateField('hint', !hint)}
            onPointerDown={(e) => e.stopPropagation()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '3px solid #B8860B', padding: '4px 10px', fontWeight: '900', fontSize: '12px', cursor: 'pointer', background: hint ? 'var(--accent-yellow)' : 'var(--surface-color)', color: '#B8860B' }}
          >
            <Lightbulb size={14} /> {hint ? 'Hint On' : 'Add Hint'}
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

      {isExam ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '800' }}>Your Answer:</span>
          </div>
          <textarea
            placeholder="Type your answer here..."
            value={localAns}
            onChange={(e) => {
              setLocalAns(e.target.value);
              setExamAnswer(shape.id, { type: 'written', value: e.target.value });
            }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              flex: 1, width: '100%', border: '3px solid #000', padding: '8px',
              fontFamily: 'Inter', fontSize: '14px', resize: 'none', background: 'var(--surface-color)', pointerEvents: 'auto'
            }}
          />
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '800' }}>Expected Answer Lines:</span>
            <input
              type="number"
              value={expectedLines}
              onChange={(e) => updateField('expectedLines', parseInt(e.target.value) || 1)}
              onPointerDown={(e) => e.stopPropagation()}
              style={{ width: '50px', border: '3px solid #000', padding: '4px', fontWeight: 'bold', pointerEvents: 'auto' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '800' }}>Expected Answer (for grading):</span>
          </div>
          <textarea
            placeholder="Optional: expected answer the teacher will grade against..."
            value={expectedAnswer}
            onChange={(e) => updateField('expectedAnswer', e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              width: '100%', minHeight: '40px', border: '3px solid #000', padding: '8px',
              fontFamily: 'Inter', fontSize: '14px', resize: 'none', background: '#FAFAFA', pointerEvents: 'auto'
            }}
          />

          <div style={{ flex: 1, border: '3px dashed #ccc', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px' }}>
            <span style={{ color: '#aaa', fontSize: '12px', fontWeight: 'bold' }}>Student Answer Space ({expectedLines} lines)</span>
          </div>
        </>
      )}
    </HTMLContainer>
  );
};
