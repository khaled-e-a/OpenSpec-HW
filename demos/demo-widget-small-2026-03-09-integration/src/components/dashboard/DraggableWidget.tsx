import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { WidgetLayout } from './types';

interface DraggableWidgetProps extends WidgetLayout {
  children: React.ReactNode;
}

/**
 * Wraps a child widget and makes it draggable within a DashboardGrid.
 *
 * Implements: UC1-S1 — recognises press/hold as drag start
 * Implements: UC1-S2 — visual lift (opacity, z-index) during drag
 * Implements: UC1-S8 — positioned at its current grid cell via CSS grid
 */
export function DraggableWidget({ id, col, row, w, h, children }: DraggableWidgetProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { col, row, w, h },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        gridColumn: `${col + 1} / span ${w}`,
        gridRow: `${row + 1} / span ${h}`,
        opacity: isDragging ? 0.3 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 10 : 'auto',
        touchAction: 'none', // required for @dnd-kit touch sensor
        userSelect: 'none',
        transition: 'opacity 150ms',
      }}
    >
      {children}
    </div>
  );
}
