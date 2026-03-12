import type { WidgetLayout } from '../types';

/**
 * Returns the first unoccupied 1×1 cell, scanning left-to-right within each
 * row starting from row 0. Returns null if the grid is full.
 *
 * Implements: UC1-S2 — System finds the first available grid cell
 * Implements: UC1-E1a — No unoccupied cell exists
 */
export function findFirstOpenCell(
  layout: WidgetLayout[],
  cols: number,
  rows: number,
): { col: number; row: number } | null {
  // Build set of all occupied cells
  const occupied = new Set<string>();
  for (const widget of layout) {
    for (let c = widget.col; c < widget.col + widget.w; c++) {
      for (let r = widget.row; r < widget.row + widget.h; r++) {
        occupied.add(`${c},${r}`);
      }
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!occupied.has(`${c},${r}`)) {
        return { col: c, row: r };
      }
    }
  }

  return null;
}
