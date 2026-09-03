import React, { useState } from 'react';
import { BaseBoxShapeUtil, HTMLContainer } from 'tldraw';
import { Calculator } from 'lucide-react';

export class CalculatorShapeUtil extends BaseBoxShapeUtil {
  static type = 'calculator';

  getDefaultProps() {
    return {
      w: 320,
      h: 460,
      expression: '',
      history: [],
      isScientific: false,
    };
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, shape.props.h, 12);
    return path;
  }

  component(shape) {
    const { w, h, expression, history, isScientific } = shape.props;
    
    // We use a local state to handle the input efficiently, and periodically sync to Yjs (tldraw shape prop)
    const [localExpr, setLocalExpr] = useState(expression);
    const [localHistory, setLocalHistory] = useState(history);

    const syncShape = (newExpr, newHist) => {
      this.editor.updateShape({
        id: shape.id,
        type: 'calculator',
        props: {
          expression: newExpr,
          history: newHist,
        },
      });
    };

    const handleInput = (val) => {
      let newExpr = localExpr + val;
      setLocalExpr(newExpr);
      syncShape(newExpr, localHistory);
    };

    const calculate = () => {
      try {
        // Safe evaluation
        let expr = localExpr
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/−/g, '-')
          .replace(/π/g, 'Math.PI')
          .replace(/e/g, 'Math.E')
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/ln\(/g, 'Math.log(')
          .replace(/√\(/g, 'Math.sqrt(');
        
        // Handle square roughly
        if (expr.includes('²')) {
          expr = expr.replace(/(\d+(\.\d+)?)²/g, 'Math.pow($1, 2)');
        }

        // Use Function constructor for a slightly safer eval than global eval, although it's still evaluating strings.
        const res = new Function(`return ${expr}`)();
        const formattedRes = Number.isInteger(res) ? res.toString() : parseFloat(res).toFixed(4).replace(/\.?0+$/, '');
        
        const newHist = [...localHistory.slice(-4), `${localExpr} = ${formattedRes}`];
        setLocalExpr(formattedRes);
        setLocalHistory(newHist);
        syncShape(formattedRes, newHist);
      } catch (e) {
        setLocalExpr('Error');
        syncShape('Error', localHistory);
      }
    };

    const clear = () => {
      setLocalExpr('');
      syncShape('', localHistory);
    };

    const toggleMode = () => {
      this.editor.updateShape({
        id: shape.id,
        type: 'calculator',
        props: {
          isScientific: !isScientific,
          w: !isScientific ? 450 : 320,
        },
      });
    };

    const handleKeyDown = (e) => {
      const key = e.key;
      
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '(', ')', '%'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        handleInput(key);
      } else if (key === '+' || key === '-') {
        e.preventDefault();
        e.stopPropagation();
        handleInput(key === '+' ? '+' : '−');
      } else if (key === '*' || key === 'x' || key === 'X') {
        e.preventDefault();
        e.stopPropagation();
        handleInput('×');
      } else if (key === '/') {
        e.preventDefault();
        e.stopPropagation();
        handleInput('÷');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        e.stopPropagation();
        calculate();
      } else if (key === 'Backspace') {
        e.preventDefault();
        e.stopPropagation();
        if (localExpr === 'Error') {
          clear();
        } else {
          const newExpr = localExpr.slice(0, -1);
          setLocalExpr(newExpr);
          syncShape(newExpr, localHistory);
        }
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        e.preventDefault();
        e.stopPropagation();
        clear();
      }
    };

    const basicButtons = [
      'C', '(', ')', '÷',
      '7', '8', '9', '×',
      '4', '5', '6', '−',
      '1', '2', '3', '+',
      '0', '.', '=', '%'
    ];

    const scientificButtons = [
      'sin', 'cos', 'tan', 'C', '(', ')', '÷',
      'log', 'ln', '√', '7', '8', '9', '×',
      'π', 'e', 'x²', '4', '5', '6', '−',
      'x!', '^', 'inv', '1', '2', '3', '+',
      'rad', 'deg', 'EE', '0', '.', '=', '%'
    ];

    const currentButtons = isScientific ? scientificButtons : basicButtons;
    const gridCols = isScientific ? 7 : 4;

    return (
      <HTMLContainer
        id={shape.id}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{
          width: w,
          height: h,
          backgroundColor: 'var(--color-panel)',
          border: 'var(--border-thick) solid var(--color-text)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-hard)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: "'Fira Code', monospace",
          pointerEvents: 'none',
          outline: 'none',
        }}
      >
        <div 
          style={{ 
            padding: '12px', 
            background: 'var(--color-bg)', 
            borderBottom: 'var(--border-thick) solid var(--color-text)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
          onPointerDown={(e) => { e.stopPropagation(); }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
            <Calculator size={18} />
            Calculator
          </div>
          <button 
            onClick={toggleMode}
            style={{
              padding: '4px 8px',
              background: 'var(--accent)',
              color: 'white',
              border: '2px solid var(--color-text)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '12px',
              boxShadow: '2px 2px 0 var(--color-text)',
            }}
          >
            {isScientific ? 'BASIC' : 'SCI'}
          </button>
        </div>

        <div 
          style={{ 
            padding: '16px', 
            background: 'var(--color-bg)', 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px' 
          }}
          onPointerDown={(e) => { e.stopPropagation(); }}
        >
          {/* Display */}
          <div style={{
            background: 'var(--surface-color)',
            border: '2px solid var(--color-text)',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.1)'
          }}>
            <div style={{ color: '#888', fontSize: '12px', minHeight: '16px', textAlign: 'right' }}>
               {localHistory.length > 0 ? localHistory[localHistory.length - 1] : ''}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text)', minHeight: '32px', overflowX: 'auto', whiteSpace: 'nowrap', width: '100%', textAlign: 'right' }}>
              {localExpr || '0'}
            </div>
          </div>

          {/* Keypad */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`, 
            gap: '8px', 
            marginTop: 'auto',
            flex: 1
          }}>
            {currentButtons.map((btn, idx) => {
              const isOperator = ['÷', '×', '−', '+', '='].includes(btn);
              const isAction = ['C', '%', '(', ')'].includes(btn);
              
              let bgColor = 'var(--surface-color)';
              if (isOperator) bgColor = 'var(--accent-purple)';
              if (isAction) bgColor = 'var(--accent-pink)';
              if (btn === '=') bgColor = 'var(--accent)';

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (btn === 'C') clear();
                    else if (btn === '=') calculate();
                    else if (['sin', 'cos', 'tan', 'log', 'ln', '√'].includes(btn)) handleInput(btn + '(');
                    else handleInput(btn);
                  }}
                  style={{
                    background: bgColor,
                    border: '2px solid var(--color-text)',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: isScientific ? '14px' : '18px',
                    color: (isOperator || isAction || btn === '=') ? 'var(--surface-color)' : 'var(--color-text)',
                    cursor: 'pointer',
                    boxShadow: '2px 2px 0 var(--color-text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.1s, box-shadow 0.1s'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translate(2px, 2px)';
                    e.currentTarget.style.boxShadow = '0px 0px 0 var(--color-text)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translate(0, 0)';
                    e.currentTarget.style.boxShadow = '2px 2px 0 var(--color-text)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translate(0, 0)';
                    e.currentTarget.style.boxShadow = '2px 2px 0 var(--color-text)';
                  }}
                >
                  {btn}
                </button>
              );
            })}
          </div>
        </div>
      </HTMLContainer>
    );
  }
}
