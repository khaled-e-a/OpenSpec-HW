import { useRef, useState, useCallback } from 'react';
import { snapAndClamp } from '../utils/gridUtils';

interface ResizeDragOptions {
  widgetId: string;
  initialW: number;
  initialH: number;
  cellSize: number;
  gridCols: number;
  gridRows: number;
  onCommit: (w: number, h: number) => boolean; // returns false if reflow failed
}

interface ResizeDragResult {
  previewW: number | null;
  previewH: number | null;
  isDragging: boolean;
  onHandlePointerDown: (e: React.PointerEvent) => void;
  noSpaceFeedback: boolean;
}

// Tasks 7.3–7.8
export function useResizeDrag({
  initialW,
  initialH,
  cellSize,
  gridCols,
  gridRows,
  onCommit,
}: ResizeDragOptions): ResizeDragResult {
  const [previewW, setPreviewW] = useState<number | null>(null);
  const [previewH, setPreviewH] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [noSpaceFeedback, setNoSpaceFeedback] = useState(false);
  const startRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const hitFloorRef = useRef(false);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    const rawW = startRef.current.w + dx / cellSize;
    const rawH = startRef.current.h + dy / cellSize;

    // Task 7.5 — minimum 1×1, task 7.6 — clamp at grid boundary
    const clamped = snapAndClamp(0, 0, Math.max(1, Math.round(rawW)), Math.max(1, Math.round(rawH)), gridCols, gridRows);
    const newW = Math.max(1, Math.min(clamped.col + Math.max(1, Math.round(rawW)), gridCols));
    const newH = Math.max(1, Math.min(clamped.row + Math.max(1, Math.round(rawH)), gridRows));

    // Detect floor hit for visual pulse
    hitFloorRef.current = newW === 1 && Math.round(rawW) < 1 || newH === 1 && Math.round(rawH) < 1;

    setPreviewW(newW);
    setPreviewH(newH);
  }, [cellSize, gridCols, gridRows]);

  const onPointerUp = useCallback(() => {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    setIsDragging(false);

    const pw = previewW ?? initialW;
    const ph = previewH ?? initialH;

    // Task 7.7 — commit or revert
    const success = onCommit(pw, ph);
    if (!success) {
      setNoSpaceFeedback(true);
      setTimeout(() => setNoSpaceFeedback(false), 2000);
    }
    // Task 7.8 — clear preview
    setPreviewW(null);
    setPreviewH(null);
    startRef.current = null;
  }, [onCommit, previewW, previewH, initialW, initialH, onPointerMove]);

  const onHandlePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    startRef.current = { x: e.clientX, y: e.clientY, w: initialW, h: initialH };
    setIsDragging(true);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }, [initialW, initialH, onPointerMove, onPointerUp]);

  return { previewW, previewH, isDragging, onHandlePointerDown, noSpaceFeedback };
}
