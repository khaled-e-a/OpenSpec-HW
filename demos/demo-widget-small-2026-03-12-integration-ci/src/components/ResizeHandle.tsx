import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { LayoutItem } from '../types';
import { clampToGrid } from '../utils/grid';
import { capResizeAtBoundary } from '../utils/collision';

interface ResizeHandleProps {
  item: LayoutItem;
  cellSize: number;
  layout: LayoutItem[];
  cols: number;
  rows: number;
  onResize: (w: number, h: number) => void;
}

// Task 6.1 — ResizeHandle at bottom-right corner (UC2-S1)
// Task 6.2 — Visible on hover via CSS (UC2-S1)
export function ResizeHandle({ item, cellSize, layout, cols, rows, onResize }: ResizeHandleProps) {
  const startPointer = useRef<{ x: number; y: number } | null>(null);
  const startSize = useRef<{ w: number; h: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  // Task 6.7 — Live preview dimensions during resize (UC2-S3)
  // previewRef mirrors preview state so handlePointerUp always reads the latest value
  const [preview, setPreview] = useState<{ w: number; h: number } | null>(null);
  const previewRef = useRef<{ w: number; h: number } | null>(null);

  // Task 6.6 — Escape cancels resize (UC2-E4c)
  useEffect(() => {
    if (!isResizing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsResizing(false);
        setPreview(null);
        startPointer.current = null;
        startSize.current = null;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isResizing]);

  // Task 6.3 — Record pre-resize size on pointerdown (UC2-S2, UC2-E4c)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      (e.target as Element).setPointerCapture?.(e.pointerId);
      startPointer.current = { x: e.clientX, y: e.clientY };
      startSize.current = { w: item.w, h: item.h };
      setIsResizing(true);
    },
    [item.w, item.h],
  );

  // Task 6.4 — Compute candidate (w, h) from delta, apply constraints, update preview (UC2-S3, UC2-E4a, UC2-E4b)
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isResizing || !startPointer.current || !startSize.current) return;

      const deltaX = e.clientX - startPointer.current.x;
      const deltaY = e.clientY - startPointer.current.y;

      const rawW = startSize.current.w + Math.round(deltaX / cellSize);
      const rawH = startSize.current.h + Math.round(deltaY / cellSize);

      // Guard: skip if coordinate math produced NaN (e.g. jsdom PointerEvent quirks)
      if (!Number.isFinite(rawW) || !Number.isFinite(rawH)) return;

      // UC2-E4b: clamp to grid boundary
      const clamped = clampToGrid(item.x, item.y, rawW, rawH, cols, rows);
      const candidate: LayoutItem = { ...item, w: clamped.w, h: clamped.h };

      // UC2-E4a: cap at adjacent widget boundary
      const capped = capResizeAtBoundary(candidate, layout, item.id);

      previewRef.current = capped;
      setPreview(capped);
    },
    [isResizing, cellSize, item, layout, cols, rows],
  );

  // Task 6.5 — Commit resize on pointerup (UC2-S4, UC2-S5, UC2-S7)
  // Use previewRef (not preview state) to avoid stale closure from async re-renders
  const handlePointerUp = useCallback(
    (_e: React.PointerEvent) => {
      if (!isResizing || !previewRef.current) {
        setIsResizing(false);
        return;
      }
      onResize(previewRef.current.w, previewRef.current.h);
      previewRef.current = null;
      setIsResizing(false);
      setPreview(null);
      startPointer.current = null;
      startSize.current = null;
    },
    [isResizing, onResize],
  );

  const previewW = preview ? preview.w * cellSize : null;
  const previewH = preview ? preview.h * cellSize : null;

  return (
    <>
      {/* Task 6.7 — Live resize preview outline (UC2-S3) */}
      {isResizing && preview && (
        <div
          className="resize-preview"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: previewW!,
            height: previewH!,
            border: '2px dashed #3b82f6',
            backgroundColor: 'rgba(59,130,246,0.1)',
            pointerEvents: 'none',
            zIndex: 50,
          }}
        />
      )}

      {/* Task 6.1/6.2 — The drag handle itself, shown on hover */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="resize-handle"
        style={{
          position: 'absolute',
          bottom: 2,
          right: 2,
          width: 12,
          height: 12,
          cursor: 'se-resize',
          opacity: 0,
          transition: 'opacity 0.15s',
          backgroundColor: '#6b7280',
          borderRadius: 2,
          zIndex: 10,
        }}
        aria-label="Resize widget"
      />

      <style>{`
        div:hover > .resize-handle {
          opacity: 1;
        }
      `}</style>
    </>
  );
}
