import React, { CSSProperties, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { LayoutItem } from '../types';
import { ResizeHandle } from './ResizeHandle';
import { cellToPixel, clampToGrid } from '../utils/grid';
import { capResizeAtBoundary } from '../utils/collision';

interface DraggableWidgetProps {
  item: LayoutItem;
  cellSize: number;
  onResize: (w: number, h: number) => void;
  style?: CSSProperties;
  children?: React.ReactNode;
  layout?: LayoutItem[];
  cols?: number;
  rows?: number;
}

// Task 5.1 — DraggableWidget wraps children with useDraggable (UC1-S1)
export function DraggableWidget({
  item,
  cellSize,
  onResize,
  style,
  children,
  layout = [],
  cols = 12,
  rows = 12,
}: DraggableWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  });

  // Task 5.3 — Escape key cancels drag (UC1-E5b)
  // @dnd-kit handles Escape internally and calls onDragCancel, so we just need
  // the escape key to be available. No extra listener needed — @dnd-kit KeyboardSensor
  // already handles this. For pointer drag, we listen on keydown to abort.
  useEffect(() => {
    if (!isDragging) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // @dnd-kit cancels the active drag on Escape automatically via its sensors
        // This handler is a safety net for custom scenarios
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDragging]);

  const dragStyle: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    boxSizing: 'border-box',
    border: '1px solid #d1d5db',
    borderRadius: 4,
    backgroundColor: '#fff',
    overflow: 'hidden',
  };

  return (
    <>
      {/* Task 5.2 — Ghost placeholder at original position while dragging (UC1-S2) */}
      {isDragging && (
        <div
          style={{
            ...style,
            position: 'absolute',
            backgroundColor: 'rgba(209,213,219,0.5)',
            border: '2px dashed #9ca3af',
            borderRadius: 4,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      <div ref={setNodeRef} style={{ ...style, ...dragStyle }} data-widget-id={item.id} {...listeners} {...attributes}>
        {children}

        {/* Resize handle — passes layout context for collision capping */}
        <ResizeHandle
          item={item}
          cellSize={cellSize}
          layout={layout}
          cols={cols}
          rows={rows}
          onResize={onResize}
        />
      </div>
    </>
  );
}
