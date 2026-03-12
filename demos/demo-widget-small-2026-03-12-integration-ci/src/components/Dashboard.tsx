import React, { useState } from 'react';
import type { DashboardProps, LayoutItem } from '../types';
import { DashboardGrid } from './DashboardGrid';

const DEFAULT_COLS = 12;
const DEFAULT_ROWS = 12;
const DEFAULT_CELL_SIZE = 80;

// Task 7.1 — Dashboard owns layout state; supports both controlled and uncontrolled usage
export function Dashboard({
  layout: controlledLayout,
  initialLayout,
  onLayoutChange,
  cols = DEFAULT_COLS,
  rows = DEFAULT_ROWS,
  cellSize = DEFAULT_CELL_SIZE,
  children,
}: DashboardProps) {
  const [internalLayout, setInternalLayout] = useState<LayoutItem[]>(
    initialLayout ?? [],
  );

  const isControlled = controlledLayout !== undefined;
  const layout = isControlled ? controlledLayout! : internalLayout;

  // Task 7.2 — Pass layout and handlers down to DashboardGrid
  const handleLayoutChange = (newLayout: LayoutItem[]) => {
    if (!isControlled) {
      setInternalLayout(newLayout);
    }
    onLayoutChange?.(newLayout);
  };

  return (
    <DashboardGrid
      layout={layout}
      onLayoutChange={handleLayoutChange}
      cols={cols}
      rows={rows}
      cellSize={cellSize}
    >
      {children}
    </DashboardGrid>
  );
}
