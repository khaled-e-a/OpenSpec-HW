// GridDropZone.tsx
// UC1-S5, UC1-S6: Drop zone for receiving widget drops
// UC1-S4, UC2-S3: CSS grid layout with configurable cell dimensions
// Task 5.3: Expose ref so DashboardGrid can read bounding rect for snap calc

import { useDroppable } from '@dnd-kit/core';
import type { CSSProperties, ReactNode, Ref } from 'react';

interface GridDropZoneProps {
  cols: number;
  rows: number;
  cellSize: number;
  containerRef: Ref<HTMLDivElement>;
  children: ReactNode;
}

export function GridDropZone({ cols, rows, cellSize, containerRef, children }: GridDropZoneProps) {
  const { setNodeRef: setDropRef } = useDroppable({ id: 'grid-drop-zone' });

  // UC5.2: CSS grid sized by cols × rows × cellSize
  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    position: 'relative',
  };

  return (
    <div
      ref={(node) => {
        // Attach both the droppable ref and the forwarded container ref
        setDropRef(node);
        if (typeof containerRef === 'function') {
          containerRef(node);
        } else if (containerRef && typeof containerRef === 'object') {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }}
      style={gridStyle}
      data-testid="grid-drop-zone"
    >
      {children}
    </div>
  );
}
