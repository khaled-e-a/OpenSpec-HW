import { useState, useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { GridLayout } from '../components/dashboard/types';

interface DragState {
  draggingId: string;
  originCol: number;
  originRow: number;
  colSpan: number;
  rowSpan: number;
  targetCol: number;
  targetRow: number;
}

interface UseDragDropOptions {
  gridRef: RefObject<HTMLDivElement | null>;
  layout: GridLayout;
  columns: number;
  rows: number;
  gap: number;
  isOccupied: (col: number, row: number, colSpan: number, rowSpan: number, excludeId?: string) => boolean;
  onDrop: (id: string, col: number, row: number) => void;
}

interface UseDragDropReturn {
  dragState: DragState | null;
  handleWidgetPointerDown: (id: string, e: React.PointerEvent) => void;
}

function computeTargetCell(
  pointerX: number,
  pointerY: number,
  rect: DOMRect,
  columns: number,
  rows: number,
  gap: number,
  colSpan: number,
  rowSpan: number
): { col: number; row: number } {
  const cellWidth  = (rect.width  - gap * (columns - 1)) / columns;
  const cellHeight = (rect.height - gap * (rows    - 1)) / rows;

  const rawCol = Math.floor((pointerX - rect.left) / (cellWidth  + gap)) + 1;
  const rawRow = Math.floor((pointerY - rect.top)  / (cellHeight + gap)) + 1;

  const col = Math.max(1, Math.min(rawCol, columns - colSpan + 1));
  const row = Math.max(1, Math.min(rawRow, rows    - rowSpan + 1));

  return { col, row };
}

export function useDragDrop({
  gridRef,
  layout,
  columns,
  rows,
  gap,
  isOccupied,
  onDrop,
}: UseDragDropOptions): UseDragDropReturn {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const dragStateRef = useRef<DragState | null>(null);

  // Keep ref in sync so event listeners can read current state.
  dragStateRef.current = dragState;

  const handleWidgetPointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      const widget = layout.find((w) => w.id === id);
      if (!widget) return;

      e.preventDefault();

      const grid = gridRef.current;
      if (grid) {
        grid.setPointerCapture(e.pointerId);
      }

      const state: DragState = {
        draggingId: id,
        originCol: widget.col,
        originRow: widget.row,
        colSpan: widget.colSpan,
        rowSpan: widget.rowSpan,
        targetCol: widget.col,
        targetRow: widget.row,
      };
      setDragState(state);
      dragStateRef.current = state;
    },
    [layout, gridRef]
  );

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const current = dragStateRef.current;
      if (!current || !gridRef.current) return;

      const rect = gridRef.current.getBoundingClientRect();
      const { col, row } = computeTargetCell(
        e.clientX,
        e.clientY,
        rect,
        columns,
        rows,
        gap,
        current.colSpan,
        current.rowSpan
      );

      setDragState((prev) =>
        prev ? { ...prev, targetCol: col, targetRow: row } : null
      );
    };

    const handlePointerUp = (e: PointerEvent) => {
      const current = dragStateRef.current;
      if (!current) return;

      const grid = gridRef.current;
      let dropped = false;

      if (grid) {
        const rect = grid.getBoundingClientRect();
        const inside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;

        if (inside) {
          const { col, row } = computeTargetCell(
            e.clientX,
            e.clientY,
            rect,
            columns,
            rows,
            gap,
            current.colSpan,
            current.rowSpan
          );

          const blocked = isOccupied(col, row, current.colSpan, current.rowSpan, current.draggingId);
          if (!blocked) {
            onDrop(current.draggingId, col, row);
            dropped = true;
          }
        }
      }

      if (!dropped) {
        // Revert — onDrop not called, layout stays unchanged.
      }

      setDragState(null);
      dragStateRef.current = null;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dragStateRef.current) {
        setDragState(null);
        dragStateRef.current = null;
      }
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [gridRef, columns, rows, gap, isOccupied, onDrop]);

  return { dragState, handleWidgetPointerDown };
}

export { computeTargetCell };
