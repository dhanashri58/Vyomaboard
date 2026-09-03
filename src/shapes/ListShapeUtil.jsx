import { BaseBoxShapeUtil, HTMLContainer, T, DefaultColorStyle } from 'tldraw';
import { CheckSquare, Square, Plus, Trash2 } from 'lucide-react';
import { NOTE_COLORS } from './ShapeColors';

export class ListShapeUtil extends BaseBoxShapeUtil {
  static type = 'milanote-list';
  static props = {
    w: T.number,
    h: T.number,
    title: T.string,
    items: T.arrayOf(
      T.object({
        id: T.string,
        text: T.string,
        checked: T.boolean,
      })
    ),
    color: DefaultColorStyle,
  };

  getDefaultProps() {
    return {
      w: 300,
      h: 200,
      title: 'To-Do List',
      items: [
        { id: '1', text: 'New task', checked: false }
      ],
      color: 'blue'
    };
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, shape.props.h, 8);
    return path;
  }

  component(shape) {
    return <ListComponent shape={shape} editor={this.editor} />;
  }
}

const ListComponent = ({ shape, editor }) => {
  const { items, title, color } = shape.props;
  const theme = NOTE_COLORS[color] || NOTE_COLORS.blue;

  const updateItems = (newItems) => {
    editor.updateShape({ id: shape.id, type: 'milanote-list', props: { items: newItems } });
  };

  const handleCheck = (id) => {
    updateItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleTextChange = (id, text) => {
    updateItems(items.map(item => item.id === id ? { ...item, text } : item));
  };

  const handleAdd = () => {
    updateItems([...items, { id: Math.random().toString(36).substr(2, 9), text: '', checked: false }]);
  };

  const handleDelete = (id) => {
    updateItems(items.filter(item => item.id !== id));
  };

  const updateColor = (newColor) => {
    editor.updateShape({ id: shape.id, type: 'milanote-list', props: { color: newColor } });
  };

  return (
    <HTMLContainer
      id={shape.id}
      style={{
        backgroundColor: theme.bg,
        borderRadius: '2px',
        boxShadow: '4px 4px 0px #000, inset 0 0 0 3px #000',
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'none',
        overflow: 'visible',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        transform: 'rotate(0.5deg)', // opposite tilt to cards
      }}
    >
      {/* Title Bar */}
      <div style={{
        background: theme.headerBg,
        padding: '12px 16px',
        borderBottom: `3px solid #000`,
        display: 'flex',
        alignItems: 'center',
      }}>
        <input
          value={title}
          onChange={(e) => editor.updateShape({ id: shape.id, type: 'milanote-list', props: { title: e.target.value } })}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            border: 'none',
            outline: 'none',
            fontSize: '15px',
            fontWeight: '600',
            color: theme.text,
            background: 'transparent',
            width: '100%',
          }}
        />
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '8px' }}>
            <div 
              onClick={() => handleCheck(item.id)}
              onPointerDown={(e) => e.stopPropagation()}
              style={{ cursor: 'pointer', color: item.checked ? theme.text : theme.placeholder, opacity: item.checked ? 0.8 : 0.5, display: 'flex', alignItems: 'center', pointerEvents: 'all' }}
            >
              {item.checked ? <CheckSquare size={18} /> : <Square size={18} />}
            </div>
            <input
              value={item.text}
              onChange={(e) => handleTextChange(item.id, e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
              placeholder="List item..."
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                color: theme.text,
                background: 'transparent',
                flex: 1,
                textDecoration: item.checked ? 'line-through' : 'none',
                opacity: item.checked ? 0.6 : 1,
                pointerEvents: 'all'
              }}
            />
            <div 
              onClick={() => handleDelete(item.id)}
              onPointerDown={(e) => e.stopPropagation()}
              style={{ cursor: 'pointer', color: theme.placeholder, opacity: 0.5, display: 'flex', alignItems: 'center', pointerEvents: 'all' }}
            >
              <Trash2 size={16} />
            </div>
          </div>
        ))}
        
        <button
          onClick={handleAdd}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            border: 'none',
            color: theme.text,
            opacity: 0.7,
            cursor: 'pointer',
            padding: '8px 0',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <Plus size={16} /> Add item
        </button>
      </div>

      {/* Folded corner effect */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: '24px',
        height: '24px',
        background: `var(--accent-yellow)`,
        borderTopLeftRadius: '4px',
      }} />

    </HTMLContainer>
  );
};
