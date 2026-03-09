import type { WidgetLayout } from '../types'

/**
 * Converts pointer coordinates (relative to the grid container) to a grid (col, row).
 * UC2-S2, UC1-S6
 */
export function pointerToCell(
  x: number,
  y: number,
  cellWidth: number,
  cellHeight: number,
  gap: number,
): { col: number; row: number } {
  const col = Math.floor(x / (cellWidth + gap))
  const row = Math.floor(y / (cellHeight + gap))
  return { col, row }
}

/**
 * Clamps a widget's top-left position so it stays fully within the grid.
 * UC2-E2a
 */
export function clampPosition(
  col: number,
  row: number,
  colSpan: number,
  rowSpan: number,
  totalCols: number,
  totalRows: number,
): { col: number; row: number } {
  return {
    col: Math.max(0, Math.min(col, totalCols - colSpan)),
    row: Math.max(0, Math.min(row, totalRows - rowSpan)),
  }
}

/**
 * Returns true if placing widget (id) at (col, row) with given spans would
 * overlap any other widget already in the layout.
 * UC1-E4a, UC1-E5b
 */
export function hasCollision(
  layout: WidgetLayout[],
  id: string,
  col: number,
  row: number,
  colSpan: number,
  rowSpan: number,
): boolean {
  for (const w of layout) {
    if (w.id === id) continue
    const overlapCol = col < w.col + w.colSpan && col + colSpan > w.col
    const overlapRow = row < w.row + w.rowSpan && row + rowSpan > w.row
    if (overlapCol && overlapRow) return true
  }
  return false
}
