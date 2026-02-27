import { useRef } from 'react';
import { CELL_SIZE, GAP } from '../hooks/useDashboard';

function cellToPixel(col, row) {
  return {
    left: col * (CELL_SIZE + GAP),
    top: row * (CELL_SIZE + GAP),
  };
}

function sizeToPixel(w, h) {
  return {
    width: w * CELL_SIZE + (w - 1) * GAP,
    height: h * CELL_SIZE + (h - 1) * GAP,
  };
}

export default function Widget({ widget, isDragging, onDragStart }) {
  const handleRef = useRef(null);
  const { left, top } = cellToPixel(widget.x, widget.y);
  const { width, height } = sizeToPixel(widget.w, widget.h);

  function handleMouseDown(e) {
    if (e.button !== 0) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    onDragStart(widget.id, offsetX, offsetY);
  }

  return (
    <div
      className={`widget widget--${widget.type}${isDragging ? ' widget--dragging' : ''}`}
      style={{ left, top, width, height }}
      onMouseDown={handleMouseDown}
    >
      <div className="widget__header" ref={handleRef}>
        <span className="widget__drag-icon">⠿</span>
        <span className="widget__title">{widget.title}</span>
        <span className="widget__size-badge">{widget.w}×{widget.h}</span>
      </div>
      <div className="widget__body">
        {widget.content}
      </div>
    </div>
  );
}
