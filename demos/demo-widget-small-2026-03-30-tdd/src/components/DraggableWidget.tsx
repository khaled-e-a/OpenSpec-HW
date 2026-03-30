// DraggableWidget.tsx
// UC1-S1, UC1-S3: Initiate drag on pointer press; track movement
// UC1-S2: Show placeholder when dragging
// UC2-S3: Positioned at (col, row) using CSS grid

import { useDraggable } from '@dnd-kit/core';
import type { CSSProperties, ReactNode } from 'react';
import type { WidgetLayout } from '../utils/widgetTypes';

interface DraggableWidgetProps {
  layout: WidgetLayout;
  children: ReactNode;
}

export function DraggableWidget({ layout, children }: DraggableWidgetProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: layout.widgetId,
  });

  // UC2-S3: Position widget via CSS grid (1-indexed)
  // UC6.4: span w columns, span h rows
  const cellStyle: CSSProperties = {
    gridColumn: `${layout.col + 1} / span ${layout.w}`,
    gridRow: `${layout.row + 1} / span ${layout.h}`,
  };

  return (
    <div
      data-widget-id={layout.widgetId}
      style={cellStyle}
    >
      {/* UC1-S2: When dragging, show dimmed placeholder instead of widget content */}
      {isDragging ? (
        // UC7.3: Dashed border placeholder
        <div
          data-testid={`placeholder-${layout.widgetId}`}
          style={{
            width: '100%',
            height: '100%',
            border: '2px dashed #aaa',
            opacity: 0.4,
            borderRadius: 4,
          }}
        />
      ) : (
        // UC1-S1: Drag handle — attach listeners/ref to the content wrapper
        <div
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          style={{ width: '100%', height: '100%', cursor: 'grab', touchAction: 'none' }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
