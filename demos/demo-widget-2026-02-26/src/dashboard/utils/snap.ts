import type { LayoutItem } from '../types';

export interface SnappedPosition {
  x: number;
  y: number;
}

/**
 * Maps pixel position to the nearest snapped grid cell, clamped to grid bounds.
 * px/py are relative to the grid container's top-left corner.
 */
export function snapToGrid(
  px: number,
  py: number,
  colWidth: number,
  rowHeight: number,
  item: Pick<LayoutItem, 'w' | 'h'>,
  columns: number,
): SnappedPosition {
  const rawX = Math.round(px / colWidth);
  const rawY = Math.round(py / rowHeight);

  const x = Math.max(0, Math.min(rawX, columns - item.w));
  const y = Math.max(0, rawY);

  return { x, y };
}

/**
 * Maps pointer offset from a widget's top-left to a snapped size, clamped to constraints.
 */
export function snapToSize(
  offsetX: number,
  offsetY: number,
  colWidth: number,
  rowHeight: number,
  item: Pick<LayoutItem, 'x' | 'y' | 'minW' | 'minH' | 'maxW' | 'maxH'>,
  columns: number,
): { w: number; h: number } {
  const minW = item.minW ?? 1;
  const minH = item.minH ?? 1;
  const maxW = item.maxW ?? columns - item.x;
  const maxH = item.maxH ?? Infinity;

  const rawW = Math.round(offsetX / colWidth);
  const rawH = Math.round(offsetY / rowHeight);

  const w = Math.max(minW, Math.min(rawW, maxW, columns - item.x));
  const h = Math.max(minH, Math.min(rawH, maxH));

  return { w, h };
}
