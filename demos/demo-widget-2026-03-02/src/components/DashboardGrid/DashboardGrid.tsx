import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { GridConfig, DashboardWidget } from '../../types';
import { Widget } from '../Widget';
import { GridCell } from './GridCell';

interface DashboardGridProps {
  widgets: DashboardWidget[];
  config?: Partial<GridConfig>;
  isEditMode?: boolean;
  onWidgetMove?: (widgetId: string, position: { x: number; y: number }) => void;
  onWidgetResize?: (widgetId: string, size: { width: number; height: number }) => void;
}

const DEFAULT_GRID_CONFIG: GridConfig = {
  columns: 12,
  rows: 8,
  gap: 16,
  margin: 24,
};

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  widgets,
  config = {},
  isEditMode = false,
  onWidgetMove,
  onWidgetResize,
}) => {
  const gridConfig = { ...DEFAULT_GRID_CONFIG, ...config };
  const { columns, rows, gap, margin } = gridConfig;

  const { setNodeRef } = useDroppable({
    id: 'dashboard-grid',
  });

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, minmax(100px, auto))`,
    gap: `${gap}px`,
    padding: `${margin}px`,
    minHeight: '100%',
    position: 'relative',
  };

  const renderGridCells = () => {
    if (!isEditMode) return null;

    const cells = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        cells.push(
          <GridCell
            key={`cell-${col}-${row}`}
            x={col}
            y={row}
            isOccupied={isCellOccupied(col, row)}
          />
        );
      }
    }
    return cells;
  };

  const isCellOccupied = (x: number, y: number): boolean => {
    return widgets.some(widget => {
      const { position, size } = widget;
      return (
        x >= position.x &&
        x < position.x + size.width &&
        y >= position.y &&
        y < position.y + size.height
      );
    });
  };

  const renderWidgets = () => {
    return widgets.map(widget => (
      <Widget
        key={widget.id}
        widget={widget}
        gridConfig={gridConfig}
        isEditMode={isEditMode}
        onMove={onWidgetMove}
        onResize={onWidgetResize}
      />
    ));
  };

  return (
    <div ref={setNodeRef} className="dashboard-grid" style={gridStyle}>
      {renderGridCells()}
      {renderWidgets()}
    </div>
  );
};