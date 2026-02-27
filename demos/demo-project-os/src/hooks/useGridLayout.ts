import { useState, useCallback, useMemo } from 'react';
import type { GridLayout, WidgetLayout } from '../components/dashboard/types';

interface UseGridLayoutOptions {
  initialLayout: GridLayout;
  columns: number;
  rows: number;
  onLayoutChange?: (layout: GridLayout) => void;
}

interface UseGridLayoutReturn {
  layout: GridLayout;
  moveWidget: (id: string, col: number, row: number) => void;
  isOccupied: (col: number, row: number, colSpan: number, rowSpan: number, excludeId?: string) => boolean;
  isValidWidget: (widget: WidgetLayout) => boolean;
}

export function buildOccupancyMap(layout: GridLayout, excludeId?: string): Set<string> {
  const occupied = new Set<string>();
  for (const widget of layout) {
    if (widget.id === excludeId) continue;
    for (let c = widget.col; c < widget.col + widget.colSpan; c++) {
      for (let r = widget.row; r < widget.row + widget.rowSpan; r++) {
        occupied.add(`${c},${r}`);
      }
    }
  }
  return occupied;
}

export function useGridLayout({
  initialLayout,
  columns,
  rows,
  onLayoutChange,
}: UseGridLayoutOptions): UseGridLayoutReturn {
  const [internalLayout, setInternalLayout] = useState<GridLayout>(initialLayout);

  // Controlled mode when onLayoutChange is provided; uncontrolled otherwise.
  const layout = onLayoutChange ? initialLayout : internalLayout;

  const occupancyMap = useMemo(() => buildOccupancyMap(layout), [layout]);

  const isValidWidget = useCallback(
    (widget: WidgetLayout): boolean => {
      if (widget.colSpan > columns) {
        console.warn(
          `[DashboardGrid] Widget "${widget.id}" has colSpan=${widget.colSpan} which exceeds grid columns=${columns}. Widget will not be rendered.`
        );
        return false;
      }
      if (widget.rowSpan > rows) {
        console.warn(
          `[DashboardGrid] Widget "${widget.id}" has rowSpan=${widget.rowSpan} which exceeds grid rows=${rows}. Widget will not be rendered.`
        );
        return false;
      }
      return true;
    },
    [columns, rows]
  );

  const isOccupied = useCallback(
    (col: number, row: number, colSpan: number, rowSpan: number, excludeId?: string): boolean => {
      const map = excludeId ? buildOccupancyMap(layout, excludeId) : occupancyMap;
      for (let c = col; c < col + colSpan; c++) {
        for (let r = row; r < row + rowSpan; r++) {
          if (map.has(`${c},${r}`)) return true;
        }
      }
      return false;
    },
    [layout, occupancyMap]
  );

  const moveWidget = useCallback(
    (id: string, col: number, row: number) => {
      const updated = layout.map((w) => (w.id === id ? { ...w, col, row } : w));
      if (onLayoutChange) {
        onLayoutChange(updated);
      } else {
        setInternalLayout(updated);
      }
    },
    [layout, onLayoutChange]
  );

  return { layout, moveWidget, isOccupied, isValidWidget };
}
