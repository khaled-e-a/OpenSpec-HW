/**
 * Converts pointer page coordinates to a grid cell {col, row}.
 *
 * Implements: UC1-S3 — displays ghost at nearest snap-to-grid position
 * Implements: UC1-S5 — continuously updates ghost within bounds
 */
export function pointerToCell(
  pointerX: number,
  pointerY: number,
  gridRect: DOMRect,
  cellWidth: number,
  cellHeight: number,
  widgetCols: number,
  widgetRows: number,
  totalCols: number,
  totalRows: number,
): { col: number; row: number } {
  const rawCol = Math.floor((pointerX - gridRect.left) / cellWidth);
  const rawRow = Math.floor((pointerY - gridRect.top) / cellHeight);

  // Clamp so the widget stays fully within grid bounds
  const col = Math.max(0, Math.min(rawCol, totalCols - widgetCols));
  const row = Math.max(0, Math.min(rawRow, totalRows - widgetRows));

  return { col, row };
}

/**
 * Returns true if the pointer is within the grid boundary.
 */
export function isPointerInsideGrid(
  pointerX: number,
  pointerY: number,
  gridRect: DOMRect,
): boolean {
  return (
    pointerX >= gridRect.left &&
    pointerX <= gridRect.right &&
    pointerY >= gridRect.top &&
    pointerY <= gridRect.bottom
  );
}
