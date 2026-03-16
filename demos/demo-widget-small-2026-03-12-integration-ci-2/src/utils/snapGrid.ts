import { GRID_COLS, CELL_WIDTH_PX, CELL_HEIGHT_PX } from '../constants';

/**
 * Converts pointer document coordinates to clamped grid { col, row }.
 * UC1-S3, UC1-S5 — used in onDragMove and resize pointermove handlers.
 *
 * @param pointerX  Pointer clientX
 * @param pointerY  Pointer clientY
 * @param gridRect  Bounding rect of the grid container element
 * @param widgetW   Width of the widget in grid units (for right-edge clamping)
 * @param widgetH   Height of the widget in grid units (for bottom-edge clamping)
 */
export function pointerToGridCoords(
  pointerX: number,
  pointerY: number,
  gridRect: DOMRect,
  widgetW: number,
  widgetH: number
): { col: number; row: number } {
  const rawCol = Math.round((pointerX - gridRect.left) / CELL_WIDTH_PX);
  const rawRow = Math.round((pointerY - gridRect.top) / CELL_HEIGHT_PX);

  // Clamp so the widget stays within grid bounds
  const col = Math.max(0, Math.min(rawCol, GRID_COLS - widgetW));
  const row = Math.max(0, rawRow);

  return { col, row };
}

/**
 * Throttles a callback to fire at most once per animation frame.
 * UC1-S5, UC2-S3 — used on pointermove/onDragMove handlers.
 */
export function rafThrottle<T extends (...args: Parameters<T>) => void>(fn: T): T {
  let rafId: number | null = null;
  const throttled = (...args: Parameters<T>) => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      fn(...args);
      rafId = null;
    });
  };
  return throttled as T;
}
