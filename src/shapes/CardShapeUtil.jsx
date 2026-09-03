import { BaseBoxShapeUtil, HTMLContainer, T, DefaultColorStyle } from 'tldraw';
import { NOTE_COLORS } from './ShapeColors';

export class CardShapeUtil extends BaseBoxShapeUtil {
  static type = 'milanote-card';
  static props = {
    w: T.number,
    h: T.number,
    title: T.string,
    body: T.string,
    color: DefaultColorStyle,
  };

  getDefaultProps() {
    return {
      w: 250,
      h: 200,
      title: '',
      body: '',
      color: 'yellow',
    };
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, shape.props.h, 8);
    return path;
  }

  component(shape) {
    return <CardComponent shape={shape} editor={this.editor} />;
  }
}

const CardComponent = ({ shape, editor }) => {
  const { title, body, color } = shape.props;
  const theme = NOTE_COLORS[color] || NOTE_COLORS.yellow;

  return (
    <HTMLContainer
      id={shape.id}
      style={{
        backgroundColor: theme.bg,
        borderRadius: '2px', // Sticky notes have sharpish edges
        boxShadow: '4px 4px 0px #000, inset 0 0 0 3px #000',
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'none',
        overflow: 'visible', // allow color picker to spill out
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        transform: 'rotate(-0.5deg)', // slight tilt for sticky note effect
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
          placeholder="Note title..."
          value={title}
          onChange={(e) => editor.updateShape({ id: shape.id, type: 'milanote-card', props: { title: e.target.value } })}
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

      {/* Body */}
      <textarea
        placeholder="Write your note here..."
        value={body}
        onChange={(e) => editor.updateShape({ id: shape.id, type: 'milanote-card', props: { body: e.target.value } })}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          border: 'none',
          outline: 'none',
          fontSize: '14px',
          color: theme.text,
          resize: 'none',
          flex: 1,
          background: 'transparent',
          width: '100%',
          lineHeight: '1.6',
          padding: '16px',
        }}
      />

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
