// gridGeometry.ts — pure grid geometry and validation utilities
// UC1-S4: pointerToCell snap calculation
// UC1-E3a: clamping to prevent out-of-bounds preview
// UC1-S6, UC1-E6a, UC1-E6b: isValidPlacement

import type { WidgetLayout } from './widgetTypes';

/**
 * UC1-S4, UC1-E3a: Convert an absolute pointer position to a snapped grid cell (col, row).
 * The result is clamped so the widget (of size w×h) stays fully within the grid.
 *
 * @param pointerX  Absolute pointer X (e.g., event.clientX)
 * @param pointerY  Absolute pointer Y (e.g., event.clientY)
 * @param gridRect  Bounding rect of the grid container
 * @param cellSize  Width/height of a single cell in pixels
 * @param w         Widget column span
 * @param h         Widget row span
 * @param gridCols  Total grid columns
 * @param gridRows  Total grid rows
 */
export function pointerToCell(
  pointerX: number,
  pointerY: number,
  gridRect: Pick<DOMRect, 'left' | 'top'>,
  cellSize: number,
  w: number,
  h: number,
  gridCols: number,
  gridRows: number
): { col: number; row: number } {
  const relX = pointerX - gridRect.left;
  const relY = pointerY - gridRect.top;

  const rawCol = Math.floor(relX / cellSize);
  const rawRow = Math.floor(relY / cellSize);

  const col = Math.max(0, Math.min(rawCol, gridCols - w));
  const row = Math.max(0, Math.min(rawRow, gridRows - h));

  return { col, row };
}

/**
 * Build a Set of "col,row" strings for all occupied cells, optionally
 * excluding one widget by id (used when validating a drag move).
 */
function buildOccupancySet(layout: WidgetLayout[], excludeId?: string): Set<string> {
  const set = new Set<string>();
  for (const widget of layout) {
    if (widget.widgetId === excludeId) continue;
    for (let c = widget.col; c < widget.col + widget.w; c++) {
      for (let r = widget.row; r < widget.row + widget.h; r++) {
        set.add(`${c},${r}`);
      }
    }
  }
  return set;
}

/**
 * UC1-S6, UC1-E6a, UC1-E6b: Returns true only if placing a widget of size w×h
 * at (col, row) is fully within grid bounds and does not overlap any existing widget
 * (the widget being moved, identified by widgetId, is excluded from collision checks).
 */
export function isValidPlacement(
  layout: WidgetLayout[],
  widgetId: string,
  col: number,
  row: number,
  w: number,
  h: number,
  gridCols: number,
  gridRows: number
): boolean {
  // UC1-E6b: bounds check
  if (col < 0 || row < 0) return false;
  if (col + w > gridCols) return false;
  if (row + h > gridRows) return false;

  // UC1-E6a: collision check (exclude the widget being moved)
  const occupied = buildOccupancySet(layout, widgetId);
  for (let c = col; c < col + w; c++) {
    for (let r = row; r < row + h; r++) {
      if (occupied.has(`${c},${r}`)) return false;
    }
  }
  return true;
}
