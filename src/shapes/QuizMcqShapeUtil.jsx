import { useState } from 'react';
import { BaseBoxShapeUtil, HTMLContainer, T } from 'tldraw';
import { Lightbulb } from 'lucide-react';
import { getExamAnswer, setExamAnswer } from '../lib/examSession';

export class QuizMcqShapeUtil extends BaseBoxShapeUtil {
  static type = 'quiz-mcq-shape';
  static props = {
    w: T.number,
    h: T.number,
    question: T.string,
    option1: T.string,
    option2: T.string,
    option3: T.string,
    option4: T.string,
    correctOption: T.number,
    marks: T.number,
    mode: T.string,
    selectedOption: T.number,
    showKey: T.boolean,
    hint: T.boolean,
    hintText: T.string,
  };

  getDefaultProps() {
    return {
      w: 400,
      h: 300,
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correctOption: 1,
      marks: 1,
      mode: 'author',
      selectedOption: 0,
      showKey: false,
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
    return <QuizMcqComponent shape={shape} editor={this.editor} />;
  }
}

const QuizMcqComponent = ({ shape, editor }) => {
  const { question, option1, option2, option3, option4, correctOption, marks, mode, showKey, hint, hintText } = shape.props;
  const isExam = mode === 'exam';

  // In exam mode the student's selection lives in the isolated per-tab store,
  // never in the shared Yjs document.
  const [localSel, setLocalSel] = useState(() => (getExamAnswer(shape.id) && getExamAnswer(shape.id).value) || 0);
  const [showHint, setShowHint] = useState(false);

  const updateField = (field, value) => {
    editor.updateShape({ id: shape.id, type: 'quiz-mcq-shape', props: { [field]: value } });
  };

  const options = [
    { id: 1, value: option1, field: 'option1' },
    { id: 2, value: option2, field: 'option2' },
    { id: 3, value: option3, field: 'option3' },
    { id: 4, value: option4, field: 'option4' }
  ];

  const checkedValue = isExam ? localSel : correctOption;
  const onPick = isExam
    ? (id) => {
        setLocalSel(id);
        setExamAnswer(shape.id, { type: 'mcq', value: id });
      }
    : (id) => updateField('correctOption', id);

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
          {isExam ? 'Multiple Choice' : 'Multiple Choice Question'}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!isExam && (
            <>
              <button
                onClick={() => updateField('showKey', !showKey)}
                onPointerDown={(e) => e.stopPropagation()}
                title="Toggle answer key visibility"
                style={{ border: '3px solid #000', padding: '4px 8px', fontWeight: '900', fontSize: '12px', cursor: 'pointer', background: showKey ? 'var(--accent-green)' : 'var(--surface-color)', pointerEvents: 'auto' }}
              >
                {showKey ? 'Hide Key' : 'Show Key'}
              </button>
              {showKey && (
                <span className="neo-badge" style={{ background: 'var(--accent-green)', fontSize: '10px' }}>
                  Key: {['', 'A', 'B', 'C', 'D'][correctOption] || correctOption}
                </span>
              )}
            </>
          )}
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
        placeholder="Enter your question here..."
        value={question}
        readOnly={isExam}
        onChange={(e) => updateField('question', e.target.value)}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          width: '100%', minHeight: '60px', border: '3px solid #000', padding: '8px',
          marginBottom: '16px', fontFamily: 'Inter', fontSize: '14px', resize: 'none', background: isExam ? 'var(--surface-color)' : 'var(--surface-color)', pointerEvents: 'auto'
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
        {options.map(opt => {
          const isCorrectChoice = correctOption === opt.id;
          const isSelected = checkedValue === opt.id;
          return (
            <label
              key={opt.id}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isExam ? 'pointer' : 'default' }}
            >
              <input
                type="radio"
                name={`mcq-${shape.id}`}
                checked={isSelected}
                disabled={!isExam}
                onChange={() => onPick(opt.id)}
                onPointerDown={(e) => e.stopPropagation()}
                style={{ width: '20px', height: '20px', cursor: isExam ? 'pointer' : 'not-allowed', accentColor: 'var(--accent-pink)', pointerEvents: 'auto' }}
                title={isExam ? 'Select your answer' : 'Mark as correct answer'}
              />
              <input
                type="text"
                placeholder={`Option ${opt.id}`}
                value={opt.value}
                readOnly={isExam}
                onChange={(e) => updateField(opt.field, e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
                style={{
                  flex: 1, border: '3px solid #000', padding: '8px', fontFamily: 'Inter', fontSize: '14px',
                  background: isExam ? (isSelected ? 'var(--accent-yellow)' : 'var(--surface-color)') : (isCorrectChoice ? 'var(--accent-yellow)' : 'var(--surface-color)'),
                  pointerEvents: 'auto'
                }}
              />
              {isExam && isSelected && (
                <span style={{ fontSize: '11px', fontWeight: '900', color: '#000', whiteSpace: 'nowrap' }}>Your choice</span>
              )}
            </label>
          );
        })}
      </div>
    </HTMLContainer>
  );
};
