import { type ReactNode } from 'react';
import { computeContainerHeight } from '../utils/geometry';
import type { LayoutItem } from '../types';
import { GridContext } from './GridContext';

interface GridCanvasProps {
  colWidth: number;
  columns: number;
  rowHeight: number;
  layout: LayoutItem[];
  children: ReactNode;
}

export function GridCanvas({ colWidth, columns, rowHeight, layout, children }: GridCanvasProps) {
  const containerHeight = computeContainerHeight(layout, rowHeight);

  return (
    <GridContext.Provider value={{ colWidth, rowHeight, columns }}>
      <div
        style={{ position: 'relative', width: '100%', height: containerHeight }}
        data-testid="grid-canvas"
      >
        {children}
      </div>
    </GridContext.Provider>
  );
}
