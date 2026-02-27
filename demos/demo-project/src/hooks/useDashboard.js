import { useState, useCallback, useRef } from 'react';

export const CELL_SIZE = 80; // px per grid cell
export const COLS = 12;
export const ROWS = 8;
export const GAP = 8;

function cellsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function isInBounds(widget) {
  return (
    widget.x >= 0 &&
    widget.y >= 0 &&
    widget.x + widget.w <= COLS &&
    widget.y + widget.h <= ROWS
  );
}

function isPlacementValid(widgets, candidate, draggedId) {
  if (!isInBounds(candidate)) return false;
  return !widgets.some(
    (w) => w.id !== draggedId && cellsOverlap(w, candidate)
  );
}

export function useDashboard(initialWidgets) {
  const [widgets, setWidgets] = useState(initialWidgets);
  const [dragging, setDragging] = useState(null); // { id, offsetX, offsetY }
  const [ghost, setGhost] = useState(null); // { x, y, w, h, valid }
  const gridRef = useRef(null);

  const pixelToCell = useCallback((px, py) => {
    const col = Math.round(px / (CELL_SIZE + GAP));
    const row = Math.round(py / (CELL_SIZE + GAP));
    return { col, row };
  }, []);

  const onDragStart = useCallback((id, offsetX, offsetY) => {
    const widget = widgets.find((w) => w.id === id);
    setDragging({ id, offsetX, offsetY });
    setGhost({ x: widget.x, y: widget.y, w: widget.w, h: widget.h, valid: true });
  }, [widgets]);

  const onDragMove = useCallback((clientX, clientY) => {
    if (!dragging || !gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const px = clientX - rect.left - dragging.offsetX;
    const py = clientY - rect.top - dragging.offsetY;
    const { col, row } = pixelToCell(px, py);

    const draggedWidget = widgets.find((w) => w.id === dragging.id);
    if (!draggedWidget) return;

    const candidate = { x: col, y: row, w: draggedWidget.w, h: draggedWidget.h };
    const valid = isPlacementValid(widgets, candidate, dragging.id);
    setGhost({ x: col, y: row, w: draggedWidget.w, h: draggedWidget.h, valid });
  }, [dragging, widgets, pixelToCell]);

  const onDragEnd = useCallback(() => {
    if (!dragging || !ghost) return;
    if (ghost.valid) {
      setWidgets((prev) =>
        prev.map((w) =>
          w.id === dragging.id ? { ...w, x: ghost.x, y: ghost.y } : w
        )
      );
    }
    setDragging(null);
    setGhost(null);
  }, [dragging, ghost]);

  return { widgets, dragging, ghost, gridRef, onDragStart, onDragMove, onDragEnd };
}
