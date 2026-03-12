import type { WidgetLayout } from '../types';

/**
 * Returns a Set of "col,row" strings for all cells occupied by widgets,
 * excluding the widget with `excludeId` (the one being dragged).
 *
 * Implements: UC1-S7 — system validates target position
 */
export function getOccupiedCells(
  layout: WidgetLayout[],
  excludeId: string,
): Set<string> {
  const occupied = new Set<string>();
  for (const widget of layout) {
    if (widget.id === excludeId) continue;
    for (let c = widget.col; c < widget.col + widget.w; c++) {
      for (let r = widget.row; r < widget.row + widget.h; r++) {
        occupied.add(`${c},${r}`);
      }
    }
  }
  return occupied;
}

/**
 * Returns true if placing a widget at `candidate` position is valid:
 *  - All cells are within grid bounds
 *  - No cells are occupied by another widget
 *
 * Implements: UC1-S7  — validates unoccupied and within bounds
 * Implements: UC1-E7a — collision detected → reject
 * Implements: UC1-E7b — partially out of bounds → reject
 */
export function isValidDrop(
  candidate: { col: number; row: number; w: number; h: number },
  layout: WidgetLayout[],
  totalCols: number,
  totalRows: number,
  excludeId: string,
): boolean {
  const { col, row, w, h } = candidate;

  // Bounds check
  if (col < 0 || row < 0 || col + w > totalCols || row + h > totalRows) {
    return false;
  }

  // Collision check
  const occupied = getOccupiedCells(layout, excludeId);
  for (let c = col; c < col + w; c++) {
    for (let r = row; r < row + h; r++) {
      if (occupied.has(`${c},${r}`)) return false;
    }
  }

  return true;
}
